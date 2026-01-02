import React, { useState, useEffect } from 'react';
import { Input, Tooltip } from 'antd';

/**
 * 数字输入组件
 * 支持格式化、范围限制、单位显示等功能
 */
const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  placeholder = '请输入数字',
  formatter,
  parser,
  precision = 0,
  disabled = false,
  className = '',
  style = {},
  tooltip = '',
  ...rest
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState('');

  // 当外部value变化时，更新内部状态
  useEffect(() => {
    setInputValue(value);
    validateValue(value);
  }, [value]);

  // 验证数值是否在允许范围内
  const validateValue = (val) => {
    let errorMsg = '';

    if (val === undefined || val === null) {
      return;
    }

    if (min !== undefined && val < min) {
      errorMsg = `数值不能小于${min}`;
    } else if (max !== undefined && val > max) {
      errorMsg = `数值不能大于${max}`;
    }

    setError(errorMsg);
    return errorMsg === '';
  };

  // 处理输入变化
  const handleChange = (e) => {
    let val = e.target.value;

    // 如果是空字符串，直接返回
    if (val === '') {
      setInputValue('');
      onChange && onChange(null);
      setError('');
      return;
    }

    // 移除千分位分隔符
    val = val.replace(/,/g, '');

    // 解析数值
    let num = parseFloat(val);

    if (isNaN(num)) {
      return;
    }

    // 应用精度限制
    num = Number(num.toFixed(precision));

    // 应用范围限制
    if (min !== undefined) {
      num = Math.max(num, min);
    }
    if (max !== undefined) {
      num = Math.min(num, max);
    }

    // 验证数值
    validateValue(num);

    // 更新状态
    setInputValue(num);
    onChange && onChange(num);
  };

  // 处理增减按钮
  const handleStepChange = (delta) => {
    const currentValue = inputValue || 0;
    const newValue =
      Math.round((currentValue + delta * step) * Math.pow(10, precision)) /
      Math.pow(10, precision);

    // 应用范围限制
    let finalValue = newValue;
    if (min !== undefined) {
      finalValue = Math.max(finalValue, min);
    }
    if (max !== undefined) {
      finalValue = Math.min(finalValue, max);
    }

    validateValue(finalValue);
    setInputValue(finalValue);
    onChange && onChange(finalValue);
  };

  // 渲染输入框内容
  const renderValue = () => {
    if (inputValue === undefined || inputValue === null) {
      return '';
    }

    if (formatter) {
      return formatter(inputValue);
    }

    // 默认格式化：添加千分位分隔符
    return Number(inputValue).toLocaleString('zh-CN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  return (
    <div className={`number-input-container ${className}`} style={style}>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <div className='number-input-wrapper'>
            <Input
              value={renderValue()}
              onChange={handleChange}
              placeholder={placeholder}
              prefix={prefix}
              suffix={suffix}
              disabled={disabled}
              {...rest}
            />
            {!disabled && (
              <div className='number-input-controls'>
                <button
                  className='number-input-control-btn up'
                  onClick={() => handleStepChange(1)}
                  aria-label='增加'
                >
                  <span className='number-input-icon'>+</span>
                </button>
                <button
                  className='number-input-control-btn down'
                  onClick={() => handleStepChange(-1)}
                  aria-label='减少'
                >
                  <span className='number-input-icon'>-</span>
                </button>
              </div>
            )}
          </div>
        </Tooltip>
      ) : (
        <div className='number-input-wrapper'>
          <Input
            value={renderValue()}
            onChange={handleChange}
            placeholder={placeholder}
            prefix={prefix}
            suffix={suffix}
            disabled={disabled}
            {...rest}
          />
          {!disabled && (
            <div className='number-input-controls'>
              <button
                className='number-input-control-btn up'
                onClick={() => handleStepChange(1)}
                aria-label='增加'
              >
                <span className='number-input-icon'>+</span>
              </button>
              <button
                className='number-input-control-btn down'
                onClick={() => handleStepChange(-1)}
                aria-label='减少'
              >
                <span className='number-input-icon'>-</span>
              </button>
            </div>
          )}
        </div>
      )}
      {error && <div className='number-input-error'>{error}</div>}
      <style jsx>{`
        .number-input-container {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .number-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .number-input-controls {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 2px;
          pointer-events: none;
        }

        .number-input-control-btn {
          width: 20px;
          height: 15px;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          cursor: pointer;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          transition: all 0.2s ease;
        }

        .number-input-control-btn:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .number-input-control-btn:active {
          transform: scale(0.95);
        }

        .number-input-icon {
          font-size: 10px;
          line-height: 1;
          color: rgba(0, 0, 0, 0.65);
        }

        .number-input-error {
          color: #ff4d4f;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default NumberInput;
