import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  size = 'md',
  variant = 'default',
  className = '',
  id,
  ...props
}) => {
  // 生成唯一ID
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // 基础样式
  const baseStyles = 'flex items-center rounded-md border transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary';

  // 变体样式
  const variantStyles = {
    default: 'bg-white border-gray-300 hover:border-gray-400',
    outlined: 'bg-transparent border-gray-300 hover:border-primary',
    filled: 'bg-gray-50 border-gray-300 hover:bg-gray-100',
  };

  // 尺寸样式
  const sizeStyles = {
    sm: 'h-9',
    md: 'h-10',
    lg: 'h-12',
  };

  // 全宽样式
  const widthStyle = fullWidth ? 'w-full' : '';

  // 错误状态样式
  const errorStyle = error ? 'border-danger focus-within:ring-danger focus-within:border-danger' : '';

  // 输入框样式
  const inputStyles = {
    sm: 'text-sm px-3',
    md: 'text-base px-4',
    lg: 'text-lg px-4',
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${errorStyle}`}>
        {leftIcon && <span className="px-3 text-gray-400">{leftIcon}</span>}
        <input
          id={inputId}
          className={`flex-1 bg-transparent border-none outline-none ${inputStyles[size]} placeholder-gray-400`}
          {...props}
        />
        {rightIcon && <span className="px-3 text-gray-400">{rightIcon}</span>}
      </div>
      {error && (
        <p className="text-sm text-danger mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;