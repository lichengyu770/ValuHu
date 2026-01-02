const express = require('express');
const router = express.Router();

// 导入所有子路由
const authRoutes = require('./authRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const propertyRoutes = require('./propertyRoutes');
const orderRoutes = require('./orderRoutes');
const reportRoutes = require('./reportRoutes');
const caseRoutes = require('./caseRoutes');
const templateRoutes = require('./templateRoutes');
const valuationRoutes = require('./valuationRoutes');
const apiKeyRoutes = require('./apiKeyRoutes');
const enterpriseRoutes = require('./enterpriseRoutes');
const teamRoutes = require('./teamRoutes');
const batchValuationRoutes = require('./batchValuationRoutes');
const assetDashboardRoutes = require('./assetDashboardRoutes');
const assetGroupRoutes = require('./assetGroupRoutes');
const monitoringRoutes = require('./monitoringRoutes');
const dataQualityRoutes = require('./dataQualityRoutes');
const notificationRoutes = require('./notificationRoutes');
const blogRoutes = require('./blogRoutes');
const webhookRoutes = require('./webhookRoutes');
const governmentDataRoutes = require('./governmentDataRoutes');
const industryStandardRoutes = require('./industryStandardRoutes');
const macroAnalysisRoutes = require('./macroAnalysisRoutes');
const projectRoutes = require('./projectRoutes');
const trainingProjectRoutes = require('./trainingProjectRoutes');
const scoreRoutes = require('./scoreRoutes');

// 挂载所有子路由
router.use('/auth', authRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/properties', propertyRoutes);
router.use('/orders', orderRoutes);
router.use('/reports', reportRoutes);
router.use('/cases', caseRoutes);
router.use('/templates', templateRoutes);
router.use('/valuations', valuationRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/enterprises', enterpriseRoutes);
router.use('/teams', teamRoutes);
router.use('/batch-valuations', batchValuationRoutes);
router.use('/asset-dashboard', assetDashboardRoutes);
router.use('/asset-groups', assetGroupRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/data-quality', dataQualityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/blogs', blogRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/government-data', governmentDataRoutes);
router.use('/industry-standards', industryStandardRoutes);
router.use('/macro-analysis', macroAnalysisRoutes);
router.use('/projects', projectRoutes);
router.use('/training-projects', trainingProjectRoutes);
router.use('/scores', scoreRoutes);

module.exports = router;