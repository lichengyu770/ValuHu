const { query, pool } = require('../config/db');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');


/**
 * 资产看板控制器
 * 提供不动产组合总览、价值波动图表、风险预警等功能
 */
class AssetDashboardController {
  /**
   * 获取资产组合总览
   */
  getAssetOverview = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_properties'),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const enterpriseId = req.user.enterpriseId;
        
        // 获取房产数量和总面积
        const propertyStatsResult = await query(`
          SELECT 
            COUNT(*) as total_properties,
            SUM(area) as total_area,
            COUNT(DISTINCT city) as total_cities,
            COUNT(DISTINCT property_type) as total_property_types
          FROM properties 
          WHERE user_id = $1 OR enterprise_id = $2
        `, [userId, enterpriseId]);
        
        const { total_properties, total_area, total_cities, total_property_types } = propertyStatsResult.rows[0];
        
        // 获取最新估价统计（只获取每个房产的最新一次估价）
        const latestValuationsResult = await query(`
          SELECT 
            p.id, p.address, p.city, p.district, p.area, p.property_type,
            v.estimated_price, v.price_per_sqm, v.confidence_level, v.created_at
          FROM properties p
          JOIN valuations v ON p.id = v.property_id
          WHERE (p.user_id = $1 OR p.enterprise_id = $2)
          AND NOT EXISTS (
            SELECT 1 FROM valuations v2 WHERE p.id = v2.property_id AND v2.created_at > v.created_at
          )
          ORDER BY v.created_at DESC
        `, [userId, enterpriseId]);
        
        // 计算资产总值、平均价值、平均单价
        const totalValue = latestValuationsResult.rows.reduce((sum, row) => {
          return sum + (row.estimated_price || 0);
        }, 0);
        
        const totalProperties = parseInt(total_properties);
        const averageValue = totalProperties > 0 ? totalValue / totalProperties : 0;
        const averageArea = total_area ? parseFloat(total_area) / totalProperties : 0;
        
        // 计算平均单价（基于最新估价）
        const validValuations = latestValuationsResult.rows.filter(row => row.estimated_price && row.price_per_sqm);
        const averagePricePerSqm = validValuations.length > 0 
          ? validValuations.reduce((sum, row) => sum + row.price_per_sqm, 0) / validValuations.length 
          : 0;
        
        // 按房产类型统计
        const propertyTypeStats = latestValuationsResult.rows.reduce((stats, row) => {
          const type = row.property_type || 'unknown';
          if (!stats[type]) {
            stats[type] = {
              count: 0,
              totalValue: 0,
              totalArea: 0,
              averageValue: 0
            };
          }
          stats[type].count++;
          stats[type].totalValue += (row.estimated_price || 0);
          stats[type].totalArea += (row.area || 0);
          stats[type].averageValue = stats[type].totalValue / stats[type].count;
          return stats;
        }, {});
        
        // 按城市统计
        const cityStats = latestValuationsResult.rows.reduce((stats, row) => {
          const city = row.city || 'unknown';
          if (!stats[city]) {
            stats[city] = {
              count: 0,
              totalValue: 0,
              totalArea: 0
            };
          }
          stats[city].count++;
          stats[city].totalValue += (row.estimated_price || 0);
          stats[city].totalArea += (row.area || 0);
          return stats;
        }, {});
        
        // 计算价值分布（按区间）
        const valueDistribution = {
          low: 0,      // < 500万
          medium: 0,   // 500万 - 1000万
          high: 0,     // 1000万 - 2000万
          luxury: 0    // >= 2000万
        };
        
        latestValuationsResult.rows.forEach(row => {
          const price = row.estimated_price || 0;
          if (price < 5000000) {
            valueDistribution.low++;
          } else if (price < 10000000) {
            valueDistribution.medium++;
          } else if (price < 20000000) {
            valueDistribution.high++;
          } else {
            valueDistribution.luxury++;
          }
        });
        
        // 获取最近的10条估价记录
        const recentValuations = latestValuationsResult.rows.slice(0, 10).map(row => ({
          id: row.id,
          address: row.address,
          city: row.city,
          district: row.district,
          estimatedPrice: parseFloat(row.estimated_price),
          pricePerSqm: parseFloat(row.price_per_sqm),
          confidenceLevel: parseFloat(row.confidence_level),
          createdAt: row.created_at
        }));
        
        // 计算资产增值情况（基于最近两次估价）
        const valueChangeResult = await query(`
          WITH latest_valuations AS (
            SELECT 
              p.id, 
              v.estimated_price, 
              v.created_at,
              ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY v.created_at DESC) as rn
            FROM properties p
            JOIN valuations v ON p.id = v.property_id
            WHERE (p.user_id = $1 OR p.enterprise_id = $2)
          )
          SELECT 
            l1.id,
            l1.estimated_price as latest_price,
            l2.estimated_price as previous_price,
            l1.created_at as latest_date,
            l2.created_at as previous_date
          FROM latest_valuations l1
          LEFT JOIN latest_valuations l2 ON l1.id = l2.id AND l2.rn = 2
          WHERE l1.rn = 1
        `, [userId, enterpriseId]);
        
        // 计算总体增值情况
        let totalAppreciation = 0;
        let appreciatingProperties = 0;
        let depreciatingProperties = 0;
        let stableProperties = 0;
        
        valueChangeResult.rows.forEach(row => {
          if (row.previous_price && row.latest_price) {
            const change = row.latest_price - row.previous_price;
            if (change > 0) {
              totalAppreciation += change;
              appreciatingProperties++;
            } else if (change < 0) {
              depreciatingProperties++;
            } else {
              stableProperties++;
            }
          }
        });
        
        // 计算增值率
        const totalPreviousValue = valueChangeResult.rows.reduce((sum, row) => {
          return sum + (row.previous_price || 0);
        }, 0);
        
        const overallAppreciationRate = totalPreviousValue > 0 
          ? (totalAppreciation / totalPreviousValue) * 100 
          : 0;
        
        res.status(200).json({
          success: true,
          data: {
            // 基本统计
            totalProperties: parseInt(total_properties),
            totalArea: parseFloat(total_area || 0),
            totalCities: parseInt(total_cities),
            totalPropertyTypes: parseInt(total_property_types),
            
            // 价值统计
            totalValue: parseFloat(totalValue),
            averageValue: parseFloat(averageValue),
            averageArea: parseFloat(averageArea),
            averagePricePerSqm: parseFloat(averagePricePerSqm),
            
            // 增值情况
            totalAppreciation: parseFloat(totalAppreciation),
            overallAppreciationRate: parseFloat(overallAppreciationRate.toFixed(2)),
            appreciatingProperties,
            depreciatingProperties,
            stableProperties,
            
            // 分布统计
            propertyTypeStats,
            cityStats,
            valueDistribution,
            
            // 最近估价记录
            recentValuations
          }
        });
      } catch (error) {
        console.error('获取资产组合总览错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取价值波动图表数据
   */
  getValueTrend = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_valuations'),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const enterpriseId = req.user.enterpriseId;
        const { period = '3months', propertyId, granularity = 'week' } = req.query;
        
        // 确定时间范围
        let timeRangeQuery = '';
        let dateTrunc = granularity === 'day' ? 'day' : 
                      granularity === 'month' ? 'month' : 'week';
        
        // 根据period参数确定时间范围
        if (period === '1month') {
          timeRangeQuery = `WHERE v.created_at >= NOW() - INTERVAL '1 month'`;
          // 1个月内默认使用日粒度
          dateTrunc = 'day';
        } else if (period === '3months') {
          timeRangeQuery = `WHERE v.created_at >= NOW() - INTERVAL '3 months'`;
        } else if (period === '6months') {
          timeRangeQuery = `WHERE v.created_at >= NOW() - INTERVAL '6 months'`;
          // 6个月以上默认使用月粒度
          dateTrunc = 'month';
        } else if (period === '1year') {
          timeRangeQuery = `WHERE v.created_at >= NOW() - INTERVAL '1 year'`;
          dateTrunc = 'month';
        } else if (period === '2years') {
          timeRangeQuery = `WHERE v.created_at >= NOW() - INTERVAL '2 years'`;
          dateTrunc = 'month';
        }
        
        // 如果指定了房产ID，只查询该房产的估价记录
        let propertyFilter = '';
        const params = [];
        if (propertyId) {
          propertyFilter = `AND p.id = $1`;
          params.push(propertyId);
        }
        
        // 查询价值趋势数据
        const trendResult = await query(`
          SELECT 
            DATE_TRUNC('${dateTrunc}', v.created_at) as period,
            AVG(v.estimated_price) as avg_price,
            AVG(v.price_per_sqm) as avg_price_per_sqm,
            SUM(v.estimated_price) as total_value,
            COUNT(*) as valuation_count,
            COUNT(DISTINCT p.id) as property_count
          FROM properties p
          JOIN valuations v ON p.id = v.property_id
          WHERE (p.user_id = $${params.length + 1} OR p.enterprise_id = $${params.length + 2})
          ${propertyFilter}
          ${timeRangeQuery}
          GROUP BY period
          ORDER BY period
        `, [...params, userId, enterpriseId]);
        
        // 查询每月价值变化（用于计算同比/环比）
        const monthlyResult = await query(`
          SELECT 
            DATE_TRUNC('month', v.created_at) as month,
            AVG(v.estimated_price) as avg_price,
            SUM(v.estimated_price) as total_value
          FROM properties p
          JOIN valuations v ON p.id = v.property_id
          WHERE (p.user_id = $${params.length + 1} OR p.enterprise_id = $${params.length + 2})
          ${propertyFilter}
          GROUP BY month
          ORDER BY month
        `, [...params, userId, enterpriseId]);
        
        // 计算月度变化率（环比）
        const monthlyChanges = monthlyResult.rows.map((row, index) => {
          const changeRate = index > 0 ? 
            ((row.avg_price - monthlyResult.rows[index - 1].avg_price) / monthlyResult.rows[index - 1].avg_price) * 100 : 0;
          
          return {
            month: row.month,
            avg_price: parseFloat(row.avg_price),
            total_value: parseFloat(row.total_value),
            change_rate: parseFloat(changeRate.toFixed(2)),
            change_type: changeRate > 0 ? 'increase' : changeRate < 0 ? 'decrease' : 'stable'
          };
        });
        
        // 计算同比变化率
        const yearOverYearChanges = monthlyResult.rows.map((row, index) => {
          // 找到去年同期的数据
          const lastYearIndex = index - 12;
          if (lastYearIndex < 0) {
            return {
              month: row.month,
              avg_price: parseFloat(row.avg_price),
              year_over_year_rate: 0,
              change_type: 'stable'
            };
          }
          
          const lastYearPrice = monthlyResult.rows[lastYearIndex].avg_price;
          const yearOverYearRate = ((row.avg_price - lastYearPrice) / lastYearPrice) * 100;
          
          return {
            month: row.month,
            avg_price: parseFloat(row.avg_price),
            year_over_year_rate: parseFloat(yearOverYearRate.toFixed(2)),
            change_type: yearOverYearRate > 0 ? 'increase' : yearOverYearRate < 0 ? 'decrease' : 'stable'
          };
        });
        
        // 查询不同房产类型的价值趋势
        const propertyTypeTrendResult = await query(`
          SELECT 
            DATE_TRUNC('${dateTrunc}', v.created_at) as period,
            p.property_type,
            AVG(v.estimated_price) as avg_price
          FROM properties p
          JOIN valuations v ON p.id = v.property_id
          WHERE (p.user_id = $${params.length + 1} OR p.enterprise_id = $${params.length + 2})
          ${propertyFilter}
          ${timeRangeQuery}
          GROUP BY period, p.property_type
          ORDER BY period, p.property_type
        `, [...params, userId, enterpriseId]);
        
        // 组织不同房产类型的趋势数据
        const propertyTypeTrends = {};
        propertyTypeTrendResult.rows.forEach(row => {
          const type = row.property_type || 'unknown';
          if (!propertyTypeTrends[type]) {
            propertyTypeTrends[type] = [];
          }
          propertyTypeTrends[type].push({
            period: row.period,
            avg_price: parseFloat(row.avg_price)
          });
        });
        
        // 查询不同城市的价值趋势
        const cityTrendResult = await query(`
          SELECT 
            DATE_TRUNC('${dateTrunc}', v.created_at) as period,
            p.city,
            AVG(v.estimated_price) as avg_price
          FROM properties p
          JOIN valuations v ON p.id = v.property_id
          WHERE (p.user_id = $${params.length + 1} OR p.enterprise_id = $${params.length + 2})
          ${propertyFilter}
          ${timeRangeQuery}
          GROUP BY period, p.city
          ORDER BY period, p.city
        `, [...params, userId, enterpriseId]);
        
        // 组织不同城市的趋势数据
        const cityTrends = {};
        cityTrendResult.rows.forEach(row => {
          const city = row.city || 'unknown';
          if (!cityTrends[city]) {
            cityTrends[city] = [];
          }
          cityTrends[city].push({
            period: row.period,
            avg_price: parseFloat(row.avg_price)
          });
        });
        
        res.status(200).json({
          success: true,
          data: {
            // 主趋势数据
            trendData: trendResult.rows.map(row => ({
              period: row.period,
              avg_price: parseFloat(row.avg_price),
              avg_price_per_sqm: parseFloat(row.avg_price_per_sqm),
              total_value: parseFloat(row.total_value),
              valuation_count: parseInt(row.valuation_count),
              property_count: parseInt(row.property_count)
            })),
            
            // 月度变化数据
            monthlyChanges,
            
            // 同比变化数据
            yearOverYearChanges,
            
            // 不同房产类型的趋势数据
            propertyTypeTrends,
            
            // 不同城市的趋势数据
            cityTrends,
            
            // 查询参数
            period,
            granularity: dateTrunc,
            propertyId
          }
        });
      } catch (error) {
        console.error('获取价值波动图表数据错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取风险预警信息
   */
  getRiskAlerts = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_valuations'),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const enterpriseId = req.user.enterpriseId;
        
        // 查询所有房产的最新两次估价结果
        const valuationHistoryResult = await query(`
          WITH latest_valuations AS (
            SELECT 
              p.id, 
              p.address, 
              p.city, 
              p.district, 
              p.property_type,
              p.area,
              v.estimated_price,
              v.price_per_sqm,
              v.confidence_level,
              v.created_at,
              ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY v.created_at DESC) as rn
            FROM properties p
            JOIN valuations v ON p.id = v.property_id
            WHERE (p.user_id = $1 OR p.enterprise_id = $2)
          )
          SELECT 
            l1.id,
            l1.address,
            l1.city,
            l1.district,
            l1.property_type,
            l1.area,
            l1.estimated_price as latest_price,
            l1.price_per_sqm as latest_price_per_sqm,
            l1.confidence_level as latest_confidence,
            l1.created_at as latest_date,
            l2.estimated_price as previous_price,
            l2.price_per_sqm as previous_price_per_sqm,
            l2.confidence_level as previous_confidence,
            l2.created_at as previous_date
          FROM latest_valuations l1
          LEFT JOIN latest_valuations l2 ON l1.id = l2.id AND l2.rn = 2
          WHERE l1.rn = 1
        `, [userId, enterpriseId]);
        
        // 生成风险预警
        const riskAlerts = [];
        
        valuationHistoryResult.rows.forEach(row => {
          // 1. 价格下跌风险
          if (row.previous_price && row.latest_price) {
            // 计算价格变化率
            const priceChangeRate = ((row.latest_price - row.previous_price) / row.previous_price) * 100;
            
            // 根据下跌幅度生成不同级别的预警
            if (priceChangeRate < -15) {
              riskAlerts.push({
                id: uuidv4(),
                type: 'price_drop',
                property_id: row.id,
                address: row.address,
                city: row.city,
                district: row.district,
                property_type: row.property_type,
                area: parseFloat(row.area),
                latest_price: parseFloat(row.latest_price),
                previous_price: parseFloat(row.previous_price),
                change_rate: parseFloat(priceChangeRate.toFixed(2)),
                latest_date: row.latest_date,
                previous_date: row.previous_date,
                risk_level: 'high',
                message: `房产价值急剧下跌 ${Math.abs(priceChangeRate).toFixed(1)}%，请立即关注！`,
                recommendation: '建议重新评估房产价值，考虑市场变化因素'
              });
            } else if (priceChangeRate < -10) {
              riskAlerts.push({
                id: uuidv4(),
                type: 'price_drop',
                property_id: row.id,
                address: row.address,
                city: row.city,
                district: row.district,
                property_type: row.property_type,
                area: parseFloat(row.area),
                latest_price: parseFloat(row.latest_price),
                previous_price: parseFloat(row.previous_price),
                change_rate: parseFloat(priceChangeRate.toFixed(2)),
                latest_date: row.latest_date,
                previous_date: row.previous_date,
                risk_level: 'high',
                message: `房产价值下跌超过10%，请关注`,
                recommendation: '建议关注该区域市场动态，考虑是否需要调整资产配置'
              });
            } else if (priceChangeRate < -5) {
              riskAlerts.push({
                id: uuidv4(),
                type: 'price_drop',
                property_id: row.id,
                address: row.address,
                city: row.city,
                district: row.district,
                property_type: row.property_type,
                area: parseFloat(row.area),
                latest_price: parseFloat(row.latest_price),
                previous_price: parseFloat(row.previous_price),
                change_rate: parseFloat(priceChangeRate.toFixed(2)),
                latest_date: row.latest_date,
                previous_date: row.previous_date,
                risk_level: 'medium',
                message: `房产价值下跌超过5%，请注意`,
                recommendation: '建议定期监控该房产价值变化'
              });
            }
          }
          
          // 2. 估价置信度低风险
          if (row.latest_confidence && row.latest_confidence < 0.7) {
            riskAlerts.push({
              id: uuidv4(),
              type: 'low_confidence',
              property_id: row.id,
              address: row.address,
              city: row.city,
              district: row.district,
              property_type: row.property_type,
              area: parseFloat(row.area),
              latest_price: parseFloat(row.latest_price),
              confidence_level: parseFloat(row.latest_confidence),
              latest_date: row.latest_date,
              risk_level: 'medium',
              message: `房产估价置信度较低（${(row.latest_confidence * 100).toFixed(0)}%），估价结果可能不够准确`,
              recommendation: '建议提供更多房产详细信息，重新进行估价'
            });
          }
          
          // 3. 长时间未估价风险
          if (row.latest_date) {
            const daysSinceLastValuation = Math.floor((new Date() - new Date(row.latest_date)) / (1000 * 60 * 60 * 24));
            if (daysSinceLastValuation > 90) {
              riskAlerts.push({
                id: uuidv4(),
                type: 'outdated_valuation',
                property_id: row.id,
                address: row.address,
                city: row.city,
                district: row.district,
                property_type: row.property_type,
                area: parseFloat(row.area),
                latest_price: parseFloat(row.latest_price),
                latest_date: row.latest_date,
                days_since_last_valuation: daysSinceLastValuation,
                risk_level: 'low',
                message: `房产估价已超过${daysSinceLastValuation}天未更新，估价结果可能已过时`,
                recommendation: '建议重新评估房产价值，以反映最新市场情况'
              });
            }
          }
          
          // 4. 价格波动率异常风险
          if (row.previous_price && row.latest_price) {
            // 计算价格变化绝对值
            const priceChangeAbs = Math.abs(row.latest_price - row.previous_price);
            const avgPrice = (row.latest_price + row.previous_price) / 2;
            const volatility = (priceChangeAbs / avgPrice) * 100;
            
            // 如果价格波动超过20%，生成预警
            if (volatility > 20) {
              riskAlerts.push({
                id: uuidv4(),
                type: 'high_volatility',
                property_id: row.id,
                address: row.address,
                city: row.city,
                district: row.district,
                property_type: row.property_type,
                area: parseFloat(row.area),
                latest_price: parseFloat(row.latest_price),
                previous_price: parseFloat(row.previous_price),
                volatility: parseFloat(volatility.toFixed(2)),
                latest_date: row.latest_date,
                previous_date: row.previous_date,
                risk_level: 'medium',
                message: `房产价格波动异常（${volatility.toFixed(1)}%），市场可能存在不稳定因素`,
                recommendation: '建议密切关注该区域市场动态，考虑风险对冲策略'
              });
            }
          }
        });
        
        // 查询城市级别的风险（基于该城市所有房产的平均变化率）
        const cityRiskResult = await query(`
          WITH city_averages AS (
            SELECT 
              p.city,
              AVG(v.estimated_price) as avg_price,
              DATE_TRUNC('month', v.created_at) as month
            FROM properties p
            JOIN valuations v ON p.id = v.property_id
            WHERE (p.user_id = $1 OR p.enterprise_id = $2)
            GROUP BY p.city, DATE_TRUNC('month', v.created_at)
          ),
          city_changes AS (
            SELECT 
              c1.city,
              c1.avg_price as current_month,
              c2.avg_price as previous_month,
              c1.month
            FROM city_averages c1
            LEFT JOIN city_averages c2 ON c1.city = c2.city AND c2.month = c1.month - INTERVAL '1 month'
            WHERE c1.month = (SELECT MAX(month) FROM city_averages)
          )
          SELECT * FROM city_changes WHERE previous_month IS NOT NULL
        `, [userId, enterpriseId]);
        
        // 添加城市级别的风险预警
        cityRiskResult.rows.forEach(row => {
          const cityChangeRate = ((row.current_month - row.previous_month) / row.previous_month) * 100;
          
          if (cityChangeRate < -10) {
            riskAlerts.push({
              id: uuidv4(),
              type: 'city_price_drop',
              city: row.city,
              current_month_avg: parseFloat(row.current_month),
              previous_month_avg: parseFloat(row.previous_month),
              change_rate: parseFloat(cityChangeRate.toFixed(2)),
              month: row.month,
              risk_level: 'medium',
              message: `${row.city}市房产均价下跌 ${Math.abs(cityChangeRate).toFixed(1)}%，该区域市场可能存在下行风险`,
              recommendation: '建议关注该城市房产政策变化，评估资产配置风险'
            });
          }
        });
        
        // 按风险等级和时间排序
        riskAlerts.sort((a, b) => {
          const riskLevels = { high: 0, medium: 1, low: 2 };
          const timeA = a.latest_date || a.month || new Date();
          const timeB = b.latest_date || b.month || new Date();
          
          // 先按风险等级排序，再按时间排序（最新的在前）
          if (riskLevels[a.risk_level] !== riskLevels[b.risk_level]) {
            return riskLevels[a.risk_level] - riskLevels[b.risk_level];
          }
          return new Date(timeB) - new Date(timeA);
        });
        
        // 统计不同类型的预警数量
        const alertStats = {
          total: riskAlerts.length,
          high: riskAlerts.filter(alert => alert.risk_level === 'high').length,
          medium: riskAlerts.filter(alert => alert.risk_level === 'medium').length,
          low: riskAlerts.filter(alert => alert.risk_level === 'low').length,
          byType: {
            price_drop: riskAlerts.filter(alert => alert.type === 'price_drop').length,
            low_confidence: riskAlerts.filter(alert => alert.type === 'low_confidence').length,
            outdated_valuation: riskAlerts.filter(alert => alert.type === 'outdated_valuation').length,
            high_volatility: riskAlerts.filter(alert => alert.type === 'high_volatility').length,
            city_price_drop: riskAlerts.filter(alert => alert.type === 'city_price_drop').length
          }
        };
        
        res.status(200).json({
          success: true,
          data: {
            stats: alertStats,
            alerts: riskAlerts
          }
        });
      } catch (error) {
        console.error('获取风险预警信息错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取资产分布统计
   */
  getAssetDistribution = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_properties'),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const enterpriseId = req.user.enterpriseId;
        
        // 按房产类型分布
        const propertyTypeResult = await query(`
          SELECT property_type, COUNT(*) as count, SUM(area) as total_area
          FROM properties
          WHERE user_id = $1 OR enterprise_id = $2
          GROUP BY property_type
        `, [userId, enterpriseId]);
        
        // 按城市分布
        const cityResult = await query(`
          SELECT city, COUNT(*) as count, SUM(area) as total_area
          FROM properties
          WHERE user_id = $1 OR enterprise_id = $2
          GROUP BY city
        `, [userId, enterpriseId]);
        
        // 按价值区间分布
        const valueRangeResult = await query(`
          SELECT 
            CASE 
              WHEN v.estimated_price < 500000 THEN 'low'
              WHEN v.estimated_price < 1000000 THEN 'medium'
              WHEN v.estimated_price < 2000000 THEN 'high'
              ELSE 'luxury'
            END as value_range,
            COUNT(*) as count
          FROM properties p
          JOIN valuations v ON p.id = v.property_id
          WHERE (p.user_id = $1 OR p.enterprise_id = $2)
          GROUP BY value_range
        `, [userId, enterpriseId]);
        
        res.status(200).json({
          success: true,
          data: {
            byPropertyType: propertyTypeResult.rows,
            byCity: cityResult.rows,
            byValueRange: valueRangeResult.rows
          }
        });
      } catch (error) {
        console.error('获取资产分布统计错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];
}

const assetDashboardController = new AssetDashboardController();
module.exports = assetDashboardController;
