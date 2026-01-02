import React from 'react';
import '../../styles/components/SystemCard.css';

interface SystemCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const SystemCard: React.FC<SystemCardProps> = ({
  title,
  description,
  icon,
  link,
}) => {
  return (
    <div className='system-card'>
      <div className='card-icon'>{icon}</div>
      <h3 className='card-title'>{title}</h3>
      <p className='card-description'>{description}</p>
      <a href={link} className='card-link'>
        查看详情 →
      </a>
    </div>
  );
};

export default SystemCard;
