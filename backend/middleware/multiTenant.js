const multiTenantMiddleware = (req, res, next) => {
    // 从请求中获取租户ID
    // 优先级：1. API Key 2. JWT Token 3. 请求头 4. 查询参数
    let tenantId = null;
    
    // 1. 从API Key中获取租户ID
    if (req.headers['x-api-key']) {
        // 在实际应用中，应该从数据库或缓存中根据API Key查找对应的租户ID
        // 这里简化处理，直接返回一个示例租户ID
        tenantId = '60c72b2f9b1e8c001c8e4f5a';
    }
    
    // 2. 从JWT Token中获取租户ID
    if (!tenantId && req.user && req.user.enterpriseId) {
        tenantId = req.user.enterpriseId;
    }
    
    // 3. 从请求头中获取租户ID
    if (!tenantId && req.headers['x-tenant-id']) {
        tenantId = req.headers['x-tenant-id'];
    }
    
    // 4. 从查询参数中获取租户ID
    if (!tenantId && req.query.tenant_id) {
        tenantId = req.query.tenant_id;
    }
    
    // 如果仍然没有租户ID，设置默认租户ID
    if (!tenantId) {
        tenantId = '60c72b2f9b1e8c001c8e4f5a'; // 默认租户ID
    }
    
    // 将租户ID添加到请求对象中
    req.tenantId = tenantId;
    
    // 将租户ID添加到响应头中，以便客户端确认
    res.setHeader('X-Tenant-ID', tenantId);
    
    next();
};

module.exports = multiTenantMiddleware;
