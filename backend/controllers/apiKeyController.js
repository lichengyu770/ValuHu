const ApiKey = require('../models/ApiKey');
const Enterprise = require('../models/Enterprise');

// 申请API Key
exports.createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresAt, description, rateLimit } = req.body;
    const userId = req.user.id;
    
    // 检查用户权限
    if (req.user.role === 'personal') {
      return res.status(403).json({ message: '个人用户无法申请API Key' });
    }
    
    // 企业用户需要关联企业
    let enterpriseId = null;
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (!enterprise) {
        return res.status(404).json({ message: '未找到关联的企业' });
      }
      enterpriseId = enterprise._id;
    }
    
    // 创建API Key
    const apiKey = new ApiKey({
      userId,
      enterpriseId,
      name,
      permissions,
      expiresAt,
      description,
      rateLimit
    });
    
    await apiKey.save();
    
    res.status(201).json({
      success: true,
      message: 'API Key申请成功',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key, // 只在创建时返回完整key，之后不再返回
        permissions: apiKey.permissions,
        status: apiKey.status,
        expiresAt: apiKey.expiresAt,
        rateLimit: apiKey.rateLimit,
        createdAt: apiKey.createdAt
      }
    });
    
  } catch (error) {
    console.error('创建API Key错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取API Key列表
exports.getApiKeys = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { userId };
    
    // 企业管理员可以查看企业所有API Key
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.$or = [
          { userId },
          { enterpriseId: enterprise._id }
        ];
      }
    }
    
    // 查询API Key列表
    const apiKeys = await ApiKey.find(query).select('-key -keyHash');
    
    res.status(200).json({
      success: true,
      data: apiKeys
    });
    
  } catch (error) {
    console.error('获取API Key列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取单个API Key详情
exports.getApiKeyById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { _id: id, userId };
    
    // 企业管理员可以查看企业所有API Key
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.$or = [
          { _id: id, userId },
          { _id: id, enterpriseId: enterprise._id }
        ];
      }
    }
    
    // 查询API Key
    const apiKey = await ApiKey.findOne(query).select('-key -keyHash');
    
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: apiKey
    });
    
  } catch (error) {
    console.error('获取API Key详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新API Key
exports.updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, status, expiresAt, description, rateLimit } = req.body;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { _id: id, userId };
    
    // 企业管理员可以更新企业所有API Key
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.$or = [
          { _id: id, userId },
          { _id: id, enterpriseId: enterprise._id }
        ];
      }
    }
    
    // 构建更新数据对象
    const updateData = {
      name,
      permissions,
      status,
      expiresAt,
      description,
      updatedAt: Date.now()
    };
    
    // 只有在rateLimit存在时才更新
    if (rateLimit) {
      updateData.rateLimit = rateLimit;
    }
    
    // 更新API Key
    const apiKey = await ApiKey.findOneAndUpdate(
      query,
      updateData,
      { new: true }
    ).select('-key -keyHash');
    
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key不存在或无权限' });
    }
    
    res.status(200).json({
      success: true,
      message: 'API Key更新成功',
      data: apiKey
    });
    
  } catch (error) {
    console.error('更新API Key错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 删除API Key
exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { _id: id, userId };
    
    // 企业管理员可以删除企业所有API Key
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.$or = [
          { _id: id, userId },
          { _id: id, enterpriseId: enterprise._id }
        ];
      }
    }
    
    // 删除API Key
    const apiKey = await ApiKey.findOneAndDelete(query);
    
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key不存在或无权限' });
    }
    
    res.status(200).json({
      success: true,
      message: 'API Key删除成功'
    });
    
  } catch (error) {
    console.error('删除API Key错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取API Key使用统计
exports.getApiKeyStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = { _id: id, userId };
    
    // 企业管理员可以查看企业所有API Key统计
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.$or = [
          { _id: id, userId },
          { _id: id, enterpriseId: enterprise._id }
        ];
      }
    }
    
    // 查询API Key
    const apiKey = await ApiKey.findOne(query).select('usageStats');
    
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key不存在或无权限' });
    }
    
    res.status(200).json({
      success: true,
      data: apiKey.usageStats
    });
    
  } catch (error) {
    console.error('获取API Key统计错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
