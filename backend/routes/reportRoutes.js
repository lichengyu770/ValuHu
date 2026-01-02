const express = require('express');
const router = express.Router();
const { getReports, getReportById, createReport, updateReport, deleteReport, generateReport, downloadReport, batchGenerateReports, batchDownloadReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// 获取报告列表（公开路由）
router.get('/', getReports);

// 获取单个报告详情（公开路由）
router.get('/:id', getReportById);

// 下载报告（需要认证）
router.get('/download/:id', protect, downloadReport);

// 创建新报告（需要认证）
router.post('/', protect, createReport);

// 基于估价结果生成报告（需要认证）
router.post('/generate', protect, generateReport);

// 更新报告（需要认证）
router.put('/:id', protect, updateReport);

// 删除报告（需要认证）
router.delete('/:id', protect, deleteReport);

// 批量生成报告（需要认证）
router.post('/batch-generate', protect, batchGenerateReports);

// 批量下载报告（需要认证）
router.get('/batch-download', protect, batchDownloadReports);

module.exports = router;