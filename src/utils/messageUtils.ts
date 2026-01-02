import { message, MessageInstance } from 'antd';

// 定义消息选项接口
interface MessageOptions {
  duration?: number;
  onClose?: () => void;
}

// 配置全局message默认选项
message.config({
  top: 60, // 距离顶部的距离
  duration: 3, // 默认显示时长
  maxCount: 3, // 最多同时显示的消息数量
});

/**
 * 统一的操作反馈工具
 */
const messageUtils = {
  /**
   * 成功消息
   * @param content - 消息内容
   * @param options - 可选配置
   * @returns 消息实例
   */
  success: (content: string, options: MessageOptions = {}): MessageInstance => {
    return message.success(content, options.duration || 3, options.onClose);
  },

  /**
   * 错误消息
   * @param content - 消息内容
   * @param options - 可选配置
   * @returns 消息实例
   */
  error: (content: string, options: MessageOptions = {}): MessageInstance => {
    return message.error(content, options.duration || 3, options.onClose);
  },

  /**
   * 警告消息
   * @param content - 消息内容
   * @param options - 可选配置
   * @returns 消息实例
   */
  warning: (content: string, options: MessageOptions = {}): MessageInstance => {
    return message.warning(content, options.duration || 3, options.onClose);
  },

  /**
   * 信息消息
   * @param content - 消息内容
   * @param options - 可选配置
   * @returns 消息实例
   */
  info: (content: string, options: MessageOptions = {}): MessageInstance => {
    return message.info(content, options.duration || 3, options.onClose);
  },

  /**
   * 加载中消息
   * @param content - 消息内容
   * @param options - 可选配置
   * @returns 消息实例
   */
  loading: (content: string, options: MessageOptions = {}): MessageInstance => {
    return message.loading(content, options.duration || 0, options.onClose);
  },

  /**
   * 关闭所有消息
   */
  destroy: (): void => {
    message.destroy();
  },
};

export default messageUtils;

export type { MessageOptions };
