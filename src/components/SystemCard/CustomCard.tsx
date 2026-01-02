import React from 'react';
import '../../styles/components/SystemCard.css';

interface CustomCardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  link?: string;
  linkText?: string;
  badge?: React.ReactNode;
  isHoverable?: boolean;
  isClickable?: boolean;
  style?: React.CSSProperties;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  description,
  imageUrl,
  icon,
  className = '',
  onClick = null,
  children = null,
  link = '',
  linkText = '查看详情 →',
  badge = null,
  isHoverable = true,
  isClickable = false,
  style = {},
}) => {
  const cardClasses = `system-card custom-card ${isHoverable ? 'hoverable' : ''} ${isClickable ? 'clickable' : ''} ${className}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.location.href = link;
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={isClickable || onClick ? handleClick : undefined}
      style={style}
    >
      {badge && <div className='card-badge'>{badge}</div>}

      {imageUrl && (
        <div className='card-image'>
          <img src={imageUrl} alt={title} />
        </div>
      )}

      {icon && <div className='card-icon'>{icon}</div>}

      {title && <h3 className='card-title'>{title}</h3>}
      {description && <p className='card-description'>{description}</p>}

      {children && <div className='card-content'>{children}</div>}

      {link && (
        <a href={link} className='card-link'>
          {linkText}
        </a>
      )}
    </div>
  );
};

export default CustomCard;
