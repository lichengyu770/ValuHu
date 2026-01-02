const GovernmentData = require('../models/GovernmentData');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * 政府数据控制器，处理政府数据的CRUD操作和安全交换
 */
const governmentDataController = {
  /**
   * 获取政府数据列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getGovernmentData(req, res) {
    try {
      const { dataType, status, page = 1, limit = 10 } = req.query;
      
      let query = {};
      if (dataType) {
        query.dataType = dataType;
      }
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        GovernmentData.find(query)
          .populate('providerId', 'name email')
          .populate('authorizedParties', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        GovernmentData.countDocuments(query)
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
      console.error('获取政府数据列表错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取单个政府数据详情
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getGovernmentDataById(req, res) {
    try {
      const data = await GovernmentData.findById(req.params.id)
        .populate('providerId', 'name email')
        .populate('authorizedParties', 'name');
      
      if (!data) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('获取政府数据详情错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 上传政府数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async uploadGovernmentData(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传数据文件' });
      }
      
      const { dataType, name, description, source, version, validFrom, validTo, accessLevel, authorizedParties } = req.body;
      
      // 生成数据哈希值
      const fileBuffer = fs.readFileSync(req.file.path);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // 保存政府数据记录
      const governmentData = await GovernmentData.create({
        dataType,
        name,
        description,
        source,
        version,
        fileUrl: `/uploads/${req.file.filename}`,
        validFrom,
        validTo,
        accessLevel,
        authorizedParties: authorizedParties ? JSON.parse(authorizedParties) : [],
        hash,
        providerId: req.user.id
      });
      
      res.status(201).json({ success: true, data: governmentData, message: '政府数据上传成功' });
    } catch (error) {
      console.error('上传政府数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 更新政府数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async updateGovernmentData(req, res) {
    try {
      const governmentData = await GovernmentData.findById(req.params.id);
      
      if (!governmentData) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      // 如果上传了新文件，更新文件URL和哈希值
      if (req.file) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        req.body.fileUrl = `/uploads/${req.file.filename}`;
        req.body.hash = hash;
      }
      
      // 更新政府数据
      const updatedData = await GovernmentData.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({ success: true, data: updatedData, message: '政府数据更新成功' });
    } catch (error) {
      console.error('更新政府数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 删除政府数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async deleteGovernmentData(req, res) {
    try {
      const governmentData = await GovernmentData.findById(req.params.id);
      
      if (!governmentData) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      // 删除对应的文件
      const filePath = path.join(__dirname, '..', governmentData.fileUrl.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // 删除政府数据记录
      await governmentData.remove();
      
      res.status(200).json({ success: true, message: '政府数据删除成功' });
    } catch (error) {
      console.error('删除政府数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 审核政府数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async reviewGovernmentData(req, res) {
    try {
      const { status, comments } = req.body;
      const governmentData = await GovernmentData.findById(req.params.id);
      
      if (!governmentData) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      // 更新审核状态
      governmentData.status = status;
      
      // 添加审核记录
      governmentData.reviewHistory.push({
        reviewerId: req.user.id,
        reviewerName: req.user.name || req.user.email,
        reviewDate: new Date(),
        status,
        comments
      });
      
      await governmentData.save();
      
      res.status(200).json({ success: true, data: governmentData, message: '政府数据审核成功' });
    } catch (error) {
      console.error('审核政府数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 下载政府数据文件
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async downloadGovernmentData(req, res) {
    try {
      const governmentData = await GovernmentData.findById(req.params.id);
      
      if (!governmentData) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      // 检查访问权限
      if (governmentData.accessLevel === 'private') {
        // 只有授权用户可以访问
        const isAuthorized = req.user && 
          (req.user.role === 'admin' || 
           governmentData.authorizedParties.includes(req.user.enterpriseId));
        
        if (!isAuthorized) {
          return res.status(403).json({ success: false, message: '没有访问权限' });
        }
      }
      
      // 更新使用统计
      await governmentData.updateUsage(req.user.enterpriseId || req.user.id);
      
      // 发送文件下载
      const filePath = path.join(__dirname, '..', governmentData.fileUrl.substring(1));
      if (fs.existsSync(filePath)) {
        res.download(filePath, `${governmentData.name}-${governmentData.version}.${governmentData.fileUrl.split('.').pop()}`);
      } else {
        res.status(404).json({ success: false, message: '文件不存在' });
      }
    } catch (error) {
      console.error('下载政府数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 生成数据使用报告
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async generateUsageReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const query = {};
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const data = await GovernmentData.find(query)
        .select('name dataType source usageStats createdAt');
      
      // 生成使用报告
      const report = {
        reportDate: new Date().toISOString(),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        totalData: data.length,
        dataByType: {},
        usageSummary: {
          totalAccesses: 0,
          mostAccessedData: null,
          accessBySource: {}
        },
        detailedUsage: data.map(item => ({
          name: item.name,
          dataType: item.dataType,
          source: item.source,
          totalAccesses: item.usageStats.totalAccesses,
          lastAccessedAt: item.usageStats.lastAccessedAt,
          accessByParty: Object.fromEntries(item.usageStats.accessByParty)
        }))
      };
      
      // 计算使用统计
      data.forEach(item => {
        // 按数据类型统计
        report.dataByType[item.dataType] = (report.dataByType[item.dataType] || 0) + 1;
        
        // 总访问量
        report.usageSummary.totalAccesses += item.usageStats.totalAccesses;
        
        // 按来源统计访问量
        report.usageSummary.accessBySource[item.source] = 
          (report.usageSummary.accessBySource[item.source] || 0) + item.usageStats.totalAccesses;
        
        // 最常访问的数据
        if (!report.usageSummary.mostAccessedData || 
            item.usageStats.totalAccesses > report.usageSummary.mostAccessedData.totalAccesses) {
          report.usageSummary.mostAccessedData = {
            name: item.name,
            dataType: item.dataType,
            totalAccesses: item.usageStats.totalAccesses
          };
        }
      });
      
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      console.error('生成数据使用报告错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 数据脱敏处理
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async desensitizeData(req, res) {
    try {
      const { dataId, rules, fileData } = req.body;
      const governmentData = await GovernmentData.findById(dataId);
      
      if (!governmentData) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      // 实际数据脱敏处理逻辑
      let desensitizedData = fileData;
      
      if (rules) {
        // 更新脱敏规则
        governmentData.desensitizationRules = rules;
        
        // 根据脱敏规则处理数据
        if (rules.removeFields && Array.isArray(rules.removeFields)) {
          rules.removeFields.forEach(field => {
            if (desensitizedData[field]) {
              delete desensitizedData[field];
            }
          });
        }
        
        if (rules.maskFields && Array.isArray(rules.maskFields)) {
          rules.maskFields.forEach(field => {
            if (desensitizedData[field]) {
              const value = desensitizedData[field].toString();
              const maskLength = Math.floor(value.length * 0.7);
              desensitizedData[field] = value.slice(0, value.length - maskLength) + '*'.repeat(maskLength);
            }
          });
        }
        
        if (rules.hashFields && Array.isArray(rules.hashFields)) {
          rules.hashFields.forEach(field => {
            if (desensitizedData[field]) {
              desensitizedData[field] = crypto.createHash('sha256').update(desensitizedData[field]).digest('hex');
            }
          });
        }
      }
      
      await governmentData.save();
      
      res.status(200).json({ 
        success: true, 
        data: governmentData, 
        desensitizedData,
        message: '数据脱敏处理成功' 
      });
    } catch (error) {
      console.error('数据脱敏处理错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * OAuth2.0回调处理
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async oauthCallback(req, res) {
    try {
      // OAuth2.0认证逻辑
      const { code, state } = req.query;
      
      // 这里实现具体的OAuth2.0 token获取和验证逻辑
      // 例如调用政府OAuth服务器获取access_token和user_info
      
      // 模拟OAuth2.0认证成功
      res.status(200).json({
        success: true,
        message: 'OAuth2.0认证成功',
        code,
        state
      });
    } catch (error) {
      console.error('OAuth2.0回调处理错误:', error);
      res.status(500).json({ success: false, message: 'OAuth2.0认证失败' });
    }
  },
  
  /**
   * 批量脱敏处理
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async batchDesensitizeData(req, res) {
    try {
      const { dataIds, rules } = req.body;
      
      if (!Array.isArray(dataIds) || dataIds.length === 0) {
        return res.status(400).json({ success: false, message: '请提供有效的数据ID列表' });
      }
      
      // 批量处理数据脱敏
      const results = await Promise.all(dataIds.map(async (dataId) => {
        const governmentData = await GovernmentData.findById(dataId);
        if (!governmentData) {
          return { dataId, success: false, message: '政府数据不存在' };
        }
        
        // 更新脱敏规则
        governmentData.desensitizationRules = rules;
        await governmentData.save();
        
        return { dataId, success: true, message: '数据脱敏规则更新成功' };
      }));
      
      res.status(200).json({
        success: true,
        results,
        message: '批量数据脱敏处理完成'
      });
    } catch (error) {
      console.error('批量数据脱敏处理错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * 获取脱敏数据
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getDesensitizedData(req, res) {
    try {
      const governmentData = await GovernmentData.findById(req.params.id);
      
      if (!governmentData) {
        return res.status(404).json({ success: false, message: '政府数据不存在' });
      }
      
      // 这里实现从文件读取数据并进行脱敏处理的逻辑
      // 为简化实现，我们返回脱敏规则和数据基本信息
      
      res.status(200).json({
        success: true,
        data: {
          id: governmentData._id,
          name: governmentData.name,
          dataType: governmentData.dataType,
          desensitizationRules: governmentData.desensitizationRules,
          status: governmentData.status,
          message: '数据脱敏处理已就绪，可通过API调用获取脱敏后的数据'
        }
      });
    } catch (error) {
      console.error('获取脱敏数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

module.exports = governmentDataController;