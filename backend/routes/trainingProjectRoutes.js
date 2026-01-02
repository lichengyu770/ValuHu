const express = require('express');
const router = express.Router();
const {
  getTrainingProjects,
  getTrainingProjectById,
  createTrainingProject,
  updateTrainingProject,
  deleteTrainingProject,
  assignParticipants,
  updateProgress
} = require('../controllers/trainingProjectController');
const { protect } = require('../middleware/auth');

// 获取实训项目列表
router.get('/', protect, getTrainingProjects);

// 获取单个实训项目详情
router.get('/:id', protect, getTrainingProjectById);

// 创建新实训项目
router.post('/', protect, createTrainingProject);

// 更新实训项目
router.put('/:id', protect, updateTrainingProject);

// 删除实训项目
router.delete('/:id', protect, deleteTrainingProject);

// 分配学生到实训项目
router.post('/:id/assign-participants', protect, assignParticipants);

// 更新实训项目进度
router.put('/:id/progress', protect, updateProgress);

module.exports = router;