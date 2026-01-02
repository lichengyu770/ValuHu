const express = require('express');
const router = express.Router();
const industryStandardController = require('../controllers/industryStandardController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置文件上传存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `industry-standard-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 文件上传中间件
const upload = multer({ storage });

/**
 * 行业标准制定工具路由
 */

// 获取行业标准列表
router.get('/', industryStandardController.getIndustryStandards);

// 获取单个行业标准详情
router.get('/:id', industryStandardController.getIndustryStandardById);

// 创建行业标准（需要认证）
router.post('/', protect, upload.single('file'), industryStandardController.createIndustryStandard);

// 更新行业标准（需要认证）
router.put('/:id', protect, upload.single('file'), industryStandardController.updateIndustryStandard);

// 删除行业标准（需要认证）
router.delete('/:id', protect, industryStandardController.deleteIndustryStandard);

// 审核行业标准（需要认证）
router.post('/:id/review', protect, industryStandardController.reviewIndustryStandard);

// 下载行业标准文件（需要认证）
router.get('/:id/download', protect, industryStandardController.downloadIndustryStandard);

// 获取标准采用情况报告（需要认证）
router.get('/adoption-report', protect, industryStandardController.getAdoptionReport);

// 获取标准合规性检查（需要认证）
router.post('/compliance-check', protect, industryStandardController.getComplianceCheck);

// 批量检查成员单位合规性（需要认证）
router.post('/batch-compliance-check', protect, industryStandardController.batchCheckCompliance);

// 发布行业标准（需要认证）
router.post('/:id/publish', protect, industryStandardController.publishIndustryStandard);

// 创建标准新版本（需要认证）
router.post('/:id/new-version', protect, industryStandardController.createNewVersion);

// 配置标准参数（需要认证）
router.put('/:id/configure', protect, industryStandardController.configureStandardParams);

// 获取标准版本历史
router.get('/versions/:standardNumber', industryStandardController.getStandardVersions);

module.exports = router;