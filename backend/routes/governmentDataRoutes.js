const express = require('express');
const router = express.Router();
const governmentDataController = require('../controllers/governmentDataController');
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
    cb(null, `government-data-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 文件上传中间件
const upload = multer({ storage });

/**
 * 政府数据交换平台路由
 */

// 获取政府数据列表
router.get('/', governmentDataController.getGovernmentData);

// 获取单个政府数据详情
router.get('/:id', governmentDataController.getGovernmentDataById);

// 上传政府数据（需要认证）
router.post('/', protect, upload.single('file'), governmentDataController.uploadGovernmentData);

// 更新政府数据（需要认证）
router.put('/:id', protect, upload.single('file'), governmentDataController.updateGovernmentData);

// 删除政府数据（需要认证）
router.delete('/:id', protect, governmentDataController.deleteGovernmentData);

// 审核政府数据（需要认证）
router.post('/:id/review', protect, governmentDataController.reviewGovernmentData);

// 下载政府数据文件（需要认证）
router.get('/:id/download', protect, governmentDataController.downloadGovernmentData);

// 生成数据使用报告（需要认证）
router.get('/usage-report', protect, governmentDataController.generateUsageReport);

// 数据脱敏处理（需要认证）
router.post('/desensitize', protect, governmentDataController.desensitizeData);

// 获取脱敏数据（需要认证）
router.get('/:id/desensitized', protect, governmentDataController.getDesensitizedData);

// 批量数据脱敏处理（需要认证）
router.post('/batch-desensitize', protect, governmentDataController.batchDesensitizeData);

// OAuth2.0回调处理
router.get('/oauth/callback', governmentDataController.oauthCallback);

// OAuth2.0授权请求
router.get('/oauth/authorize', (req, res) => {
  // 这里实现OAuth2.0授权请求逻辑
  // 例如重定向到政府OAuth服务器
  res.status(200).json({ success: true, message: 'OAuth2.0授权请求已处理' });
});

module.exports = router;