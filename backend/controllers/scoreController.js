const Score = require('../models/Score');
const ScoreRule = require('../models/ScoreRule');
const Case = require('../models/Case');

// @desc    自动评分
// @route   POST /api/scores/auto-score/:id
// @access  Private
const autoScore = async (req, res) => {
  try {
    const scoreRecord = await Score.findById(req.params.id).populate('caseId').populate('scoreRuleId');
    
    if (!scoreRecord) {
      return res.status(404).json({ message: '评分记录未找到' });
    }

    // 如果没有指定评分规则，根据案例类型自动匹配
    let scoreRule = scoreRecord.scoreRuleId;
    if (!scoreRule) {
      scoreRule = await ScoreRule.findOne({
        applicableCaseTypes: scoreRecord.caseId.caseType,
        status: '生效中'
      });
      
      if (!scoreRule) {
        return res.status(400).json({ message: '未找到适用的评分规则' });
      }
      
      scoreRecord.scoreRuleId = scoreRule._id;
    }

    // 执行自动评分逻辑
    let totalScore = 0;
    const scoreDetails = [];
    const autoFeedback = [];

    // 遍历评分规则中的每个评分项
    for (const ruleItem of scoreRule.scoreItems) {
      let itemScore = 0;
      const itemFeedback = [];

      // 遍历评分项中的每个评分标准
      for (const criterion of ruleItem.criteria) {
        let criterionScore = 0;
        let isMatch = false;

        // 根据不同的条件类型执行评分逻辑
        switch (criterion.conditionType) {
          case '关键词匹配':
            // 检查学生提交内容中是否包含关键词
            if (scoreRecord.submission.includes(criterion.conditionValue)) {
              criterionScore = (ruleItem.fullMark * criterion.scorePercentage) / 100;
              isMatch = true;
              itemFeedback.push(`关键词匹配："${criterion.conditionValue}"，得分${criterionScore}`);
            } else {
              itemFeedback.push(`关键词未匹配："${criterion.conditionValue}"，得分0`);
            }
            break;
          
          case '内容长度':
            // 检查内容长度是否符合要求
            const minLength = parseInt(criterion.conditionValue);
            if (scoreRecord.submission.length >= minLength) {
              criterionScore = (ruleItem.fullMark * criterion.scorePercentage) / 100;
              isMatch = true;
              itemFeedback.push(`内容长度达标（${scoreRecord.submission.length}字符），得分${criterionScore}`);
            } else {
              itemFeedback.push(`内容长度不足（${scoreRecord.submission.length}字符，要求${minLength}字符），得分0`);
            }
            break;
          
          case '格式检查':
            // 检查内容格式是否符合要求（简单示例）
            if (criterion.conditionValue === '包含结论') {
              if (scoreRecord.submission.includes('结论') || scoreRecord.submission.includes('总结')) {
                criterionScore = (ruleItem.fullMark * criterion.scorePercentage) / 100;
                isMatch = true;
                itemFeedback.push('包含结论，得分${criterionScore}');
              } else {
                itemFeedback.push('缺少结论，得分0');
              }
            }
            break;
          
          // 可以根据需要添加更多条件类型的处理逻辑
          default:
            break;
        }

        itemScore += criterionScore;
      }

      // 计算该评分项的加权得分
      const weightedScore = (itemScore * ruleItem.weight) / 100;
      totalScore += weightedScore;

      // 添加评分详情
      scoreDetails.push({
        itemName: ruleItem.name,
        weight: ruleItem.weight,
        studentScore: weightedScore,
        isPass: itemScore >= (ruleItem.fullMark * 0.6), // 60分及格
        description: itemFeedback.join('；')
      });

      autoFeedback.push(`${ruleItem.name}：${weightedScore}分（${itemScore}/${ruleItem.fullMark}）`);
    }

    // 更新评分记录
    scoreRecord.autoScore = parseFloat(totalScore.toFixed(1));
    scoreRecord.status = '自动评分完成';
    scoreRecord.autoFeedback = autoFeedback.join('\n');
    scoreRecord.scoreDetails = scoreDetails;
    scoreRecord.autoScoreTime = Date.now();
    
    await scoreRecord.save();
    
    res.json(scoreRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    人工复核评分
// @route   PUT /api/scores/manual-review/:id
// @access  Private
const manualReview = async (req, res) => {
  try {
    const { manualScore, manualFeedback } = req.body;
    const scoreRecord = await Score.findById(req.params.id);
    
    if (!scoreRecord) {
      return res.status(404).json({ message: '评分记录未找到' });
    }

    // 更新人工评分
    scoreRecord.manualScore = manualScore;
    scoreRecord.manualFeedback = manualFeedback;
    scoreRecord.status = '评分完成';
    scoreRecord.reviewerId = req.user.id;
    scoreRecord.manualScoreTime = Date.now();
    
    await scoreRecord.save();
    
    res.json(scoreRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取评分记录列表
// @route   GET /api/scores
// @access  Private
const getScores = async (req, res) => {
  try {
    const {
      projectId,
      caseId,
      studentId,
      status,
      page = 1,
      limit = 10
    } = req.query;

    // 构建查询条件
    const query = {};

    if (projectId) query.projectId = projectId;
    if (caseId) query.caseId = caseId;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    // 计算总条数
    const total = await Score.countDocuments(query);
    // 计算偏移量
    const offset = (page - 1) * limit;

    // 查询评分记录
    const scores = await Score.find(query)
      .populate('studentId', 'name email')
      .populate('caseId', 'title caseType')
      .populate('projectId', 'title')
      .sort({ submissionTime: -1 })
      .skip(offset)
      .limit(parseInt(limit));
    
    res.json({
      scores,
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

// @desc    获取单个评分记录详情
// @route   GET /api/scores/:id
// @access  Private
const getScoreById = async (req, res) => {
  try {
    const scoreRecord = await Score.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('caseId', 'title caseType')
      .populate('projectId', 'title')
      .populate('scoreRuleId');
    
    if (!scoreRecord) {
      return res.status(404).json({ message: '评分记录未找到' });
    }
    
    res.json(scoreRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建评分记录
// @route   POST /api/scores
// @access  Private
const createScoreRecord = async (req, res) => {
  try {
    const {
      caseId,
      projectId,
      studentId,
      submission
    } = req.body;

    // 创建评分记录
    const scoreRecord = await Score.create({
      caseId,
      projectId,
      studentId,
      submission,
      status: '待评分'
    });
    
    res.status(201).json(scoreRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取评分统计信息
// @route   GET /api/scores/stats
// @access  Private
const getScoreStats = async (req, res) => {
  try {
    const {
      projectId,
      caseId
    } = req.query;

    // 构建查询条件
    const query = {};

    if (projectId) query.projectId = projectId;
    if (caseId) query.caseId = caseId;

    // 计算统计信息
    const stats = await Score.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgScore: { $avg: '$finalScore' },
          minScore: { $min: '$finalScore' },
          maxScore: { $max: '$finalScore' },
          passedCount: {
            $sum: {
              $cond: [{ $gte: ['$finalScore', 60] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          avgScore: { $round: ['$avgScore', 1] },
          minScore: 1,
          maxScore: 1,
          passedCount: 1,
          passRate: { $round: [{ $multiply: [{ $divide: ['$passedCount', '$totalRecords'] }, 100] }, 1] }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalRecords: 0,
      avgScore: 0,
      minScore: 0,
      maxScore: 0,
      passedCount: 0,
      passRate: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  autoScore,
  manualReview,
  getScores,
  getScoreById,
  createScoreRecord,
  getScoreStats
};