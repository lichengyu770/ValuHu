import React from 'react';
import { DatePicker, Space, Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

// 定义接口
interface Preset {
  label: string;
  value: [Date, Date];
}

interface DateRangePickerProps {
  value?: [Date | null, Date | null];
  onChange?: (dates: [Date | null, Date | null], dateStrings: [string, string]) => void;
  placeholder?: [string, string];
  disabled?: boolean;
  showQuickPicker?: boolean;
  presets?: Preset[];
  className?: string;
  style?: React.CSSProperties;
  tooltip?: string;
  [key: string]: any;
}

/**
 * 日期范围选择组件
 * 支持预设时间范围、快捷选择等功能
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
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
  const defaultPresets: Preset[] = [
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
  const allPresets: Preset[] = [...defaultPresets, ...presets];

  // 处理预设选择
  const handlePresetChange = (presetValue: [Date, Date]) => {
    onChange && onChange(presetValue, [presetValue[0].toISOString(), presetValue[1].toISOString()]);
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
    </div>
  );
};

export default DateRangePicker;