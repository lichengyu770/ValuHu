# 房产估价系统设计系统

## 1. 设计原则

### 1.1 核心原则
- **一致性**: 统一的视觉语言和交互模式
- **清晰性**: 信息层次分明，易于理解
- **专业性**: 符合金融/房产行业的专业形象
- **易用性**: 直观的用户界面，减少认知负担
- **响应式**: 适配不同设备和屏幕尺寸
- **可访问性**: 确保所有用户都能使用

### 1.2 视觉风格
- **深色主题**: 专业、现代、减少视觉疲劳
- **橙色点缀**: 温暖、活力，突出关键操作
- **玻璃态效果**: 增强深度感和现代感
- **平滑动画**: 提升用户体验，增强交互反馈

## 2. 颜色方案

### 2.1 主色调
| 颜色名称 | 十六进制 | 用途 |
|---------|---------|------|
| 主橙色 | #ffa046 | 主要按钮、强调文本、交互元素 |
| 深橙色 | #ff7e35 | 按钮悬停、高亮状态 |
| 背景黑 | #000000 | 页面背景 |
| 背景深棕 | #1a0d08 | 卡片背景、组件背景 |

### 2.2 辅助色
| 颜色名称 | 十六进制 | 用途 |
|---------|---------|------|
| 成功绿 | #52c41a | 成功状态、正向指标 |
| 警告黄 | #faad14 | 警告状态、提示信息 |
| 错误红 | #ff4d4f | 错误状态、负面指标 |
| 信息蓝 | #1890ff | 信息提示、链接 |

### 2.3 中性色
| 颜色名称 | 十六进制 | 用途 |
|---------|---------|------|
| 白色 | #ffffff | 主要文本、标题 |
| 浅灰 | rgba(255,255,255,0.8) | 次要文本 |
| 中灰 | rgba(255,255,255,0.6) | 辅助文本、提示信息 |
| 深灰 | rgba(255,255,255,0.4) | 边框、分割线 |

## 3. 排版

### 3.1 字体家族
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

### 3.2 字体大小
| 级别 | 大小 | 行高 | 用途 |
|------|------|------|------|
| 标题1 | 2.5rem | 1.2 | 页面主标题 |
| 标题2 | 2rem | 1.2 | 卡片标题、 section标题 |
| 标题3 | 1.5rem | 1.3 | 子标题 |
| 正文 | 1rem | 1.6 | 主要内容文本 |
| 辅助文本 | 0.875rem | 1.5 | 提示、说明文本 |
| 小字 | 0.75rem | 1.4 | 标签、页脚文本 |

### 3.3 字重
| 字重 | 用途 |
|------|------|
| 700 (Bold) | 标题、重要按钮 |
| 600 (Semibold) | 次要标题、强调文本 |
| 500 (Medium) | 正文、普通按钮 |
| 400 (Regular) | 辅助文本、说明文字 |

## 4. 间距系统

### 4.1 基础间距单位
```css
:root {
  --spacing-unit: 4px;
}
```

### 4.2 常用间距
| 名称 | 尺寸 | 用途 |
|------|------|------|
| xs | 8px | 小间距，组件内部元素 |
| sm | 16px | 中间距，组件之间 |
| md | 24px | 大间距，区块之间 |
| lg | 32px | 超大间距，主要内容区域 |
| xl | 48px | 页面级间距，重要区域分隔 |

## 5. 圆角

| 名称 | 尺寸 | 用途 |
|------|------|------|
| sm | 4px | 小按钮、输入框 |
| md | 8px | 卡片、按钮、弹窗 |
| lg | 12px | 模态框、大卡片 |
| xl | 16px | 特殊容器、hero区域 |
| round | 50% | 圆形按钮、头像 |

## 6. 阴影

### 6.1 基础阴影
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
```

### 6.2 悬停阴影
```css
box-shadow: 0 8px 24px rgba(255, 160, 70, 0.2);
```

### 6.3 玻璃态阴影
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

## 7. 组件样式

### 7.1 按钮

#### 主要按钮
```css
.btn-primary {
  background: linear-gradient(135deg, #ffa046, #ff7e35);
  border: none;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 160, 70, 0.3);
  transition: all 0.3s ease;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 160, 70, 0.4);
}
```

#### 次要按钮
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 160, 70, 0.2);
  color: white;
  transition: all 0.3s ease;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
}

.btn-secondary:hover {
  background: rgba(255, 160, 70, 0.2);
  border-color: rgba(255, 160, 70, 0.6);
  box-shadow: 0 0 20px rgba(255, 160, 70, 0.4);
}
```

### 7.2 卡片

#### 基础卡片
```css
.card {
  background: rgba(26, 13, 8, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 160, 70, 0.2);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 160, 70, 0.2);
  border-color: rgba(255, 160, 70, 0.4);
}
```

#### 统计卡片
```css
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 160, 70, 0.2);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 160, 70, 0.2);
  border-color: rgba(255, 160, 70, 0.4);
}
```

### 7.3 输入框

#### 基础输入框
```css
.input {
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid rgba(255, 160, 70, 0.3);
  border-radius: 8px;
  background: rgba(26, 13, 8, 0.6);
  color: #ffffff;
  transition: all 0.2s ease;
  outline: none;
  width: 100%;
}

.input:focus {
  border-color: rgba(255, 160, 70, 0.8);
  box-shadow: 0 0 0 3px rgba(255, 160, 70, 0.1);
}
```

### 7.4 导航

#### 导航项
```css
.nav-item {
  position: relative;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.nav-item:hover,
.nav-item.active {
  color: #ffa046;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  width: 0;
  height: 2px;
  background: #ffa046;
  transition: width 0.2s ease;
}

.nav-item:hover::after,
.nav-item.active::after {
  width: calc(100% - 48px);
}
```

## 8. 动画效果

### 8.1 基础动画
- **淡入淡出**: `fadeIn`, `fadeOut`
- **滑动**: `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`
- **缩放**: `scaleIn`, `scaleOut`
- **旋转**: `spin`
- **脉冲**: `pulse`

### 8.2 交互反馈
- **按钮悬停**: 轻微上浮，阴影增强
- **卡片悬停**: 轻微上浮，边框变色
- **输入框聚焦**: 边框变色，外发光效果
- **导航项**: 下划线动画

## 9. 响应式设计

### 9.1 断点
| 断点名称 | 宽度 | 设备类型 |
|---------|------|----------|
| 移动端 | < 768px | 手机 |
| 平板 | 768px - 1023px | 平板设备 |
| 桌面 | 1024px + | 桌面显示器 |

### 9.2 响应式策略
- **流式布局**: 使用百分比和flexbox/grid
- **内容优先级**: 在小屏幕上隐藏非关键内容
- **调整间距**: 小屏幕上减少间距
- **调整字体大小**: 使用clamp()函数实现响应式字体
- **调整布局**: 从多列变为单列

## 10. 图标系统

### 10.1 图标库
- 使用 Ant Design Icons
- 统一图标风格和大小
- 保持图标与文本的对齐

### 10.2 图标大小
| 尺寸 | 用途 |
|------|------|
| 16px | 文本内图标 |
| 20px | 按钮图标 |
| 24px | 导航图标 |
| 32px | 大图标、卡片图标 |
| 48px | 英雄区域图标 |

## 11. 可访问性

### 11.1 颜色对比度
- 确保文本与背景的对比度符合WCAG AA标准
- 主要文本: 至少4.5:1
- 大文本(18pt+): 至少3:1

### 11.2 键盘导航
- 所有交互元素都可以通过键盘访问
- 清晰的焦点状态
- 合理的Tab顺序

### 11.3 屏幕阅读器支持
- 适当的ARIA属性
- 语义化HTML结构
- 清晰的文本描述

## 12. 设计系统使用指南

### 12.1 组件使用
- 优先使用设计系统中的组件
- 保持组件的一致性
- 不要修改组件的核心样式

### 12.2 颜色使用
- 严格遵循颜色方案
- 不要随意创建新的颜色
- 确保颜色使用的正确性

### 12.3 排版使用
- 遵循字体大小和字重规范
- 保持文本的可读性
- 建立清晰的信息层次

### 12.4 间距使用
- 使用设计系统中的间距单位
- 保持间距的一致性
- 建立清晰的视觉节奏

## 13. 设计系统维护

### 13.1 更新流程
- 设计系统的更新需要经过评审
- 更新后需要通知团队成员
- 确保所有组件都能平滑过渡

### 13.2 版本控制
- 对设计系统进行版本管理
- 记录所有变更
- 提供迁移指南

### 13.3 文档维护
- 保持文档的更新
- 提供示例和使用说明
- 定期审查和改进

## 14. 设计资源

### 14.1 设计文件
- Figma设计文件链接
- Sketch设计文件链接

### 14.2 图标库
- Ant Design Icons文档
- 自定义图标库

### 14.3 组件库
- 组件库文档
- 组件使用示例

## 15. 设计系统推广

### 15.1 培训
- 定期举办设计系统培训
- 分享最佳实践
- 提供一对一支持

### 15.2 反馈机制
- 建立设计系统反馈渠道
- 定期收集反馈
- 持续改进设计系统

### 15.3 激励机制
- 鼓励团队成员使用设计系统
- 认可和奖励优秀的设计系统使用
- 建立设计系统大使

---

# 房产估价系统设计系统 v1.0

*最后更新: 2025年12月22日*
*版本: 1.0*
