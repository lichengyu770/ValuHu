import React, { useState, useEffect } from 'react';
import { systemMonitor } from '../services/SystemMonitor';

const ReportGenerator = () => {
  // 状态管理
  const [reportType, setReportType] = useState('comprehensive');
  const [reportFormat, setReportFormat] = useState('html');
  const [reportSchedules, setReportSchedules] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    type: 'comprehensive',
    frequency: 'weekly',
    format: 'html',
    recipients: '',
  });

  // 报告模板选项
  const reportTemplates = {
    performance: '系统性能报告',
    access: '访问统计报告',
    errors: '错误日志报告',
    comprehensive: '综合报告',
  };

  // 报告格式选项
  const reportFormats = {
    json: 'JSON',
    csv: 'CSV',
    html: 'HTML',
  };

  // 报告频率选项
  const reportFrequencies = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
  };

  // 组件挂载时加载报告计划
  useEffect(() => {
    loadReportSchedules();

    // 监听报告生成相关事件
    const handleReportGenerated = () => {
      setIsGenerating(false);
    };

    document.addEventListener('report-generated', handleReportGenerated);
    return () => {
      document.removeEventListener('report-generated', handleReportGenerated);
    };
  }, []);

  // 加载报告计划
  const loadReportSchedules = () => {
    const schedules = systemMonitor.getReportSchedules();
    setReportSchedules(schedules);
  };

  // 立即生成报告
  const handleGenerateReport = () => {
    setIsGenerating(true);
    systemMonitor.exportReport(reportType, reportFormat);

    // 模拟报告生成完成
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  // 安排定期报告
  const handleScheduleReport = () => {
    const config = {
      ...scheduleConfig,
      recipients: scheduleConfig.recipients
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };

    const scheduleId = systemMonitor.scheduleReport(config);
    if (scheduleId) {
      alert('报告计划已设置成功！');
      setShowScheduleForm(false);
      loadReportSchedules();
      resetScheduleForm();
    } else {
      alert('设置报告计划失败，请稍后再试。');
    }
  };

  // 取消报告计划
  const handleCancelSchedule = (scheduleId) => {
    if (window.confirm('确定要取消这个报告计划吗？')) {
      const success = systemMonitor.cancelReportSchedule(scheduleId);
      if (success) {
        alert('报告计划已取消！');
        loadReportSchedules();
      } else {
        alert('取消报告计划失败，请稍后再试。');
      }
    }
  };

  // 重置计划表单
  const resetScheduleForm = () => {
    setScheduleConfig({
      type: 'comprehensive',
      frequency: 'weekly',
      format: 'html',
      recipients: '',
    });
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '从未';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>自动化报告生成</h2>

      {/* 立即生成报告区域 */}
      <div className='mb-8 bg-gray-50 p-6 rounded-lg'>
        <h3 className='text-xl font-semibold text-gray-700 mb-4'>
          立即生成报告
        </h3>
        <div className='flex flex-col md:flex-row gap-4 items-stretch md:items-end'>
          <div className='flex-1'>
            <label
              htmlFor='reportType'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              报告类型：
            </label>
            <select
              id='reportType'
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
            >
              {Object.entries(reportTemplates).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className='flex-1'>
            <label
              htmlFor='reportFormat'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              报告格式：
            </label>
            <select
              id='reportFormat'
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
            >
              {Object.entries(reportFormats).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className='md:w-32'>
            <button
              className='w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '生成报告'}
            </button>
          </div>
        </div>
      </div>

      {/* 定期报告计划区域 */}
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-semibold text-gray-700'>定期报告计划</h3>
          <button
            className='bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 transition-colors'
            onClick={() => setShowScheduleForm(!showScheduleForm)}
          >
            {showScheduleForm ? '取消' : '新增计划'}
          </button>
        </div>

        {/* 添加计划表单 */}
        {showScheduleForm && (
          <div className='bg-gray-50 p-6 rounded-lg mb-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label
                  htmlFor='scheduleType'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  报告类型：
                </label>
                <select
                  id='scheduleType'
                  value={scheduleConfig.type}
                  onChange={(e) =>
                    setScheduleConfig({
                      ...scheduleConfig,
                      type: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
                >
                  {Object.entries(reportTemplates).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor='scheduleFrequency'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  报告频率：
                </label>
                <select
                  id='scheduleFrequency'
                  value={scheduleConfig.frequency}
                  onChange={(e) =>
                    setScheduleConfig({
                      ...scheduleConfig,
                      frequency: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
                >
                  {Object.entries(reportFrequencies).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='scheduleFormat'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                报告格式：
              </label>
              <select
                id='scheduleFormat'
                value={scheduleConfig.format}
                onChange={(e) =>
                  setScheduleConfig({
                    ...scheduleConfig,
                    format: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
              >
                {Object.entries(reportFormats).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='recipients'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                接收者（邮箱，逗号分隔）：
              </label>
              <input
                type='text'
                id='recipients'
                value={scheduleConfig.recipients}
                onChange={(e) =>
                  setScheduleConfig({
                    ...scheduleConfig,
                    recipients: e.target.value,
                  })
                }
                placeholder='输入接收者邮箱，多个邮箱用逗号分隔'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary'
              />
              <p className='mt-1 text-xs text-gray-500'>
                留空将只生成报告文件，不发送邮件
              </p>
            </div>

            <div className='flex justify-end gap-3'>
              <button
                onClick={handleScheduleReport}
                className='bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary/90 transition-colors'
              >
                确认设置
              </button>
              <button
                onClick={() => {
                  setShowScheduleForm(false);
                  resetScheduleForm();
                }}
                className='bg-gray-500 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-600 transition-colors'
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 计划列表 */}
        <div className='overflow-x-auto'>
          {reportSchedules.length === 0 ? (
            <p className='text-center text-gray-500 py-10 italic'>
              暂无报告计划，请点击"新增计划"添加
            </p>
          ) : (
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    报告类型
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    频率
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    格式
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    接收者
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    最后生成
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {reportSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {reportTemplates[schedule.type]}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {reportFrequencies[schedule.frequency]}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {reportFormats[schedule.format]}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700 max-w-xs truncate'>
                      {schedule.recipients.length > 0 ? (
                        schedule.recipients.join(', ')
                      ) : (
                        <span className='text-gray-500 text-xs italic'>
                          仅生成文件
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {formatDate(schedule.lastGenerated)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button
                        className='bg-red-500 text-white text-xs font-medium py-1 px-3 rounded hover:bg-red-600 transition-colors'
                        onClick={() => handleCancelSchedule(schedule.id)}
                      >
                        取消计划
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 报告说明 */}
      <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded'>
        <h4 className='text-lg font-semibold text-blue-700 mb-2'>
          报告内容说明
        </h4>
        <ul className='list-disc pl-5 space-y-1 text-sm text-blue-700'>
          <li>
            <strong>系统性能报告</strong>
            ：包含页面加载时间、API响应时间和内存使用等性能指标
          </li>
          <li>
            <strong>访问统计报告</strong>
            ：包含总访问量、今日访问量、热门模块和活跃用户等信息
          </li>
          <li>
            <strong>错误日志报告</strong>：包含系统错误日志的汇总和分析
          </li>
          <li>
            <strong>综合报告</strong>：包含以上所有内容的完整报告
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReportGenerator;
