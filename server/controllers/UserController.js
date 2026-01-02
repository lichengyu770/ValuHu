// 用户控制器
import db from '../db.js';
import SmsService from '../utils/smsService.js';
import { successResponse, errorResponse, serverErrorResponse, notFoundResponse } from '../utils/response.js';

class UserController {
  /**
   * 登录接口（支持自动注册）
   */
  static async login(req, res) {
    try {
      const { user_id, user_sig } = req.body;

      // 验证参数
      if (!user_id || !user_sig) {
        return errorResponse(res, 'UserID和UserSig不能为空', 400);
      }

      // 验证UserID格式
      const userIdRegex = /^[a-zA-Z0-9_-]{1,32}$/;
      if (!userIdRegex.test(user_id)) {
        return errorResponse(res, 'UserID格式错误，只允许字母、数字、下划线和连字符，长度不超过32个字符', 400);
      }

      // 检查UserID是否存在
      db.get('SELECT * FROM users WHERE user_id = ?', [user_id], (err, user) => {
        if (err) {
          console.error('查询用户失败:', err.message);
          return serverErrorResponse(res);
        }

        // 如果用户存在，验证UserSig
        if (user) {
          if (user.user_sig === user_sig) {
            // 更新最后登录时间
            db.run(
              'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
              [user_id],
              (err) => {
                if (err) {
                  console.error('更新用户时间失败:', err.message);
                }
              }
            );
            return successResponse(res, { user_id: user.user_id, is_new: false }, '登录成功');
          } else {
            return errorResponse(res, 'UserSig验证失败', 401);
          }
        }
        // 如果用户不存在，自动注册
        else {
          const sql = 'INSERT INTO users (user_id, user_sig) VALUES (?, ?)';
          db.run(sql, [user_id, user_sig], function (err) {
            if (err) {
              console.error('创建用户失败:', err.message);
              return serverErrorResponse(res);
            }
            return successResponse(res, { user_id: user_id, is_new: true }, '注册并登录成功');
          });
        }
      });
    } catch (error) {
      console.error('登录处理失败:', error);
      serverErrorResponse(res);
    }
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(req, res) {
    try {
      const { id } = req.params;

      // 查询用户信息
      const sql = `SELECT * FROM users WHERE user_id = ?`;
      
      db.get(sql, [id], (err, user) => {
        if (err) {
          console.error('获取用户信息失败:', err.message);
          return serverErrorResponse(res);
        }

        if (!user) {
          return notFoundResponse(res, '用户不存在');
        }

        successResponse(res, user, '获取用户信息成功');
      });
    } catch (error) {
      console.error('处理获取用户信息请求失败:', error);
      serverErrorResponse(res);
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUserInfo(req, res) {
    try {
      const { id } = req.params;
      const { user_sig, ...otherFields } = req.body;

      // 验证参数
      if (!user_sig) {
        return errorResponse(res, 'UserSig不能为空', 400);
      }

      // 检查用户是否存在并验证UserSig
      db.get('SELECT * FROM users WHERE user_id = ?', [id], (err, user) => {
        if (err) {
          console.error('查询用户失败:', err.message);
          return serverErrorResponse(res);
        }

        if (!user) {
          return notFoundResponse(res, '用户不存在');
        }

        if (user.user_sig !== user_sig) {
          return errorResponse(res, 'UserSig验证失败', 401);
        }

        // 构建更新SQL
        let updateFields = [];
        let params = [];

        // 只更新提供的字段
        if (otherFields) {
          for (const [key, value] of Object.entries(otherFields)) {
            // 排除user_id和user_sig字段
            if (key !== 'user_id' && key !== 'user_sig') {
              updateFields.push(`${key} = ?`);
              params.push(value);
            }
          }
        }

        // 添加updated_at字段
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        if (updateFields.length === 1) {
          // 只有updated_at字段，直接返回成功
          return successResponse(res, null, '用户信息更新成功');
        }

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
        
        db.run(sql, params, function (err) {
          if (err) {
            console.error('更新用户信息失败:', err.message);
            return serverErrorResponse(res, '更新用户信息失败');
          }

          successResponse(res, null, '用户信息更新成功');
        });
      });
    } catch (error) {
      console.error('处理更新用户信息请求失败:', error);
      serverErrorResponse(res);
    }
  }

  /**
   * 获取用户估价历史
   */
  static async getUserValuationHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // 查询用户估价历史
      const sql = `SELECT * FROM valuation_results 
                  WHERE user_id = ? 
                  ORDER BY created_at DESC 
                  LIMIT ? OFFSET ?`;
      
      db.all(sql, [id, parseInt(limit), parseInt(offset)], (err, rows) => {
        if (err) {
          console.error('获取用户估价历史失败:', err.message);
          return serverErrorResponse(res, '获取用户估价历史失败');
        }

        // 解析JSON数据
        const valuationHistory = rows.map(row => ({
          ...row,
          factors: JSON.parse(row.factors),
          propertyInfo: JSON.parse(row.propertyInfo)
        }));

        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM valuation_results WHERE user_id = ?`;
        db.get(countSql, [id], (err, countResult) => {
          if (err) {
            console.error('获取估价历史总数失败:', err.message);
            return serverErrorResponse(res, '获取估价历史总数失败');
          }

          successResponse(res, {
            list: valuationHistory,
            total: countResult.total || 0
          }, '获取用户估价历史成功');
        });
      });
    } catch (error) {
      console.error('处理获取用户估价历史请求失败:', error);
      serverErrorResponse(res);
    }
  }

  /**
   * 发送短信验证码
   */
  static async sendSmsCode(req, res) {
    try {
      const { phoneNumber } = req.body;

      // 验证参数
      if (!phoneNumber) {
        return errorResponse(res, '手机号不能为空', 400);
      }

      // 简单的手机号验证
      if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        return errorResponse(res, '请输入正确的手机号码', 400);
      }

      // 发送验证码
      const result = await SmsService.sendVerificationCode(phoneNumber);

      if (result) {
        return successResponse(res, null, '验证码发送成功');
      } else {
        return serverErrorResponse(res, '验证码发送失败，请稍后重试');
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      serverErrorResponse(res);
    }
  }

  /**
   * 验证短信验证码
   */
  static verifySmsCode(req, res) {
    try {
      const { phoneNumber, code } = req.body;

      // 验证参数
      if (!phoneNumber || !code) {
        return errorResponse(res, '手机号和验证码不能为空', 400);
      }

      // 简单的手机号验证
      if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        return errorResponse(res, '请输入正确的手机号码', 400);
      }

      // 验证验证码
      const result = SmsService.verifyCode(phoneNumber, code);

      if (result) {
        return successResponse(res, null, '验证码验证成功');
      } else {
        return errorResponse(res, '验证码错误或已过期', 400);
      }
    } catch (error) {
      console.error('验证验证码失败:', error);
      serverErrorResponse(res);
    }
  }
}

export default UserController;