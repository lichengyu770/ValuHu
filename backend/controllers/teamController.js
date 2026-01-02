const Team = require('../models/Team');
const User = require('../models/User');
const Enterprise = require('../models/Enterprise');

// 创建团队
exports.createTeam = async (req, res) => {
  try {
    const { name, description, defaultPermissions } = req.body;
    const userId = req.user.id;
    
    // 检查用户是否关联企业
    if (!req.user.enterpriseId) {
      return res.status(400).json({ message: '您需要先关联企业才能创建团队' });
    }
    
    // 检查用户是否有权创建团队
    const enterprise = await Enterprise.findById(req.user.enterpriseId);
    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }
    
    if (enterprise.createdBy.toString() !== userId && !enterprise.admins.includes(userId)) {
      return res.status(403).json({ message: '无权限创建团队' });
    }
    
    // 创建团队
    const team = new Team({
      name,
      description,
      enterpriseId: req.user.enterpriseId,
      createdBy: userId,
      admin: userId,
      members: [{
        userId,
        role: 'admin',
        permissions: defaultPermissions || ['view_properties', 'view_valuations', 'view_reports']
      }],
      defaultPermissions: defaultPermissions || ['view_properties', 'view_valuations', 'view_reports']
    });
    
    await team.save();
    
    // 更新企业的团队列表
    enterprise.teams.push(team._id);
    await enterprise.save();
    
    // 更新用户的团队ID
    await User.findByIdAndUpdate(userId, { teamId: team._id });
    
    res.status(201).json({
      success: true,
      message: '团队创建成功',
      data: team
    });
    
  } catch (error) {
    console.error('创建团队错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取团队列表
exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 构建查询条件
    let query = {};
    
    // 个人用户只能查看自己所在的团队
    if (req.user.role === 'personal') {
      query = { 'members.userId': userId };
    } else {
      // 企业用户可以查看企业下的所有团队
      query = { enterpriseId: req.user.enterpriseId };
    }
    
    const teams = await Team.find(query);
    
    res.status(200).json({
      success: true,
      data: teams
    });
    
  } catch (error) {
    console.error('获取团队列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取团队详情
exports.getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查找团队
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: '团队不存在' });
    }
    
    // 检查用户是否有权访问团队
    const isTeamMember = team.members.some(member => member.userId.toString() === userId);
    const enterprise = await Enterprise.findById(team.enterpriseId);
    const isEnterpriseAdmin = enterprise && (enterprise.createdBy.toString() === userId || enterprise.admins.includes(userId));
    
    if (!isTeamMember && !isEnterpriseAdmin && req.user.role !== 'admin' && req.user.role !== 'government') {
      return res.status(403).json({ message: '无权限访问此团队' });
    }
    
    res.status(200).json({
      success: true,
      data: team
    });
    
  } catch (error) {
    console.error('获取团队详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新团队信息
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, defaultPermissions } = req.body;
    const userId = req.user.id;
    
    // 查找团队
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: '团队不存在' });
    }
    
    // 检查用户权限
    const isTeamAdmin = team.admin.toString() === userId;
    const enterprise = await Enterprise.findById(team.enterpriseId);
    const isEnterpriseAdmin = enterprise && (enterprise.createdBy.toString() === userId || enterprise.admins.includes(userId));
    
    if (!isTeamAdmin && !isEnterpriseAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限更新此团队' });
    }
    
    // 更新团队信息
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { name, description, status, defaultPermissions, updatedAt: Date.now() },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: '团队信息更新成功',
      data: updatedTeam
    });
    
  } catch (error) {
    console.error('更新团队信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 删除团队
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查找团队
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: '团队不存在' });
    }
    
    // 检查用户权限
    const isTeamAdmin = team.admin.toString() === userId;
    const enterprise = await Enterprise.findById(team.enterpriseId);
    const isEnterpriseAdmin = enterprise && (enterprise.createdBy.toString() === userId || enterprise.admins.includes(userId));
    
    if (!isTeamAdmin && !isEnterpriseAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限删除此团队' });
    }
    
    // 更新企业的团队列表
    enterprise.teams = enterprise.teams.filter(teamId => teamId.toString() !== id);
    await enterprise.save();
    
    // 更新团队成员的teamId
    await User.updateMany(
      { _id: { $in: team.members.map(member => member.userId) } },
      { teamId: null }
    );
    
    // 删除团队
    await Team.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: '团队删除成功'
    });
    
  } catch (error) {
    console.error('删除团队错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 添加团队成员
exports.addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, permissions } = req.body;
    const currentUserId = req.user.id;
    
    // 查找团队
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: '团队不存在' });
    }
    
    // 检查用户权限
    const isTeamAdmin = team.admin.toString() === currentUserId;
    const enterprise = await Enterprise.findById(team.enterpriseId);
    const isEnterpriseAdmin = enterprise && (enterprise.createdBy.toString() === currentUserId || enterprise.admins.includes(currentUserId));
    
    if (!isTeamAdmin && !isEnterpriseAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限添加团队成员' });
    }
    
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查用户是否已经是团队成员
    const isAlreadyMember = team.members.some(member => member.userId.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({ message: '用户已经是团队成员' });
    }
    
    // 添加团队成员
    team.members.push({
      userId,
      role: role || 'member',
      permissions: permissions || team.defaultPermissions
    });
    
    await team.save();
    
    // 更新用户的teamId
    await User.findByIdAndUpdate(userId, { teamId: team._id });
    
    res.status(200).json({
      success: true,
      message: '团队成员添加成功',
      data: team
    });
    
  } catch (error) {
    console.error('添加团队成员错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 移除团队成员
exports.removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;
    
    // 查找团队
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: '团队不存在' });
    }
    
    // 检查用户权限
    const isTeamAdmin = team.admin.toString() === currentUserId;
    const enterprise = await Enterprise.findById(team.enterpriseId);
    const isEnterpriseAdmin = enterprise && (enterprise.createdBy.toString() === currentUserId || enterprise.admins.includes(currentUserId));
    
    if (!isTeamAdmin && !isEnterpriseAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限移除团队成员' });
    }
    
    // 不能移除团队管理员
    if (team.admin.toString() === userId) {
      return res.status(400).json({ message: '不能移除团队管理员' });
    }
    
    // 移除团队成员
    team.members = team.members.filter(member => member.userId.toString() !== userId);
    
    await team.save();
    
    // 更新用户的teamId
    await User.findByIdAndUpdate(userId, { teamId: null });
    
    res.status(200).json({
      success: true,
      message: '团队成员移除成功',
      data: team
    });
    
  } catch (error) {
    console.error('移除团队成员错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新团队成员权限
exports.updateTeamMemberPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, permissions } = req.body;
    const currentUserId = req.user.id;
    
    // 查找团队
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: '团队不存在' });
    }
    
    // 检查用户权限
    const isTeamAdmin = team.admin.toString() === currentUserId;
    const enterprise = await Enterprise.findById(team.enterpriseId);
    const isEnterpriseAdmin = enterprise && (enterprise.createdBy.toString() === currentUserId || enterprise.admins.includes(currentUserId));
    
    if (!isTeamAdmin && !isEnterpriseAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限更新团队成员权限' });
    }
    
    // 更新成员权限
    const memberIndex = team.members.findIndex(member => member.userId.toString() === userId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: '团队成员不存在' });
    }
    
    team.members[memberIndex].permissions = permissions;
    await team.save();
    
    res.status(200).json({
      success: true,
      message: '团队成员权限更新成功',
      data: team
    });
    
  } catch (error) {
    console.error('更新团队成员权限错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
