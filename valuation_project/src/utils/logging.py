#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日志工具模块

该模块提供了集中式的日志配置和初始化功能，
所有项目模块应该从这里导入logger进行日志记录。
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Dict, Any, Optional


# 全局logger实例
logger = None


def setup_logging(
    log_level: str = 'INFO',
    log_file: Optional[str] = None,
    log_dir: str = 'logs',
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
    format_str: str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    console_logging: bool = True
) -> logging.Logger:
    """
    设置全局日志配置
    
    Args:
        log_level: 日志级别 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: 日志文件名，如果为None则使用默认名称
        log_dir: 日志目录
        max_bytes: 单个日志文件最大字节数
        backup_count: 保留的日志文件数量
        format_str: 日志格式字符串
        console_logging: 是否输出到控制台
        
    Returns:
        配置好的logger实例
    """
    global logger
    
    # 如果logger已经存在，直接返回
    if logger is not None:
        return logger
    
    # 创建日志目录
    os.makedirs(log_dir, exist_ok=True)
    
    # 设置日志文件名
    if log_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = f"valuation_{timestamp}.log"
    
    log_file_path = os.path.join(log_dir, log_file)
    
    # 创建logger
    logger = logging.getLogger('valuation')
    logger.setLevel(getattr(logging, log_level.upper()))
    logger.propagate = False
    
    # 清空已有的handler
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # 创建格式化器
    formatter = logging.Formatter(format_str)
    
    # 添加文件handler
    file_handler = RotatingFileHandler(
        log_file_path,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # 添加控制台handler
    if console_logging:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    
    logger.info(f"日志系统初始化完成，日志文件: {log_file_path}")
    logger.info(f"日志级别: {log_level}")
    
    return logger


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    获取一个命名logger实例
    
    Args:
        name: logger名称，如果为None则返回根logger
        
    Returns:
        logger实例
    """
    global logger
    
    # 如果全局logger尚未初始化，先初始化
    if logger is None:
        setup_logging()
    
    if name is None:
        return logger
    
    # 创建子logger
    return logger.getChild(name)


def setup_logging_from_config(config: Dict[str, Any]) -> logging.Logger:
    """
    从配置字典中设置日志
    
    Args:
        config: 配置字典，包含logging配置
        
    Returns:
        配置好的logger实例
    """
    logging_config = config.get('logging', {})
    
    return setup_logging(
        log_level=logging_config.get('level', 'INFO'),
        log_file=logging_config.get('log_file'),
        log_dir=logging_config.get('log_dir', 'logs'),
        max_bytes=logging_config.get('max_bytes', 10 * 1024 * 1024),
        backup_count=logging_config.get('backup_count', 5),
        console_logging=logging_config.get('console_logging', True)
    )


# 导出logger实例
def get_default_logger() -> logging.Logger:
    """
    获取默认logger实例
    
    Returns:
        默认logger实例
    """
    return get_logger()


# 为了方便使用，可以直接导入这个logger
logger = get_default_logger()