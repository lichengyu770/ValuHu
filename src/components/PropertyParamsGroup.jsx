import React from 'react';
import { Card, Collapse, Tooltip, Space } from 'antd';
import {
  DownOutlined,
  UpOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Panel } = Collapse;

/**
 * 房产参数分组组件
 * 用于将估价参数分组展示，提高表单可读性
 */
const PropertyParamsGroup = ({
  title,
  children,
  description = '',
  collapsible = true,
  defaultActive = true,
  className = '',
  style = {},
  icon = null,
  tooltip = '',
  ...rest
}) => {
  // 处理面板展开/折叠
  const handleChange = (activeKey) => {
    console.log('面板状态变化:', activeKey);
  };

  return (
    <div className={`property-params-group ${className}`} style={style}>
      {collapsible ? (
        <Collapse
          activeKey={defaultActive ? ['1'] : []}
          onChange={handleChange}
          ghost
          size='large'
          bordered={false}
          expandIcon={({ isActive }) =>
            isActive ? <UpOutlined /> : <DownOutlined />
          }
          {...rest}
        >
          <Panel
            header={
              <div className='property-params-group-header'>
                {icon && (
                  <div className='property-params-group-icon'>{icon}</div>
                )}
                <div className='property-params-group-title'>
                  <span>{title}</span>
                  {tooltip && (
                    <Tooltip title={tooltip}>
                      <InfoCircleOutlined className='property-params-group-tooltip-icon' />
                    </Tooltip>
                  )}
                </div>
                {description && (
                  <div className='property-params-group-description'>
                    {description}
                  </div>
                )}
              </div>
            }
            key='1'
          >
            <div className='property-params-group-content'>{children}</div>
          </Panel>
        </Collapse>
      ) : (
        <Card
          title={
            <div className='property-params-group-header'>
              {icon && <div className='property-params-group-icon'>{icon}</div>}
              <div className='property-params-group-title'>
                <span>{title}</span>
                {tooltip && (
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined className='property-params-group-tooltip-icon' />
                  </Tooltip>
                )}
              </div>
            </div>
          }
          bordered={false}
          className='property-params-group-card'
          {...rest}
        >
          <div className='property-params-group-content'>{children}</div>
        </Card>
      )}

      <style jsx>{`
        .property-params-group {
          width: 100%;
          margin-bottom: 16px;
        }

        .property-params-group-header {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .property-params-group-icon {
          font-size: 20px;
          color: #ffa046;
        }

        .property-params-group-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        .property-params-group-tooltip-icon {
          font-size: 14px;
          color: #909399;
          cursor: help;
        }

        .property-params-group-description {
          font-size: 13px;
          color: #909399;
          margin-left: auto;
        }

        .property-params-group-content {
          padding: 16px 0;
        }

        .property-params-group-card {
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .property-params-group-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        :global(.ant-collapse-item) {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          margin-bottom: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        :global(.ant-collapse-item:hover) {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        :global(.ant-collapse-header) {
          padding: 16px 24px !important;
        }

        :global(.ant-collapse-content-box) {
          padding: 0 24px 16px !important;
        }
      `}</style>
    </div>
  );
};

export default PropertyParamsGroup;
