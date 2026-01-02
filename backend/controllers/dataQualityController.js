const { query, pool } = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

/**
 * 数据质量管理控制器
 * 提供数据质量监控、异常数据标记、手动修正估价结果、模型精度分析等功能
 */

// 中间件数组，包含保护和授权
const withAuth = [protect, authorize('admin', 'enterprise', 'government')];
const adminAuth = [protect, authorize('admin')];
const modelAuth = [protect, authorize('admin', 'government', 'academic')];

/**
 * 获取低置信度的异常估价列表
 */
const getLowConfidenceValuations = [
  ...withAuth,
  async (req, res) => {
    try {
      const { threshold = 0.8, limit = 50, offset = 0 } = req.query;
      
      // 查询低置信度的估价记录
      const sql = `
        SELECT v.*, p.address, p.city, p.district
        FROM valuations v
        JOIN properties p ON v.property_id = p.id
        WHERE v.confidence_level < $1
        ORDER BY v.confidence_level ASC, v.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const { rows } = await query(sql, [threshold, parseInt(limit), parseInt(offset)]);
      
      // 获取总数
      const countSql = `SELECT COUNT(*) as total FROM valuations WHERE confidence_level < $1`;
      const { rows: countRows } = await query(countSql, [threshold]);
      
      res.status(200).json({
        success: true,
        data: {
          valuations: rows,
          total: parseInt(countRows[0].total),
          threshold: parseFloat(threshold),
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('获取低置信度估价列表错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

/**
 * 标记数据为异常
 */
const markAsAnomaly = [
  ...withAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, severity = 'medium' } = req.body;
      
      // 检查估价记录是否存在
      const checkSql = `SELECT * FROM valuations WHERE id = $1`;
      const { rows: checkRows } = await query(checkSql, [id]);
      
      if (!checkRows.length) {
        return res.status(404).json({ success: false, message: '估价记录不存在' });
      }
      
      // 更新估价记录，添加异常标记
      const updateSql = `
        UPDATE valuations 
        SET 
          metadata = COALESCE(metadata, '{}')::jsonb || $2::jsonb,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const metadataUpdate = {
        is_anomaly: true,
        anomaly_reason: reason,
        anomaly_severity: severity,
        anomaly_marked_by: req.user.id,
        anomaly_marked_at: new Date().toISOString()
      };
      
      const { rows: updatedRows } = await query(updateSql, [id, metadataUpdate]);
      
      res.status(200).json({
        success: true,
        data: updatedRows[0],
        message: '异常数据标记成功'
      });
    } catch (error) {
      console.error('标记异常数据错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

/**
 * 取消异常标记
 */
const unmarkAnomaly = [
  ...withAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // 检查估价记录是否存在
      const checkSql = `SELECT * FROM valuations WHERE id = $1`;
      const { rows: checkRows } = await query(checkSql, [id]);
      
      if (!checkRows.length) {
        return res.status(404).json({ success: false, message: '估价记录不存在' });
      }
      
      // 更新估价记录，移除异常标记
      const updateSql = `
        UPDATE valuations 
        SET 
          metadata = CASE 
            WHEN metadata IS NOT NULL THEN 
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    jsonb_set(
                      jsonb_set(
                        metadata::jsonb, 
                        '{is_anomaly}', 
                        'false'::jsonb
                      ),
                      '{anomaly_reason}',
                      'null'::jsonb
                    ),
                    '{anomaly_severity}',
                    'null'::jsonb
                  ),
                  '{anomaly_marked_by}',
                  'null'::jsonb
                ),
                '{anomaly_marked_at}',
                'null'::jsonb
              )
            ELSE '{}'::jsonb
          END,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const { rows: updatedRows } = await query(updateSql, [id]);
      
      res.status(200).json({
        success: true,
        data: updatedRows[0],
        message: '异常标记已取消'
      });
    } catch (error) {
      console.error('取消异常标记错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

/**
 * 手动修正估价结果
 */
const manualCorrectValuation = [
  ...withAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { estimated_price, price_per_sqm, notes } = req.body;
      
      // 检查估价记录是否存在
      const checkSql = `SELECT * FROM valuations WHERE id = $1`;
      const { rows: checkRows } = await query(checkSql, [id]);
      
      if (!checkRows.length) {
        return res.status(404).json({ success: false, message: '估价记录不存在' });
      }
      
      const originalValuation = checkRows[0];
      
      // 更新估价记录
      const updateSql = `
        UPDATE valuations 
        SET 
          estimated_price = $2,
          price_per_sqm = $3,
          confidence_level = 1.0,
          metadata = COALESCE(metadata, '{}')::jsonb || $4::jsonb,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const metadataUpdate = {
        manually_corrected: true,
        original_estimated_price: originalValuation.estimated_price,
        original_price_per_sqm: originalValuation.price_per_sqm,
        corrected_by: req.user.id,
        corrected_at: new Date().toISOString(),
        correction_notes: notes
      };
      
      const { rows: updatedRows } = await query(updateSql, [id, estimated_price, price_per_sqm, metadataUpdate]);
      
      res.status(200).json({
        success: true,
        data: updatedRows[0],
        message: '估价结果修正成功'
      });
    } catch (error) {
      console.error('手动修正估价结果错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

/**
 * 获取模型精度统计
 */
const getModelAccuracy = [
  ...modelAuth,
  async (req, res) => {
    try {
      const { model_type, start_date, end_date } = req.query;
      
      // 构建查询条件
      let whereClause = '';
      const params = [];
      let paramIndex = 1;
      
      if (model_type) {
        whereClause = `WHERE model_type = $${paramIndex}`;
        params.push(model_type);
        paramIndex++;
      }
      
      if (start_date) {
        whereClause += whereClause ? ' AND ' : 'WHERE ';
        whereClause += `created_at >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }
      
      if (end_date) {
        whereClause += whereClause ? ' AND ' : 'WHERE ';
        whereClause += `created_at <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }
      
      // 查询模型精度统计
      const accuracySql = `
        SELECT 
          model_type,
          COUNT(*) as total_valuations,
          AVG(confidence_level) as avg_confidence,
          MIN(confidence_level) as min_confidence,
          MAX(confidence_level) as max_confidence,
          COUNT(CASE WHEN confidence_level >= 0.9 THEN 1 END) as high_confidence_count,
          COUNT(CASE WHEN confidence_level < 0.8 THEN 1 END) as low_confidence_count,
          COUNT(CASE WHEN metadata::jsonb->>'manually_corrected' = 'true' THEN 1 END) as corrected_count
        FROM valuations
        ${whereClause}
        GROUP BY model_type
        ORDER BY total_valuations DESC
      `;
      
      const { rows: accuracyRows } = await query(accuracySql, params);
      
      // 查询置信度分布
      const distributionSql = `
        SELECT 
          model_type,
          FLOOR(confidence_level * 10) / 10 as confidence_range,
          COUNT(*) as count
        FROM valuations
        ${whereClause}
        GROUP BY model_type, confidence_range
        ORDER BY model_type, confidence_range
      `;
      
      const { rows: distributionRows } = await query(distributionSql, params);
      
      // 处理分布数据，按模型类型分组
      const confidenceDistribution = {};
      distributionRows.forEach(row => {
        if (!confidenceDistribution[row.model_type]) {
          confidenceDistribution[row.model_type] = [];
        }
        confidenceDistribution[row.model_type].push({
          range: row.confidence_range,
          count: parseInt(row.count)
        });
      });
      
      res.status(200).json({
        success: true,
        data: {
          model_accuracy: accuracyRows,
          confidence_distribution: confidenceDistribution
        }
      });
    } catch (error) {
      console.error('获取模型精度错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

/**
 * 获取异常数据列表
 */
const getAnomalyValuations = [
  ...withAuth,
  async (req, res) => {
    try {
      const { severity, limit = 50, offset = 0 } = req.query;
      
      // 构建查询条件
      let whereClause = `WHERE metadata::jsonb->>'is_anomaly' = 'true'`;
      const params = [];
      let paramIndex = 1;
      
      if (severity) {
        whereClause += ` AND metadata::jsonb->>'anomaly_severity' = $${paramIndex}`;
        params.push(severity);
        paramIndex++;
      }
      
      // 查询异常数据
      const sql = `
        SELECT v.*, p.address, p.city, p.district
        FROM valuations v
        JOIN properties p ON v.property_id = p.id
        ${whereClause}
        ORDER BY (metadata::jsonb->>'anomaly_severity') ASC, v.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      
      const { rows } = await query(sql, params);
      
      // 获取总数
      const countSql = `
        SELECT COUNT(*) as total 
        FROM valuations 
        ${whereClause}
      `;
      const { rows: countRows } = await query(countSql, params.slice(0, -2));
      
      res.status(200).json({
        success: true,
        data: {
          valuations: rows,
          total: parseInt(countRows[0].total),
          severity,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('获取异常数据列表错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

/**
 * 获取数据质量报告
 */
const getDataQualityReport = [
  ...modelAuth,
  async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // 确定时间范围
      let timeRange = '';
      if (period === '7d') {
        timeRange = 'WHERE v.created_at >= NOW() - INTERVAL 7 days';
      } else if (period === '30d') {
        timeRange = 'WHERE v.created_at >= NOW() - INTERVAL 30 days';
      } else if (period === '90d') {
        timeRange = 'WHERE v.created_at >= NOW() - INTERVAL 90 days';
      } else if (period === '1y') {
        timeRange = 'WHERE v.created_at >= NOW() - INTERVAL 1 year';
      }
      
      // 计算总体数据质量指标
      const qualitySql = `
        SELECT 
          COUNT(*) as total_valuations,
          COUNT(CASE WHEN v.confidence_level >= 0.9 THEN 1 END) as high_confidence,
          COUNT(CASE WHEN v.confidence_level < 0.8 THEN 1 END) as low_confidence,
          COUNT(CASE WHEN v.metadata::jsonb->>'is_anomaly' = 'true' THEN 1 END) as anomalies,
          COUNT(CASE WHEN v.metadata::jsonb->>'manually_corrected' = 'true' THEN 1 END) as corrected,
          AVG(v.confidence_level) as avg_confidence
        FROM valuations v
        ${timeRange}
      `;
      
      const { rows: qualityRows } = await query(qualitySql);
      const qualityMetrics = qualityRows[0];
      
      // 获取每日数据质量趋势
      const trendSql = `
        SELECT 
          DATE_TRUNC('day', v.created_at) as date,
          COUNT(*) as total_valuations,
          AVG(v.confidence_level) as avg_confidence,
          COUNT(CASE WHEN v.confidence_level < 0.8 THEN 1 END) as low_confidence_count
        FROM valuations v
        ${timeRange}
        GROUP BY DATE_TRUNC('day', v.created_at)
        ORDER BY date
      `;
      
      const { rows: trendRows } = await query(trendSql);
      
      // 获取按城市的质量分布
      const citySql = `
        SELECT 
          p.city,
          COUNT(*) as total_valuations,
          AVG(v.confidence_level) as avg_confidence,
          COUNT(CASE WHEN v.confidence_level < 0.8 THEN 1 END) as low_confidence_count
        FROM valuations v
        JOIN properties p ON v.property_id = p.id
        ${timeRange}
        GROUP BY p.city
        ORDER BY total_valuations DESC
        LIMIT 10
      `;
      
      const { rows: cityRows } = await query(citySql);
      
      res.status(200).json({
        success: true,
        data: {
          period,
          quality_metrics: {
            total_valuations: parseInt(qualityMetrics.total_valuations),
            high_confidence_count: parseInt(qualityMetrics.high_confidence),
            low_confidence_count: parseInt(qualityMetrics.low_confidence),
            anomaly_count: parseInt(qualityMetrics.anomalies),
            corrected_count: parseInt(qualityMetrics.corrected),
            avg_confidence: parseFloat(qualityMetrics.avg_confidence),
            high_confidence_rate: qualityMetrics.total_valuations > 0 ? 
              parseFloat(qualityMetrics.high_confidence) / parseInt(qualityMetrics.total_valuations) : 0,
            low_confidence_rate: qualityMetrics.total_valuations > 0 ? 
              parseFloat(qualityMetrics.low_confidence) / parseInt(qualityMetrics.total_valuations) : 0,
            anomaly_rate: qualityMetrics.total_valuations > 0 ? 
              parseFloat(qualityMetrics.anomalies) / parseInt(qualityMetrics.total_valuations) : 0,
            correction_rate: qualityMetrics.total_valuations > 0 ? 
              parseFloat(qualityMetrics.corrected) / parseInt(qualityMetrics.total_valuations) : 0
          },
          daily_trend: trendRows.map(row => ({
            date: row.date,
            total_valuations: parseInt(row.total_valuations),
            avg_confidence: parseFloat(row.avg_confidence),
            low_confidence_count: parseInt(row.low_confidence_count)
          })),
          city_distribution: cityRows.map(row => ({
            city: row.city,
            total_valuations: parseInt(row.total_valuations),
            avg_confidence: parseFloat(row.avg_confidence),
            low_confidence_count: parseInt(row.low_confidence_count),
            low_confidence_rate: parseFloat(row.low_confidence_count) / parseInt(row.total_valuations)
          }))
        }
      });
    } catch (error) {
      console.error('获取数据质量报告错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
];

module.exports = {
  getLowConfidenceValuations,
  markAsAnomaly,
  unmarkAnomaly,
  manualCorrectValuation,
  getModelAccuracy,
  getDataQualityReport
};