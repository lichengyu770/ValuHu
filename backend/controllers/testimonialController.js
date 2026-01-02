const { query } = require('../config/db');

let inMemoryTestimonials = [
  { id: 1, name: '赵强', title: '房产中介公司总经理', content: '使用智汇云平台后，我们的估价效率提升了300%，客户满意度大幅提高。AI估价功能比人工估价更快速准确。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 2, name: '李伟', title: '住建局信息科主任', content: '智汇云平台帮助我们建立了完善的房地产市场监测体系，数据实时准确，为政策制定提供了有力支撑。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 3, name: '王芳', title: '湖南大学房地产研究中心教授', content: '作为学术研究者，智汇云平台的案例库为我们提供了宝贵的研究数据，平台的产学研合作模式值得推广。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 4, name: '黄磊', title: '银行信贷部总监', content: '智汇云的风险评估模型非常专业，帮助我们有效降低了房贷风险，放贷效率也大大提高。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 5, name: '张华', title: '房产协会秘书长', content: '通过智汇云平台，协会实现了行业数据的统一管理和共享，信用体系建设更加规范高效。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 6, name: '吴彬', title: '物业公司运营经理', content: '智汇云的社区估价功能帮助我们更好地制定租金策略，房源管理也变得更加智能化。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 7, name: '赵军', title: '开发商项目总监', content: '在项目定位和定价方面，智汇云的市场分析报告给了我们非常精准的参考，项目成功率显著提升。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 8, name: '陈明', title: '职业技术学院专业主任', content: '智汇云平台是学生实训的最佳工具，学生毕业后能直接上手工作，就业竞争力大大增强。', avatar: '', created_at: new Date(), updated_at: new Date() },
  { id: 9, name: '周杰', title: '个人投资者', content: '作为一个房产投资者，智汇云帮我做出了很多正确的投资决策，平台的估价功能太实用了。', avatar: '', created_at: new Date(), updated_at: new Date() }
];

const getTestimonials = async (req, res) => {
  try {
    const result = await query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.log('使用内存存储返回评价数据（数据库连接失败）');
    res.json(inMemoryTestimonials);
  }
};

const createTestimonial = async (req, res) => {
  const { name, title, content, avatar } = req.body;
  
  try {
    const result = await query(
      'INSERT INTO testimonials (name, title, content, avatar, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, title, content, avatar]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    const newTestimonial = {
      id: inMemoryTestimonials.length + 1,
      name,
      title,
      content,
      avatar,
      created_at: new Date(),
      updated_at: new Date()
    };
    inMemoryTestimonials.push(newTestimonial);
    res.status(201).json(newTestimonial);
  }
};

const updateTestimonial = async (req, res) => {
  const { name, title, content, avatar } = req.body;
  
  try {
    const result = await query(
      'UPDATE testimonials SET name = $1, title = $2, content = $3, avatar = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, title, content, avatar, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '评价未找到' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    const index = inMemoryTestimonials.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: '评价未找到' });
    }
    inMemoryTestimonials[index] = { ...inMemoryTestimonials[index], name, title, content, avatar, updated_at: new Date() };
    res.json(inMemoryTestimonials[index]);
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const result = await query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '评价未找到' });
    }
    
    res.json({ message: '评价已删除' });
  } catch (error) {
    const index = inMemoryTestimonials.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: '评价未找到' });
    }
    inMemoryTestimonials.splice(index, 1);
    res.json({ message: '评价已删除' });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};