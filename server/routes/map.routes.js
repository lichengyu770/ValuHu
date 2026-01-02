// 地图辅助接口路由
import express from 'express';
const router = express.Router();
import MapController from '../controllers/MapController.js';

// 地理编码（地址转经纬度）
router.get('/map/geocode', MapController.geocode);

// 逆地理编码（经纬度转地址）
router.get('/map/reverse-geocode', MapController.reverseGeocode);

// 获取周边设施
router.get('/map/nearby-facilities', MapController.getNearbyFacilities);

export default router;