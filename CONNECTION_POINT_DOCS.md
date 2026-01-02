# 连接点功能使用文档

## 概述

连接点（Connection Point）是一个轻量级的跨页面通信和数据同步解决方案，为多页应用提供类似单页应用的数据共享和通信能力。通过LocalStorage和事件系统，实现不同标签页或窗口之间的实时数据同步和消息传递。

## 功能特性

- **跨页面消息传递**：在不同标签页或窗口之间发送和接收消息
- **实时数据同步**：共享和同步数据状态，保持各页面数据一致性
- **页面连接管理**：检测和管理已打开的页面，获取页面列表
- **事件系统**：支持自定义事件监听和触发
- **性能优化**：自动管理消息队列和清理机制

## 快速开始

### 引入连接点脚本

在需要使用连接点功能的页面中引入以下脚本：

```html
<!-- 引入连接点脚本 -->
<script src="connection-point.js"></script>

<!-- 页面初始化脚本 -->
<script>
  document.addEventListener('DOMContentLoaded', function () {
    // 检查连接点是否已加载
    if (window.connectionPoint) {
      console.log('连接点已加载，可以使用');

      // 初始化连接点功能
      // 连接点会自动初始化，无需额外调用
    }
  });
</script>
```

### 使用模板创建新页面

推荐使用已配置好连接点的页面模板创建新页面：

```html
<!-- 使用page-template.html作为基础，它已包含连接点的标准配置 -->
```

## API参考

### 1. 连接状态检查

#### `isAvailable()`

检查连接点功能是否可用。

**返回值**：Boolean - 连接点是否可用

**使用示例**：

```javascript
if (window.connectionPoint.isAvailable()) {
  console.log('连接点功能可用');
} else {
  console.log('连接点功能不可用');
}
```

#### `getVersion()`

获取连接点的版本信息。

**返回值**：String - 版本号

**使用示例**：

```javascript
const version = window.connectionPoint.getVersion();
console.log('连接点版本:', version);
```

### 2. 消息传递

#### `sendMessage(message)`

发送消息到所有其他连接的页面。

**参数**：

- `message` (String|Object) - 要发送的消息内容

**使用示例**：

```javascript
// 发送字符串消息
window.connectionPoint.sendMessage('Hello from Page A');

// 发送对象消息
window.connectionPoint.sendMessage({
  type: 'notification',
  title: '新消息',
  content: '您有一条新消息',
});
```

#### `on('message', callback)`

监听接收到的消息。

**参数**：

- `callback` (Function) - 消息处理函数，接收一个包含消息数据的对象

**使用示例**：

```javascript
window.connectionPoint.on('message', function (data) {
  console.log('收到消息:', data.content);
  // 处理接收到的消息
});
```

### 3. 数据同步

#### `syncData(key, value)`

同步数据到所有连接的页面。

**参数**：

- `key` (String) - 数据的键名
- `value` (Any) - 要同步的数据值

**使用示例**：

```javascript
// 同步用户信息
window.connectionPoint.syncData('userInfo', {
  id: 123,
  name: '张三',
  role: 'admin',
});

// 清除数据（设置为null）
window.connectionPoint.syncData('userInfo', null);
```

#### `get(key)`

获取已同步的数据。

**参数**：

- `key` (String) - 要获取的数据键名

**返回值**：Any - 存储的数据值，如果不存在则返回undefined

**使用示例**：

```javascript
const userInfo = window.connectionPoint.get('userInfo');
if (userInfo) {
  console.log('用户信息:', userInfo);
}
```

#### `on('dataUpdated', callback)`

监听数据更新事件。

**参数**：

- `callback` (Function) - 数据更新处理函数，接收包含key、value和source的事件对象

**使用示例**：

```javascript
window.connectionPoint.on('dataUpdated', function (event) {
  console.log(`数据更新: ${event.key}`, event.value);
  console.log('数据来源:', event.source); // 'local' 或 'remote'

  if (event.key === 'userInfo') {
    // 更新UI上的用户信息
    updateUserInterface(event.value);
  }
});
```

### 4. 页面管理

#### `getConnectedPages()`

获取所有已连接的页面列表。

**返回值**：Array - 页面信息对象数组，每个对象包含title、url等信息

**使用示例**：

```javascript
const pages = window.connectionPoint.getConnectedPages();
console.log('已连接的页面数量:', pages.length);
pages.forEach((page) => {
  console.log(`页面标题: ${page.title}, URL: ${page.url}`);
});
```

#### `on('pageConnected', callback)`

监听新页面连接事件。

**参数**：

- `callback` (Function) - 页面连接处理函数，接收页面信息对象

**使用示例**：

```javascript
window.connectionPoint.on('pageConnected', function (pageInfo) {
  console.log('新页面已连接:', pageInfo.title);
});
```

#### `on('pageDisconnected', callback)`

监听页面断开连接事件。

**参数**：

- `callback` (Function) - 页面断开处理函数，接收页面信息对象

**使用示例**：

```javascript
window.connectionPoint.on('pageDisconnected', function (pageInfo) {
  console.log('页面已断开:', pageInfo.title);
});
```

## 事件系统

连接点提供了灵活的事件系统，可以监听和触发自定义事件。

### `on(eventName, callback)`

注册事件监听器。

**参数**：

- `eventName` (String) - 事件名称
- `callback` (Function) - 事件处理函数

### `off(eventName, callback)`

移除事件监听器。

**参数**：

- `eventName` (String) - 事件名称
- `callback` (Function) - 要移除的事件处理函数

### `trigger(eventName, data)`

触发自定义事件。

**参数**：

- `eventName` (String) - 事件名称
- `data` (Any) - 事件数据

**使用示例**：

```javascript
// 注册自定义事件监听
function handleCustomEvent(data) {
  console.log('自定义事件触发:', data);
}
window.connectionPoint.on('customEvent', handleCustomEvent);

// 触发自定义事件
window.connectionPoint.trigger('customEvent', { message: 'Hello' });

// 移除事件监听
window.connectionPoint.off('customEvent', handleCustomEvent);
```

## 错误处理

连接点内置了错误处理机制，可以通过监听错误事件来处理潜在的问题。

```javascript
window.connectionPoint.on('error', function (error) {
  console.error('连接点错误:', error);
  // 执行错误处理逻辑
});
```

## 最佳实践

### 1. 数据序列化

在同步复杂对象时，确保数据可以正确序列化和反序列化：

```javascript
// 正确的做法：使用可序列化的数据结构
const serializableData = {
  id: 1,
  name: '测试',
  items: [1, 2, 3],
  meta: { version: '1.0' },
};

// 避免：包含函数、DOM元素或循环引用的对象
const badData = {
  process: function () {}, // 不可序列化
  element: document.body, // 不可序列化
  circular: null, // 循环引用
};
badData.circular = badData;
```

### 2. 数据命名空间

为了避免数据键名冲突，建议使用命名空间前缀：

```javascript
// 推荐：使用命名空间前缀
window.connectionPoint.syncData('user:profile', userData);
window.connectionPoint.syncData('app:settings', appSettings);
window.connectionPoint.syncData('valuation:result', valuationResult);
```

### 3. 性能考虑

- **避免频繁同步大量数据**：只同步必要的数据，避免频繁更新大对象
- **使用事件过滤**：在处理数据更新事件时，根据key进行过滤
- **清理不再需要的数据**：当数据不再需要时，将其设置为null以释放存储空间

### 4. 页面生命周期管理

确保在页面卸载前适当清理事件监听器：

```javascript
window.addEventListener('beforeunload', function () {
  // 移除事件监听器
  window.connectionPoint.off('dataUpdated', dataUpdateHandler);
  window.connectionPoint.off('message', messageHandler);

  // 清理临时数据
  window.connectionPoint.syncData('temp:session', null);
});
```

## 测试与调试

连接点提供了专门的测试工具和演示页面，用于验证功能和调试问题。

### 测试页面

- **test-connection.html**：基础功能测试页面
- **connection-showcase.html**：全面功能展示页面
- **valuation-demo.html**：实际业务场景演示页面

### 调试技巧

1. **打开多个标签页**：在不同标签页中打开测试页面，验证通信和同步功能
2. **使用开发者工具**：在控制台查看日志输出和事件触发
3. **检查LocalStorage**：监控LocalStorage中的`__connection_point__`数据变化

## 浏览器兼容性

连接点功能支持所有现代浏览器，包括：

- Chrome 40+
- Firefox 35+
- Safari 10+
- Edge 16+

注意：需要浏览器支持LocalStorage和StorageEvent API。

## 常见问题

### Q: 为什么在某些浏览器中功能不工作？

A: 检查浏览器是否支持LocalStorage和StorageEvent API，以及是否在隐私模式下（某些浏览器在隐私模式下限制LocalStorage）。

### Q: 消息发送后没有被接收？

A: 确保接收页面已经加载并正确注册了消息监听器，同时检查发送的消息格式是否正确。

### Q: 数据同步有延迟？

A: StorageEvent的传播可能存在轻微延迟，这是正常现象。对于实时性要求高的场景，可以考虑使用其他通信方式。

## 版本历史

- **v1.0.0** - 初始版本，实现基础的跨页面通信和数据同步功能

## 支持与反馈

如有任何问题或建议，请通过以下方式联系我们：

- 技术支持邮箱：support@example.com
- 反馈页面：[feedback.html](feedback.html)

---

_文档更新日期：2024年_
