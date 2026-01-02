import React from 'react';
import { DatePicker, Space, Tooltip } from 'antd';
import {
  CalendarOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;

/**
 * 日期范围选择组件
 * 支持预设时间范围、快捷选择等功能
 */
const DateRangePicker = ({
  value,
  onChange,
  placeholder = ['开始日期', '结束日期'],
  disabled = false,
  showQuickPicker = true,
  presets = [],
  className = '',
  style = {},
  tooltip = '',
  ...rest
}) => {
  // 预设时间范围
  const defaultPresets = [
    {
      label: '今天',
      value: [
        new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(new Date().setHours(23, 59, 59, 999)),
      ],
    },
    {
      label: '昨天',
      value: [
        new Date(
          new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
            0,
            0,
            0,
            0
          )
        ),
        new Date(
          new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      ],
    },
    {
      label: '最近7天',
      value: [
        new Date(new Date().setDate(new Date().getDate() - 6)),
        new Date(),
      ],
    },
    {
      label: '最近30天',
      value: [
        new Date(new Date().setDate(new Date().getDate() - 29)),
        new Date(),
      ],
    },
    {
      label: '本月',
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
      ],
    },
    {
      label: '上月',
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      ],
    },
    {
      label: '本季度',
      value: [
        new Date(
          new Date().getFullYear(),
          Math.floor(new Date().getMonth() / 3) * 3,
          1
        ),
        new Date(),
      ],
    },
    {
      label: '本年度',
      value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
    },
  ];

  // 合并默认预设和用户自定义预设
  const allPresets = [...defaultPresets, ...presets];

  // 处理预设选择
  const handlePresetChange = (presetValue) => {
    onChange && onChange(presetValue);
  };

  return (
    <div className={`date-range-picker-container ${className}`} style={style}>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <div className='date-range-picker-wrapper'>
            <RangePicker
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              {...rest}
            />
            {showQuickPicker && !disabled && (
              <div className='date-range-picker-quick'>
                <Space wrap>
                  {allPresets.map((preset, index) => (
                    <button
                      key={index}
                      className='date-range-picker-quick-btn'
                      onClick={() => handlePresetChange(preset.value)}
                    >
                      <CalendarOutlined className='date-range-picker-quick-icon' />
                      {preset.label}
                    </button>
                  ))}
                </Space>
              </div>
            )}
          </div>
        </Tooltip>
      ) : (
        <div className='date-range-picker-wrapper'>
          <RangePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            {...rest}
          />
          {showQuickPicker && !disabled && (
            <div className='date-range-picker-quick'>
              <Space wrap>
                {allPresets.map((preset, index) => (
                  <button
                    key={index}
                    className='date-range-picker-quick-btn'
                    onClick={() => handlePresetChange(preset.value)}
                  >
                    <CalendarOutlined className='date-range-picker-quick-icon' />
                    {preset.label}
                  </button>
                ))}
              </Space>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        .date-range-picker-container {
          width: 100%;
        }

        .date-range-picker-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .date-range-picker-quick {
          margin-top: 8px;
        }

        .date-range-picker-quick-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid #d9d9d9;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.65);
          transition: all 0.3s;
        }

        .date-range-picker-quick-btn:hover {
          border-color: #4096ff;
          color: #4096ff;
          background: #ecf5ff;
        }

        .date-range-picker-quick-btn:active {
          transform: translateY(1px);
        }

        .date-range-picker-quick-icon {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;
