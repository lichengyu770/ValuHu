const AssetGroup = require('../models/AssetGroup');
const Property = require('../models/Property');
const Enterprise = require('../models/Enterprise');

/**
 * 创建资产分组
 */
exports.createAssetGroup = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;
    
    // 检查用户权限
    if (req.user.role === 'personal') {
      return res.status(403).json({ success: false, message: '个人用户无法创建资产分组' });
    }
    
    // 企业用户需要关联企业
    let enterpriseId = null;
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (!enterprise) {
        return res.status(404).json({ success: false, message: '未找到关联的企业' });
      }
      enterpriseId = enterprise._id;
    }
    
    // 创建资产分组
    const assetGroup = new AssetGroup({
      name,
      description,
      color,
      tenantId: enterpriseId,
      createdBy: userId
    });
    
    await assetGroup.save();
    
    res.status(201).json({
      success: true,
      message: '资产分组创建成功',
      data: assetGroup
    });
    
  } catch (error) {
    console.error('创建资产分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取资产分组列表
 */
exports.getAssetGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 构建查询条件
    let query = {};
    
    // 企业用户需要关联企业
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.tenantId = enterprise._id;
      } else {
        return res.status(404).json({ success: false, message: '未找到关联的企业' });
      }
    }
    
    // 查询资产分组列表
    const assetGroups = await AssetGroup.find(query);
    
    res.status(200).json({
      success: true,
      data: assetGroups
    });
    
  } catch (error) {
    console.error('获取资产分组列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取单个资产分组详情
 */
exports.getAssetGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 构建查询条件
    let query = { _id: id };
    
    // 企业用户需要关联企业
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.tenantId = enterprise._id;
      } else {
        return res.status(404).json({ success: false, message: '未找到关联的企业' });
      }
    }
    
    // 查询资产分组详情
    const assetGroup = await AssetGroup.findOne(query);
    
    if (!assetGroup) {
      return res.status(404).json({ success: false, message: '资产分组不存在' });
    }
    
    // 获取该分组下的资产列表
    const properties = await Property.find({ groupId: id });
    
    res.status(200).json({
      success: true,
      data: {
        ...assetGroup._doc,
        assets: properties
      }
    });
    
  } catch (error) {
    console.error('获取资产分组详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 更新资产分组
 */
exports.updateAssetGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;
    
    // 构建查询条件
    let query = { _id: id };
    
    // 企业用户需要关联企业
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.tenantId = enterprise._id;
      } else {
        return res.status(404).json({ success: false, message: '未找到关联的企业' });
      }
    }
    
    // 更新资产分组
    const assetGroup = await AssetGroup.findOneAndUpdate(
      query,
      { name, description, color, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!assetGroup) {
      return res.status(404).json({ success: false, message: '资产分组不存在或无权限' });
    }
    
    res.status(200).json({
      success: true,
      message: '资产分组更新成功',
      data: assetGroup
    });
    
  } catch (error) {
    console.error('更新资产分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 删除资产分组
 */
exports.deleteAssetGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 构建查询条件
    let query = { _id: id };
    
    // 企业用户需要关联企业
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.tenantId = enterprise._id;
      } else {
        return res.status(404).json({ success: false, message: '未找到关联的企业' });
      }
    }
    
    // 删除资产分组
    const assetGroup = await AssetGroup.findOneAndDelete(query);
    
    if (!assetGroup) {
      return res.status(404).json({ success: false, message: '资产分组不存在或无权限' });
    }
    
    // 将该分组下的资产的groupId设为null
    await Property.updateMany({ groupId: id }, { groupId: null });
    
    res.status(200).json({
      success: true,
      message: '资产分组删除成功'
    });
    
  } catch (error) {
    console.error('删除资产分组错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 为资产添加标签
 */
exports.addAssetTags = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { tags } = req.body;
    const userId = req.user.id;
    
    // 查找资产
    const property = await Property.findById(assetId);
    if (!property) {
      return res.status(404).json({ success: false, message: '资产不存在' });
    }
    
    // 检查权限
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (!enterprise || property.tenantId.toString() !== enterprise._id.toString()) {
        return res.status(403).json({ success: false, message: '无权限操作该资产' });
      }
    }
    
    // 添加标签（去重）
    const updatedTags = [...new Set([...property.tags, ...tags])];
    property.tags = updatedTags;
    
    await property.save();
    
    res.status(200).json({
      success: true,
      message: '标签添加成功',
      data: { tags: property.tags }
    });
    
  } catch (error) {
    console.error('为资产添加标签错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 从资产移除标签
 */
exports.removeAssetTags = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { tags } = req.body;
    const userId = req.user.id;
    
    // 查找资产
    const property = await Property.findById(assetId);
    if (!property) {
      return res.status(404).json({ success: false, message: '资产不存在' });
    }
    
    // 检查权限
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (!enterprise || property.tenantId.toString() !== enterprise._id.toString()) {
        return res.status(403).json({ success: false, message: '无权限操作该资产' });
      }
    }
    
    // 移除标签
    const updatedTags = property.tags.filter(tag => !tags.includes(tag));
    property.tags = updatedTags;
    
    await property.save();
    
    res.status(200).json({
      success: true,
      message: '标签移除成功',
      data: { tags: property.tags }
    });
    
  } catch (error) {
    console.error('从资产移除标签错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取资产标签列表
 */
exports.getAssetTags = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 构建查询条件
    let query = {};
    
    // 企业用户需要关联企业
    if (req.user.role === 'enterprise' || req.user.role === 'association' || req.user.role === 'academic') {
      // 查找用户关联的企业
      const enterprise = await Enterprise.findOne({ $or: [{ createdBy: userId }, { admins: userId }] });
      if (enterprise) {
        query.tenantId = enterprise._id;
      } else {
        return res.status(404).json({ success: false, message: '未找到关联的企业' });
      }
    }
    
    // 获取所有标签
    const properties = await Property.find(query);
    
    // 提取所有标签并去重
    const allTags = new Set();
    properties.forEach(property => {
      property.tags.forEach(tag => allTags.add(tag));
    });
    
    // 统计每个标签的使用次数
    const tagCounts = {};
    properties.forEach(property => {
      property.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // 转换为数组并排序
    const tagList = Array.from(allTags).map(tag => ({
      name: tag,
      count: tagCounts[tag] || 0
    })).sort((a, b) => b.count - a.count);
    
    res.status(200).json({
      success: true,
      data: tagList
    });
    
  } catch (error) {
    console.error('获取资产标签列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
