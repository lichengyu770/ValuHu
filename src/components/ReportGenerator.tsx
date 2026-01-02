import React, { useState } from 'react';
import { ReportGenerationService, ReportFormat, ReportType } from '../services/ReportGenerationService';
import { PropertyInfo, ValuationResult } from '../utils/valuationAlgorithms';
import { valuationStore } from '../store/valuationStore';

const ReportGenerator: React.FC = () => {
  // 状态管理
  const [reportType, setReportType] = useState<ReportType>(ReportType.DETAILED);
  const [reportFormat, setReportFormat] = useState<ReportFormat>(ReportFormat.HTML);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // 获取当前估价数据
  const { propertyInfo, valuationResults } = valuationStore();

  // 报告服务实例
  const reportService = new ReportGenerationService();
  const templates = reportService.getAllTemplates();

  // 报告格式选项
  const reportFormats = [
    { value: ReportFormat.HTML, label: 'HTML' },
    { value: ReportFormat.PDF, label: 'PDF' },
    { value: ReportFormat.EXCEL, label: 'Excel' },
    { value: ReportFormat.JSON, label: 'JSON' },
    { value: ReportFormat.CSV, label: 'CSV' },
  ];

  // 立即生成报告
  const handleGenerateReport = async () => {
    if (!propertyInfo || valuationResults.length === 0) {
      alert('请先完成房产估价，再生成报告');
      return;
    }

    setIsGenerating(true);

    try {
      // 获取默认模板
      const template = templates.find(t => t.type === reportType) || templates[0];
      
      // 生成报告
      const report = reportService.generateReport(
        {
          templateId: template.id,
          property: propertyInfo as PropertyInfo,
          valuationResults: valuationResults as ValuationResult[],
          title: customTitle || undefined,
          author: customAuthor || undefined,
          notes: customNotes || undefined,
          includeCharts,
          chartTypes: ['line', 'bar', 'pie'],
        },
        reportFormat
      );

      // 导出报告
      reportService.exportReport(report);
    } catch (error) {
      console.error('报告生成失败:', error);
      alert('报告生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>报告生成器</h2>

      {/* 报告生成选项 */}
      <div className='mb-8 bg-gray-50 p-6 rounded-lg'>
        <h3 className='text-xl font-semibold text-gray-700 mb-4'>
          生成估价报告
        </h3>
        
        <div className='space-y-4'>
          {/* 报告类型 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='reportType'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                报告类型：
              </label>
              <select
                id='reportType'
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.type}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 报告格式 */}
            <div>
              <label
                htmlFor='reportFormat'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                报告格式：
              </label>
              <select
                id='reportFormat'
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
              >
                {reportFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 自定义选项 */}
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='showCustomOptions'
              checked={showCustomOptions}
              onChange={(e) => setShowCustomOptions(e.target.checked)}
              className='mr-2 text-primary focus:ring-primary border-gray-300 rounded'
            />
            <label
              htmlFor='showCustomOptions'
              className='text-sm font-medium text-gray-700'
            >
              显示自定义选项
            </label>
          </div>

          {/* 自定义选项内容 */}
          {showCustomOptions && (
            <div className='bg-white p-4 rounded-lg border border-gray-200 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='customTitle'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    报告标题：
                  </label>
                  <input
                    type='text'
                    id='customTitle'
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder='自定义报告标题'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
                  />
                </div>

                <div>
                  <label
                    htmlFor='customAuthor'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    作者：
                  </label>
                  <input
                    type='text'
                    id='customAuthor'
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    placeholder='报告作者'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='includeCharts'
                  className='flex items-center text-sm font-medium text-gray-700 mb-3'
                >
                  <input
                    type='checkbox'
                    id='includeCharts'
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className='mr-2 text-primary focus:ring-primary border-gray-300 rounded'
                  />
                  包含图表
                </label>
              </div>

              <div>
                <label
                  htmlFor='customNotes'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  备注：
                </label>
                <textarea
                  id='customNotes'
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder='添加报告备注信息'
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
                />
              </div>
            </div>
          )}

          {/* 生成按钮 */}
          <div className='flex justify-center'>
            <button
              className='bg-primary text-white font-medium py-3 px-8 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg'
              onClick={handleGenerateReport}
              disabled={isGenerating || !propertyInfo || valuationResults.length === 0}
            >
              {isGenerating ? '生成中...' : '生成报告'}
            </button>
          </div>
        </div>
      </div>

      {/* 报告模板说明 */}
      <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded'>
        <h4 className='text-lg font-semibold text-blue-700 mb-2'>
          报告模板说明
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700'>
          {templates.map((template) => (
            <div key={template.id} className='bg-white p-3 rounded shadow-sm'>
              <strong>{template.name}</strong>
              <p className='mt-1 text-gray-600'>{template.description}</p>
              <div className='mt-2 flex flex-wrap gap-1'>
                {template.fields.map((field) => (
                  <span key={field} className='px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700'>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;