import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  header,
  footer,
  variant = 'default',
  size = 'md',
  shadow = 'md',
  className = '',
  ...props
}) => {
  // 基础样式
  const baseStyles = 'rounded-lg transition-all duration-200';

  // 变体样式
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white',
    outlined: 'bg-white border border-gray-200',
    filled: 'bg-gray-50',
  };

  // 阴影样式
  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // 尺寸样式
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // 卡片头样式
  const cardHeaderStyles = 'mb-4';

  // 卡片标题样式
  const cardTitleStyles = 'text-xl font-bold text-gray-900 mb-1';

  // 卡片副标题样式
  const cardSubtitleStyles = 'text-sm text-gray-500';

  // 卡片内容样式
  const cardContentStyles = 'mb-4';

  // 卡片页脚样式
  const cardFooterStyles = 'mt-4 pt-4 border-t border-gray-200';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${shadowStyles[shadow]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* 自定义头部 */}
      {header && <div className={cardHeaderStyles}>{header}</div>}

      {/* 默认头部（标题+副标题） */}
      {(title || subtitle) && !header && (
        <div className={cardHeaderStyles}>
          {title && <h3 className={cardTitleStyles}>{title}</h3>}
          {subtitle && <p className={cardSubtitleStyles}>{subtitle}</p>}
        </div>
      )}

      {/* 卡片内容 */}
      <div className={cardContentStyles}>{children}</div>

      {/* 卡片页脚 */}
      {footer && <div className={cardFooterStyles}>{footer}</div>}
    </div>
  );
};

export default Card;