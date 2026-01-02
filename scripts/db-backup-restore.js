#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

/**
 * 数据库备份和恢复工具
 * 支持MySQL数据库的备份和恢复操作
 */
class DatabaseBackupRestore {
  constructor() {
    // 从环境变量获取数据库配置
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'realestate_dev',
      // 备份目录
      backupDir: path.resolve(
        process.cwd(),
        process.env.DB_BACKUP_DIR || 'db-backups'
      ),
      // 备份保留天数
      retainDays: process.env.DB_BACKUP_RETAIN_DAYS
        ? parseInt(process.env.DB_BACKUP_RETAIN_DAYS)
        : 7,
    };

    // 确保备份目录存在
    if (!fs.existsSync(this.dbConfig.backupDir)) {
      fs.mkdirSync(this.dbConfig.backupDir, { recursive: true });
      console.log(`Created backup directory: ${this.dbConfig.backupDir}`);
    }
  }

  /**
   * 生成备份文件名
   * @param {string} prefix - 文件名前缀
   * @returns {string} - 备份文件名
   */
  generateBackupFilename(prefix = 'backup') {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const dateStr = now.toISOString().split('T')[0];
    return `${prefix}-${this.dbConfig.database}-${dateStr}-${timestamp.substring(11, 19)}.sql.gz`;
  }

  /**
   * 执行备份
   * @param {string} [description=''] - 备份描述
   * @returns {string} - 备份文件路径
   */
  backup(description = '') {
    console.log('开始数据库备份...');

    const backupFile = path.join(
      this.dbConfig.backupDir,
      this.generateBackupFilename()
    );

    try {
      // 构建备份命令
      const backupCommand = `mysqldump --host=${this.dbConfig.host} --port=${this.dbConfig.port} --user=${this.dbConfig.user} --password=${this.dbConfig.password} --single-transaction --quick --lock-tables=false --routines --triggers --events ${this.dbConfig.database} | gzip > ${backupFile}`;

      console.log(`正在备份数据库 ${this.dbConfig.database} 到 ${backupFile}`);
      execSync(backupCommand);

      // 记录备份信息
      const backupInfo = {
        filename: path.basename(backupFile),
        path: backupFile,
        size: fs.statSync(backupFile).size,
        description,
        timestamp: new Date().toISOString(),
      };

      // 保存备份记录
      this.saveBackupRecord(backupInfo);

      // 清理过期备份
      this.cleanupOldBackups();

      console.log(`备份成功！备份文件: ${backupFile}`);
      console.log(
        `备份文件大小: ${(backupInfo.size / 1024 / 1024).toFixed(2)} MB`
      );

      return backupFile;
    } catch (error) {
      console.error('备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 恢复数据库
   * @param {string} backupFilePath - 备份文件路径
   * @param {boolean} [dropDatabase=false] - 是否先删除数据库
   * @returns {boolean} - 是否恢复成功
   */
  restore(backupFilePath, dropDatabase = false) {
    console.log(`开始恢复数据库 ${this.dbConfig.database}...`);
    console.log(`使用备份文件: ${backupFilePath}`);

    try {
      // 检查备份文件是否存在
      if (!fs.existsSync(backupFilePath)) {
        throw new Error(`备份文件不存在: ${backupFilePath}`);
      }

      // 先备份当前数据库作为保险
      const safetyBackupFile = this.backup('恢复前的安全备份');
      console.log(`已创建恢复前的安全备份: ${safetyBackupFile}`);

      // 如果需要删除数据库
      if (dropDatabase) {
        const dropCommand = `mysql --host=${this.dbConfig.host} --port=${this.dbConfig.port} --user=${this.dbConfig.user} --password=${this.dbConfig.password} -e "DROP DATABASE IF EXISTS ${this.dbConfig.database}; CREATE DATABASE ${this.dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`;
        console.log(`正在删除并重建数据库 ${this.dbConfig.database}`);
        execSync(dropCommand);
      }

      // 恢复数据库
      const restoreCommand = `gunzip -c ${backupFilePath} | mysql --host=${this.dbConfig.host} --port=${this.dbConfig.port} --user=${this.dbConfig.user} --password=${this.dbConfig.password} ${this.dbConfig.database}`;
      console.log(`正在导入数据到 ${this.dbConfig.database}`);
      execSync(restoreCommand);

      console.log('数据库恢复成功！');
      return true;
    } catch (error) {
      console.error('恢复失败:', error.message);
      throw error;
    }
  }

  /**
   * 保存备份记录
   * @param {Object} backupInfo - 备份信息
   */
  saveBackupRecord(backupInfo) {
    const recordsFile = path.join(
      this.dbConfig.backupDir,
      'backup-records.json'
    );

    let records = [];
    if (fs.existsSync(recordsFile)) {
      const data = fs.readFileSync(recordsFile, 'utf8');
      records = JSON.parse(data);
    }

    records.push(backupInfo);
    fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
  }

  /**
   * 清理过期备份
   */
  cleanupOldBackups() {
    const now = new Date();
    const cutoffTime =
      now.getTime() - this.dbConfig.retainDays * 24 * 60 * 60 * 1000;

    try {
      const files = fs.readdirSync(this.dbConfig.backupDir);
      let deletedCount = 0;

      files.forEach((file) => {
        if (file.endsWith('.sql.gz')) {
          const filePath = path.join(this.dbConfig.backupDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`已删除过期备份: ${file}`);
          }
        }
      });

      if (deletedCount > 0) {
        console.log(`共删除 ${deletedCount} 个过期备份文件`);
      }
    } catch (error) {
      console.error('清理过期备份失败:', error.message);
    }
  }

  /**
   * 列出所有备份
   * @returns {Array} - 备份列表
   */
  listBackups() {
    const recordsFile = path.join(
      this.dbConfig.backupDir,
      'backup-records.json'
    );

    if (fs.existsSync(recordsFile)) {
      const data = fs.readFileSync(recordsFile, 'utf8');
      return JSON.parse(data);
    }

    return [];
  }

  /**
   * 获取最近的备份
   * @returns {Object|null} - 最近的备份信息
   */
  getLatestBackup() {
    const backups = this.listBackups();
    if (backups.length === 0) {
      return null;
    }

    return backups.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )[0];
  }
}

/**
 * 命令行接口
 */
function main() {
  const dbTool = new DatabaseBackupRestore();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'backup':
      const description = args[1] || '手动备份';
      dbTool.backup(description);
      break;

    case 'restore':
      const backupFile = args[1];
      const dropDatabase = args[2] === '--drop';

      if (!backupFile) {
        console.error('请指定备份文件路径');
        process.exit(1);
      }

      dbTool.restore(backupFile, dropDatabase);
      break;

    case 'list':
      const backups = dbTool.listBackups();
      if (backups.length === 0) {
        console.log('暂无备份记录');
      } else {
        console.log('备份记录:');
        backups.forEach((backup, index) => {
          console.log(`${index + 1}. ${backup.filename}`);
          console.log(`   时间: ${backup.timestamp}`);
          console.log(`   大小: ${(backup.size / 1024 / 1024).toFixed(2)} MB`);
          console.log(`   描述: ${backup.description || '无'}`);
          console.log('---');
        });
      }
      break;

    case 'latest':
      const latest = dbTool.getLatestBackup();
      if (latest) {
        console.log('最近备份:');
        console.log(`文件名: ${latest.filename}`);
        console.log(`时间: ${latest.timestamp}`);
        console.log(`大小: ${(latest.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`描述: ${latest.description || '无'}`);
        console.log(`路径: ${latest.path}`);
      } else {
        console.log('暂无备份记录');
      }
      break;

    default:
      console.log('数据库备份恢复工具使用说明:');
      console.log('');
      console.log('备份数据库:');
      console.log('  node scripts/db-backup-restore.js backup [描述]');
      console.log('');
      console.log('恢复数据库:');
      console.log(
        '  node scripts/db-backup-restore.js restore <备份文件路径> [--drop]'
      );
      console.log('  --drop 参数会先删除并重建数据库');
      console.log('');
      console.log('列出所有备份:');
      console.log('  node scripts/db-backup-restore.js list');
      console.log('');
      console.log('查看最近备份:');
      console.log('  node scripts/db-backup-restore.js latest');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseBackupRestore;
