const Valuation = require('../models/Valuation');
const Property = require('../models/Property');
const User = require('../models/User');

// 创建估价
const createValuation = async (req, res) => {
  try {
    // 验证请求数据
    const {
      propertyId,
      area,
      buildingType,
      floor,
      totalFloors,
      constructionYear,
      decorationLevel,
      valuationMethod,
      additionalParams,
    } = req.body;

    if (!propertyId || !area) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要字段',
      });
    }

    // 检查物业是否存在
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        code: 404,
        message: '物业不存在',
      });
    }

    // 检查用户是否存在
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    // TODO: 实现估价算法，计算估价结果
    // 这里暂时使用模拟数据
    const estimatedValue = area * 10000; // 假设每平米10000元
    const valueRange = {
      min: estimatedValue * 0.9,
      max: estimatedValue * 1.1,
    };

    // 创建估价记录
    const valuation = new Valuation({
      propertyId,
      userId: req.user.id,
      area,
      buildingType,
      floor,
      totalFloors,
      constructionYear,
      decorationLevel,
      valuationMethod,
      estimatedValue,
      valueRange,
      additionalParams,
    });

    // 保存估价记录
    await valuation.save();

    // 更新用户免费试用次数
    user.freeTrialCount -= 1;
    await user.save();

    res.status(201).json({
      code: 201,
      message: '估价创建成功',
      data: valuation,
    });
  } catch (error) {
    console.error('创建估价失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 获取估价列表
const getValuationList = async (req, res) => {
  try {
    // 获取查询参数
    const {
      page = 1,
      limit = 10,
      status,
      valuationMethod,
      startDate,
      endDate,
    } = req.query;

    // 构建查询条件
    const query = { userId: req.user.id };
    if (status) query.status = status;
    if (valuationMethod) query.valuationMethod = valuationMethod;
    if (startDate) query.valuationDate = { $gte: new Date(startDate) };
    if (endDate) {
      if (!query.valuationDate) query.valuationDate = {};
      query.valuationDate.$lte = new Date(endDate);
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查找估价记录
    const valuations = await Valuation.find(query)
      .populate('propertyId', 'propertyName propertyAddress')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ valuationDate: -1 });

    // 获取总记录数
    const total = await Valuation.countDocuments(query);

    res.status(200).json({
      code: 200,
      message: '获取估价列表成功',
      data: {
        valuations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取估价列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 获取估价详情
const getValuationById = async (req, res) => {
  try {
    // 获取估价ID
    const { id } = req.params;

    // 查找估价记录
    const valuation = await Valuation.findById(id)
      .populate('propertyId', 'propertyName propertyAddress propertyType')
      .populate('userId', 'username fullName');

    if (!valuation) {
      return res.status(404).json({
        code: 404,
        message: '估价记录不存在',
      });
    }

    // 检查估价记录是否属于当前用户
    if (valuation.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权访问该估价记录',
      });
    }

    res.status(200).json({
      code: 200,
      message: '获取估价详情成功',
      data: valuation,
    });
  } catch (error) {
    console.error('获取估价详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

// 更新估价
const updateValuation = async (req, res) => {
  try {
    // 获取估价ID
    const { id } = req.params;

    // 验证请求数据
    const { status, remarks } = req.body;

    // 查找估价记录
    const valuation = await Valuation.findById(id);

    if (!valuation) {
      return res.status(404).json({
        code: 404,
        message: '估价记录不存在',
      });
    }

    // 检查估价记录是否属于当前用户
    if (valuation.userId.toString() !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权操作该估价记录',
      });
    }

    // 更新估价状态和备注
    valuation.status = status;
    if (remarks) valuation.remarks = remarks;

    await valuation.save();

    res.status(200).json({
      code: 200,
      message: '估价更新成功',
      data: valuation,
    });
  } catch (error) {
    console.error('更新估价失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
};

module.exports = {
  createValuation,
  getValuationList,
  getValuationById,
  updateValuation,
};
