const express = require('express');
const router = express.Router();
const {
  autoScore,
  manualReview,
  getScores,
  getScoreById,
  createScoreRecord,
  getScoreStats
} = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');

// 获取评分记录列表
router.get('/', protect, getScores);

// 获取单个评分记录详情
router.get('/:id', protect, getScoreById);

// 创建评分记录
router.post('/', protect, createScoreRecord);

// 自动评分
router.post('/auto-score/:id', protect, autoScore);

// 人工复核评分
router.put('/manual-review/:id', protect, manualReview);

// 获取评分统计信息
router.get('/stats', protect, getScoreStats);

module.exports = router;