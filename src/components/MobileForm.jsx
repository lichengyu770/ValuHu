import React, { useState, useEffect, useRef } from 'react';

/**
 * 移动端友好的表单组件
 */
const MobileForm = ({
  children,
  onSubmit,
  initialValues = {},
  className = '',
  autoSave = false,
  autoSaveKey = `form-${Math.random().toString(36).substr(2, 9)}`,
  autoSaveInterval = 3000,
  onAutoSave = null,
  feedback = true,
  feedbackDuration = 3000,
  saveMessage = '表单已自动保存',
  successMessage = '提交成功',
  errorMessage = '提交失败',
}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialValues);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackType, setFeedbackType] = useState('success'); // success, error, info
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const formRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // 从localStorage恢复自动保存的数据
  useEffect(() => {
    if (autoSave) {
      const savedData = localStorage.getItem(autoSaveKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
          showFeedback('info', '已恢复上次保存的表单数据');
        } catch (error) {
          console.error('恢复表单数据失败:', error);
        }
      }
    }
  }, [autoSave, autoSaveKey]);

  // 监听表单数据变化，触发自动保存
  useEffect(() => {
    if (autoSave && Object.keys(formData).length > 0) {
      // 清除之前的定时器
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // 设置新的定时器，延迟保存
      autoSaveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(autoSaveKey, JSON.stringify(formData));
        if (onAutoSave) {
          onAutoSave(formData);
        }
        showFeedback('success', saveMessage);
      }, autoSaveInterval);
    }

    // 清理函数
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    formData,
    autoSave,
    autoSaveKey,
    autoSaveInterval,
    onAutoSave,
    saveMessage,
  ]);

  // 处理表单数据变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 显示反馈消息
  const showFeedback = (type, message) => {
    if (!feedback) return;

    setFeedbackType(type);
    setFeedbackMessage(message);
    setIsFeedbackVisible(true);

    // 自动隐藏反馈消息
    setTimeout(() => {
      setIsFeedbackVisible(false);
    }, feedbackDuration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 触发表单内所有输入的验证
    const formElements = e.target.elements;
    const newErrors = {};
    let hasErrors = false;

    // 检查必填项
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      if (element.required && !element.value) {
        const fieldName = element.name || element.id;
        newErrors[fieldName] = '此项为必填项';
        hasErrors = true;
      }
    }

    // 设置错误信息
    setErrors(newErrors);

    if (!hasErrors) {
      setIsSubmitting(true);

      try {
        // 收集表单数据
        const finalFormData = {};
        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i];
          if (element.name) {
            finalFormData[element.name] = element.value;
          }
        }

        // 调用提交回调
        await onSubmit(finalFormData);

        // 提交成功，清除自动保存的数据
        if (autoSave) {
          localStorage.removeItem(autoSaveKey);
        }

        // 显示成功反馈
        showFeedback('success', successMessage);
      } catch (error) {
        console.error('表单提交失败:', error);
        setErrors({ submit: error.message || errorMessage });
        showFeedback('error', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 渲染反馈消息
  const renderFeedback = () => {
    if (!isFeedbackVisible || !feedbackMessage) return null;

    const feedbackClasses = {
      success: 'bg-green-50 text-green-600 border-green-200',
      error: 'bg-red-50 text-red-600 border-red-200',
      info: 'bg-blue-50 text-blue-600 border-blue-200',
    };

    return (
      <div
        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 opacity-100 transform translate-y-0 transition-transform ${feedbackClasses[feedbackType]} border`}
      >
        <div className='flex items-center gap-2'>
          {feedbackType === 'success' && (
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
          {feedbackType === 'error' && (
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          )}
          {feedbackType === 'info' && (
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          )}
          <span className='font-medium'>{feedbackMessage}</span>
        </div>
      </div>
    );
  };

  // 处理子组件的变化事件
  const handleChildChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 克隆子组件，注入表单数据和变化处理函数
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // 检查是否是表单字段组件
      const isFormField = ['MobileInput', 'MobileSelect'].includes(
        child.type.displayName || child.type.name
      );

      if (isFormField) {
        return React.cloneElement(child, {
          value: formData[child.props.name] || child.props.value || '',
          onChange: (e) => {
            // 调用原始的onChange处理函数
            if (child.props.onChange) {
              child.props.onChange(e);
            }
            // 处理表单数据变化
            handleInputChange(e);
          },
        });
      }

      return child;
    }
    return child;
  });

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`space-y-6 ${className}`}
        autoComplete='on'
      >
        {clonedChildren}

        {/* 全局错误信息 */}
        {errors.submit && (
          <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
            {errors.submit}
          </div>
        )}
      </form>

      {/* 操作反馈 */}
      {renderFeedback()}
    </>
  );
};

// 设置组件显示名称，便于调试
MobileForm.displayName = 'MobileForm';

/**
 * 移动端友好的输入框组件
 */
export const MobileInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error = '',
  inputMode = 'text',
  autoComplete = 'on',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const hasError = !!error;
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className='space-y-2'>
      {label && (
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700 dark:text-gray-300'
        >
          {label} {required && <span className='text-red-500'>*</span>}
        </label>
      )}

      <div className='relative'>
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full h-12 px-4 py-3 rounded-lg transition-all duration-300 touch-manipulation
            ${
              hasError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
                : `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${isFocused ? 'border-blue-300 dark:border-blue-700' : ''}`
            }
            ${className}`}
        />

        {/* 密码可见性切换 */}
        {type === 'password' && (
          <button
            type='button'
            onClick={togglePasswordVisibility}
            className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700'
            aria-label={isPasswordVisible ? '隐藏密码' : '显示密码'}
          >
            <svg
              className='h-5 w-5'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              {isPasswordVisible ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3v6m0 0v6m0-6h6m-6 0H3'
                />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* 错误信息 */}
      {error && <p className='text-red-600 text-xs mt-1'>{error}</p>}
    </div>
  );
};

// 设置组件显示名称，便于调试
MobileInput.displayName = 'MobileInput';

/**
 * 移动端友好的选择器组件
 */
export const MobileSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = '请选择',
  required = false,
  error = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // 找到当前选中的选项
  React.useEffect(() => {
    if (options && value) {
      const option = options.find((opt) => opt.value === value);
      setSelectedOption(option || null);
    }
  }, [value, options]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    setIsOpen(false);

    // 找到新选中的选项
    const option = options.find((opt) => opt.value === newValue);
    setSelectedOption(option || null);
  };

  const hasError = !!error;

  return (
    <div className='space-y-2'>
      {label && (
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700 dark:text-gray-300'
        >
          {label} {required && <span className='text-red-500'>*</span>}
        </label>
      )}

      <div className='relative'>
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          required={required}
          className={`w-full h-12 px-4 py-3 rounded-lg transition-all duration-300 touch-manipulation appearance-none
            ${
              hasError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
                : `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`
            }
            ${className}`}
        >
          <option value='' disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 下拉箭头 */}
        <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500'>
          <svg
            className='h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </div>

      {/* 错误信息 */}
      {error && <p className='text-red-600 text-xs mt-1'>{error}</p>}
    </div>
  );
};

// 设置组件显示名称，便于调试
MobileSelect.displayName = 'MobileSelect';

/**
 * 移动端友好的按钮组件
 */
export const MobileButton = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium', // small, medium, large
  className = '',
}) => {
  // 按钮尺寸
  const sizeClasses = {
    small: 'h-9 px-3 text-sm',
    medium: 'h-12 px-4',
    large: 'h-14 px-6 text-lg',
  };

  // 按钮变体
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary:
      'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    outline:
      'border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white',
    text: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800',
  };

  const baseClasses = `rounded-lg font-medium transition-all duration-300 touch-manipulation active:scale-95 flex items-center justify-center`;
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      {loading ? (
        <div className='flex items-center gap-2'>
          <svg
            className='animate-spin -ml-1 mr-2 h-4 w-4 text-current'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          处理中...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// 设置组件显示名称，便于调试
MobileButton.displayName = 'MobileButton';

export default MobileForm;
