import React from 'react';
import { Card, Button, Space, Tag, Divider, Tooltip } from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  PercentOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

/**
 * 报告卡片组件
 * 用于展示估价报告的卡片式视图
 */
const ReportCard = ({
  report,
  onDownload,
  onView,
  onShare,
  onDelete,
  className = '',
  style = {},
  showActions = true,
  ...rest
}) => {
  // 格式化日期
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 根据置信度显示不同颜色的标签
  const getConfidenceTagColor = (confidence) => {
    if (confidence >= 90) return 'success';
    if (confidence >= 80) return 'processing';
    if (confidence >= 70) return 'warning';
    return 'error';
  };

  // 根据估价方法显示不同图标
  const getMethodIcon = (method) => {
    const methodIcons = {
      市场比较法: <BarChartOutlined />,
      收益法: <DollarCircleOutlined />,
      成本法: <PercentOutlined />,
      综合估价法: <FileTextOutlined />,
    };
    return methodIcons[method] || <FileTextOutlined />;
  };

  return (
    <Card
      className={`report-card ${className}`}
      style={style}
      bordered={false}
      hoverable
      cover={
        <div className='report-card-cover'>
          <div className='report-card-cover-header'>
            <FileTextOutlined className='report-card-cover-icon' />
            <div className='report-card-cover-title'>
              <span className='report-card-property-id'>
                {report.propertyId}
              </span>
              <Tag color={getConfidenceTagColor(report.confidence)}>
                置信度 {report.confidence}%
              </Tag>
            </div>
          </div>
          <div className='report-card-cover-content'>
            <div className='report-card-valuation'>
              <div className='report-card-valuation-label'>总估价</div>
              <div className='report-card-valuation-value'>
                ¥{report.totalValue.toLocaleString('zh-CN')}
              </div>
              <div className='report-card-valuation-unit'>
                ¥{report.unitPrice.toLocaleString('zh-CN')}/㎡
              </div>
            </div>
          </div>
        </div>
      }
      {...rest}
    >
      <div className='report-card-content'>
        <div className='report-card-meta'>
          <div className='report-card-meta-item'>
            <CalendarOutlined className='report-card-meta-icon' />
            <span className='report-card-meta-label'>估价日期</span>
            <span className='report-card-meta-value'>
              {formatDate(report.valuationDate)}
            </span>
          </div>
          <div className='report-card-meta-item'>
            {getMethodIcon(report.valuationMethod)}
            <span className='report-card-meta-label'>估价方法</span>
            <span className='report-card-meta-value'>
              {report.valuationMethod}
            </span>
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className='report-card-details'>
          <div className='report-card-detail-item'>
            <span className='report-card-detail-label'>建筑面积</span>
            <span className='report-card-detail-value'>
              {report.evaluationDetails.valuationParams.area} ㎡
            </span>
          </div>
          <div className='report-card-detail-item'>
            <span className='report-card-detail-label'>建筑类型</span>
            <span className='report-card-detail-value'>
              {report.evaluationDetails.valuationParams.buildingType}
            </span>
          </div>
          <div className='report-card-detail-item'>
            <span className='report-card-detail-label'>地理位置</span>
            <span className='report-card-detail-value'>
              {report.evaluationDetails.valuationParams.location}
            </span>
          </div>
          <div className='report-card-detail-item'>
            <span className='report-card-detail-label'>建成年份</span>
            <span className='report-card-detail-value'>
              {report.evaluationDetails.valuationParams.constructionYear}
            </span>
          </div>
        </div>

        {showActions && (
          <div className='report-card-actions'>
            <Space size='small' wrap>
              <Tooltip title='查看报告'>
                <Button
                  type='primary'
                  icon={<EyeOutlined />}
                  onClick={() => onView && onView(report)}
                >
                  查看
                </Button>
              </Tooltip>
              <Tooltip title='下载报告'>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => onDownload && onDownload(report)}
                >
                  下载
                </Button>
              </Tooltip>
              <Tooltip title='分享报告'>
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={() => onShare && onShare(report)}
                >
                  分享
                </Button>
              </Tooltip>
              <Tooltip title='删除报告'>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete && onDelete(report)}
                >
                  删除
                </Button>
              </Tooltip>
            </Space>
          </div>
        )}
      </div>

      <style jsx>{`
        .report-card {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .report-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .report-card-cover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
          color: white;
        }

        .report-card-cover-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .report-card-cover-icon {
          font-size: 24px;
          margin-right: 12px;
        }

        .report-card-cover-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .report-card-property-id {
          font-size: 16px;
          font-weight: 600;
        }

        .report-card-cover-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .report-card-valuation {
          flex: 1;
        }

        .report-card-valuation-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .report-card-valuation-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .report-card-valuation-unit {
          font-size: 14px;
          opacity: 0.8;
        }

        .report-card-content {
          padding: 16px;
        }

        .report-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .report-card-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .report-card-meta-icon {
          font-size: 16px;
          color: #666;
        }

        .report-card-meta-label {
          font-size: 14px;
          color: #666;
        }

        .report-card-meta-value {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .report-card-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .report-card-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .report-card-detail-label {
          font-size: 12px;
          color: #999;
        }

        .report-card-detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .report-card-actions {
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .report-card-cover-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .report-card-meta {
            flex-direction: column;
            align-items: flex-start;
          }

          .report-card-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Card>
  );
};

export default ReportCard;
