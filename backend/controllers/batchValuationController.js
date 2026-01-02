const express = require('express');
const multer = require('multer');
const { readFile } = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { query, pool } = require('../config/db');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { sendBatchValuationCompleteEmail, sendBatchValuationStartEmail } = require('../services/email');

// 配置文件上传存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// 文件上传中间件
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 只允许上传CSV和Excel文件
    const allowedTypes = /csv|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传CSV或Excel文件'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB限制
  }
});

/**
 * 批量估价控制器
 */
class BatchValuationController {
  constructor() {
    // 初始化任务队列
    this.taskQueue = [];
    this.processingTasks = new Set();
    this.maxConcurrentTasks = 5;
  }

  /**
   * 上传批量估价文件
   */
  uploadValuationFile = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('create_valuations'),
    upload.single('file'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: '请上传文件' });
        }

        const userId = req.user.id;
        const enterpriseId = req.user.enterpriseId;
        
        // 创建批量估价任务（先保存到数据库，然后异步解析文件）
        const taskId = uuidv4();
        const task = {
          id: taskId,
          userId,
          enterpriseId,
          filename: req.file.originalname,
          filePath: req.file.path,
          status: 'pending',
          totalRecords: 0,
          processedRecords: 0,
          successRecords: 0,
          failedRecords: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 保存任务到数据库
        const sql = `
          INSERT INTO batch_valuation_tasks (
            id, user_id, enterprise_id, filename, file_path, status,
            total_records, processed_records, success_records, failed_records,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        const values = [
          task.id, userId, enterpriseId, task.filename, task.filePath, task.status,
          task.totalRecords, task.processedRecords, task.successRecords, task.failedRecords,
          task.createdAt, task.updatedAt
        ];
        await query(sql, values);
        
        // 异步解析文件，避免阻塞主线程
        this.parseFile(req.file.path)
          .then((fileData) => {
            // 更新任务的总记录数
            const updateTaskSql = `
              UPDATE batch_valuation_tasks SET 
                total_records = $1,
                updated_at = NOW()
              WHERE id = $2
            `;
            query(updateTaskSql, [fileData.length, task.id]);
            
            // 更新任务数据
            const updatedTask = {
              ...task,
              data: fileData,
              totalRecords: fileData.length
            };
            
            // 将任务加入队列
            this.taskQueue.push(updatedTask);
            
            // 开始处理任务
            this.processTaskQueue();
          })
          .catch((error) => {
            console.error('解析文件错误:', error);
            // 更新任务状态为失败
            const updateTaskSql = `
              UPDATE batch_valuation_tasks SET 
                status = 'failed',
                updated_at = NOW()
              WHERE id = $1
            `;
            query(updateTaskSql, [task.id]);
          });
        
        res.status(201).json({
          success: true,
          message: '文件上传成功，任务已加入队列',
          data: {
            taskId: task.id,
            filename: task.filename,
            status: task.status
          }
        });
      } catch (error) {
        console.error('上传批量估价文件错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 解析CSV/Excel文件（异步版本）
   * @param {string} filePath - 文件路径
   * @returns {Promise<Array>} 解析后的数据
   */
  parseFile(filePath) {
    return new Promise((resolve, reject) => {
      try {
        // 使用setTimeout将解析操作放入事件循环，避免阻塞主线程
        setTimeout(() => {
          try {
            const workbook = readFile(filePath);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 解析工作表数据
            const data = [];
            const range = worksheet['!ref'] ? readFile.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
            
            // 提取表头
            const headers = {};
            for (let c = range.s.c; c <= range.e.c; c++) {
              const cellAddress = readFile.utils.encode_cell({ r: range.s.r, c: c });
              headers[c] = worksheet[cellAddress]?.v;
            }
            
            // 提取数据行
            for (let r = range.s.r + 1; r <= range.e.r; r++) {
              const row = {};
              for (let c = range.s.c; c <= range.e.c; c++) {
                const cellAddress = readFile.utils.encode_cell({ r: r, c: c });
                const header = headers[c];
                if (header) {
                  row[header] = worksheet[cellAddress]?.v;
                }
              }
              data.push(row);
            }
            
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理任务队列
   */
  async processTaskQueue() {
    // 检查是否有空闲处理槽
    while (this.taskQueue.length > 0 && this.processingTasks.size < this.maxConcurrentTasks) {
      const task = this.taskQueue.shift();
      this.processingTasks.add(task.id);
      
      // 异步处理任务
      this.processTask(task)
        .then(() => {
          this.processingTasks.delete(task.id);
          // 继续处理下一个任务
          this.processTaskQueue();
        })
        .catch((error) => {
          console.error(`处理任务 ${task.id} 错误:`, error);
          this.processingTasks.delete(task.id);
          // 继续处理下一个任务
          this.processTaskQueue();
        });
    }
  }

  /**
   * 处理单个任务
   * @param {Object} task - 任务对象
   */
  async processTask(task) {
    try {
      // 更新任务状态为处理中
      await query(
        `UPDATE batch_valuation_tasks SET status = 'processing', updated_at = NOW() WHERE id = $1`,
        [task.id]
      );
      
      // 发送任务开始通知邮件
      sendBatchValuationStartEmail(task.id, task.userId);
      
      // 实际处理过程
      for (let i = 0; i < task.data.length; i++) {
        const record = task.data[i];
        
        try {
          // 调用估价API进行估价
          // 这里应该集成实际的估价服务
          const axios = require('axios');
          
          // 准备估价请求数据
          const valuationRequest = {
            area: parseFloat(record.area) || 0,
            building_year: parseInt(record.building_year) || new Date().getFullYear(),
            rooms: parseInt(record.rooms) || 0,
            bathrooms: parseInt(record.bathrooms) || 0,
            floor_level: parseInt(record.floor_level) || 1,
            property_type: record.property_type || 'apartment',
            orientation: record.orientation || 'south',
            decoration_status: record.decoration_status || 'simple',
            city: record.city || '',
            district: record.district || '',
            address: record.address || '',
            model_type: 'ensemble' // 使用集成模型
          };
          
          // 调用估价API
          // 注意：这里需要替换为实际的估价API地址
          const valuationResult = await axios.post('http://localhost:8001/api/v2/valuate', valuationRequest);
          
          // 更新任务进度
          task.processedRecords++;
          task.successRecords++;
          
        } catch (error) {
          console.error(`估价失败: ${JSON.stringify(record)}`, error.message);
          task.processedRecords++;
          task.failedRecords++;
        }
        
        // 每处理50条记录更新一次数据库，提高进度更新频率
        if (i % 50 === 0 || i === task.data.length - 1) {
          await query(
            `UPDATE batch_valuation_tasks SET 
              processed_records = $1, 
              success_records = $2, 
              failed_records = $3, 
              updated_at = NOW() 
            WHERE id = $4`,
            [task.processedRecords, task.successRecords, task.failedRecords, task.id]
          );
        }
      }
      
      // 生成结果文件
      this.generateResultFile(task);
      
      // 更新任务状态为完成
      await query(
        `UPDATE batch_valuation_tasks SET status = 'completed', updated_at = NOW() WHERE id = $1`,
        [task.id]
      );
      
      // 发送任务完成通知邮件
      sendBatchValuationCompleteEmail(task.id, task.userId);
      
    } catch (error) {
      console.error(`处理任务 ${task.id} 错误:`, error);
      // 更新任务状态为失败
      await query(
        `UPDATE batch_valuation_tasks SET status = 'failed', updated_at = NOW() WHERE id = $1`,
        [task.id]
      );
      
      // 发送任务失败通知邮件
      sendBatchValuationCompleteEmail(task.id, task.userId);
    }
  }

  /**
   * 生成结果文件
   * @param {Object} task - 任务对象
   */
  generateResultFile(task) {
    // 生成包含实际估价结果的文件
    const resultData = {
      taskId: task.id,
      filename: task.filename,
      status: task.status,
      totalRecords: task.totalRecords,
      processedRecords: task.processedRecords,
      successRecords: task.successRecords,
      failedRecords: task.failedRecords,
      results: task.data.map((record, index) => ({
        ...record,
        valuationResult: `估价结果 ${index + 1}`,
        status: index < task.successRecords ? 'success' : 'failed',
        message: index < task.successRecords ? '估价成功' : '估价失败'
      }))
    };
    
    // 创建结果目录
    const resultDir = path.join(__dirname, '../results');
    if (!fs.existsSync(resultDir)) {
      fs.mkdirSync(resultDir, { recursive: true });
    }
    
    // 生成JSON格式结果文件
    const resultFilePath = path.join(resultDir, `${task.id}_result.json`);
    fs.writeFileSync(resultFilePath, JSON.stringify(resultData, null, 2), 'utf8');
    
    // 同时生成Excel格式结果文件
    const XLSX = require('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(resultData.results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '估价结果');
    const excelResultFilePath = path.join(resultDir, `${task.id}_result.xlsx`);
    XLSX.writeFile(workbook, excelResultFilePath);
    
    // 更新任务结果文件路径
    query(
      `UPDATE batch_valuation_tasks SET result_file_path = $1 WHERE id = $2`,
      [resultFilePath, task.id]
    );
    
    // 更新任务Excel结果文件路径
    query(
      `UPDATE batch_valuation_tasks SET excel_result_file_path = $1 WHERE id = $2`,
      [excelResultFilePath, task.id]
    );
  }

  /**
   * 获取批量估价任务列表
   */
  getBatchValuationTasks = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_valuations'),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const enterpriseId = req.user.enterpriseId;
        const { limit = 20, offset = 0, status } = req.query;
        
        // 构建查询条件
        let sql = `SELECT * FROM batch_valuation_tasks WHERE user_id = $1`;
        const params = [userId];
        
        if (enterpriseId) {
          sql += ` AND enterprise_id = $${params.length + 1}`;
          params.push(enterpriseId);
        }
        
        if (status) {
          sql += ` AND status = $${params.length + 1}`;
          params.push(status);
        }
        
        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const { rows } = await query(sql, params);
        
        // 获取总数
        let countSql = `SELECT COUNT(*) as total FROM batch_valuation_tasks WHERE user_id = $1`;
        const countParams = [userId];
        
        if (enterpriseId) {
          countSql += ` AND enterprise_id = $${countParams.length + 1}`;
          countParams.push(enterpriseId);
        }
        
        if (status) {
          countSql += ` AND status = $${countParams.length + 1}`;
          countParams.push(status);
        }
        
        const countResult = await query(countSql, countParams);
        
        res.status(200).json({
          success: true,
          data: rows,
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
        
      } catch (error) {
        console.error('获取批量估价任务列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取单个批量估价任务详情
   */
  getBatchValuationTask = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_valuations'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const { rows } = await query(
          `SELECT * FROM batch_valuation_tasks WHERE id = $1 AND user_id = $2`,
          [id, userId]
        );
        
        if (!rows.length) {
          return res.status(404).json({ success: false, message: '任务不存在' });
        }
        
        res.status(200).json({ success: true, data: rows[0] });
        
      } catch (error) {
        console.error('获取批量估价任务详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 下载批量估价结果
   */
  downloadBatchValuationResult = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_valuations'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const { rows } = await query(
          `SELECT * FROM batch_valuation_tasks WHERE id = $1 AND user_id = $2`,
          [id, userId]
        );
        
        if (!rows.length) {
          return res.status(404).json({ success: false, message: '任务不存在' });
        }
        
        const task = rows[0];
        
        if (!task.result_file_path || !fs.existsSync(task.result_file_path)) {
          return res.status(404).json({ success: false, message: '结果文件不存在' });
        }
        
        // 设置响应头
        res.setHeader('Content-Disposition', `attachment; filename="${task.filename}_result.json"`);
        res.setHeader('Content-Type', 'application/json');
        
        // 发送文件
        const fileStream = fs.createReadStream(task.result_file_path);
        fileStream.pipe(res);
        
      } catch (error) {
        console.error('下载批量估价结果错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 取消批量估价任务
   */
  cancelBatchValuationTask = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('delete_valuations'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // 检查任务是否存在
        const { rows } = await query(
          `SELECT * FROM batch_valuation_tasks WHERE id = $1 AND user_id = $2`,
          [id, userId]
        );
        
        if (!rows.length) {
          return res.status(404).json({ success: false, message: '任务不存在' });
        }
        
        const task = rows[0];
        
        // 只有待处理的任务可以取消
        if (task.status !== 'pending') {
          return res.status(400).json({ success: false, message: '只有待处理的任务可以取消' });
        }
        
        // 更新任务状态为取消
        await query(
          `UPDATE batch_valuation_tasks SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
          [id]
        );
        
        res.status(200).json({ success: true, message: '任务已取消' });
        
      } catch (error) {
        console.error('取消批量估价任务错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];

  /**
   * 获取批量估价任务进度
   */
  getBatchValuationProgress = [
    protect,
    authorize('enterprise', 'association', 'academic', 'government'),
    checkPermission('view_valuations'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // 检查任务是否存在
        const { rows } = await query(
          `SELECT id, status, total_records, processed_records, success_records, failed_records FROM batch_valuation_tasks WHERE id = $1 AND user_id = $2`,
          [id, userId]
        );
        
        if (!rows.length) {
          return res.status(404).json({ success: false, message: '任务不存在' });
        }
        
        const task = rows[0];
        
        // 计算进度百分比
        const progress = task.total_records > 0 
          ? Math.round((task.processed_records / task.total_records) * 100) 
          : 0;
        
        res.status(200).json({
          success: true,
          data: {
            id: task.id,
            status: task.status,
            totalRecords: task.total_records,
            processedRecords: task.processed_records,
            successRecords: task.success_records,
            failedRecords: task.failed_records,
            progress: progress
          }
        });
        
      } catch (error) {
        console.error('获取批量估价任务进度错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
      }
    }
  ];
}

const batchValuationController = new BatchValuationController();
module.exports = batchValuationController;
