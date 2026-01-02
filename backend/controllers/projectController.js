const Project = require('../models/Project');
const Case = require('../models/Case');

// @desc    获取实训项目列表
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('caseId', 'title caseType difficultyLevel')
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email')
      .exec();
    
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个实训项目详情
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('caseId')
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email')
      .populate('groups.leaderId', 'name email')
      .populate('groups.memberIds', 'name email')
      .exec();
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新实训项目
// @route   POST /api/projects
// @access  Private (Teacher)
const createProject = async (req, res) => {
  const {
    name, description, caseId, startDate, endDate, 
    isGroupProject, maxGroupSize, teacherId, gradingCriteria
  } = req.body;
  
  try {
    // 验证案例是否存在
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ message: '关联的案例未找到' });
    }
    
    const project = await Project.create({
      name,
      description,
      caseId,
      startDate,
      endDate,
      isGroupProject,
      maxGroupSize,
      teacherId,
      gradingCriteria
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新实训项目
// @route   PUT /api/projects/:id
// @access  Private (Teacher)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除实训项目
// @route   DELETE /api/projects/:id
// @access  Private (Teacher)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    await project.remove();
    
    res.json({ message: '实训项目已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    添加学生到实训项目
// @route   POST /api/projects/:id/students
// @access  Private (Teacher)
const addStudentsToProject = async (req, res) => {
  const { studentIds } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    // 去重添加学生
    studentIds.forEach(studentId => {
      if (!project.studentIds.includes(studentId)) {
        project.studentIds.push(studentId);
      }
    });
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建小组
// @route   POST /api/projects/:id/groups
// @access  Private (Teacher)
const createGroup = async (req, res) => {
  const { name, leaderId, memberIds } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    // 验证小组人数是否超过最大限制
    if (memberIds.length + 1 > project.maxGroupSize) {
      return res.status(400).json({ message: `小组人数不能超过${project.maxGroupSize}人` });
    }
    
    // 添加组长到成员列表
    const allMembers = [...new Set([leaderId, ...memberIds])];
    
    project.groups.push({
      name,
      leaderId,
      memberIds: allMembers.filter(id => id !== leaderId)
    });
    
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新小组信息
// @route   PUT /api/projects/:id/groups/:groupId
// @access  Private (Teacher)
const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const updateData = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    const groupIndex = project.groups.findIndex(g => g._id.toString() === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ message: '小组未找到' });
    }
    
    // 更新小组信息
    project.groups[groupIndex] = { ...project.groups[groupIndex], ...updateData };
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    提交实训作业
// @route   POST /api/projects/:id/submissions
// @access  Private (Student)
const submitProject = async (req, res) => {
  const { content, files, groupId, studentId } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    // 验证项目是否在提交期限内
    if (new Date() > project.endDate) {
      return res.status(400).json({ message: '项目已过提交期限' });
    }
    
    // 添加提交记录
    project.submissions.push({
      content,
      files,
      groupId,
      studentId,
      submittedAt: new Date()
    });
    
    // 更新小组进度
    if (groupId) {
      const groupIndex = project.groups.findIndex(g => g._id.toString() === groupId);
      if (groupIndex !== -1) {
        project.groups[groupIndex].progress = 100;
        project.groups[groupIndex].submissionDate = new Date();
      }
    }
    
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    自动评分
// @route   POST /api/projects/:id/submissions/:submissionId/auto-grade
// @access  Private (Teacher/System)
const autoGradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { evaluation, metrics } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    // 找到提交记录
    const submissionIndex = project.submissions.findIndex(s => s._id.toString() === submissionId);
    if (submissionIndex === -1) {
      return res.status(404).json({ message: '提交记录未找到' });
    }
    
    // 简单的自动评分逻辑（可根据实际需求扩展）
    let score = 0;
    
    // 根据评估标准计算分数
    project.gradingCriteria.forEach(criterion => {
      if (metrics && metrics[criterion.name]) {
        score += (metrics[criterion.name] / 100) * criterion.weight;
      }
    });
    
    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    // 更新提交记录的分数
    project.submissions[submissionIndex].score = score;
    
    // 添加自动评分结果
    project.autoGradingResults.push({
      submissionId,
      score,
      evaluation,
      metrics,
      gradedAt: new Date()
    });
    
    // 更新小组分数
    const groupId = project.submissions[submissionIndex].groupId;
    if (groupId) {
      const groupIndex = project.groups.findIndex(g => g._id.toString() === groupId);
      if (groupIndex !== -1) {
        project.groups[groupIndex].score = score;
      }
    }
    
    await project.save();
    
    res.json({
      score,
      evaluation,
      metrics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新项目状态
// @route   PUT /api/projects/:id/status
// @access  Private (Teacher)
const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '实训项目未找到' });
    }
    
    project.status = status;
    await project.save();
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addStudentsToProject,
  createGroup,
  updateGroup,
  submitProject,
  autoGradeSubmission,
  updateProjectStatus
};
