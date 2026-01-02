import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 测试路由
app.get('/', (req, res) => {
  res.send('服务器正在运行！');
});

// 联系表单提交路由
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // 验证请求数据
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: '请填写所有必填字段' });
    }

    // 构建消息数据
    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString(),
    };

    // 保存到文件（模拟邮件发送）
    const filePath = path.join(process.cwd(), 'contact-form-submissions.json');
    let submissions = [];

    // 读取现有数据
    if (fs.existsSync(filePath)) {
      try {
        const existingData = fs.readFileSync(filePath, 'utf8');
        submissions = JSON.parse(existingData);
      } catch (error) {
        console.error('读取文件失败:', error);
        submissions = [];
      }
    }

    // 添加新数据
    submissions.push(contactData);

    // 保存数据到文件
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), 'utf8');

    console.log('表单提交成功:', contactData);

    // 发送响应
    res
      .status(200)
      .json({ success: true, message: '消息发送成功！我们会尽快回复您。' });
  } catch (error) {
    console.error('表单提交处理失败:', error);
    res
      .status(500)
      .json({ success: false, message: '消息发送失败，请稍后重试。' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
