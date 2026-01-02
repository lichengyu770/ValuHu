import { describe, it, expect, vi, beforeEach } from 'vitest';
import wpsService from './WpsService';
import axios from 'axios';

// 模拟axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('WpsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDocument', () => {
    it('should generate a document successfully', async () => {
      // 模拟成功响应
      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            documentId: 'doc-123',
            title: 'Generated Document',
            size: 1024,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            status: 'completed',
            downloadUrl: 'https://example.com/download/doc-123',
            previewUrl: 'https://example.com/preview/doc-123'
          },
          success: true
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // 准备测试数据
      const params = {
        templateId: 'template-123',
        data: {
          property: {
            city: '北京',
            district: '朝阳区',
            community: '测试小区'
          },
          valuationResults: [
            {
              id: 'result-1',
              algorithm: 'basic',
              price: 1200000,
              unitPrice: 10000,
              confidence: 90,
              timestamp: new Date(),
              details: {
                factors: { buildingType: 1.0, floor: 1.0 },
                trendAnalysis: { yearOnYearGrowth: 5, monthlyTrend: [] },
                comparableProperties: []
              },
              propertyInfo: {
                city: '北京',
                district: '朝阳区',
                community: '测试小区',
                buildingType: 'apartment',
                area: 120,
                floor: 5,
                totalFloors: 10,
                orientation: 'south',
                decoration: 'medium',
                age: 8,
                lotRatio: 2.5,
                greenRatio: 30,
                nearbyFacilities: ['school'],
                constructionYear: 2015
              },
              propertyId: 'beijing-chaoyang-120'
            }
          ],
          metadata: {
            title: '估价报告',
            author: '系统',
            createdAt: new Date().toISOString(),
            includeCharts: true
          }
        },
        outputFormat: 'docx',
        title: '估价报告'
      };

      // 调用generateDocument方法
      const result = await wpsService.generateDocument(params);

      // 验证结果
      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/v1/documents/generate',
        {
          template_id: params.templateId,
          data: params.data,
          output_format: params.outputFormat,
          title: params.title
        },
        expect.any(Object)
      );
    });

    it('should handle API error when generating document', async () => {
      // 模拟失败响应
      const mockError = {
        response: {
          data: {
            code: 500,
            message: 'Internal Server Error',
            success: false
          }
        }
      };

      mockedAxios.post.mockRejectedValue(mockError);

      // 准备测试数据
      const params = {
        templateId: 'template-123',
        data: {
          property: {
            city: '北京',
            district: '朝阳区'
          },
          valuationResults: []
        },
        outputFormat: 'docx'
      };

      // 验证是否抛出错误
      await expect(wpsService.generateDocument(params)).rejects.toThrow('Internal Server Error');
    });
  });

  describe('convertDocument', () => {
    it('should convert a document successfully', async () => {
      // 模拟成功响应
      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            documentId: 'doc-123',
            title: 'Converted Document',
            size: 2048,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            status: 'completed',
            downloadUrl: 'https://example.com/download/converted-doc-123',
            previewUrl: 'https://example.com/preview/converted-doc-123'
          },
          success: true
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // 调用convertDocument方法
      const result = await wpsService.convertDocument({
        documentId: 'doc-123',
        targetFormat: 'pdf'
      });

      // 验证结果
      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/v1/documents/convert',
        {
          document_id: 'doc-123',
          target_format: 'pdf'
        },
        expect.any(Object)
      );
    });
  });

  describe('getDocumentInfo', () => {
    it('should get document info successfully', async () => {
      // 模拟成功响应
      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            documentId: 'doc-123',
            title: 'Test Document',
            size: 1024,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            status: 'completed',
            downloadUrl: 'https://example.com/download/doc-123',
            previewUrl: 'https://example.com/preview/doc-123'
          },
          success: true
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // 调用getDocumentInfo方法
      const result = await wpsService.getDocumentInfo('doc-123');

      // 验证结果
      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/v1/documents/doc-123',
        expect.any(Object)
      );
    });
  });

  describe('getDocumentList', () => {
    it('should get document list successfully', async () => {
      // 模拟成功响应
      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            documents: [
              {
                documentId: 'doc-123',
                title: 'Document 1',
                size: 1024,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
                status: 'completed',
                downloadUrl: 'https://example.com/download/doc-123',
                previewUrl: 'https://example.com/preview/doc-123'
              },
              {
                documentId: 'doc-456',
                title: 'Document 2',
                size: 2048,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
                status: 'completed',
                downloadUrl: 'https://example.com/download/doc-456',
                previewUrl: 'https://example.com/preview/doc-456'
              }
            ],
            total: 2
          },
          success: true
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // 调用getDocumentList方法
      const result = await wpsService.getDocumentList(1, 10);

      // 验证结果
      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/v1/documents',
        {
          params: { page: 1, page_size: 10 }
        }
      );
    });
  });

  describe('getTemplates', () => {
    it('should get templates successfully', async () => {
      // 模拟成功响应
      const mockResponse = {
        data: {
          code: 200,
          message: 'success',
          data: {
            templates: [
              {
                template_id: 'template-123',
                name: '估价报告模板',
                create_time: new Date().toISOString()
              },
              {
                template_id: 'template-456',
                name: '详细估价报告模板',
                create_time: new Date().toISOString()
              }
            ],
            total: 2
          },
          success: true
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // 调用getTemplates方法
      const result = await wpsService.getTemplates(1, 10);

      // 验证结果
      expect(result).toEqual({
        templates: [
          {
            templateId: 'template-123',
            name: '估价报告模板',
            createTime: expect.any(String)
          },
          {
            templateId: 'template-456',
            name: '详细估价报告模板',
            createTime: expect.any(String)
          }
        ],
        total: 2
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/v1/templates',
        {
          params: { page: 1, page_size: 10 }
        }
      );
    });
  });
});
