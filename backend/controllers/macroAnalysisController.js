const MacroAnalysis = require('../models/MacroAnalysis');

/**
 * 宏观分析控制器，处理宏观分析数据的CRUD操作和分析功能
 */
const macroAnalysisController = {
  /**
   * 获取宏观分析数据列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getMacroAnalysisData(req, res) {
    try {
      const { type, region, frequency, startDate, endDate, page = 1, limit = 20 } = req.query;
      
      let query = {};
      if (type) {
        query.type = type;
      }
      if (region) {
        query.region = region;
      }
      if (frequency) {
        query.frequency = frequency;
      }
      if (startDate && endDate) {
        query.dataDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        MacroAnalysis.find(query)
          .sort({ dataDate: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        MacroAnalysis.countDocuments(query)
      ]);
      
      res.status(200).json({
        success: true,
        data,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('获取宏观分析数据列表错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取单个宏观分析数据详情
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getMacroAnalysisDataById(req, res) {
    try {
      const data = await MacroAnalysis.findById(req.params.id);
      
      if (!data) {
        return res.status(404).json({ success: false, message: '宏观分析数据不存在' });
      }
      
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('获取宏观分析数据详情错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 创建宏观分析数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async createMacroAnalysisData(req, res) {
    try {
      const { name, code, type, unit, value, yearOnYearGrowth, monthOnMonthGrowth, dataDate, source, frequency, region } = req.body;
      
      // 保存宏观分析数据记录
      const macroData = await MacroAnalysis.create({
        name,
        code,
        type,
        unit,
        value,
        yearOnYearGrowth,
        monthOnMonthGrowth,
        dataDate: new Date(dataDate),
        source,
        frequency,
        region
      });
      
      res.status(201).json({ success: true, data: macroData, message: '宏观分析数据创建成功' });
    } catch (error) {
      console.error('创建宏观分析数据错误:', error);
      res.status(500).json({ success: false, message: error.message || '服务器错误' });
    }
  },

  /**
   * 更新宏观分析数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async updateMacroAnalysisData(req, res) {
    try {
      const macroData = await MacroAnalysis.findById(req.params.id);
      
      if (!macroData) {
        return res.status(404).json({ success: false, message: '宏观分析数据不存在' });
      }
      
      // 更新宏观分析数据
      const updatedData = await MacroAnalysis.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({ success: true, data: updatedData, message: '宏观分析数据更新成功' });
    } catch (error) {
      console.error('更新宏观分析数据错误:', error);
      res.status(500).json({ success: false, message: error.message || '服务器错误' });
    }
  },

  /**
   * 删除宏观分析数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async deleteMacroAnalysisData(req, res) {
    try {
      const macroData = await MacroAnalysis.findById(req.params.id);
      
      if (!macroData) {
        return res.status(404).json({ success: false, message: '宏观分析数据不存在' });
      }
      
      // 删除宏观分析数据记录
      await macroData.remove();
      
      res.status(200).json({ success: true, message: '宏观分析数据删除成功' });
    } catch (error) {
      console.error('删除宏观分析数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取宏观分析指标趋势数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getMacroTrendData(req, res) {
    try {
      const { code, startDate, endDate, region } = req.query;
      
      if (!code) {
        return res.status(400).json({ success: false, message: '请提供指标代码' });
      }
      
      let query = { code };
      if (region) {
        query.region = region;
      }
      if (startDate && endDate) {
        query.dataDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const trendData = await MacroAnalysis.find(query)
        .sort({ dataDate: 1 })
        .select('dataDate value yearOnYearGrowth monthOnMonthGrowth');
      
      res.status(200).json({ success: true, data: trendData });
    } catch (error) {
      console.error('获取宏观分析指标趋势数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取宏观分析仪表板数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getDashboardData(req, res) {
    try {
      const { region } = req.query;
      
      let query = {};
      if (region) {
        query.region = region;
      }
      
      // 获取最近一个月的数据
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.dataDate = { $gte: oneMonthAgo };
      
      const [dataByType, recentData, statusSummary] = await Promise.all([
        // 按指标类型统计
        MacroAnalysis.aggregate([
          { $match: query },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        // 获取最近的指标数据
        MacroAnalysis.find(query)
          .sort({ dataDate: -1 })
          .limit(10),
        // 按状态统计
        MacroAnalysis.aggregate([
          { $match: query },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);
      
      // 生成仪表板数据
      const dashboardData = {
        dataByType: dataByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentData,
        statusSummary: statusSummary.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, { normal: 0, warning: 0, alert: 0 })
      };
      
      res.status(200).json({ success: true, data: dashboardData });
    } catch (error) {
      console.error('获取宏观分析仪表板数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 政策影响模拟
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async simulatePolicyImpact(req, res) {
    try {
      const { policyType, intensity, startDate, endDate, region } = req.body;
      
      // 这里可以添加更复杂的政策影响模拟逻辑
      // 目前简化为基于政策类型和强度返回模拟结果
      
      // 获取历史数据
      let query = {};
      if (region) {
        query.region = region;
      }
      if (startDate && endDate) {
        query.dataDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const historicalData = await MacroAnalysis.find(query)
        .sort({ dataDate: 1 })
        .select('dataDate value type');
      
      // 政策影响系数
      const impactCoefficients = {
        tax_adjustment: { price_index: 0.8, volume_index: 1.2 },
        interest_rate: { price_index: 1.5, volume_index: 0.7 },
        supply_adjustment: { price_index: 0.5, volume_index: 1.0 },
        demand_stimulation: { price_index: 1.0, volume_index: 1.5 }
      };
      
      // 模拟政策影响
      const simulationResults = historicalData.map(item => {
        const coefficient = impactCoefficients[policyType]?.[item.type] || 1.0;
        const impactValue = item.value * (1 + (coefficient * intensity / 100));
        return {
          dataDate: item.dataDate,
          originalValue: item.value,
          simulatedValue: impactValue,
          difference: impactValue - item.value,
          type: item.type
        };
      });
      
      res.status(200).json({ 
        success: true, 
        data: simulationResults,
        message: '政策影响模拟成功'
      });
    } catch (error) {
      console.error('政策影响模拟错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取宏观指标对比数据
   * @param {Object} req - Express对象
   * @param {Object} res - Express响应对象
   */
  async getIndicatorComparison(req, res) {
    try {
      const { indicators, startDate, endDate, region } = req.query;
      
      if (!indicators) {
        return res.status(400).json({ success: false, message: '请提供指标代码列表' });
      }
      
      const indicatorList = indicators.split(',');
      
      let query = { code: { $in: indicatorList } };
      if (region) {
        query.region = region;
      }
      if (startDate && endDate) {
        query.dataDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const comparisonData = await MacroAnalysis.find(query)
        .sort({ dataDate: 1 });
      
      // 按指标代码分组
      const groupedData = comparisonData.reduce((acc, item) => {
        if (!acc[item.code]) {
          acc[item.code] = [];
        }
        acc[item.code].push({
          dataDate: item.dataDate,
          value: item.value,
          yearOnYearGrowth: item.yearOnYearGrowth,
          monthOnMonthGrowth: item.monthOnMonthGrowth
        });
        return acc;
      }, {});
      
      res.status(200).json({ success: true, data: groupedData });
    } catch (error) {
      console.error('获取宏观指标对比数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

module.exports = macroAnalysisController;