import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Space } from 'antd';
import { ValuationResult } from '../../../types/valuation';

interface ShareModalProps {
  visible: boolean;
  onCancel: () => void;
  valuationResult: ValuationResult | null;
}

/**
 * 分享模态框组件
 * 负责处理估价结果的分享功能
 */
const ShareModal: React.FC<ShareModalProps> = ({ 
  visible, 
  onCancel, 
  valuationResult 
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  // 生成分享链接
  useEffect(() => {
    if (visible && valuationResult) {
      // 模拟生成分享链接
      setShareUrl(`https://example.com/valuation/share/${valuationResult.id}`);
    }
  }, [visible, valuationResult]);

  // 复制链接到剪贴板
  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      Modal.success({ content: '链接已复制到剪贴板' });
    } catch (error) {
      Modal.error({ content: '复制失败，请手动复制' });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Modal
      title="分享估价结果"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <div style={{ padding: '16px 0' }}>
        {/* 分享链接 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>分享链接</div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={shareUrl}
              readOnly
              placeholder="生成分享链接中..."
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={handleCopyLink} loading={isCopying}>
              复制
            </Button>
          </Space.Compact>
        </div>

        {/* 提示信息 */}
        <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 24 }}>
          <p style={{ marginBottom: 8 }}>分享链接有效期为7天</p>
          <p>通过分享链接，他人可以查看您的估价结果</p>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={onCancel}>关闭</Button>
          <Button type="primary" onClick={handleCopyLink} loading={isCopying}>
            复制链接
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;