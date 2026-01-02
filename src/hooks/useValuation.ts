import { useState, useCallback, useEffect } from 'react';
import { useApiRequest } from './useApiRequest';
import { ValuationParams, ValuationResult } from '../types/valuation';
import { getCacheKey } from '../utils/formUtils';

export type ValuationMethod = 'market-comparison' | 'income-capitalization' | 'cost' | 'comprehensive';

export interface ValuationOptions {
  cacheTime?: number;
  saveHistory?: boolean;
}

export interface ValuationHistoryItem {
  id: string;
  timestamp: number;
  params: ValuationParams;
  result: ValuationResult;
  method: ValuationMethod;
}

export function useValuation(options: ValuationOptions = {}) {
  const { cacheTime = 30 * 60 * 1000, saveHistory = true } = options; // 默认缓存30分钟，保存历史记录
  const [valuationParams, setValuationParams] = useState<ValuationParams | null>(null);
  const [valuationMethod, setValuationMethod] = useState<ValuationMethod>('market-comparison');
  const [valuationHistory, setValuationHistory] = useState<ValuationHistoryItem[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ValuationResult[]>([]);

  // 加载历史记录
  useEffect(() => {
    if (saveHistory) {
      const savedHistory = localStorage.getItem('valuation-history');
      if (savedHistory) {
        try {
          setValuationHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Failed to parse valuation history:', error);
          localStorage.removeItem('valuation-history');
        }
      }
    }
  }, [saveHistory]);

  // 保存历史记录
  const saveToHistory = useCallback((params: ValuationParams, result: ValuationResult) => {
    if (!saveHistory) return;

    const historyItem: ValuationHistoryItem = {
      id: `valuation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      params,
      result,
      method: valuationMethod,
    };

    const updatedHistory = [historyItem, ...valuationHistory].slice(0, 50); // 只保留最近50条记录
    setValuationHistory(updatedHistory);
    localStorage.setItem('valuation-history', JSON.stringify(updatedHistory));
  }, [valuationHistory, valuationMethod, saveHistory]);

  // 使用API请求hook
  const {
    data: valuationResult,
    loading,
    error,
    execute: requestValuation,
    refetch,
  } = useApiRequest<ValuationResult>('/api/valuation', {
    method: 'POST',
    immediate: false,
    cacheTime,
  });

  // 使用API请求hook获取可比案例
  const {
    data: comparableProperties,
    loading: loadingComparables,
    execute: requestComparables,
  } = useApiRequest<any[]>('/api/comparables', {
    method: 'POST',
    immediate: false,
    cacheTime: 10 * 60 * 1000, // 可比案例缓存10分钟
  });

  // 执行估价
  const estimate = useCallback(async (params: ValuationParams, method?: ValuationMethod) => {
    const selectedMethod = method || valuationMethod;
    setValuationParams(params);
    setValuationMethod(selectedMethod);
    
    // 生成缓存键
    const cacheKey = getCacheKey('valuation', { ...params, method: selectedMethod });
    
    try {
      const result = await requestValuation({
        ...params,
        method: selectedMethod,
        cacheKey,
      });
      
      // 保存到历史记录
      saveToHistory(params, result);
      
      return result;
    } catch (err) {
      throw err;
    }
  }, [requestValuation, valuationMethod, saveToHistory]);

  // 获取可比案例
  const getComparableProperties = useCallback(async (params: ValuationParams) => {
    try {
      const result = await requestComparables(params);
      return result;
    } catch (err) {
      throw err;
    }
  }, [requestComparables]);

  // 对比多个估价结果
  const compareResults = useCallback((results: ValuationResult[]) => {
    setComparisonResults(results);
  }, []);

  // 从历史记录中添加到对比
  const addToComparison = useCallback((historyItem: ValuationHistoryItem) => {
    setComparisonResults(prev => [...prev, historyItem.result]);
  }, []);

  // 从对比中移除结果
  const removeFromComparison = useCallback((resultIndex: number) => {
    setComparisonResults(prev => prev.filter((_, index) => index !== resultIndex));
  }, []);

  // 清空对比结果
  const clearComparison = useCallback(() => {
    setComparisonResults([]);
  }, []);

  // 获取估价置信度
  const getConfidenceLevel = useCallback((result: ValuationResult | null) => {
    if (!result) return 'low';
    
    const confidence = result.confidence || 0;
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  }, []);

  // 获取置信度描述
  const getConfidenceDescription = useCallback((result: ValuationResult | null) => {
    const level = getConfidenceLevel(result);
    switch (level) {
      case 'high':
        return '估价结果可信度高，基于充足的市场数据和合理的估价方法';
      case 'medium':
        return '估价结果可信度中等，建议结合其他因素综合考虑';
      case 'low':
        return '估价结果可信度较低，建议重新评估或咨询专业人士';
      default:
        return '';
    }
  }, [getConfidenceLevel]);

  // 导出估价结果
  const exportResult = useCallback((result: ValuationResult) => {
    const exportData = {
      ...result,
      exportTime: new Date().toISOString(),
      formattedPrice: new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(result.estimatedPrice),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valuation-result-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // 删除历史记录
  const deleteHistoryItem = useCallback((id: string) => {
    const updatedHistory = valuationHistory.filter(item => item.id !== id);
    setValuationHistory(updatedHistory);
    localStorage.setItem('valuation-history', JSON.stringify(updatedHistory));
  }, [valuationHistory]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setValuationHistory([]);
    localStorage.removeItem('valuation-history');
  }, []);

  // 重置估价结果
  const reset = useCallback(() => {
    setValuationParams(null);
    setValuationMethod('market-comparison');
    setComparisonResults([]);
  }, []);

  // 格式化估价结果
  const formatResult = useCallback((result: ValuationResult | null) => {
    if (!result) return null;

    return {
      ...result,
      formattedPrice: new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(result.estimatedPrice),
      formattedPriceRange: {
        min: new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: 'CNY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(result.priceRange.min),
        max: new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: 'CNY',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(result.priceRange.max),
      },
      confidenceLevel: getConfidenceLevel(result),
      confidenceDescription: getConfidenceDescription(result),
    };
  }, [getConfidenceLevel, getConfidenceDescription]);

  return {
    // 状态
    valuationParams,
    valuationResult,
    valuationMethod,
    valuationHistory,
    comparisonResults,
    comparableProperties,
    loading: loading || loadingComparables,
    error,
    formattedResult: formatResult(valuationResult),
    
    // 方法
    estimate,
    getComparableProperties,
    setValuationMethod,
    compareResults,
    addToComparison,
    removeFromComparison,
    clearComparison,
    exportResult,
    deleteHistoryItem,
    clearHistory,
    reset,
    setParams: setValuationParams,
    refetch,
    formatResult,
    getConfidenceLevel,
    getConfidenceDescription,
  };
}