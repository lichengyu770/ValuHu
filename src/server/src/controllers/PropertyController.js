const Property = require('../models/Property');

// 创建物业信息
exports.createProperty = async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json({
      code: 201,
      message: '物业信息创建成功',
      data: property,
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: '物业信息创建失败',
      error: err.message,
    });
  }
};

// 获取物业列表
exports.getPropertyList = async (req, res) => {
  try {
    const { page = 1, limit = 10, propertyType, status } = req.query;
    const query = {};

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const properties = await Property.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(query);

    res.status(200).json({
      code: 200,
      message: '物业列表获取成功',
      data: {
        list: properties,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '物业列表获取失败',
      error: err.message,
    });
  }
};

// 获取物业详情
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('devices')
      .populate('workorders')
      .populate('tenants');

    if (!property) {
      return res.status(404).json({
        code: 404,
        message: '物业信息不存在',
      });
    }

    res.status(200).json({
      code: 200,
      message: '物业详情获取成功',
      data: property,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '物业详情获取失败',
      error: err.message,
    });
  }
};

// 更新物业信息
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res.status(404).json({
        code: 404,
        message: '物业信息不存在',
      });
    }

    res.status(200).json({
      code: 200,
      message: '物业信息更新成功',
      data: property,
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: '物业信息更新失败',
      error: err.message,
    });
  }
};

// 删除物业信息
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        code: 404,
        message: '物业信息不存在',
      });
    }

    res.status(200).json({
      code: 200,
      message: '物业信息删除成功',
      data: property,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '物业信息删除失败',
      error: err.message,
    });
  }
};

// 获取物业统计信息
exports.getPropertyStats = async (req, res) => {
  try {
    const total = await Property.countDocuments();
    const byType = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    ]);
    const byStatus = await Property.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      code: 200,
      message: '物业统计信息获取成功',
      data: {
        total,
        byType,
        byStatus,
      },
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '物业统计信息获取失败',
      error: err.message,
    });
  }
};
