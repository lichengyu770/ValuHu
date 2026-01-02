const mongoose = require('mongoose');

const ScoreRuleSchema = new mongoose.Schema({
  // 评分规则名称
  name: {
    type: String,
    required: [true, '请输入评分规则名称']
  },
  // 评分规则描述
  description: {
    type: String
  },
  // 关联的案例类型
  applicableCaseTypes: [{
    type: String,
    enum: ['住宅', '写字楼', '商铺', '别墅', '厂房', '公寓'],
    required: [true, '请选择适用的案例类型']
  }],
  // 评分规则状态
  status: {
    type: String,
    enum: ['草稿', '生效中', '已过期'],
    default: '草稿'
  },
  // 评分项
  scoreItems: {
    type: [{
      // 评分项名称
      name: {
        type: String,
        required: [true, '请输入评分项名称']
      },
      // 评分项描述
      description: {
        type: String
      },
      // 权重（百分比）
      weight: {
        type: Number,
        required: [true, '请输入权重'],
        min: 0,
        max: 100
      },
      // 满分值
      fullMark: {
        type: Number,
        required: [true, '请输入满分值'],
        default: 100
      },
      // 评分标准
      criteria: {
        type: [{
          // 条件类型
          conditionType: {
            type: String,
            enum: ['关键词匹配', '内容长度', '格式检查', '逻辑一致性', '数据准确性'],
            required: [true, '请选择条件类型']
          },
          // 条件值
          conditionValue: {
            type: String,
            required: [true, '请输入条件值']
          },
          // 预期结果
          expectedResult: {
            type: String,
            required: [true, '请输入预期结果']
          },
          // 得分比例（百分比）
          scorePercentage: {
            type: Number,
            required: [true, '请输入得分比例'],
            min: 0,
            max: 100
          }
        }],
        required: [true, '请输入评分标准']
      }
    }],
    required: [true, '请输入评分项']
  },
  // 规则创建者
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请输入创建者ID']
  },
  // 生效时间
  effectiveTime: {
    type: Date
  },
  // 过期时间
  expireTime: {
    type: Date
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新updatedAt字段的中间件
ScoreRuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScoreRule', ScoreRuleSchema);