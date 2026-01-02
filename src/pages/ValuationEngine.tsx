import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Select, Button, Space, Divider, Statistic, Table, Tabs, Row, Col, Progress, Tag, message, Modal, Input, Spin } from 'antd';
const { TextArea } = Input;
import { CalculatorOutlined, BarChartOutlined, LineChartOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as ReLineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import ValuationService from '../services/valuation/ValuationService';
import KnowledgeMemoryService from '../services/utils/KnowledgeMemoryService';
import TrialService from '../services/auth/TrialService';
import FormSubmissionService from '../services/utils/FormSubmissionService';
import ReportGenerationService from '../services/report/ReportGenerationService';
import wpsService from '../services/wps/WpsService';
import {
  defaultValuationParams
} from '../models/valuationModels';

import { ValuationResult, Template, SmartSuggestion, ValuationParams } from '../types/valuation';

// 导入子组件
import StepNavigation from './ValuationEngine/StepNavigation';
import SmartSuggestions from './ValuationEngine/SmartSuggestions';
import ValuationForm from './ValuationEngine/ValuationForm';

/**
 * 估价引擎组件
 * 提供房产估价参数输入和结果展示功能
 */
const ValuationEngine = () => {
  const [form] = Form.useForm();
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('result');
  
  // 报告生成服务实例
  const reportService = new ReportGenerationService();
  
  // WPS报告生成状态
  const [wpsLoading, setWpsLoading] = useState(false);
  const [wpsTemplates, setWpsTemplates] = useState<Array<{ templateId: string; name: string; createTime: string }>>([]);
  const [selectedWpsTemplate, setSelectedWpsTemplate] = useState<string | null>(null);
  
  // 多步骤流程状态
  const [currentStep, setCurrentStep] = useState(1);
  const STEP_1 = 1; // 参数输入
  const STEP_2 = 2; // 结果预览
  const STEP_3 = 3; // 报告生成
  
  // 自动保存定时器
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 历史记录状态
  const [valuationHistory, setValuationHistory] = useState<ValuationResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ValuationResult | null>(null);
  const [historyTabVisible, setHistoryTabVisible] = useState(false);
  
  // 模板管理状态
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [saveTemplateModalVisible, setSaveTemplateModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState<string>('');

  const [templateLoading, setTemplateLoading] = useState(false);
  
  // 分享功能状态
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  // 知识记忆状态
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<Template[]>([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  
  // 表单提交服务状态
  const [sampleModalVisible, setSampleModalVisible] = useState(false);
  const [currentSample, setCurrentSample] = useState<string>('');
  
  // 步骤配置
  const steps = [
    {
      title: '参数输入',
      description: '请输入房产的基本信息和估价参数'
    },
    {
      title: '结果预览',
      description: '查看估价结果和详细分析'
    },
    {
      title: '报告生成',
      description: '生成和分享估价报告'
    }
  ];
  
  // 步骤导航函数

  
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * 提交估价请求 - 多步骤流程
   */
  const handleValuationSubmit = async (values: ValuationParams) => {
    try {
      if (currentStep === STEP_1) {
        // 第一步：验证参数并进入第二步
        const validationResult = ValuationService.validateParams(values);
        if (!validationResult.isValid) {
          message.error(validationResult.errors.join(', '));
          return;
        }
        
        // 显示成功提示
        message.success('参数验证通过，正在进入结果预览...');
        // 延迟进入下一步，让用户看到提示
        setTimeout(() => {
          goToNextStep();
        }, 500);
      } else if (currentStep === STEP_2) {
        // 第二步：执行估价计算
        
        // 检查试用次数
        if (!TrialService.hasRemainingTrial()) {
          message.error('您的免费试用次数已用尽，请登录后购买付费功能');
          // 引导用户到付费功能页面
          window.location.href = '/product-services.html';
          return;
        }
        
        setLoading(true);
        message.loading('正在计算估价结果，请稍候...', 0);
        
        // 执行估价
        const result = await ValuationService.performValuation(values);
        setValuationResult(result);
        setActiveTab('result');
        
        // 扣减试用次数
        TrialService.deductTrialCount();
        const remainingCount = TrialService.getRemainingTrialCount();
        message.success(`估价完成！试用次数已扣除，剩余次数：${remainingCount}`, 2);
        
        // 保存估价历史到知识记忆服务
        try {
          await KnowledgeMemoryService.saveValuationHistory({
            valuationParams: values,
            valuationResult: result
          });
          // 重新获取智能建议和推荐模板
          fetchSmartSuggestions(values);
        } catch (error) {
          message.error('保存估价历史失败: ' + (error instanceof Error ? error.message : String(error)));
        }
        
        // 估价完成，进入第三步
        goToNextStep();
      } else if (currentStep === STEP_3) {
        // 第三步：完成流程
        // 调用表单提交服务
        const formSubmissionResult = await submitToFormService(values);
        if (formSubmissionResult.success) {
          message.success('估价流程已完成，表单数据已提交');
        } else {
          message.error('估价流程已完成，但表单提交失败');
        }
      }
    } catch (error) {
      console.error('估价失败:', error);
      message.error(`估价失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  


  /**
   * 重置表单
   */
  const handleReset = useCallback(() => {
    form.resetFields();
    setValuationResult(null);
  }, [form]);



  /**
   * 表单自动保存
   */
  const autoSaveForm = useCallback(() => {
    const values = form.getFieldsValue();
    try {
      localStorage.setItem('valuationFormValues', JSON.stringify(values));
      message.success('表单已自动保存');
    } catch (error) {
      message.error('表单自动保存失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [form]);

  /**
   * 加载自动保存的表单数据
   */
  const loadAutoSavedForm = useCallback(() => {
    const savedValues = localStorage.getItem('valuationFormValues');
    if (savedValues) {
      try {
        const parsedValues = JSON.parse(savedValues);
        form.setFieldsValue(parsedValues);
        message.success('已加载自动保存的表单数据');
      } catch (error) {
      message.error('加载自动保存的表单数据失败: ' + (error instanceof Error ? error.message : String(error)));
    }
    }
  }, [form]);

  /**
   * 手动保存表单
   */
  const handleManualSave = useCallback(() => {
    autoSaveForm();
  }, [autoSaveForm]);

  /**
   * 获取智能建议
   */
  const fetchSmartSuggestions = useCallback(async (values: ValuationParams) => {
    try {
      const suggestionsResult = await KnowledgeMemoryService.getSmartSuggestions(values);
      setSmartSuggestions(suggestionsResult.suggestions);
      setRecommendedTemplates(suggestionsResult.recommendedTemplates);
    } catch (error) {
      console.error('获取智能建议失败:', error);
    }
  }, []);

  /**
   * 刷新市场数据
   */
  const refreshMarketData = useCallback(async () => {
    try {
      setLoading(true);
      await ValuationService.marketDataCache.forceUpdate();
      message.success('市场数据已刷新');
      
      // 重新计算当前估值
      if (valuationResult) {
        const values = form.getFieldsValue();
        const result = await ValuationService.performValuation(values);
        setValuationResult(result);
      }
    } catch (error) {
      console.error('刷新市场数据失败:', error);
      message.error('刷新市场数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [form, valuationResult]);

  /**
   * 通用报告生成函数
   */
  const generateReport = useCallback(async (
    reportType: 'html' | 'pdf' | 'excel' | 'wps',
    result: ValuationResult
  ) => {
    try {
      let reportData: Blob | string;
      let fileName: string;
      let mimeType: string;
      let loadingMessage: string;
      let successMessage: string;

      switch (reportType) {
        case 'html':
          loadingMessage = '正在生成HTML报告...';
          reportData = ValuationService.generateHtmlReport(result);
          fileName = `valuation-report-${result.propertyId}.html`;
          mimeType = 'text/html';
          successMessage = 'HTML报告生成成功';
          break;
        case 'pdf':
          loadingMessage = '正在生成PDF报告...';
          reportData = await ValuationService.generatePdfReport(result);
          fileName = `valuation-report-${result.id}.pdf`;
          mimeType = 'application/pdf';
          successMessage = 'PDF报告生成成功';
          break;
        case 'excel':
          loadingMessage = '正在生成Excel报告...';
          reportData = await ValuationService.generateExcelReport(result);
          fileName = `valuation-report-${result.id}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          successMessage = 'Excel报告生成成功';
          break;
        case 'wps': {
          loadingMessage = '正在生成WPS报告...';
          // 使用ReportGenerationService生成WPS报告
          const reportParams = {
            templateId: 'template-detailed-001', // 默认使用详细报告模板
            property: {
              city: result.propertyInfo.city,
              district: result.propertyInfo.district,
              community: result.propertyInfo.community,
              buildingType: result.propertyInfo.buildingType,
              area: result.propertyInfo.area,
              floor: result.propertyInfo.floor,
              totalFloors: result.propertyInfo.totalFloors,
              orientation: result.propertyInfo.orientation,
              decoration: result.propertyInfo.decoration,
              age: result.propertyInfo.age,
              lotRatio: result.propertyInfo.lotRatio,
              greenRatio: result.propertyInfo.greenRatio,
              nearbyFacilities: result.propertyInfo.nearbyFacilities,
              constructionYear: result.propertyInfo.constructionYear
            },
            valuationResults: [result],
            includeCharts: true,
            useWps: true,
            wpsTemplateId: selectedWpsTemplate || 'default-valuation-template'
          };
          
          // 生成WPS报告
          const wpsReport = await reportService.generateReport(reportParams, 'word');
          
          // 解析WPS报告结果
          let wpsResult;
          try {
            wpsResult = JSON.parse(wpsReport.content);
          } catch (parseError) {
            // 如果解析失败，使用传统方式生成报告
            message.warning('WPS报告生成失败，正在使用传统方式生成报告...');
            reportData = ValuationService.generateHtmlReport(result);
            fileName = `valuation-report-${result.propertyId}.html`;
            mimeType = 'text/html';
            successMessage = 'HTML报告生成成功';
            break;
          }
          
          // 如果WPS报告生成成功，重定向到下载链接
          if (wpsResult.downloadUrl) {
            window.open(wpsResult.downloadUrl, '_blank');
            message.success('WPS报告生成成功，正在下载...');
            return;
          } else {
            // 如果没有下载链接，使用传统方式生成报告
            message.warning('WPS报告下载链接获取失败，正在使用传统方式生成报告...');
            reportData = ValuationService.generateHtmlReport(result);
            fileName = `valuation-report-${result.propertyId}.html`;
            mimeType = 'text/html';
            successMessage = 'HTML报告生成成功';
            break;
          }
        }
        default: {
          throw new Error('不支持的报告类型');
        }
      }

      message.loading(loadingMessage, 0);
      
      // 下载报告
      ValuationService.downloadReport(reportData, fileName, mimeType);
      
      message.success(successMessage);
    } catch (error) {
      message.error(`生成${reportType.toUpperCase()}报告失败: ` + (error instanceof Error ? error.message : String(error)));
    }
  }, [selectedWpsTemplate, reportService]);

  /**
   * 生成HTML报告
   */
  const handleGenerateHtmlReport = useCallback((result: ValuationResult) => {
    generateReport('html', result);
  }, [generateReport]);

  /**
   * 生成PDF报告
   */
  const handleGeneratePdfReport = useCallback((result: ValuationResult) => {
    generateReport('pdf', result);
  }, [generateReport]);

  /**
   * 生成Excel报告
   */
  const handleGenerateExcelReport = useCallback((result: ValuationResult) => {
    generateReport('excel', result);
  }, [generateReport]);

  /**
   * 生成WPS报告
   */
  const handleGenerateWpsReport = useCallback((result: ValuationResult) => {
    generateReport('wps', result);
  }, [generateReport]);

  /**
   * 获取WPS模板列表
   */
  const fetchWpsTemplates = useCallback(async () => {
    try {
      setWpsLoading(true);
      const templates = await wpsService.getTemplates();
      setWpsTemplates(templates.templates);
    } catch (error) {
      console.error('获取WPS模板列表失败:', error);
      message.error('获取WPS模板列表失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setWpsLoading(false);
    }
  }, []);

  // 组件挂载时获取WPS模板列表
  useEffect(() => {
    fetchWpsTemplates();
  }, [fetchWpsTemplates]);

  /**
   * 获取历史估价记录
   */
  const fetchValuationHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const history = await ValuationService.getValuationHistory();
      setValuationHistory(history);
      message.success('历史记录获取成功');
    } catch (error) {
      console.error('获取历史记录失败:', error);
      message.error('获取历史记录失败: ' + error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /**
   * 查看历史记录详情
   */
  const viewHistoryItem = useCallback((item: ValuationResult) => {
    setSelectedHistoryItem(item);
    setHistoryModalVisible(true);
  }, []);

  /**
   * 关闭历史记录详情弹窗
   */
  const handleHistoryModalClose = useCallback(() => {
    setHistoryModalVisible(false);
    setSelectedHistoryItem(null);
  }, []);

  /**
   * 切换历史记录标签页
   */
  const toggleHistoryTab = useCallback(() => {
    setHistoryTabVisible(!historyTabVisible);
    if (!historyTabVisible) {
      fetchValuationHistory();
    }
  }, [historyTabVisible, fetchValuationHistory]);
  
  /**
   * 获取估价模板列表
   */
  const fetchTemplates = useCallback(() => {
    try {
      const templatesList = ValuationService.getValuationTemplates();
      setTemplates(templatesList);
    } catch (error) {
      message.error('获取模板失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, []);
  
  /**
   * 加载模板到表单
   */
  const loadTemplate = useCallback((templateId: string) => {
    try {
      const template = ValuationService.getValuationTemplateById(templateId);
      if (template) {
        form.setFieldsValue(template.params);
        setSelectedTemplate(templateId);
        message.success('模板加载成功');
      }
    } catch (error) {
      message.error('加载模板失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [form]);
  
  /**
   * 保存当前表单为模板
   */
  const saveCurrentFormAsTemplate = useCallback(() => {
    setSaveTemplateModalVisible(true);
  }, []);
  
  /**
   * 确认保存模板
   */
  const confirmSaveTemplate = useCallback(async () => {
    try {
      setTemplateLoading(true);
      const formValues = form.getFieldsValue();
      const template = {
        name: templateName,
        params: formValues
      };
      
      await ValuationService.saveValuationTemplate(template);
      setSaveTemplateModalVisible(false);
      setTemplateName('');
      fetchTemplates();
      message.success('模板保存成功');
    } catch (error) {
      message.error('保存模板失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setTemplateLoading(false);
    }
  }, [form, templateName, fetchTemplates]);
  
  /**
   * 删除模板
   */
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await ValuationService.deleteValuationTemplate(templateId);
      fetchTemplates();
      message.success('模板删除成功');
    } catch (error) {
      message.error('删除模板失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [fetchTemplates]);
  
  // 组件挂载时获取模板列表
  useEffect(() => {
    fetchTemplates();
    loadAutoSavedForm();
    
    // 检查URL中是否包含分享ID
    const shareIdFromUrl = ValuationService.getShareIdFromUrl();
    if (shareIdFromUrl) {
      loadSharedResult(shareIdFromUrl);
    }
    
    // 检查是否有快速评估参数
    try {
      const quickValuationParams = localStorage.getItem('quickValuationParams');
      if (quickValuationParams) {
        const parsedParams = JSON.parse(quickValuationParams);
        // 加载快速评估参数到表单
        form.setFieldsValue(parsedParams);
        // 清除localStorage中的快速评估参数
        localStorage.removeItem('quickValuationParams');
      }
    } catch (error) {
      message.error('加载快速评估参数失败: ' + (error instanceof Error ? error.message : String(error)));
    }
    
    // 清理函数
    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [autoSaveTimer, form, loadAutoSavedForm, fetchTemplates, loadSharedResult]);
  
  // 表单值变化监听，实现自动保存和智能建议
  useEffect(() => {
    const subscription = form.watch((values) => {
      // 延迟获取智能建议，避免频繁请求
      const timer = setTimeout(() => {
        // 获取智能建议
        fetchSmartSuggestions(values);
      }, 500);
      
      // 重置自动保存定时器
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
      
      // 设置新的自动保存定时器（30秒自动保存）
      const newAutoSaveTimer = setInterval(() => {
        autoSaveForm();
      }, 30000);
      setAutoSaveTimer(newAutoSaveTimer);
      
      return () => clearTimeout(timer);
    });
    
    return () => subscription.unsubscribe();
  }, [form, autoSaveTimer, autoSaveForm, fetchSmartSuggestions]);
  
  // 组件挂载时获取智能模板
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // 获取系统模板
        const systemTemplates = ValuationService.getValuationTemplates();
        // 获取智能模板
        const smartTemplates = await KnowledgeMemoryService.getSmartTemplates();
        // 合并模板
        setTemplates([...systemTemplates, ...smartTemplates]);
      } catch (error) {
        message.error('获取模板失败: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    
    fetchTemplates();
  }, []);
  
  /**
   * 加载分享的估价结果
   */
  const loadSharedResult = (shareId: string) => {
    try {
      const sharedResult = ValuationService.getSharedResultById(shareId);
      if (sharedResult) {
        setValuationResult(sharedResult);
        setActiveTab('result');
        message.success('分享结果加载成功');
      } else {
        message.error('分享结果不存在或已过期');
      }
    } catch (error) {
      message.error('加载分享结果失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  /**
   * 分享当前估价结果
   */
  const handleShareResult = async () => {
    try {
      setSharingLoading(true);
      // 保存结果用于分享
      const shareId = await ValuationService.saveResultForSharing(valuationResult);
      setShareId(shareId);
      
      // 生成分享链接
      const shareLink = ValuationService.generateShareLink(shareId);
      setShareUrl(shareLink);
      
      // 生成二维码（简化实现，实际项目中应使用专业的二维码生成库）
      generateQRCode(shareLink);
      
      setShareModalVisible(true);
    } catch (error) {
      message.error('分享结果失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSharingLoading(false);
    }
  };
  
  /**
   * 生成二维码（简化实现）
   */
  const generateQRCode = (url: string) => {
    // 这里使用简化的二维码生成方法
    // 实际项目中应使用qrcode.js或其他专业库
    // 此处仅为示例，生成一个模拟的二维码URL
    setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`);
  };
  
  /**
   * 复制分享链接到剪贴板
   */
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        message.success('分享链接已复制到剪贴板');
      })
      .catch(err => {
        message.error('复制失败，请手动复制链接');
      });
  };
  
  /**
   * 关闭分享模态框
   */
  const handleShareModalCancel = () => {
    setShareModalVisible(false);
    setShareUrl('');
    setShareId(null);
    setQrCodeDataUrl('');
  };
  
  /**
   * 显示样本模态框
   * @param sample - 样本内容
   */
  const showSampleModal = (sample: string) => {
    setCurrentSample(sample);
    setSampleModalVisible(true);
  };
  
  /**
   * 关闭样本模态框
   */
  const handleSampleModalCancel = () => {
    setSampleModalVisible(false);
    setCurrentSample('');
  };
  
  /**
   * 复制样本到剪贴板
   */
  const copySampleToClipboard = () => {
    navigator.clipboard.writeText(currentSample)
      .then(() => {
        message.success('样本已复制到剪贴板');
      })
      .catch(err => {
        message.error('复制失败，请手动复制');
      });
  };
  
  /**
   * 提交表单到表单服务
   */
  const submitToFormService = async (values: ValuationParams) => {
    try {
      const rules = {
        buildingType: [{ required: true, message: '请选择建筑类型' }],
        location: [{ required: true, message: '请选择地理位置' }],
        valuationMethod: [{ required: true, message: '请选择估价方法' }],
        area: [{ required: true, message: '请输入建筑面积' }],
        constructionYear: [{ required: true, message: '请输入建成年份' }],
        decorationLevel: [{ required: true, message: '请选择装修等级' }],
        floor: [{ required: true, message: '请输入所在楼层' }],
        totalFloors: [{ required: true, message: '请输入总楼层' }],
        orientation: [{ required: true, message: '请选择朝向' }],
        lotRatio: [{ required: true, message: '请输入容积率' }],
        greenRatio: [{ required: true, message: '请输入绿化率' }],
        nearbyFacilities: [{ required: true, message: '请选择周边配套设施' }]
      };
      
      const result = await FormSubmissionService.submitForm(
        values,
        rules,
        'lichengyu@fangsuanyun.cn'
      );
      
      setSubmissionResult(result);
      
      if (result.success) {
        message.success(result.message);
        showSampleModal(result.data.standardSample);
      } else {
        message.error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('提交到表单服务失败:', error);
      message.error('表单提交失败: ' + error.message);
      return { success: false, message: error.message };
    }
  };

  /**
   * 可比案例表格列配置
   */
  const comparableColumns = [
    {
      title: '案例ID',
      dataIndex: 'caseId',
      key: 'caseId',
    },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '单价(元/㎡)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (text) => new Intl.NumberFormat('zh-CN').format(text),
    },
    {
      title: '总价(元)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text) => new Intl.NumberFormat('zh-CN').format(text),
    },
    {
      title: '成交日期',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
    },
    {
      title: '相似度',
      dataIndex: 'similarity',
      key: 'similarity',
      render: (text) => (
        <Progress percent={text} size="small" strokeColor={{ '0%': '#52c41a', '100%': '#faad14' }} />
      ),
    },
  ];



  /**
   * 历史记录表格列配置
   */
  const historyColumns = [
    {
      title: '报告编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '房产ID',
      dataIndex: 'propertyId',
      key: 'propertyId',
    },
    {
      title: '估价日期',
      dataIndex: 'valuationDate',
      key: 'valuationDate',
      render: (text) => new Date(text).toLocaleDateString('zh-CN'),
    },
    {
      title: '总估价(元)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (text) => new Intl.NumberFormat('zh-CN').format(text),
    },
    {
      title: '单价(元/㎡)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (text) => new Intl.NumberFormat('zh-CN').format(text),
    },
    {
      title: '估价方法',
      dataIndex: 'valuationMethod',
      key: 'valuationMethod',
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (text) => `${text}%`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => viewHistoryItem(record)}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="valuation-engine page-container">
      {/* 页面头部 */}
      <div className="page-header">
        <h1>数智估价核心引擎</h1>
        <p>基于市场比较法、收益法和成本法的房产价值评估系统</p>
      </div>
      
      {/* 步骤导航 */}
      <StepNavigation 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={(stepNumber) => {
          const stepIndex = stepNumber - 1;
          if (stepIndex < currentStep) {
            setCurrentStep(stepNumber);
          }
        }} 
      />
      
      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        {/* 智能建议卡片 */}
        <SmartSuggestions 
          visible={suggestionsVisible} 
          smartSuggestions={smartSuggestions} 
          recommendedTemplates={recommendedTemplates} 
          onClose={() => setSuggestionsVisible(false)} 
          onApplyTemplate={(params) => form.setFieldsValue(params)} 
        />
        
        {/* 参数输入表单 */}
        <ValuationForm 
          form={form} 
          loading={loading} 
          templates={templates} 
          selectedTemplate={selectedTemplate} 
          templateLoading={templateLoading} 
          saveTemplateModalVisible={saveTemplateModalVisible} 
          templateName={templateName} 
          onFinish={handleValuationSubmit} 
          onReset={handleReset} 
          onManualSave={handleManualSave} 
          onRefreshMarketData={refreshMarketData} 
          onLoadTemplate={loadTemplate} 
          onSaveTemplate={saveCurrentFormAsTemplate} 
          onDeleteTemplate={deleteTemplate} 
          onCloseModal={() => {
            setSaveTemplateModalVisible(false);
            setTemplateName('');
          }} 
          onTemplateNameChange={setTemplateName} 
        />
          



        {/* 步骤2：结果预览 */}
        {currentStep === STEP_2 && (
          <Card title="估价结果预览" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleValuationSubmit}
              initialValues={defaultValuationParams}
              autoComplete="off"
            >
              {/* 操作按钮栏 */}
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={goToPrevStep} size="large">
                  返回修改
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} icon={<CalculatorOutlined />} size="large">
                  继续
                </Button>
              </div>
            </Form>
            
            {valuationResult ? (
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* 基本结果 */}
                <TabPane tab={<span><CalculatorOutlined /> 估价结果</span>} key="result">
                  <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', fontSize: '14px', color: '#856404', textAlign: 'center' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '5px' }}></i>
                    <strong>重要提示：</strong>本估价结果仅供参考，实际价值可能因市场波动、政策调整等因素而变化。
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card>
                        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                          <Tag color="warning" style={{ fontSize: 12 }}>仅供参考</Tag>
                        </div>
                        <Statistic
                          title="总估价"
                          value={valuationResult.totalValue}
                          precision={2}
                          valueStyle={{ color: '#3f8600' }}
                          prefix="¥"
                          suffix="元"
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                          <Tag color="warning" style={{ fontSize: 12 }}>仅供参考</Tag>
                        </div>
                        <Statistic
                          title="单价"
                          value={valuationResult.unitPrice}
                          precision={2}
                          valueStyle={{ color: '#3f8600' }}
                          prefix="¥"
                          suffix="元/㎡"
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="置信度"
                          value={valuationResult.confidence}
                          precision={1}
                          valueStyle={{ color: '#1890ff' }}
                          suffix="%"
                        />
                        <Progress percent={valuationResult.confidence} status="active" />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="估价方法"
                          value={valuationResult.valuationMethod}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="估价日期"
                          value={new Date(valuationResult.valuationDate).toLocaleDateString()}
                        />
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                
                {/* 可比案例 */}
                <TabPane tab={<span><BarChartOutlined /> 可比案例</span>} key="comparable">
                  {/* 可比案例价格对比 - 增强版 */}
                  <Card title="可比案例价格对比">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart 
                        data={valuationResult.comparableProperties}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="caseId" 
                          stroke="rgba(255, 255, 255, 0.6)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="rgba(255, 255, 255, 0.6)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                          tickFormatter={(value) => new Intl.NumberFormat('zh-CN').format(value)}
                          label={{ value: '单价 (元/㎡)', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.6)' }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="rgba(255, 160, 70, 0.6)"
                          tick={{ fill: 'rgba(255, 160, 70, 0.6)' }}
                          tickFormatter={(value) => `${value}㎡`}
                          label={{ value: '面积 (㎡)', angle: 90, position: 'insideRight', fill: 'rgba(255, 160, 70, 0.6)' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid rgba(255, 160, 70, 0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value, name) => {
                            if (name === '单价 (元/㎡)') {
                              return [`${name}: ¥${new Intl.NumberFormat('zh-CN').format(value)}`, '价格'];
                            }
                            return [`${name}: ${value}㎡`, '面积'];
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="rect"
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="unitPrice" 
                          name="单价 (元/㎡)" 
                          fill="#1890ff" 
                          radius={[8, 8, 0, 0]}
                          animationDuration={1500}
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="area" 
                          name="面积 (㎡)" 
                          fill="#ffa046" 
                          radius={[8, 8, 0, 0]}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  
                  {/* 相似度分析 */}
                  <Card title="相似度分析" style={{ marginTop: 16 }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <ReLineChart 
                        data={valuationResult.comparableProperties}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="caseId" 
                          stroke="rgba(255, 255, 255, 0.6)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          stroke="rgba(255, 255, 255, 0.6)"
                          tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid rgba(255, 160, 70, 0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value) => [`相似度: ${value}%`, '匹配度']}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="similarity" 
                          name="相似度" 
                          stroke="#52c41a" 
                          strokeWidth={3} 
                          dot={{ r: 5, fill: '#52c41a', stroke: '#fff', strokeWidth: 2 }} 
                          activeDot={{ r: 8, fill: '#52c41a', stroke: '#fff', strokeWidth: 2 }}
                          animationDuration={1500}
                        />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </Card>
                  
                  {/* 可比案例详情表格 */}
                  <Card title="可比案例详情" style={{ marginTop: 16 }}>
                    <Table 
                      columns={comparableColumns} 
                      dataSource={valuationResult.comparableProperties} 
                      rowKey="caseId" 
                      pagination={false}
                      size="small"
                      scroll={{ x: true }}
                      rowHoverable
                    />
                  </Card>
                </TabPane>
              
              {/* 趋势分析 */}
              <TabPane tab={<span><LineChartOutlined /> 趋势分析</span>} key="trend">
                {/* 年度涨幅和预测 */}
                <Card title="年度涨幅">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="同比涨幅"
                        value={valuationResult.trendAnalysis.yearOnYearGrowth}
                        precision={1}
                        valueStyle={{ 
                          color: valuationResult.trendAnalysis.yearOnYearGrowth > 0 ? '#3f8600' : '#cf1322' 
                        }}
                        suffix="%"
                      />
                    </Col>
                    <Col span={16}>
                      <Card>
                        <p>{valuationResult.trendAnalysis.prediction}</p>
                      </Card>
                    </Col>
                  </Row>
                </Card>
                
                {/* 月度价格趋势 - 折线图 */}
                <Card title="月度价格趋势" style={{ marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <ReLineChart 
                      data={valuationResult.trendAnalysis.monthlyTrend}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="rgba(255, 255, 255, 0.6)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.6)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                        tickFormatter={(value) => new Intl.NumberFormat('zh-CN').format(value)}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          border: '1px solid rgba(255, 160, 70, 0.3)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value, name) => [
                          `${name}: ¥${new Intl.NumberFormat('zh-CN').format(value)}`,
                          '价格'
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        name="价格 (元/㎡)" 
                        stroke="#ffa046" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: '#ffa046', stroke: '#fff', strokeWidth: 2 }} 
                        activeDot={{ r: 8, fill: '#ffa046', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </Card>
                
                {/* 月度价格趋势 - 面积分布图 */}
                <Card title="价格分布分析" style={{ marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={valuationResult.trendAnalysis.monthlyTrend}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="rgba(255, 255, 255, 0.6)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.6)"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                        tickFormatter={(value) => new Intl.NumberFormat('zh-CN').format(value)}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          border: '1px solid rgba(255, 160, 70, 0.3)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value, name) => [
                          `${name}: ¥${new Intl.NumberFormat('zh-CN').format(value)}`,
                          '价格'
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="price" 
                        name="价格 (元/㎡)" 
                        fill="#1890ff" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabPane>
              
              {/* 影响因素分析 */}
              <TabPane tab={<span><FileTextOutlined /> 影响因素</span>} key="factors">
                {valuationResult.valuationMethod === '综合估价法' ? (
                  <>
                    {/* 综合估价方法权重 - 增强版 */}
                    <Card title="综合估价方法权重">
                      <Row gutter={16}>
                        <Col span={12}>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: '市场比较法', value: valuationResult.factors.weights.market * 100 },
                                  { name: '收益法', value: valuationResult.factors.weights.income * 100 },
                                  { name: '成本法', value: valuationResult.factors.weights.cost * 100 }
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                labelLine={{ stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1.5 }}
                                animationDuration={1500}
                                animationBegin={300}
                              >
                                <Cell key="market" fill="#ffa046" />
                                <Cell key="income" fill="#52c41a" />
                                <Cell key="cost" fill="#1890ff" />
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [`${value}%`, '权重']}
                                contentStyle={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                  border: '1px solid rgba(255, 160, 70, 0.3)',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Col>
                        <Col span={12}>
                          <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
                            <div style={{ transition: 'all 0.3s ease' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '16px', fontWeight: 'bold', color: '#ffa046' }}>
                                <span>市场比较法</span>
                                <span>{(valuationResult.factors.weights.market * 100).toFixed(1)}%</span>
                              </div>
                              <Progress 
                                percent={valuationResult.factors.weights.market * 100} 
                                strokeColor={{
                                  '0%': '#ffa046',
                                  '100%': '#ff7e35',
                                }}
                                strokeWidth={8}
                                size="large"
                              />
                            </div>
                            <div style={{ transition: 'all 0.3s ease', marginTop: '24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                                <span>收益法</span>
                                <span>{(valuationResult.factors.weights.income * 100).toFixed(1)}%</span>
                              </div>
                              <Progress 
                                percent={valuationResult.factors.weights.income * 100} 
                                strokeColor={{
                                  '0%': '#52c41a',
                                  '100%': '#389e0d',
                                }}
                                strokeWidth={8}
                                size="large"
                              />
                            </div>
                            <div style={{ transition: 'all 0.3s ease', marginTop: '24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                                <span>成本法</span>
                                <span>{(valuationResult.factors.weights.cost * 100).toFixed(1)}%</span>
                              </div>
                              <Progress 
                                percent={valuationResult.factors.weights.cost * 100} 
                                strokeColor={{
                                  '0%': '#1890ff',
                                  '100%': '#096dd9',
                                }}
                                strokeWidth={8}
                                size="large"
                              />
                            </div>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                    
                    {/* 各方法详细结果 - 增强版 */}
                    <Card title="各方法详细结果" style={{ marginTop: 16 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ transition: 'all 0.3s ease', padding: '16px', backgroundColor: 'rgba(255, 160, 70, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 160, 70, 0.1)' }}>
                          <h4 style={{ marginBottom: '16px', color: '#ffa046', fontSize: '18px' }}>市场比较法结果</h4>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Statistic 
                                title="单价" 
                                value={valuationResult.factors.marketResult.unitPrice} 
                                prefix="¥" 
                                suffix="元/㎡" 
                                valueStyle={{ color: '#ffa046', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic 
                                title="总价" 
                                value={valuationResult.factors.marketResult.totalValue} 
                                prefix="¥" 
                                suffix="元" 
                                valueStyle={{ color: '#ffa046', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic 
                                title="置信度" 
                                value={valuationResult.factors.marketResult.confidence} 
                                suffix="%" 
                                valueStyle={{ color: '#ffa046', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                          </Row>
                        </div>
                        
                        <div style={{ transition: 'all 0.3s ease', padding: '16px', backgroundColor: 'rgba(82, 196, 26, 0.05)', borderRadius: '8px', border: '1px solid rgba(82, 196, 26, 0.1)', marginTop: '16px' }}>
                          <h4 style={{ marginBottom: '16px', color: '#52c41a', fontSize: '18px' }}>收益法结果</h4>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Statistic 
                                title="单价" 
                                value={valuationResult.factors.incomeResult.unitPrice} 
                                prefix="¥" 
                                suffix="元/㎡" 
                                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic 
                                title="总价" 
                                value={valuationResult.factors.incomeResult.totalValue} 
                                prefix="¥" 
                                suffix="元" 
                                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic 
                                title="置信度" 
                                value={valuationResult.factors.incomeResult.confidence} 
                                suffix="%" 
                                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                          </Row>
                        </div>
                        
                        <div style={{ transition: 'all 0.3s ease', padding: '16px', backgroundColor: 'rgba(24, 144, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(24, 144, 255, 0.1)', marginTop: '16px' }}>
                          <h4 style={{ marginBottom: '16px', color: '#1890ff', fontSize: '18px' }}>成本法结果</h4>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Statistic 
                                title="单价" 
                                value={valuationResult.factors.costResult.unitPrice} 
                                prefix="¥" 
                                suffix="元/㎡" 
                                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic 
                                title="总价" 
                                value={valuationResult.factors.costResult.totalValue} 
                                prefix="¥" 
                                suffix="元" 
                                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                            <Col span={8}>
                              <Statistic 
                                title="置信度" 
                                value={valuationResult.factors.costResult.confidence} 
                                suffix="%" 
                                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                                animation={true}
                              />
                            </Col>
                          </Row>
                        </div>
                      </Space>
                    </Card>
                  </>
                ) : (
                  <>
                    {/* 影响因素分析 - 增强版 */}
                    <Card title="影响因素分析">
                      <Row gutter={16}>
                        <Col span={12}>
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart 
                              cx="50%" 
                              cy="50%" 
                              outerRadius="80%" 
                              data={valuationResult.evaluationDetails.factorsAnalysis}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                              <PolarAngleAxis 
                                dataKey="name" 
                                stroke="rgba(255, 255, 255, 0.6)"
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                              />
                              <PolarRadiusAxis 
                                angle={30} 
                                domain={[0, 100]} 
                                stroke="rgba(255, 255, 255, 0.6)"
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
                              />
                              <Radar
                                name="得分"
                                dataKey="value" 
                                stroke="#ffa046" 
                                fill="#ffa046" 
                                fillOpacity={0.3}
                                strokeWidth={3}
                              />
                              <Radar
                                name="权重"
                                dataKey={(entry) => entry.weight * 100}
                                stroke="#1890ff"
                                fill="#1890ff"
                                fillOpacity={0.3}
                                strokeWidth={3}
                              />
                              <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                  border: '1px solid rgba(255, 160, 70, 0.3)',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                                formatter={(value, name) => {
                                  if (name === '得分') {
                                    return [`得分: ${value}%`, '影响得分'];
                                  }
                                  return [`权重: ${value}%`, '影响权重'];
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </Col>
                        <Col span={12}>
                          <Space direction="vertical" style={{ width: '100%', maxHeight: '350px', overflow: 'auto' }}>
                            {valuationResult.evaluationDetails.factorsAnalysis.map((factor, index) => (
                              <div 
                                key={index} 
                                style={{ 
                                  transition: 'all 0.3s ease',
                                  padding: '12px',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  marginBottom: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 160, 70, 0.1)';
                                  e.currentTarget.style.transform = 'translateX(4px)';
                                  e.currentTarget.style.borderColor = 'rgba(255, 160, 70, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '15px' }}>
                                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{factor.name}</span>
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ color: '#ffa046', fontWeight: 'bold' }}>{factor.value}%</span>
                                    <span style={{ color: '#1890ff', fontSize: '13px', opacity: 0.8 }}>权重: {(factor.weight * 100).toFixed(1)}%</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                  <div style={{ flex: 1 }}>
                                    <Progress 
                                      percent={factor.value} 
                                      strokeColor={{'0%': '#ffa046', '100%': '#ff7e35'}}
                                      strokeWidth={6}
                                      showInfo={false}
                                    />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <Progress 
                                      percent={factor.weight * 100} 
                                      strokeColor={{'0%': '#1890ff', '100%': '#096dd9'}}
                                      strokeWidth={6}
                                      showInfo={false}
                                    />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                                  <span>得分</span>
                                  <span>权重</span>
                                </div>
                              </div>
                            ))}
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  </>
                )}
                
                {/* 估价详情 - 增强版 */}
                <Card title="估价详情" style={{ marginTop: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <h4 style={{ marginBottom: '16px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>估价参数</h4>
                      <pre style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        padding: 20, 
                        borderRadius: 8, 
                        overflow: 'auto',
                        color: '#fff',
                        border: '1px solid rgba(255, 160, 70, 0.1)',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}>
                        {JSON.stringify(valuationResult.evaluationDetails.valuationParams, null, 2)}
                      </pre>
                    </div>
                    
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ marginBottom: '16px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                        {valuationResult.valuationMethod === '综合估价法' ? '综合估价详情' : '修正系数'}
                      </h4>
                      <pre style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                        padding: 20, 
                        borderRadius: 8, 
                        overflow: 'auto',
                        color: '#fff',
                        border: '1px solid rgba(255, 160, 70, 0.1)',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}>
                        {JSON.stringify(valuationResult.factors, null, 2)}
                      </pre>
                    </div>
                  </Space>
                </Card>
              </TabPane>
            </Tabs>
          ) : (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
              <p style={{ marginTop: 20 }}>正在计算估价结果...</p>
            </div>
          )}
        </Card>
      )}
      
      {/* 步骤3：报告生成 */}
      {currentStep === STEP_3 && (
        <Card title="报告生成与分享" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleValuationSubmit}
            initialValues={defaultValuationParams}
            autoComplete="off"
          >
            {/* 操作按钮栏 */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button onClick={goToPrevStep} size="large">
                返回预览
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<CalculatorOutlined />} size="large">
                完成
              </Button>
            </div>
          </Form>
          
          {valuationResult && (
            <div>
              <Card title="生成报告" style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', fontSize: '14px', color: '#856404' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '5px' }}></i>
                  <strong>重要提示：</strong>生成的报告中包含的估价结果仅供参考，实际价值可能因市场波动、政策调整等因素而变化。
                </div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {/* WPS模板选择 */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>选择WPS模板：</span>
                    <Select
                      value={selectedWpsTemplate}
                      onChange={setSelectedWpsTemplate}
                      style={{ width: 200 }}
                      placeholder="请选择WPS模板"
                      loading={wpsLoading}
                    >
                      <Select.Option value="default-valuation-template">默认估价模板</Select.Option>
                      {wpsTemplates.map((template) => (
                        <Select.Option key={template.templateId} value={template.templateId}>
                          {template.name} ({new Date(template.createTime).toLocaleDateString()})
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  
                  {/* 报告生成按钮 */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Button id="generateHtmlReport" icon={<FileTextOutlined />} onClick={() => handleGenerateHtmlReport(valuationResult)} size="large">
                      生成HTML报告
                    </Button>
                    <Button id="generatePdfReport" icon={<FilePdfOutlined />} onClick={() => handleGeneratePdfReport(valuationResult)} size="large">
                      生成PDF报告
                    </Button>
                    <Button id="generateExcelReport" type="primary" icon={<FileTextOutlined />} onClick={() => handleGenerateExcelReport(valuationResult)} size="large">
                      生成Excel报告
                    </Button>
                    <Button id="generateWpsReport" type="primary" icon={<FileTextOutlined />} onClick={() => handleGenerateWpsReport(valuationResult)} size="large" loading={wpsLoading}>
                      生成WPS报告
                    </Button>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#8c8c8c', marginTop: 10 }}>
                    选择您需要的报告格式，系统将为您生成对应的估价报告
                  </div>
                </Space>
              </Card>
              
              <Card title="分享结果" style={{ marginBottom: 20 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button id="shareResult" type="primary" icon={<CalculatorOutlined />} onClick={handleShareResult} size="large">
                    分享估价结果
                  </Button>
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#8c8c8c', marginTop: 10 }}>
                    点击分享按钮，生成分享链接，方便您与他人分享估价结果
                  </div>
                </Space>
              </Card>
              
              <Card title="历史记录">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button id="toggleHistoryTab" onClick={toggleHistoryTab} size="large">
                    {historyTabVisible ? '隐藏历史记录' : '显示历史记录'}
                  </Button>
                  {historyTabVisible && (
                    <Card title="历史估价记录" loading={historyLoading} style={{ marginTop: 10 }}>
                      <Table 
                        columns={historyColumns} 
                        dataSource={valuationHistory} 
                        rowKey="id" 
                        pagination={{ pageSize: 10 }} 
                      />
                    </Card>
                  )}
                </Space>
              </Card>
            </div>
          )}
        </Card>
      )}
      <Modal
        title="历史记录详情"
        visible={historyModalVisible}
        onCancel={handleHistoryModalClose}
        footer={null}
        width={800}
        >
          {selectedHistoryItem && (
            <>
              <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', fontSize: '14px', color: '#856404' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '5px' }}></i>
                <strong>重要提示：</strong>本历史估价结果仅供参考，实际价值可能因市场波动、政策调整等因素而变化。
              </div>
              <Timeline>
                <Timeline.Item>报告编号: {selectedHistoryItem.id}</Timeline.Item>
                <Timeline.Item>房产ID: {selectedHistoryItem.propertyId}</Timeline.Item>
                <Timeline.Item>估价日期: {new Date(selectedHistoryItem.valuationDate).toLocaleDateString('zh-CN')}</Timeline.Item>
                <Timeline.Item>估价方法: {selectedHistoryItem.valuationMethod}</Timeline.Item>
                <Timeline.Item>置信度: {selectedHistoryItem.confidence}%</Timeline.Item>
                <Timeline.Item>
                  <div>
                    <h4>估价结果</h4>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic title="总估价" value={selectedHistoryItem.totalValue} prefix="¥" suffix="元" />
                        <Tag color="warning" style={{ marginLeft: '10px', fontSize: '12px' }}>仅供参考</Tag>
                      </Col>
                      <Col span={12}>
                        <Statistic title="单价" value={selectedHistoryItem.unitPrice} prefix="¥" suffix="元/㎡" />
                        <Tag color="warning" style={{ marginLeft: '10px', fontSize: '12px' }}>仅供参考</Tag>
                      </Col>
                    </Row>
                  </div>
                </Timeline.Item>
              </Timeline>
            </>
          )}
        </Modal>
        
        {/* 保存模板弹窗 */}
        <Modal
          title="保存估价模板"
          visible={saveTemplateModalVisible}
          onCancel={() => {
            setSaveTemplateModalVisible(false);
            setTemplateName('');
          }}
          onOk={confirmSaveTemplate}
          okText="保存"
          cancelText="取消"
          confirmLoading={templateLoading}
        >
          <Form layout="vertical">
            <Form.Item
              name="templateName"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input
                placeholder="请输入模板名称"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* 分享结果弹窗 */}
        <Modal
          title="分享估价结果"
          visible={shareModalVisible}
          onCancel={handleShareModalCancel}
          footer={null}
          width={500}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: 20 }}>您可以通过以下方式分享估价结果：</p>
            
            {/* 二维码 */}
            <div style={{ marginBottom: 20 }}>
              <img src={qrCodeDataUrl} alt="估价结果分享二维码" style={{ width: 150, height: 150 }} />
              <p style={{ marginTop: 10, fontSize: 12, color: '#8c8c8c' }}>扫描二维码查看估价结果</p>
            </div>
            
            {/* 分享链接 */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>分享链接</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Input
                  value={shareUrl}
                  readOnly
                  style={{ flex: 1, marginRight: 10 }}
                />
                <Button type="primary" onClick={copyShareLink}>
                  复制
                </Button>
              </div>
              <p style={{ marginTop: 10, fontSize: 12, color: '#8c8c8c' }}>分享链接有效期为7天</p>
            </div>
            
            {/* 分享提示 */}
            <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f6f8fa', borderRadius: 4 }}>
              <p style={{ fontSize: 12, color: '#666' }}>
                注意：分享链接包含完整的估价结果信息，请谨慎分享给他人。
              </p>
            </div>
          </div>
        </Modal>
      </Space>
      
      {/* 样本显示模态框 */}
      <Modal
        title="标准样本格式"
        visible={sampleModalVisible}
        onCancel={handleSampleModalCancel}
        footer={[
          <Button key="copy" type="primary" icon={<CalculatorOutlined />} onClick={copySampleToClipboard}>
            复制样本
          </Button>,
          <Button key="close" onClick={handleSampleModalCancel}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <TextArea
          value={currentSample}
          rows={20}
          readOnly
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>
    </div>
  );
};

export default ValuationEngine;
