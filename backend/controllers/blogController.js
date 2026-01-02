const Blog = require('../models/Blog');
const User = require('../models/User');

/**
 * 博客控制器
 * 提供博客内容的创建、管理和查询功能
 */

/**
 * 获取博客列表
 */
const getBlogs = async (req, res) => {
  try {
    const { category, status, tag, author_id, limit = 10, offset = 0 } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (tag) query.tags = { $in: [tag] };
    if (author_id) query.author_id = author_id;
    
    // 查询博客列表
    const blogs = await Blog.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    // 获取总数
    const total = await Blog.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        blogs,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('获取博客列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取单个博客详情
 */
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查询博客
    const blog = await Blog.findById(id).populate('author_id', 'name email');
    
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    // 增加阅读量
    blog.views += 1;
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('获取博客详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 创建博客
 */
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, cover_image, category, tags, status, seo } = req.body;
    
    // 验证参数
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: '标题、内容和分类是必填项' });
    }
    
    // 构建博客数据
    const blogData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 300),
      cover_image,
      category,
      tags,
      status: status || 'draft',
      author_id: req.user.id,
      seo: seo || {}
    };
    
    // 如果状态为已发布，则设置发布时间
    if (blogData.status === 'published') {
      blogData.published_at = new Date();
    }
    
    // 创建博客
    const blog = await Blog.create(blogData);
    
    res.status(201).json({
      success: true,
      data: blog,
      message: '博客创建成功'
    });
  } catch (error) {
    console.error('创建博客错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 更新博客
 */
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, cover_image, category, tags, status, seo } = req.body;
    
    // 查询博客
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    // 检查权限
    if (req.user.role !== 'admin' && blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权更新该博客' });
    }
    
    // 更新博客数据
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || content.substring(0, 300);
    blog.cover_image = cover_image || blog.cover_image;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;
    
    // 如果状态发生变化，设置相应的时间
    if (status && status !== blog.status) {
      blog.status = status;
      if (status === 'published' && !blog.published_at) {
        blog.published_at = new Date();
      }
    }
    
    blog.seo = seo || blog.seo;
    
    // 保存更新
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog,
      message: '博客更新成功'
    });
  } catch (error) {
    console.error('更新博客错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 删除博客
 */
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查询博客
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    // 检查权限
    if (req.user.role !== 'admin' && blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权删除该博客' });
    }
    
    // 删除博客
    await Blog.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: '博客已删除'
    });
  } catch (error) {
    console.error('删除博客错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取博客分类统计
 */
const getBlogStats = async (req, res) => {
  try {
    // 获取分类统计
    const categoryStats = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 获取状态统计
    const statusStats = await Blog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // 获取标签统计
    const tagStats = await Blog.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // 获取总数
    const total = await Blog.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        total,
        category_stats: categoryStats,
        status_stats: statusStats,
        tag_stats: tagStats
      }
    });
  } catch (error) {
    console.error('获取博客统计错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 发布博客
 */
const publishBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查询博客
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    // 检查权限
    if (req.user.role !== 'admin' && blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权发布该博客' });
    }
    
    // 发布博客
    blog.status = 'published';
    blog.published_at = new Date();
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog,
      message: '博客发布成功'
    });
  } catch (error) {
    console.error('发布博客错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 归档博客
 */
const archiveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查询博客
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    // 检查权限
    if (req.user.role !== 'admin' && blog.author_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: '无权归档该博客' });
    }
    
    // 归档博客
    blog.status = 'archived';
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog,
      message: '博客归档成功'
    });
  } catch (error) {
    console.error('归档博客错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取博客标签列表
 */
const getBlogTags = async (req, res) => {
  try {
    // 获取所有标签
    const tags = await Blog.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取博客标签列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  publishBlog,
  archiveBlog,
  getBlogTags
};