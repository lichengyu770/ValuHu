// 文件上传控制器
const db = require('../db');
const fs = require('fs');
const path = require('path');

// 确保uploads目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class FileController {
  /**
   * 上传文件
   */
  static async uploadFile(req, res) {
    try {
      // 由于没有使用multer，这里简单模拟文件上传
      // 实际生产环境建议使用multer处理文件上传
      const { fileName, fileType, fileSize, base64Data, userId } = req.body;

      if (!fileName || !fileType || !fileSize || !base64Data) {
        return res.status(400).send({ success: false, message: '缺少必要的文件参数' });
      }

      // 验证文件大小（限制10MB）
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileSize > maxSize) {
        return res.status(400).send({ success: false, message: '文件大小超过限制（最大10MB）' });
      }

      // 生成唯一文件名
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}-${fileName}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // 解码base64数据并保存文件
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      // 保存文件信息到数据库
      const sql = `INSERT INTO uploaded_files (user_id, file_name, file_path, file_type, file_size) 
                  VALUES (?, ?, ?, ?, ?)`;
      
      db.run(sql, [userId, fileName, uniqueFileName, fileType, fileSize], function(err) {
        if (err) {
          console.error('保存文件信息失败:', err.message);
          // 删除已上传的文件
          fs.unlinkSync(filePath);
          return res.status(500).send({ success: false, message: '保存文件信息失败' });
        }

        res.send({
          success: true,
          message: '文件上传成功',
          data: {
            id: this.lastID,
            fileName: fileName,
            fileType: fileType,
            fileSize: fileSize,
            filePath: uniqueFileName
          }
        });
      });
    } catch (error) {
      console.error('处理文件上传请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(req, res) {
    try {
      const { id } = req.params;

      const sql = `SELECT * FROM uploaded_files WHERE id = ? AND is_deleted = 0`;
      
      db.get(sql, [id], (err, file) => {
        if (err) {
          console.error('获取文件信息失败:', err.message);
          return res.status(500).send({ success: false, message: '获取文件信息失败' });
        }

        if (!file) {
          return res.status(404).send({ success: false, message: '文件不存在' });
        }

        res.send({ success: true, data: file });
      });
    } catch (error) {
      console.error('处理获取文件信息请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 下载文件
   */
  static async downloadFile(req, res) {
    try {
      const { id } = req.params;

      const sql = `SELECT * FROM uploaded_files WHERE id = ? AND is_deleted = 0`;
      
      db.get(sql, [id], (err, file) => {
        if (err) {
          console.error('获取文件信息失败:', err.message);
          return res.status(500).send({ success: false, message: '获取文件信息失败' });
        }

        if (!file) {
          return res.status(404).send({ success: false, message: '文件不存在' });
        }

        const filePath = path.join(uploadDir, file.file_path);
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          return res.status(404).send({ success: false, message: '文件不存在' });
        }

        // 设置响应头
        res.setHeader('Content-Type', file.file_type);
        res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
        res.setHeader('Content-Length', file.file_size);

        // 读取文件并发送
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      });
    } catch (error) {
      console.error('处理下载文件请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(req, res) {
    try {
      const { id } = req.params;

      // 获取文件信息
      const sql = `SELECT * FROM uploaded_files WHERE id = ? AND is_deleted = 0`;
      
      db.get(sql, [id], (err, file) => {
        if (err) {
          console.error('获取文件信息失败:', err.message);
          return res.status(500).send({ success: false, message: '获取文件信息失败' });
        }

        if (!file) {
          return res.status(404).send({ success: false, message: '文件不存在' });
        }

        // 从数据库中删除文件记录
        const deleteSql = `UPDATE uploaded_files SET is_deleted = 1 WHERE id = ?`;
        
        db.run(deleteSql, [id], (err) => {
          if (err) {
            console.error('删除文件记录失败:', err.message);
            return res.status(500).send({ success: false, message: '删除文件记录失败' });
          }

          // 从服务器删除实际文件
          const filePath = path.join(uploadDir, file.file_path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          res.send({ success: true, message: '文件删除成功' });
        });
      });
    } catch (error) {
      console.error('处理删除文件请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = FileController;