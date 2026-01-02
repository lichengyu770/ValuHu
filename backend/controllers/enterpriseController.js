const Enterprise = require('../models/Enterprise');
const User = require('../models/User');
const Team = require('../models/Team');

// 创建企业
exports.createEnterprise = async (req, res) => {
  try {
    const { name, legalName, registrationNumber, industry, address, contactPhone, contactEmail } = req.body;
    const userId = req.user.id;
    
    // 检查用户是否已有企业
    const existingEnterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
    if (existingEnterprise) {
      return res.status(400).json({ message: '您已经创建或管理了一个企业' });
    }
    
    // 创建企业
    const enterprise = new Enterprise({
      name,
      legalName,
      registrationNumber,
      industry,
      address,
      contactPhone,
      contactEmail,
      createdBy: userId,
      admins: [userId]
    });
    
    await enterprise.save();
    
    // 更新用户角色
    await User.findByIdAndUpdate(userId, { role: 'enterprise', enterpriseId: enterprise._id });
    
    res.status(201).json({
      success: true,
      message: '企业创建成功',
      data: enterprise
    });
    
  } catch (error) {
    console.error('创建企业错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取企业列表（管理员专用）
exports.getEnterprises = async (req, res) => {
  try {
    // 只有管理员可以获取所有企业列表
    if (req.user.role !== 'admin' && req.user.role !== 'government') {
      return res.status(403).json({ message: '无权限访问此资源' });
    }
    
    const enterprises = await Enterprise.find();
    
    res.status(200).json({
      success: true,
      data: enterprises
    });
    
  } catch (error) {
    console.error('获取企业列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取企业详情
exports.getEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查找企业
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }
    
    // 检查用户权限
    if (enterprise.createdBy.toString() !== userId && !enterprise.admins.includes(userId) && req.user.role !== 'admin' && req.user.role !== 'government') {
      return res.status(403).json({ message: '无权限访问此企业' });
    }
    
    res.status(200).json({
      success: true,
      data: enterprise
    });
    
  } catch (error) {
    console.error('获取企业详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新企业信息
exports.updateEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, legalName, registrationNumber, industry, address, contactPhone, contactEmail, status } = req.body;
    const userId = req.user.id;
    
    // 查找企业
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }
    
    // 检查用户权限
    if (enterprise.createdBy.toString() !== userId && !enterprise.admins.includes(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限更新此企业' });
    }
    
    // 更新企业信息
    const updatedEnterprise = await Enterprise.findByIdAndUpdate(
      id,
      { name, legalName, registrationNumber, industry, address, contactPhone, contactEmail, status, updatedAt: Date.now() },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: '企业信息更新成功',
      data: updatedEnterprise
    });
    
  } catch (error) {
    console.error('更新企业信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 删除企业
exports.deleteEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查找企业
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }
    
    // 检查用户权限
    if (enterprise.createdBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限删除此企业' });
    }
    
    // 删除企业关联的团队
    await Team.deleteMany({ enterpriseId: id });
    
    // 更新关联用户的角色
    await User.updateMany({ enterpriseId: id }, { role: 'personal', enterpriseId: null });
    
    // 删除企业
    await Enterprise.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: '企业删除成功'
    });
    
  } catch (error) {
    console.error('删除企业错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 添加企业管理员
exports.addEnterpriseAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;
    
    // 查找企业
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }
    
    // 检查当前用户权限
    if (enterprise.createdBy.toString() !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限添加管理员' });
    }
    
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查用户是否已经是管理员
    if (enterprise.admins.includes(userId)) {
      return res.status(400).json({ message: '用户已经是企业管理员' });
    }
    
    // 添加管理员
    enterprise.admins.push(userId);
    await enterprise.save();
    
    // 更新用户角色
    await User.findByIdAndUpdate(userId, { role: 'enterprise', enterpriseId: id });
    
    res.status(200).json({
      success: true,
      message: '管理员添加成功',
      data: enterprise
    });
    
  } catch (error) {
    console.error('添加企业管理员错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 移除企业管理员
exports.removeEnterpriseAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;
    
    // 查找企业
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }
    
    // 检查当前用户权限
    if (enterprise.createdBy.toString() !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限移除管理员' });
    }
    
    // 不能移除创建者
    if (enterprise.createdBy.toString() === userId) {
      return res.status(400).json({ message: '不能移除企业创建者' });
    }
    
    // 移除管理员
    enterprise.admins = enterprise.admins.filter(adminId => adminId.toString() !== userId);
    await enterprise.save();
    
    // 更新用户角色
    await User.findByIdAndUpdate(userId, { role: 'personal', enterpriseId: null });
    
    res.status(200).json({
      success: true,
      message: '管理员移除成功',
      data: enterprise
    });
    
  } catch (error) {
    console.error('移除企业管理员错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
