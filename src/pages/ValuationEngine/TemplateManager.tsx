import React, { useState } from 'react';
import { Select, Button, Space, message, Modal } from 'antd';
import { DownloadOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { Template } from '../../types/valuation';
import wpsService from '../../services/WpsService';

const { Option } = Select;

interface TemplateManagerProps {
  onTemplateSelect: (templateId: string) => void;
  activeTemplateId: string;
  valuationData: any; // 估价数据，用于报告生成
}

/**
 * 模板管理组件
 * 负责模板选择和报告生成
 */
const TemplateManager: React.FC<TemplateManagerProps> = ({
  onTemplateSelect,
  activeTemplateId,
  valuationData
}) => {
  // 状态管理
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'docx' | 'pdf' | 'html'>('pdf');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // 模拟模板数据
  const mockTemplates: Template[] = [
    { id: 'template-1', name: '住宅估价模板', description: '适用于普通住宅估价', matchScore: 95, params: {} },
    { id: 'template-2', name: '商业地产模板', description: '适用于商业地产估价', matchScore: 90, params: {} },
    { id: 'template-3', name: '别墅估价模板', description: '适用于别墅和高端住宅估价', matchScore: 88, params: {} }
  ];

  // 生成报告
  const handleGenerateReport = async () => {
    if (!activeTemplateId) {
      message.warning('请先选择报告模板');
      return;
    }

    if (!valuationData) {
      message.warning('请先完成估价计算');
      return;
    }

    setIsGenerating(true);

    try {
      // 调用WPS API生成报告
      const result = await wpsService.generateDocument({
        templateId: activeTemplateId,
        data: valuationData,
        outputFormat: outputFormat,
        title: `${valuationData.params.location || '未知位置'}房产估价报告`
      });

      // 下载报告
      window.open(result.downloadUrl, '_blank');
      message.success('报告生成成功，正在下载...');
    } catch (error) {
      console.error('报告生成失败:', error);
      message.error('报告生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 预览报告
  const handlePreviewReport = async () => {
    if (!activeTemplateId) {
      message.warning('请先选择报告模板');
      return;
    }

    if (!valuationData) {
      message.warning('请先完成估价计算');
      return;
    }

    setIsPreviewing(true);

    try {
      // 首先生成报告，获取documentId
      const result = await wpsService.generateDocument({
        templateId: activeTemplateId,
        data: valuationData,
        outputFormat: 'pdf', // 预览通常使用pdf格式
        title: `${valuationData.params.location || '未知位置'}房产估价报告`
      });

      // 生成预览URL
      const previewUrl = await wpsService.generatePreviewUrl(result.documentId);
      
      setPreviewUrl(previewUrl);
      setIsPreviewModalVisible(true);
      message.success('报告预览链接已生成');
    } catch (error) {
      console.error('报告预览失败:', error);
      message.error('报告预览失败，请稍后重试');
    } finally {
      setIsPreviewing(false);
    }
  };

  // 关闭预览模态框
  const handleClosePreviewModal = () => {
    setIsPreviewModalVisible(false);
    setPreviewUrl('');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: '500' }}>选择报告模板</div>
        <Select
          style={{ width: '100%' }}
          placeholder="选择报告模板"
          value={activeTemplateId || undefined}
          onChange={onTemplateSelect}
          size="large"
        >
          {mockTemplates.map(template => (
            <Option key={template.id} value={template.id}>
              <div style={{ fontWeight: '500' }}>{template.name}</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>{template.description}</div>
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: '500' }}>选择输出格式</div>
        <Select
          style={{ width: '100%' }}
          placeholder="选择输出格式"
          value={outputFormat}
          onChange={(value) => setOutputFormat(value as 'docx' | 'pdf' | 'html')}
          size="large"
        >
          <Option value="pdf">PDF (适合打印和分享)</Option>
          <Option value="docx">DOCX (适合编辑)</Option>
          <Option value="html">HTML (适合网页查看)</Option>
        </Select>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          block
          icon={isGenerating ? <LoadingOutlined spin /> : <DownloadOutlined />}
          onClick={handleGenerateReport}
          loading={isGenerating}
          size="large"
          style={{ backgroundColor: '#ffa046', borderColor: '#ffa046' }}
        >
          {isGenerating ? '生成中...' : '生成估价报告'}
        </Button>
        <Button
          type="default"
          block
          icon={isPreviewing ? <LoadingOutlined spin /> : <EyeOutlined />}
          onClick={handlePreviewReport}
          loading={isPreviewing}
          size="large"
        >
          {isPreviewing ? '预览中...' : '预览估价报告'}
        </Button>
      </Space>

      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '16px', textAlign: 'center' }}>
        选择适合的模板，生成专业的估价报告
      </div>

      {/* 报告预览模态框 */}
      <Modal
        title="报告预览"
        open={isPreviewModalVisible}
        onCancel={handleClosePreviewModal}
        width="90vw"
        height="90vh"
        footer={null}
        centered
      >
        {previewUrl ? (
          <iframe
            src={previewUrl}
            style={{ width: '100%', height: 'calc(90vh - 100px)', border: 'none' }}
            title="报告预览"
          />
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px', 
            color: '#8c8c8c'
          }}>
            <LoadingOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#ffa046' }} spin />
            <div style={{ fontSize: '16px' }}>正在加载预览...</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateManager;