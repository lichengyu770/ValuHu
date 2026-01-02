// 数据同步服务
import ValuationService from './ValuationService';

// 定义同步状态接口
export interface SyncStatus {
  isSyncing: boolean;
  lastSync: number | null;
  nextSync: number | null;
  syncCount: number;
  successCount: number;
  failureCount: number;
  averageSyncTime: number;
  lastSyncError: string | null;
  syncHistory: SyncHistoryItem[];
}

// 定义同步历史项接口
export interface SyncHistoryItem {
  id: string;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
  dataSize?: number;
  sources: string[];
}

// 定义数据同步事件类型
export type SyncEvent = 'sync-start' | 'sync-complete' | 'sync-failed' | 'data-updated';

// 定义数据同步服务类
class DataSyncService {
  private isSyncing = false;
  private lastSync = null as number | null;
  private nextSync = null as number | null;
  private syncTimer = null as NodeJS.Timeout | null;
  private syncInterval = 60 * 60 * 1000; // 默认1小时同步一次
  private syncCount = 0;
  private successCount = 0;
  private failureCount = 0;
  private averageSyncTime = 0;
  private lastSyncError = null as string | null;
  private syncHistory: SyncHistoryItem[] = [];
  private listeners = new Map<SyncEvent, Set<(data?: any) => void>>();

  // 初始化服务
  init(): void {
    this.startAutoSync();
  }

  // 启动自动同步
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // 设置下次同步时间
    this.nextSync = Date.now() + this.syncInterval;

    // 启动定时器
    this.syncTimer = setInterval(() => {
      this.syncData();
    }, this.syncInterval);


  }

  // 停止自动同步
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      this.nextSync = null;

    }
  }

  // 设置同步间隔
  setSyncInterval(interval: number): void {
    this.syncInterval = interval;
    // 重启自动同步
    this.startAutoSync();
  }

  // 手动同步数据
  async syncData(): Promise<boolean> {
    if (this.isSyncing) {

      return false;
    }

    const startTime = Date.now();
    this.isSyncing = true;
    this.emit('sync-start');

    try {
      // 记录同步开始
      this.syncCount++;

      // 调用市场数据缓存的强制更新方法
      await ValuationService.marketDataCache.forceUpdate();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 更新统计信息
      this.successCount++;
      this.lastSync = endTime;
      this.lastSyncError = null;
      this.averageSyncTime = (
        (this.averageSyncTime * (this.successCount - 1) + duration) / this.successCount
      );

      // 更新下次同步时间
      this.nextSync = endTime + this.syncInterval;

      // 记录同步历史
      const historyItem: SyncHistoryItem = {
        id: `sync-${Date.now()}`,
        timestamp: endTime,
        duration,
        success: true,
        dataSize: JSON.stringify(ValuationService.marketDataCache.data).length,
        sources: ValuationService.marketDataSources.filter(s => s.enabled).map(s => s.id)
      };
      this.syncHistory.unshift(historyItem);
      // 保留最近50条历史记录
      if (this.syncHistory.length > 50) {
        this.syncHistory = this.syncHistory.slice(0, 50);
      }

      // 通知数据更新
      this.emit('sync-complete', historyItem);
      this.emit('data-updated', ValuationService.marketDataCache.data);


      return true;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 更新统计信息
      this.failureCount++;
      this.lastSync = endTime;
      this.lastSyncError = error instanceof Error ? error.message : '未知错误';

      // 记录同步历史
      const historyItem: SyncHistoryItem = {
        id: `sync-${Date.now()}`,
        timestamp: endTime,
        duration,
        success: false,
        error: this.lastSyncError,
        sources: ValuationService.marketDataSources.filter(s => s.enabled).map(s => s.id)
      };
      this.syncHistory.unshift(historyItem);
      // 保留最近50条历史记录
      if (this.syncHistory.length > 50) {
        this.syncHistory = this.syncHistory.slice(0, 50);
      }

      // 通知同步失败
      this.emit('sync-failed', historyItem);


      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // 获取同步状态
  getStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSync: this.lastSync,
      nextSync: this.nextSync,
      syncCount: this.syncCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      averageSyncTime: this.averageSyncTime,
      lastSyncError: this.lastSyncError,
      syncHistory: [...this.syncHistory]
    };
  }

  // 订阅事件
  on(event: SyncEvent, listener: (data?: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  // 取消订阅
  off(event: SyncEvent, listener: (data?: any) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener);
    }
  }

  // 发送事件
  private emit(event: SyncEvent, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in sync event listener:', error);
        }
      });
    }
  }

  // 获取数据源状态
  getDataSourceStatus() {
    return ValuationService.marketDataCache.getDataSourceStatus();
  }

  // 启用/禁用数据源
  toggleDataSource(sourceId: string, enabled: boolean): void {
    ValuationService.marketDataCache.toggleDataSource(sourceId, enabled);
  }

  // 设置数据源配置
  setDataSourceConfig(sourceId: string, config: Partial<typeof ValuationService.marketDataSources[0]>): void {
    const source = ValuationService.marketDataSources.find(s => s.id === sourceId);
    if (source) {
      Object.assign(source, config);
      // 立即同步数据
      this.syncData();
    }
  }
}

// 创建并导出单例实例
const dataSyncService = new DataSyncService();

export default dataSyncService;