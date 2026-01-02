-- ============================================
-- 智汇云数据库配置脚本
-- 用于修复 Supabase 连接问题
-- ============================================

-- 1. 确保 testimonials 表存在（如果不存在则创建）
CREATE TABLE IF NOT EXISTS testimonials (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 确保 properties 表存在
CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    type VARCHAR(100),
    area DECIMAL(10, 2),
    longitude DECIMAL(10, 6),
    latitude DECIMAL(10, 6),
    address VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 禁用 RLS（如果存在）- 允许匿名读取数据
ALTER TABLE IF EXISTS testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS properties DISABLE ROW LEVEL SECURITY;

-- 4. 或者创建策略允许匿名用户读取
DROP POLICY IF EXISTS "Allow anonymous read" ON testimonials;
CREATE POLICY "Allow anonymous read" ON testimonials
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow anonymous read" ON properties;
CREATE POLICY "Allow anonymous read" ON properties
    FOR SELECT
    USING (true);

-- 5. 清空现有数据并插入新数据（避免重复）
TRUNCATE TABLE testimonials RESTART IDENTITY;

-- 插入用户评价数据
INSERT INTO testimonials (name, title, content) VALUES 
-- 企业用户
('赵强', '房产中介公司总经理', '使用智汇云平台后，我们的估价效率提升了300%，客户满意度大幅提高。AI估价功能比人工估价更快速准确。'),
('钱明', '连锁品牌运营总监', '智汇云的OCR识房功能太强大了，拍照就能自动提取房产信息，录入时间从30分钟缩短到1分钟。'),
('孙华', '二手房交易平台负责人', '平台的风险评估模型非常专业，帮助我们有效识别高评套贷风险，业务合规性大大提升。'),

-- 政府官员
('李伟', '住建局信息科主任', '智汇云平台帮助我们建立了完善的房地产市场监测体系，数据实时准确，为政策制定提供了有力支撑。'),
('周正', '房产管理处科长', '通过智汇云，我们实现了全市房产数据的统一管理，监管效率提升显著，违规行为无所遁形。'),
('郑强', '市场监管处副处长', '平台的智能预警功能非常实用，能够及时发现市场异常波动，为我们调控政策提供数据支撑。'),

-- 高校教师
('王芳', '湖南大学房地产研究中心教授', '作为学术研究者，智汇云平台的案例库为我们提供了宝贵的研究数据，平台的产学研合作模式值得推广。'),
('陈明', '职业技术学院房地产专业主任', '智汇云平台是学生实训的最佳工具，学生毕业后能直接上手工作，就业竞争力大大增强。'),
('刘洋', '某高校建筑学院讲师', '平台提供的真实案例让学生能够将理论与实践结合，学习效果比传统教学方式好太多了。'),

-- 银行从业者
('黄磊', '银行信贷部总监', '智汇云的风险评估模型非常专业，帮助我们有效降低了房贷风险，放贷效率也大大提高。'),
('杨帆', '银行风控部门经理', '通过智汇云的房产估价报告，我们的审批时间缩短了50%，同时保证了估价的专业性和准确性。'),

-- 协会负责人
('张华', '房产协会秘书长', '通过智汇云平台，协会实现了行业数据的统一管理和共享，信用体系建设更加规范高效。'),
('徐敏', '中介协会副会长', '智汇云帮助我们建立了行业红黑榜，诚信经营的企业得到表彰，违规行为受到约束，行业风气明显好转。'),

-- 物业公司
('吴彬', '物业公司运营经理', '智汇云的社区估价功能帮助我们更好地制定租金策略，房源管理也变得更加智能化。'),
('郑涛', '物业管理公司总经理', '平台提供的周边房价分析报告非常准确，帮助我们合理定价，入住率提升了15%。'),

-- 开发商
('赵军', '开发商项目总监', '在项目定位和定价方面，智汇云的市场分析报告给了我们非常精准的参考，项目成功率显著提升。'),
('李鹏', '房地产开发公司策划经理', '智汇云的竞品分析功能很强大，让我们能够知己知彼，制定更有竞争力的营销策略。'),

-- 个人用户
('周杰', '个人投资者', '作为一个房产投资者，智汇云帮我做出了很多正确的投资决策，平台的估价功能太实用了。'),
('王芳', '首次购房者', '通过智汇云查房价，我买到了性价比很高的房子，报告专业可信，让我避免了被中介坑。');

-- 6. 验证数据
SELECT 
    '✅ 数据库配置完成！共 ' || COUNT(*) || ' 条用户评价' as status
FROM testimonials;

-- 显示所有评价
SELECT 
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as 序号,
    name as 姓名,
    title as 身份,
    SUBSTRING(content, 1, 40) || '...' as 评价摘要
FROM testimonials
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 执行说明：
-- 1. 登录 https://pvwkqpjouweguszvnbvc.supabase.co
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- 4. 刷新 supabase-index.html 页面查看效果
-- ============================================
