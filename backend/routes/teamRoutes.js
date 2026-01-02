const express = require('express');
const router = express.Router();
const { 
  createTeam, 
  getTeams, 
  getTeam, 
  updateTeam, 
  deleteTeam, 
  addTeamMember, 
  removeTeamMember, 
  updateTeamMemberPermissions 
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

// 团队管理路由
router.use(protect); // 所有团队路由都需要认证

// 创建团队 - 企业管理员
router.post('/', createTeam);

// 获取团队列表 - 所有认证用户
router.get('/', getTeams);

// 获取团队详情 - 团队成员和企业管理员
router.get('/:id', getTeam);

// 更新团队信息 - 团队管理员和企业管理员
router.put('/:id', updateTeam);

// 删除团队 - 团队管理员和企业管理员
router.delete('/:id', deleteTeam);

// 添加团队成员 - 团队管理员和企业管理员
router.post('/:id/members', addTeamMember);

// 移除团队成员 - 团队管理员和企业管理员
router.delete('/:id/members', removeTeamMember);

// 更新团队成员权限 - 团队管理员和企业管理员
router.put('/:id/members/permissions', updateTeamMemberPermissions);

module.exports = router;
