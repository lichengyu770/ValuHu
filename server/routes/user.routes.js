// 用户接口路由
import express from 'express';
const router = express.Router();
import UserController from '../controllers/UserController.js';

// 登录接口（支持自动注册）
router.post('/login', UserController.login);

// 获取用户信息
router.get('/users/:id', UserController.getUserInfo);

// 更新用户信息
router.put('/users/:id', UserController.updateUserInfo);

// 获取用户估价历史
router.get('/users/:id/valuation-history', UserController.getUserValuationHistory);

// 短信验证相关路由
router.post('/send-sms-code', UserController.sendSmsCode);
router.post('/verify-sms-code', UserController.verifySmsCode);

export default router;