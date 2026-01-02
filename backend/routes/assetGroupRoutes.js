const express = require('express');
const router = express.Router();
const assetGroupController = require('../controllers/assetGroupController');

// 资产分组路由

// 创建资产分组
router.post('/', assetGroupController.createAssetGroup);

// 获取资产分组列表
router.get('/', assetGroupController.getAssetGroups);

// 获取单个资产分组详情
router.get('/:id', assetGroupController.getAssetGroup);

// 更新资产分组
router.put('/:id', assetGroupController.updateAssetGroup);

// 删除资产分组
router.delete('/:id', assetGroupController.deleteAssetGroup);

// 为资产添加标签
router.post('/:assetId/tags', assetGroupController.addAssetTags);

// 从资产移除标签
router.delete('/:assetId/tags', assetGroupController.removeAssetTags);

// 获取资产标签列表
router.get('/tags/list', assetGroupController.getAssetTags);

module.exports = router;
