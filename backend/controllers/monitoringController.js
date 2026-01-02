const { query } = require('../config/db');
const { protect, authorize, checkPermission } = require('../middleware/auth');

/**
 * 监控控制器
 * 提供用户增长、API调用次数、活跃度等监控数据
 */
class MonitoringController {
  /**
   * 获取用户增长趋势
   */
  getUserGrowth = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government', 'admin'),
    checkPermission('view_analytics'),
    async (req, res) => {
      try {
        const { period = '30d', role, granularity = 'day' } = req.query;
        
        // 确定时间范围
        let timeFilter = '';
        if (period === '7d') {
          timeFilter = `WHERE u.created_at >= NOW() - INTERVAL '7 days'`;
        } else if (period === '30d') {
          timeFilter = `WHERE u.created_at >= NOW() - INTERVAL '30 days'`;
        } else if (period === '90d') {
          timeFilter = `WHERE u.created_at >= NOW() - INTERVAL '90 days'`;
        } else if (period === '1y') {
          timeFilter = `WHERE u.created_at >= NOW() - INTERVAL '1 year'`;
        } else if (period === 'all') {
          timeFilter = '';
        }
        
        // 确定时间粒度
        let dateTrunc = granularity === 'hour' ? 'hour' : 
                      granularity === 'week' ? 'week' : 
                      granularity === 'month' ? 'month' : 'day';
        
        // 构建查询条件
        let roleFilter = '';
        if (role) {
          roleFilter = `AND u.role = $1`;
        }
        
        // 查询用户增长趋势
        const growthResult = await query(`
          SELECT 
            DATE_TRUNC('${dateTrunc}', u.created_at) as date,
            COUNT(*) as new_users,
            u.role
          FROM users u
          ${timeFilter}
          ${roleFilter}
          GROUP BY DATE_TRUNC('${dateTrunc}', u.created_at), u.role
          ORDER BY date
        `, role ? [role] : []);
        
        // 查询总用户数
        const totalResult = await query(`
          SELECT 
            COUNT(*) as total_users,
            u.role
          FROM users u
          ${role ? 'WHERE u.role = $1' : ''}
          GROUP BY u.role
        `, role ? [role] : []);
        
        // 查询用户留存率（近7天新用户的次日留存）
        let retentionResult = [];
        if (period === '7d' || period === '30d') {
          retentionResult = await query(`
            WITH new_users AS (
              SELECT 
                u.id,
                u.created_at,
                u.role
              FROM users u
              WHERE u.created_at >= NOW() - INTERVAL '7 days'
              ${roleFilter}
            )
            SELECT 
              DATE_TRUNC('day', nu.created_at) as signup_date,
              COUNT(nu.id) as new_users,
              COUNT(DISTINCT v.user_id) as retained_users,
              CASE 
                WHEN COUNT(nu.id) > 0 THEN 
                  (COUNT(DISTINCT v.user_id)::float / COUNT(nu.id)::float) * 100 
                ELSE 0 
              END as retention_rate,
              nu.role
            FROM new_users nu
            LEFT JOIN valuations v ON nu.id = v.user_id 
              AND v.created_at > nu.created_at 
              AND v.created_at < nu.created_at + INTERVAL '2 days'
            GROUP BY DATE_TRUNC('day', nu.created_at), nu.role
            ORDER BY signup_date
          `, role ? [role] : []);
        }
        
        // 查询用户来源统计
        const sourceResult = await query(`
          SELECT 
            u.source,
            COUNT(*) as count,
            ROUND((COUNT(*)::float / (SELECT COUNT(*) FROM users ${role ? 'WHERE role = $1' : ''})::float) * 100, 2) as percentage
          FROM users u
          ${role ? 'WHERE u.role = $1' : ''}
          GROUP BY u.source
          ORDER BY count DESC
        `, role ? [role] : []);
        
        // 查询用户增长预测（基于近30天数据）
        let forecastResult = [];
        if (period === '30d' || period === '90d' || period === '1y') {
          const recentGrowthResult = await query(`
            SELECT 
              DATE_TRUNC('day', u.created_at) as date,
              COUNT(*) as new_users
            FROM users u
            WHERE u.created_at >= NOW() - INTERVAL '30 days'
            ${roleFilter}
            GROUP BY DATE_TRUNC('day', u.created_at)
            ORDER BY date
          `, role ? [role] : []);
          
          // 简单的线性预测
          if (recentGrowthResult.rows.length > 1) {
            const avgDailyGrowth = recentGrowthResult.rows.reduce((sum, row) => sum + row.new_users, 0) / recentGrowthResult.rows.length;
            const lastDate = recentGrowthResult.rows[recentGrowthResult.rows.length - 1].date;
            
            // 预测未来7天的增长
            for (let i = 1; i <= 7; i++) {
              const forecastDate = new Date(lastDate);
              forecastDate.setDate(forecastDate.getDate() + i);
              forecastResult.push({
                date: forecastDate,
                forecast_users: Math.round(avgDailyGrowth),
                confidence_level: 0.85 // 简单的置信度
              });
            }
          }
        }
        
        res.status(200).json({
          success: true,
          data: {
            growthTrend: growthResult.rows,
            totalUsers: totalResult.rows,
            retentionRate: retentionResult.rows,
            userSource: sourceResult.rows,
            growthForecast: forecastResult,
            period,
            granularity,
            role
          }
        });
      } catch (error) {
        console.error('获取用户增长趋势错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取API调用次数统计
   */
  getApiUsage = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government', 'admin'),
    checkPermission('view_analytics'),
    async (req, res) => {
      try {
        const { period = '30d', endpoint, clientType } = req.query;
        
        // 确定时间范围
        let timeFilter = '';
        if (period === '7d') {
          timeFilter = `WHERE created_at >= NOW() - INTERVAL '7 days'`;
        } else if (period === '30d') {
          timeFilter = `WHERE created_at >= NOW() - INTERVAL '30 days'`;
        } else if (period === '90d') {
          timeFilter = `WHERE created_at >= NOW() - INTERVAL '90 days'`;
        } else if (period === '1y') {
          timeFilter = `WHERE created_at >= NOW() - INTERVAL '1 year'`;
        }
        
        // 构建查询条件
        let endpointFilter = '';
        let clientTypeFilter = '';
        let queryParams = [];
        
        if (endpoint) {
          endpointFilter = `AND endpoint LIKE $${queryParams.length + 1}`;
          queryParams.push(`%${endpoint}%`);
        }
        
        if (clientType) {
          clientTypeFilter = `AND client_type = $${queryParams.length + 1}`;
          queryParams.push(clientType);
        }
        
        // 查询API调用统计
        const usageResult = await query(`
          SELECT 
            DATE_TRUNC('day', created_at) as date,
            endpoint,
            client_type,
            COUNT(*) as call_count,
            SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
            AVG(response_time) as avg_response_time
          FROM api_logs
          ${timeFilter}
          ${endpointFilter}
          ${clientTypeFilter}
          GROUP BY DATE_TRUNC('day', created_at), endpoint, client_type
          ORDER BY date
        `, queryParams);
        
        // 查询总调用次数
        const totalResult = await query(`
          SELECT 
            endpoint,
            COUNT(*) as total_calls,
            SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success_calls,
            SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_calls,
            ROUND((SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END)::float / COUNT(*)::float) * 100, 2) as success_rate,
            AVG(response_time) as avg_response_time
          FROM api_logs
          ${endpoint ? 'WHERE endpoint LIKE $1' : ''}
          ${clientType ? 'AND client_type = $2' : ''}
          GROUP BY endpoint
          ORDER BY total_calls DESC
        `, queryParams);
        
        // 查询API调用峰值（按小时统计）
        let peakResult = [];
        if (period === '7d' || period === '30d') {
          peakResult = await query(`
            SELECT 
              DATE_TRUNC('hour', created_at) as hour,
              COUNT(*) as call_count
            FROM api_logs
            ${timeFilter}
            ${endpointFilter}
            ${clientTypeFilter}
            GROUP BY DATE_TRUNC('hour', created_at)
            ORDER BY call_count DESC
            LIMIT 10
          `, queryParams);
        }
        
        // 查询慢API调用（响应时间>1秒）
        const slowApiResult = await query(`
          SELECT 
            endpoint,
            COUNT(*) as slow_calls,
            AVG(response_time) as avg_response_time,
            MAX(response_time) as max_response_time
          FROM api_logs
          WHERE response_time > 1000
          ${timeFilter}
          ${endpointFilter}
          ${clientTypeFilter}
          GROUP BY endpoint
          ORDER BY slow_calls DESC
          LIMIT 10
        `, queryParams);
        
        res.status(200).json({
          success: true,
          data: {
            usageTrend: usageResult.rows,
            totalCalls: totalResult.rows,
            peakCalls: peakResult,
            slowApiCalls: slowApiResult,
            period,
            endpoint,
            clientType
          }
        });
      } catch (error) {
        console.error('获取API调用次数统计错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取用户活跃度
   */
  getActivity = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government', 'admin'),
    checkPermission('view_analytics'),
    async (req, res) => {
      try {
        const { period = '30d', role, propertyType } = req.query;
        
        // 确定时间范围
        let timeFilter = '';
        if (period === '7d') {
          timeFilter = `WHERE v.created_at >= NOW() - INTERVAL '7 days'`;
        } else if (period === '30d') {
          timeFilter = `WHERE v.created_at >= NOW() - INTERVAL '30 days'`;
        } else if (period === '90d') {
          timeFilter = `WHERE v.created_at >= NOW() - INTERVAL '90 days'`;
        } else if (period === '1y') {
          timeFilter = `WHERE v.created_at >= NOW() - INTERVAL '1 year'`;
        }
        
        // 构建查询条件
        let roleFilter = '';
        let propertyTypeFilter = '';
        let queryParams = [];
        
        if (role) {
          roleFilter = `AND u.role = $${queryParams.length + 1}`;
          queryParams.push(role);
        }
        
        if (propertyType) {
          propertyTypeFilter = `AND p.property_type = $${queryParams.length + 1}`;
          queryParams.push(propertyType);
        }
        
        // 查询用户活跃度
        const activityResult = await query(`
          SELECT 
            DATE_TRUNC('day', v.created_at) as date,
            u.role,
            COUNT(DISTINCT v.user_id) as active_users,
            COUNT(*) as total_valuations,
            COUNT(DISTINCT p.id) as unique_properties,
            AVG(v.confidence_level) as avg_confidence
          FROM valuations v
          JOIN users u ON v.user_id = u.id
          JOIN properties p ON v.property_id = p.id
          ${timeFilter}
          ${roleFilter}
          ${propertyTypeFilter}
          GROUP BY DATE_TRUNC('day', v.created_at), u.role
          ORDER BY date
        `, queryParams);
        
        // 查询活跃用户总数
        const activeUsersResult = await query(`
          SELECT 
            u.role,
            COUNT(DISTINCT v.user_id) as active_users,
            COUNT(DISTINCT p.id) as unique_properties,
            COUNT(*) as total_valuations
          FROM valuations v
          JOIN users u ON v.user_id = u.id
          JOIN properties p ON v.property_id = p.id
          ${timeFilter}
          ${roleFilter}
          ${propertyTypeFilter}
          GROUP BY u.role
        `, queryParams);
        
        // 查询用户活跃度分布（按活跃天数）
        const activityDistributionResult = await query(`
          WITH user_activity AS (
            SELECT 
              v.user_id,
              COUNT(DISTINCT DATE_TRUNC('day', v.created_at)) as active_days,
              u.role
            FROM valuations v
            JOIN users u ON v.user_id = u.id
            ${timeFilter}
            ${roleFilter}
            GROUP BY v.user_id, u.role
          )
          SELECT 
            CASE 
              WHEN active_days = 1 THEN '1天' 
              WHEN active_days BETWEEN 2 AND 7 THEN '2-7天'
              WHEN active_days BETWEEN 8 AND 14 THEN '8-14天'
              WHEN active_days BETWEEN 15 AND 21 THEN '15-21天'
              WHEN active_days BETWEEN 22 AND 28 THEN '22-28天'
              ELSE '29天以上'
            END as activity_level,
            COUNT(*) as user_count,
            role
          FROM user_activity
          GROUP BY activity_level, role
          ORDER BY 
            CASE 
              WHEN activity_level = '1天' THEN 1 
              WHEN activity_level = '2-7天' THEN 2
              WHEN activity_level = '8-14天' THEN 3
              WHEN activity_level = '15-21天' THEN 4
              WHEN activity_level = '22-28天' THEN 5
              ELSE 6
            END
        `, queryParams);
        
        // 查询估价类型分布
        const valuationTypeResult = await query(`
          SELECT 
            v.model_type,
            COUNT(*) as count,
            COUNT(DISTINCT v.user_id) as unique_users
          FROM valuations v
          JOIN users u ON v.user_id = u.id
          ${timeFilter}
          ${roleFilter}
          GROUP BY v.model_type
          ORDER BY count DESC
        `, queryParams);
        
        res.status(200).json({
          success: true,
          data: {
            activityTrend: activityResult.rows,
            activeUsers: activeUsersResult.rows,
            activityDistribution: activityDistributionResult.rows,
            valuationType: valuationTypeResult.rows,
            period,
            role,
            propertyType
          }
        });
      } catch (error) {
        console.error('获取用户活跃度错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取系统概览
   */
  getSystemOverview = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government', 'admin'),
    checkPermission('view_analytics'),
    async (req, res) => {
      try {
        // 查询总用户数
        const totalUsersResult = await query(`SELECT COUNT(*) as total FROM users`);
        const totalUsers = parseInt(totalUsersResult.rows[0].total);
        
        // 查询今日活跃用户数
        const todayActiveResult = await query(`
          SELECT COUNT(DISTINCT user_id) as active FROM valuations 
          WHERE created_at >= CURRENT_DATE
        `);
        const todayActive = parseInt(todayActiveResult.rows[0].active);
        
        // 查询总估价次数
        const totalValuationsResult = await query(`SELECT COUNT(*) as total FROM valuations`);
        const totalValuations = parseInt(totalValuationsResult.rows[0].total);
        
        // 查询今日估价次数
        const todayValuationsResult = await query(`
          SELECT COUNT(*) as total FROM valuations 
          WHERE created_at >= CURRENT_DATE
        `);
        const todayValuations = parseInt(todayValuationsResult.rows[0].total);
        
        // 查询各角色用户分布
        const userRolesResult = await query(`
          SELECT role, COUNT(*) as count FROM users GROUP BY role
        `);
        
        res.status(200).json({
          success: true,
          data: {
            totalUsers,
            todayActive,
            totalValuations,
            todayValuations,
            userRoles: userRolesResult.rows
          }
        });
      } catch (error) {
        console.error('获取系统概览错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];
}

const monitoringController = new MonitoringController();
module.exports = monitoringController;