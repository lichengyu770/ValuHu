const TrainingProject = require('../models/TrainingProject');
const Case = require('../models/Case');
const User = require('../models/User');

// @desc    获取实训项目列表
// @route   GET /api/training-projects
// @access  Private
const getTrainingProjects = async (req, res) => {
  try {
    const {
      keyword,
      status,
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
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 状态筛选
    if (status) query.status = status;

    // 计算总条数
    const total = await TrainingProject.countDocuments(query);
    // 计算偏移量
    const offset = (page - 1) * limit;
    // 构建排序选项
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 查询实训项目数据，关联案例和创建者
    const trainingProjects = await TrainingProject.find(query)
      .populate('cases', 'title caseType difficultyLevel')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(offset)
      .limit(parseInt(limit));

    // 返回结果
    res.json({
      trainingProjects,
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

// @desc    获取单个实训项目详情
// @route   GET /api/training-projects/:id
// @access  Private
const getTrainingProjectById = async (req, res) => {
  try {
    const trainingProject = await TrainingProject.findById(req.params.id)
      .populate('cases', 'title caseType difficultyLevel content teachingGuide assessmentCriteria')
      .populate('createdBy', 'name email')
      .populate('participants', 'name email role');
    
    if (!trainingProject) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    res.json(trainingProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新实训项目
// @route   POST /api/training-projects
// @access  Private
const createTrainingProject = async (req, res) => {
  try {
    const {
      title,
      description,
      cases,
      status,
      startTime,
      endTime,
      assessmentMethod,
      reportTemplate
    } = req.body;

    // 验证关联的案例是否存在
    const existingCases = await Case.find({ _id: { $in: cases } });
    if (existingCases.length !== cases.length) {
      return res.status(400).json({ message: '部分关联案例不存在' });
    }

    // 创建实训项目
    const trainingProject = await TrainingProject.create({
      title,
      description,
      cases,
      status,
      createdBy: req.user.id,
      startTime,
      endTime,
      assessmentMethod,
      reportTemplate
    });
    
    res.status(201).json(trainingProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新实训项目
// @route   PUT /api/training-projects/:id
// @access  Private
const updateTrainingProject = async (req, res) => {
  try {
    const trainingProject = await TrainingProject.findById(req.params.id);
    
    if (!trainingProject) {
      return res.status(404).json({ message: '实训项目未找到' });
    }

    // 如果更新了案例，验证案例是否存在
    if (req.body.cases) {
      const existingCases = await Case.find({ _id: { $in: req.body.cases } });
      if (existingCases.length !== req.body.cases.length) {
        return res.status(400).json({ message: '部分关联案例不存在' });
      }
    }

    // 更新实训项目
    const updatedProject = await TrainingProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除实训项目
// @route   DELETE /api/training-projects/:id
// @access  Private
const deleteTrainingProject = async (req, res) => {
  try {
    const trainingProject = await TrainingProject.findById(req.params.id);
    
    if (!trainingProject) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    await trainingProject.remove();
    
    res.json({ message: '实训项目已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    分配学生到实训项目
// @route   POST /api/training-projects/:id/assign-participants
// @access  Private
const assignParticipants = async (req, res) => {
  try {
    const { participantIds } = req.body;
    const trainingProject = await TrainingProject.findById(req.params.id);
    
    if (!trainingProject) {
      return res.status(404).json({ message: '实训项目未找到' });
    }

    // 验证学生是否存在
    const existingUsers = await User.find({ _id: { $in: participantIds } });
    if (existingUsers.length !== participantIds.length) {
      return res.status(400).json({ message: '部分学生不存在' });
    }

    // 添加学生到参与者列表（去重）
    const newParticipants = [...new Set([...trainingProject.participants, ...participantIds])];
    trainingProject.participants = newParticipants;
    trainingProject.stats.totalParticipants = newParticipants.length;
    
    await trainingProject.save();
    
    res.json(trainingProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新实训项目进度
// @route   PUT /api/training-projects/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const trainingProject = await TrainingProject.findById(req.params.id);
    
    if (!trainingProject) {
      return res.status(404).json({ message: '实训项目未找到' });
    }

    // 更新进度
    trainingProject.progress = progress;
    
    // 如果进度达到100%，更新状态为已完成
    if (progress === 100) {
      trainingProject.status = 'completed';
    }
    
    await trainingProject.save();
    
    res.json(trainingProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getTrainingProjects,
  getTrainingProjectById,
  createTrainingProject,
  updateTrainingProject,
  deleteTrainingProject,
  assignParticipants,
  updateProgress
};