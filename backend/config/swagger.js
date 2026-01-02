const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger配置选项
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ValuHub API',
      description: '房产价值生态引擎 - 后端API文档',
      version: '2.0.0',
      contact: {
        name: 'ValuHub团队',
        email: 'contact@valu-hub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '开发环境'
      },
      {
        url: 'https://api.valu-hub.com/api',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Property: {
          type: 'object',
          required: ['address', 'area', 'property_type'],
          properties: {
            id: {
              type: 'string',
              description: '房产ID'
            },
            address: {
              type: 'string',
              description: '房产地址'
            },
            city: {
              type: 'string',
              description: '城市'
            },
            district: {
              type: 'string',
              description: '区县'
            },
            area: {
              type: 'number',
              description: '建筑面积（平方米）'
            },
            rooms: {
              type: 'integer',
              description: '房间数量'
            },
            bathrooms: {
              type: 'integer',
              description: '卫生间数量'
            },
            floor_level: {
              type: 'integer',
              description: '所在楼层'
            },
            total_floors: {
              type: 'integer',
              description: '总楼层'
            },
            building_year: {
              type: 'integer',
              description: '建筑年份'
            },
            property_type: {
              type: 'string',
              description: '房产类型：apartment/villa/townhouse/commercial'
            },
            orientation: {
              type: 'string',
              description: '朝向：north/east/south/west/northeast/northwest/southeast/southwest'
            },
            decoration_status: {
              type: 'string',
              description: '装修状况：rough/simple/fine/luxury'
            },
            latitude: {
              type: 'number',
              description: '纬度'
            },
            longitude: {
              type: 'number',
              description: '经度'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        Valuation: {
          type: 'object',
          required: ['property_id'],
          properties: {
            id: {
              type: 'string',
              description: '估价ID'
            },
            property_id: {
              type: 'string',
              description: '房产ID'
            },
            estimated_price: {
              type: 'number',
              description: '估价总价（元）'
            },
            price_per_sqm: {
              type: 'number',
              description: '每平方米价格（元）'
            },
            confidence_level: {
              type: 'number',
              description: '置信度'
            },
            model_version: {
              type: 'string',
              description: '模型版本'
            },
            model_type: {
              type: 'string',
              description: '使用的模型类型'
            },
            features: {
              type: 'object',
              description: '使用的特征'
            },
            result_details: {
              type: 'object',
              description: '结果详情'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            }
          }
        },
        Enterprise: {
          type: 'object',
          required: ['name', 'legalName', 'registrationNumber'],
          properties: {
            id: {
              type: 'string',
              description: '企业ID'
            },
            name: {
              type: 'string',
              description: '企业名称'
            },
            legalName: {
              type: 'string',
              description: '法人名称'
            },
            registrationNumber: {
              type: 'string',
              description: '营业执照号码'
            },
            industry: {
              type: 'string',
              description: '所属行业'
            },
            address: {
              type: 'string',
              description: '企业地址'
            },
            contactPhone: {
              type: 'string',
              description: '联系电话'
            },
            contactEmail: {
              type: 'string',
              description: '联系邮箱'
            },
            status: {
              type: 'string',
              description: '企业状态：pending/active/suspended/terminated'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        Team: {
          type: 'object',
          required: ['name', 'enterpriseId'],
          properties: {
            id: {
              type: 'string',
              description: '团队ID'
            },
            name: {
              type: 'string',
              description: '团队名称'
            },
            description: {
              type: 'string',
              description: '团队描述'
            },
            enterpriseId: {
              type: 'string',
              description: '关联企业ID'
            },
            status: {
              type: 'string',
              description: '团队状态：active/archived'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        ApiKey: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'API Key ID'
            },
            name: {
              type: 'string',
              description: 'API Key名称'
            },
            key: {
              type: 'string',
              description: 'API Key值'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'API Key权限'
            },
            status: {
              type: 'string',
              description: 'API Key状态：active/revoked/expired'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: '过期时间'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        }
      }
    }
  },
  // 指定需要包含的API路由文件
  apis: [
    '../routes/*.js',
    '../controllers/*.js'
  ]
};

// 初始化Swagger JSDoc
const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
