const nodemailer = require('nodemailer');
const { query } = require('../config/db');

/**
 * 邮件服务
 * 用于发送批量估价任务完成通知等邮件
 */

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

/**
 * 发送批量估价任务完成通知
 * @param {string} taskId - 任务ID
 * @param {string} userId - 用户ID
 */
const sendBatchValuationCompleteEmail = async (taskId, userId) => {
  try {
    // 获取用户信息
    const userSql = `SELECT email, name FROM users WHERE id = $1`;
    const { rows: userRows } = await query(userSql, [userId]);
    
    if (!userRows.length || !userRows[0].email) {
      console.error('用户没有设置邮箱，无法发送通知');
      return;
    }
    
    const user = userRows[0];
    
    // 获取任务信息
    const taskSql = `SELECT * FROM batch_valuation_tasks WHERE id = $1`;
    const { rows: taskRows } = await query(taskSql, [taskId]);
    
    if (!taskRows.length) {
      console.error('任务不存在，无法发送通知');
      return;
    }
    
    const task = taskRows[0];
    
    // 构建邮件内容
    const mailOptions = {
      from: process.env.SMTP_FROM || 'ValuHub <noreply@valuhub.com>',
      to: user.email,
      subject: `【ValuHub】批量估价任务处理完成通知`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1A5FDF; margin-bottom: 20px;">批量估价任务处理完成</h2>
          <p>亲爱的 ${user.name || '用户'}：</p>
          <p>您的批量估价任务已处理完成，以下是任务详情：</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">任务ID</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.id}</td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">文件名</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.filename}</td>
            </tr>
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">状态</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">
                ${task.status === 'completed' ? '<span style="color: #67C23A;">处理完成</span>' : '<span style="color: #F56C6C;">处理失败</span>'}
              </td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">总记录数</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.total_records}</td>
            </tr>
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">成功记录数</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.success_records}</td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">失败记录数</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.failed_records}</td>
            </tr>
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">处理时间</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">
                ${new Date(task.updated_at).toLocaleString()}
              </td>
            </tr>
          </table>
          <p>您可以登录ValuHub平台查看任务详情并下载结果文件。</p>
          <p>感谢您使用ValuHub服务！</p>
          <p style="margin-top: 30px; color: #909399; font-size: 14px;">
            此邮件为系统自动发送，请勿回复。如有问题，请联系我们的客服团队。<br>
            © 2025 ValuHub 房产价值生态引擎
          </p>
        </div>
      `
    };
    
    // 发送邮件
    await transporter.sendMail(mailOptions);
    console.log(`已发送批量估价完成通知邮件给用户 ${userId}`);
  } catch (error) {
    console.error('发送批量估价完成通知邮件错误:', error);
  }
};

/**
 * 发送批量估价任务开始通知
 * @param {string} taskId - 任务ID
 * @param {string} userId - 用户ID
 */
const sendBatchValuationStartEmail = async (taskId, userId) => {
  try {
    // 获取用户信息
    const userSql = `SELECT email, name FROM users WHERE id = $1`;
    const { rows: userRows } = await query(userSql, [userId]);
    
    if (!userRows.length || !userRows[0].email) {
      console.error('用户没有设置邮箱，无法发送通知');
      return;
    }
    
    const user = userRows[0];
    
    // 获取任务信息
    const taskSql = `SELECT * FROM batch_valuation_tasks WHERE id = $1`;
    const { rows: taskRows } = await query(taskSql, [taskId]);
    
    if (!taskRows.length) {
      console.error('任务不存在，无法发送通知');
      return;
    }
    
    const task = taskRows[0];
    
    // 构建邮件内容
    const mailOptions = {
      from: process.env.SMTP_FROM || 'ValuHub <noreply@valuhub.com>',
      to: user.email,
      subject: `【ValuHub】批量估价任务开始处理`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1A5FDF; margin-bottom: 20px;">批量估价任务开始处理</h2>
          <p>亲爱的 ${user.name || '用户'}：</p>
          <p>您的批量估价任务已开始处理，以下是任务详情：</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">任务ID</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.id}</td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">文件名</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.filename}</td>
            </tr>
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">状态</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">
                <span style="color: #E6A23C;">处理中</span>
              </td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">总记录数</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">${task.total_records}</td>
            </tr>
            <tr style="background-color: #f5f7fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e4e7ed;">提交时间</th>
              <td style="padding: 10px; border: 1px solid #e4e7ed;">
                ${new Date(task.created_at).toLocaleString()}
              </td>
            </tr>
          </table>
          <p>任务处理完成后，我们将通过邮件通知您。您也可以登录ValuHub平台查看任务进度。</p>
          <p>感谢您使用ValuHub服务！</p>
          <p style="margin-top: 30px; color: #909399; font-size: 14px;">
            此邮件为系统自动发送，请勿回复。如有问题，请联系我们的客服团队。<br>
            © 2025 ValuHub 房产价值生态引擎
          </p>
        </div>
      `
    };
    
    // 发送邮件
    await transporter.sendMail(mailOptions);
    console.log(`已发送批量估价开始通知邮件给用户 ${userId}`);
  } catch (error) {
    console.error('发送批量估价开始通知邮件错误:', error);
  }
};

module.exports = {
  sendBatchValuationCompleteEmail,
  sendBatchValuationStartEmail
};
