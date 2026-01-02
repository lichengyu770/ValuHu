const Template = require('../models/Template');

// @desc    获取模板列表
// @route   GET /api/templates
// @access  Public
const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个模板详情
// @route   GET /api/templates/:id
// @access  Public
const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: '模板未找到' });
    }
    
    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新模板
// @route   POST /api/templates
// @access  Private (Admin)
const createTemplate = async (req, res) => {
  const { title, description, thumbnail, content } = req.body;
  
  try {
    const template = await Template.create({
      title,
      description,
      thumbnail,
      content
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新模板
// @route   PUT /api/templates/:id
// @access  Private (Admin)
const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: '模板未找到' });
    }
    
    const updatedTemplate = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除模板
// @route   DELETE /api/templates/:id
// @access  Private (Admin)
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: '模板未找到' });
    }
    
    await template.remove();
    
    res.json({ message: '模板已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};