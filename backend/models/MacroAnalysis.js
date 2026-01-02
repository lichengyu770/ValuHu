const mongoose = require('mongoose');

/**
 * 宏观分析数据模型
 */
const MacroAnalysisSchema = new mongoose.Schema({
  // 分析指标名称
  name: {
    type: String,
    required: [true, '请输入指标名称'],
    trim: true,
    maxlength: [100, '指标名称不能超过100个字符']
  },
  // 分析指标代码
  code: {
    type: String,
    required: [true, '请输入指标代码'],
    trim: true,
    unique: true,
    maxlength: [50, '指标代码不能超过50个字符']
  },
  // 指标类型
  type: {
    type: String,
    enum: [
      'price_index', // 价格指数
      'volume_index', // 成交量指数
      'supply_demand', // 供需关系
      'macro_economic', // 宏观经济指标
      'policy_impact', // 政策影响
      'market_sentiment' // 市场情绪
    ],
    required: [true, '请选择指标类型']
  },
  // 指标单位
  unit: {
    type: String,
    required: [true, '请输入指标单位'],
    trim: true,
    maxlength: [20, '指标单位不能超过20个字符']
  },
  // 指标值
  value: {
    type: Number,
    required: [true, '请输入指标值']
  },
  // 同比增长率（%）
  yearOnYearGrowth: {
    type: Number,
    default: 0
  },
  // 环比增长率（%）
  monthOnMonthGrowth: {
    type: Number,
    default: 0
  },
  // 数据日期
  dataDate: {
    type: Date,
    required: [true, '请输入数据日期']
  },
  // 数据来源
  source: {
    type: String,
    required: [true, '请输入数据来源'],
    trim: true,
    maxlength: [100, '数据来源不能超过100个字符']
  },
  // 数据频率
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  // 所属地区
  region: {
    type: String,
    trim: true,
    maxlength: [50, '所属地区不能超过50个字符']
  },
  // 指标状态
  status: {
    type: String,
    enum: ['normal', 'warning', 'alert'],
    default: 'normal'
  },
  // 指标描述
  description: {
    type: String,
    trim: true,
    maxlength: [500, '指标描述不能超过500个字符']
  },
  // 相关政策
  relatedPolicies: [{
    type: String,
    trim: true
  }],
  // 历史数据
  historicalData: [{
    date: {
      type: Date,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    yearOnYearGrowth: {
      type: Number
    },
    monthOnMonthGrowth: {
      type: Number
    }
  }],
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引，提高查询效率
MacroAnalysisSchema.index({ code: 1 });
MacroAnalysisSchema.index({ type: 1, dataDate: 1 });
MacroAnalysisSchema.index({ region: 1, dataDate: 1 });

module.exports = mongoose.model('MacroAnalysis', MacroAnalysisSchema);