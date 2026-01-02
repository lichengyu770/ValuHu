const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addStudentsToProject,
  createGroup,
  updateGroup,
  submitProject,
  autoGradeSubmission,
  updateProjectStatus
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// 公开路由
// 获取所有实训项目
router.get('/', protect, getProjects);

// 获取单个实训项目详情
router.get('/:id', protect, getProjectById);

// 需要认证的路由
// 创建新实训项目
router.post('/', protect, createProject);

// 更新实训项目
router.put('/:id', protect, updateProject);

// 删除实训项目
router.delete('/:id', protect, deleteProject);

// 添加学生到实训项目
router.post('/:id/students', protect, addStudentsToProject);

// 创建小组
router.post('/:id/groups', protect, createGroup);

// 更新小组信息
router.put('/:id/groups/:groupId', protect, updateGroup);

// 提交实训作业
router.post('/:id/submissions', protect, submitProject);

// 自动评分
router.post('/:id/submissions/:submissionId/auto-grade', protect, autoGradeSubmission);

// 更新项目状态
router.put('/:id/status', protect, updateProjectStatus);

module.exports = router;
