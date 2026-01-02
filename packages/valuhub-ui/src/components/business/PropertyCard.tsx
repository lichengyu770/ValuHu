import React from 'react';
import { Card } from '../base/Card';

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  price: number;
  area: number;
  unitPrice: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  year: number;
  imageUrl?: string;
  onViewDetails?: () => void;
  onValuate?: () => void;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  address,
  price,
  area,
  unitPrice,
  bedrooms,
  bathrooms,
  type,
  year,
  imageUrl,
  onViewDetails,
  onValuate,
  className = '',
}) => {
  // 格式化价格
  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(2)}万`;
    }
    return `${price.toLocaleString()}`;
  };

  // 格式化单价
  const formatUnitPrice = (unitPrice: number) => {
    if (unitPrice >= 10000) {
      return `${(unitPrice / 10000).toFixed(2)}万/㎡`;
    }
    return `${unitPrice.toLocaleString()}元/㎡`;
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* 房产图片 */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            🏠 暂无图片
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
          {type}
        </div>
      </div>

      {/* 房产信息 */}
      <div className="p-4">
        {/* 标题和地址 */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{address}</p>
        </div>

        {/* 价格信息 */}
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
            <span className="text-sm text-gray-500 ml-2">{formatUnitPrice(unitPrice)}</span>
          </div>
        </div>

        {/* 基本参数 */}
        <div className="grid grid-cols-4 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span>🛏️</span>
            <span>{bedrooms}室</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🛁</span>
            <span>{bathrooms}卫</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📏</span>
            <span>{area.toFixed(1)}㎡</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏗️</span>
            <span>{year}年</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            onClick={onValuate}
          >
            立即估价
          </button>
          <button
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            onClick={onViewDetails}
          >
            查看详情
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;