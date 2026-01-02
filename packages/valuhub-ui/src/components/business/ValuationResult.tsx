import React from 'react';
import { Card } from '../base/Card';

interface ValuationResultProps {
  propertyName: string;
  propertyAddress: string;
  valuationAmount: number;
  valuationRange: {
    min: number;
    max: number;
  };
  confidenceLevel: number;
  valuationDate: string;
  valuationType: string;
  comparableProperties?: Array<{
    name: string;
    address: string;
    price: number;
    area: number;
    similarity: number;
  }>;
  onDownloadReport?: () => void;
  onShare?: () => void;
  className?: string;
}

const ValuationResult: React.FC<ValuationResultProps> = ({
  propertyName,
  propertyAddress,
  valuationAmount,
  valuationRange,
  confidenceLevel,
  valuationDate,
  valuationType,
  comparableProperties,
  onDownloadReport,
  onShare,
  className = '',
}) => {
  // 格式化价格
  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(2)}万`;
    }
    return `${price.toLocaleString()}`;
  };

  // 格式化置信度
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.7) return 'text-primary';
    if (confidence >= 0.5) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 主估价结果卡片 */}
      <Card variant="elevated" shadow="lg" className="border-l-4 border-primary">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{propertyName}</h2>
            <p className="text-gray-600">{propertyAddress}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-1"
              onClick={onDownloadReport}
            >
              📥 导出报告
            </button>
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1"
              onClick={onShare}
            >
              📤 分享结果
            </button>
          </div>
        </div>

        {/* 估价金额 */}
        <div className="bg-primary/5 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <p className="text-sm text-gray-600 mb-1">估价金额</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">{formatPrice(valuationAmount)}</span>
                <span className="text-gray-600">（单价：{formatPrice(Math.round(valuationAmount / 100))}元/㎡）</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">置信度：</span>
                <span className={`font-semibold ${getConfidenceColor(confidenceLevel)}`}>
                  {formatConfidence(confidenceLevel)}
                </span>
              </div>
            </div>
          </div>

          {/* 估价区间 */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">估价区间</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {formatPrice(valuationRange.min)} - {formatPrice(valuationRange.max)}
              </div>
            </div>
          </div>
        </div>

        {/* 估价信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">估价类型</p>
            <p className="font-medium">{valuationType}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">估价日期</p>
            <p className="font-medium">{valuationDate}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">估价机构</p>
            <p className="font-medium">ValuHub AI估价引擎</p>
          </div>
        </div>
      </Card>

      {/* 相似房源对比 */}
      {comparableProperties && comparableProperties.length > 0 && (
        <Card title="相似房源对比" variant="elevated">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    房源名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总价
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    面积
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    单价
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    相似度
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparableProperties.map((property, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{property.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {property.address}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {property.area}㎡
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatPrice(Math.round(property.price / property.area))}元/㎡
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${property.similarity * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(property.similarity * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValuationResult;