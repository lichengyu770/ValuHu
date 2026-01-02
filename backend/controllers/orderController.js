const Order = require('../models/Order');

// @desc    获取订单列表
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('user', 'username email');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个订单详情
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');
    
    if (!order) {
      return res.status(404).json({ message: '订单未找到' });
    }
    
    // 检查订单是否属于当前用户
    if (order.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权限访问该订单' });
    }
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新订单
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { productName, productPrice } = req.body;
  
  try {
    const order = await Order.create({
      user: req.user.id,
      productName,
      productPrice
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    更新订单状态
// @route   PUT /api/orders/:id
// @access  Private
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: '订单未找到' });
    }
    
    // 检查订单是否属于当前用户
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权限修改该订单' });
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除订单
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: '订单未找到' });
    }
    
    // 检查订单是否属于当前用户
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权限删除该订单' });
    }
    
    await order.remove();
    
    res.json({ message: '订单已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
};