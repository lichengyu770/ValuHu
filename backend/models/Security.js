const mongoose = require('mongoose');

// 加密配置模型
const EncryptionConfigSchema = new mongoose.Schema({
  // 配置基本信息
  name: {
    type: String,
    required: [true, '请输入配置名称']
  },
  description: {
    type: String
  },
  // 加密算法
  algorithm: {
    type: String,
    required: [true, '请选择加密算法'],
    enum: ['AES-256-GCM', 'RSA-2048', 'RSA-4096', 'ECC-256', 'ECC-521']
  },
  // 密钥类型
  keyType: {
    type: String,
    required: [true, '请选择密钥类型'],
    enum: ['symmetric', 'asymmetric']
  },
  // 密钥轮换策略
  keyRotation: {
    enabled: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number, // 单位：天
      default: 90
    },
    lastRotatedAt: {
      type: Date
    },
    nextRotationAt: {
      type: Date
    }
  },
  // 加密范围
  encryptionScope: {
    dataAtRest: {
      type: Boolean,
      default: true
    },
    dataInTransit: {
      type: Boolean,
      default: true
    },
    sensitiveData: {
      type: Boolean,
      default: true
    }
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  // 状态
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive']
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 访问审计模型
const AccessLogSchema = new mongoose.Schema({
  // 访问基本信息
  action: {
    type: String,
    required: [true, '请输入操作类型'],
    enum: ['read', 'write', 'update', 'delete', 'login', 'logout', 'access', 'execute']
  },
  resource: {
    type: String,
    required: [true, '请输入访问资源']
  },
  // 访问者信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String
  },
  ipAddress: {
    type: String,
    required: [true, '请输入IP地址']
  },
  userAgent: {
    type: String
  },
  // 访问结果
  result: {
    type: String,
    required: [true, '请输入访问结果'],
    enum: ['success', 'failed', 'denied']
  },
  errorMessage: {
    type: String
  },
  // 访问时间
  timestamp: {
    type: Date,
    default: Date.now
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  // 附加信息
  metadata: {
    type: Object
  }
});

// 日志记录模型
const AuditLogSchema = new mongoose.Schema({
  // 日志基本信息
  level: {
    type: String,
    required: [true, '请选择日志级别'],
    enum: ['debug', 'info', 'warn', 'error', 'fatal']
  },
  message: {
    type: String,
    required: [true, '请输入日志消息']
  },
  // 日志来源
  source: {
    type: String,
    required: [true, '请输入日志来源']
  },
  module: {
    type: String
  },
  // 关联信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise'
  },
  // 上下文信息
  context: {
    type: Object
  },
  // 时间信息
  timestamp: {
    type: Date,
    default: Date.now
  },
  // 跟踪信息
  traceId: {
    type: String
  },
  spanId: {
    type: String
  }
});

// 合规检查模型
const ComplianceCheckSchema = new mongoose.Schema({
  // 检查基本信息
  name: {
    type: String,
    required: [true, '请输入检查名称']
  },
  description: {
    type: String
  },
  // 合规标准
  standard: {
    type: String,
    required: [true, '请选择合规标准'],
    enum: ['GDPR', 'CCPA', 'PIPL', 'ISO27001', 'SOC2', 'NIST', '网络安全法']
  },
  // 检查结果
  result: {
    type: String,
    required: [true, '请输入检查结果'],
    enum: ['passed', 'failed', 'warning', 'skipped']
  },
  // 检查时间
  checkDate: {
    type: Date,
    default: Date.now
  },
  // 下次检查时间
  nextCheckDate: {
    type: Date
  },
  // 检查项目
  checks: [{
    name: {
      type: String,
      required: [true, '请输入检查项目名称']
    },
    description: {
      type: String
    },
    status: {
      type: String,
      required: [true, '请输入检查状态'],
      enum: ['passed', 'failed', 'warning', 'skipped']
    },
    remediation: {
      type: String
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 安全扫描模型
const SecurityScanSchema = new mongoose.Schema({
  // 扫描基本信息
  name: {
    type: String,
    required: [true, '请输入扫描名称']
  },
  description: {
    type: String
  },
  // 扫描类型
  scanType: {
    type: String,
    required: [true, '请选择扫描类型'],
    enum: ['vulnerability', 'penetration', 'code', 'configuration', 'dependency']
  },
  // 扫描结果
  result: {
    type: String,
    required: [true, '请输入扫描结果'],
    enum: ['clean', 'vulnerable', 'inconclusive']
  },
  // 扫描时间
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // 单位：秒
  },
  // 扫描统计
  statistics: {
    totalChecks: {
      type: Number
    },
    passed: {
      type: Number
    },
    failed: {
      type: Number
    },
    vulnerabilities: {
      low: {
        type: Number,
        default: 0
      },
      medium: {
        type: Number,
        default: 0
      },
      high: {
        type: Number,
        default: 0
      },
      critical: {
        type: Number,
        default: 0
      }
    }
  },
  // 发现的漏洞
  vulnerabilities: [{
    id: {
      type: String,
      required: [true, '请输入漏洞ID']
    },
    name: {
      type: String,
      required: [true, '请输入漏洞名称']
    },
    description: {
      type: String
    },
    severity: {
      type: String,
      required: [true, '请选择漏洞严重程度'],
      enum: ['low', 'medium', 'high', 'critical']
    },
    cvssScore: {
      type: Number
    },
    cveId: {
      type: String
    },
    location: {
      type: String
    },
    remediation: {
      type: String
    },
    status: {
      type: String,
      default: 'open',
      enum: ['open', 'in_progress', 'fixed', 'dismissed']
    }
  }],
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 隐私保护模型
const PrivacyConfigSchema = new mongoose.Schema({
  // 配置基本信息
  name: {
    type: String,
    required: [true, '请输入配置名称']
  },
  description: {
    type: String
  },
  // 数据保留策略
  dataRetention: {
    enabled: {
      type: Boolean,
      default: true
    },
    periods: {
      userData: {
        type: Number, // 单位：天
        default: 365
      },
      logData: {
        type: Number, // 单位：天
        default: 90
      },
      accessLogs: {
        type: Number, // 单位：天
        default: 180
      }
    },
    lastCleanupAt: {
      type: Date
    }
  },
  // 数据脱敏策略
  dataMasking: {
    enabled: {
      type: Boolean,
      default: true
    },
    fields: [{
      name: {
        type: String,
        required: [true, '请输入字段名称']
      },
      type: {
        type: String,
        required: [true, '请选择脱敏类型'],
        enum: ['email', 'phone', 'address', 'id_card', 'credit_card', 'password', 'custom']
      },
      maskingRule: {
        type: String
      }
    }]
  },
  // 数据主体权利
  dataSubjectRights: {
    access: {
      type: Boolean,
      default: true
    },
    rectification: {
      type: Boolean,
      default: true
    },
    erasure: {
      type: Boolean,
      default: true
    },
    portability: {
      type: Boolean,
      default: true
    },
    restriction: {
      type: Boolean,
      default: true
    },
    objection: {
      type: Boolean,
      default: true
    }
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  // 状态
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive']
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 导出模型
const EncryptionConfig = mongoose.model('EncryptionConfig', EncryptionConfigSchema);
const AccessLog = mongoose.model('AccessLog', AccessLogSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
const ComplianceCheck = mongoose.model('ComplianceCheck', ComplianceCheckSchema);
const SecurityScan = mongoose.model('SecurityScan', SecurityScanSchema);
const PrivacyConfig = mongoose.model('PrivacyConfig', PrivacyConfigSchema);

module.exports = { 
  EncryptionConfig, 
  AccessLog, 
  AuditLog, 
  ComplianceCheck, 
  SecurityScan, 
  PrivacyConfig 
};
