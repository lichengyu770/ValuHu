// 文件上传接口路由
import express from 'express';
const router = express.Router();
import FileController from '../controllers/FileController.js';

// 上传文件
router.post('/upload', FileController.uploadFile);

// 获取文件信息
router.get('/upload/:id', FileController.getFileInfo);

// 下载文件
router.get('/upload/:id/download', FileController.downloadFile);

// 删除文件
router.delete('/upload/:id', FileController.deleteFile);

export default router;