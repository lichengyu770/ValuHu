const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

const newTestimonials = [
  {
    name: '赵经理',
    title: '房产中介公司总经理',
    content: '使用智汇云平台后，我们的估价效率提升了300%，客户满意度大幅提高。AI估价功能比人工估价更快速准确。'
  },
  {
    name: '钱主任',
    title: '住建局信息科主任',
    content: '智汇云平台帮助我们建立了完善的房地产市场监测体系，数据实时准确，为政策制定提供了有力支撑。'
  },
  {
    name: '孙教授',
    title: '湖南大学房地产研究中心',
    content: '作为学术研究者，智汇云平台的案例库为我们提供了宝贵的研究数据，平台的产学研合作模式值得推广。'
  },
  {
    name: '李总监',
    title: '银行信贷部总监',
    content: '智汇云的风险评估模型非常专业，帮助我们有效降低了房贷风险，放贷效率也大大提高。'
  },
  {
    name: '周书记',
    title: '房产协会秘书长',
    content: '通过智汇云平台，协会实现了行业数据的统一管理和共享，信用体系建设更加规范高效。'
  },
  {
    name: '吴经理',
    title: '物业公司运营经理',
    content: '智汇云的社区估价功能帮助我们更好地制定租金策略，房源管理也变得更加智能化。'
  },
  {
    name: '郑工程师',
    title: '开发商项目总监',
    content: '在项目定位和定价方面，智汇云的市场分析报告给了我们非常精准的参考，项目成功率显著提升。'
  },
  {
    name: '王老师',
    title: '职业技术学院教师',
    content: '智汇云平台是学生实训的最佳工具，学生毕业后能直接上手工作，就业竞争力大大增强。'
  }
];

async function addTestimonials() {
  console.log('🚀 开始添加用户评价...\n');

  for (const testimonial of newTestimonials) {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ 添加成功: ${testimonial.name} (${testimonial.title})`);
      } else {
        console.log(`⚠️  可能已存在: ${testimonial.name}`);
      }
    } catch (error) {
      console.log(`❌ 添加失败: ${testimonial.name} - ${error.message}`);
    }
  }

  console.log('\n📊 验证数据...');
  
  // 查询所有评价
  const response = await fetch(`${API_BASE_URL}/testimonials`);
  const testimonials = await response.json();
  
  console.log(`\n✅ 现在共有 ${testimonials.length} 条用户评价:\n`);
  
  testimonials.forEach((t, i) => {
    console.log(`${i + 1}. ${t.name} - ${t.title}`);
    console.log(`   "${t.content.substring(0, 50)}..."\n`);
  });
}

addTestimonials();
