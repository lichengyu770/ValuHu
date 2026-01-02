const express = require('express');
const router = express.Router();
const batchValuationController = require('../controllers/batchValuationController');

// 批量估价路由

// 上传批量估价文件
router.post('/upload', batchValuationController.uploadValuationFile);

// 获取批量估价任务列表
router.get('/', batchValuationController.getBatchValuationTasks);

// 获取单个批量估价任务详情
router.get('/:id', batchValuationController.getBatchValuationTask);

// 获取批量估价任务进度
router.get('/:id/progress', batchValuationController.getBatchValuationProgress);

// 下载批量估价结果
router.get('/:id/download', batchValuationController.downloadBatchValuationResult);

// 取消批量估价任务
router.delete('/:id', batchValuationController.cancelBatchValuationTask);

module.exports = router;
