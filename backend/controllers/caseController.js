const Case = require('../models/Case');

// @desc    获取案例列表（支持搜索、筛选和分页）
// @route   GET /api/cases
// @access  Public
const getCases = async (req, res) => {
  try {
    const {
      keyword,
      caseType,
      difficultyLevel,
      targetAudience,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询条件
    const query = {};

    // 关键词搜索
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { relatedKnowledge: { $in: [keyword] } }
      ];
    }

    // 类型筛选
    if (caseType) query.caseType = caseType;
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;
    if (targetAudience) query.targetAudience = targetAudience;

    // 计算总条数
    const total = await Case.countDocuments(query);
    // 计算偏移量
    const offset = (page - 1) * limit;
    // 构建排序选项
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 查询案例数据
    const cases = await Case.find(query)
      .sort(sortOptions)
      .skip(offset)
      .limit(parseInt(limit));

    // 返回结果
    res.json({
      cases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个案例详情
// @route   GET /api/cases/:id
// @access  Public
const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: '案例未找到' });
    }
    
    res.json(caseItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新案例
// @route   POST /api/cases
// @access  Private (Admin)
const createCase = async (req, res) => {
  const { title, content, images } = req.body;
  
  try {
    const caseItem = await Case.create({
      title,
      content,
      images
    });
    
    res.status(201).json(caseItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新案例
// @route   PUT /api/cases/:id
// @access  Private (Admin)
const updateCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: '案例未找到' });
    }
    
    const updatedCase = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    res.json(updatedCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除案例
// @route   DELETE /api/cases/:id
// @access  Private (Admin)
const deleteCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: '案例未找到' });
    }
    
    await caseItem.remove();
    
    res.json({ message: '案例已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    为案例评分
// @route   POST /api/cases/:id/rate
// @access  Private
const rateCase = async (req, res) => {
  try {
    const { rating } = req.body;
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ message: '案例未找到' });
    }
    
    // 更新案例平均分和使用次数
    const currentTotal = caseItem.avgScore * caseItem.usageCount;
    const newUsageCount = caseItem.usageCount + 1;
    const newAvgScore = (currentTotal + rating) / newUsageCount;
    
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        avgScore: parseFloat(newAvgScore.toFixed(1)),
        usageCount: newUsageCount
      },
      { new: true }
    );
    
    res.json(updatedCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取案例统计信息
// @route   GET /api/cases/stats
// @access  Public
const getCaseStats = async (req, res) => {
  try {
    const stats = await Case.aggregate([
      {
        $group: {
          _id: null,
          totalCases: { $sum: 1 },
          avgScore: { $avg: '$avgScore' },
          totalUsage: { $sum: '$usageCount' },
          avgCompletionRate: { $avg: '$completionRate' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCases: 1,
          avgScore: { $round: ['$avgScore', 1] },
          totalUsage: 1,
          avgCompletionRate: { $round: ['$avgCompletionRate', 1] }
        }
      }
    ]);
    
    // 按类型统计案例数量
    const casesByType = await Case.aggregate([
      {
        $group: {
          _id: '$caseType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json({
      overview: stats[0] || {},
      casesByType
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取推荐案例
// @route   GET /api/cases/recommended
// @access  Public
const getRecommendedCases = async (req, res) => {
  try {
    // 推荐逻辑：按评分和使用次数排序，返回前10个
    const recommendedCases = await Case.find()
      .sort({ avgScore: -1, usageCount: -1 })
      .limit(10);
    
    res.json(recommendedCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  rateCase,
  getCaseStats,
  getRecommendedCases
};