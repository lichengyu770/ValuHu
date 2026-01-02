## 1. 问题分析

- **现状**：项目中存在多个HTML文件和React组件，它们的logo和CSS样式不一致
- **React组件**：`Sidebar.jsx`尝试导入不存在的`logo.png`文件
- **HTML文件**：每个HTML文件都有独立的logo实现，样式各不相同
- **资源文件**：`src/assets/images/`目录只有SVG文件，没有PNG格式的logo

## 2. 解决方案设计

### 2.1 准备统一的Logo资源

- 检查现有的SVG logo文件，确定使用哪个作为统一logo
- 如果需要PNG格式，将SVG转换为PNG并放置到正确位置

### 2.2 统一HTML文件的Logo和CSS

- 为所有HTML文件创建统一的导航栏模板，包含一致的logo和CSS样式
- 使用脚本批量更新所有HTML文件，确保样式一致性

### 2.3 更新React组件

- 修正`Sidebar.jsx`中的logo导入路径，使用现有的SVG文件
- 确保React组件的样式与HTML文件保持一致

## 3. 实施步骤

### 步骤1：准备Logo资源

- 检查`src/assets/images/`目录中的现有SVG文件
- 选择`app-icon-192.svg`或`app-icon-512.svg`作为统一logo
- 如需PNG格式，使用工具将SVG转换为PNG并保存为`logo.png`

### 步骤2：创建统一的导航栏模板

- 参考`index.html`中的现代导航栏设计
- 创建包含统一logo、CSS样式和导航链接的模板
- 确保模板包含响应式设计和所有必要的CSS

### 步骤3：批量更新HTML文件

- 编写脚本（基于现有的`update-nav.cjs`）来更新所有HTML文件
- 替换每个HTML文件的导航栏部分为统一模板
- 确保导航链接的`active`类正确设置

### 步骤4：更新React组件

- 修改`Sidebar.jsx`中的logo导入路径，使用现有的SVG文件
- 调整组件中的logo样式，使其与HTML文件保持一致
- 确保CSS类名和样式值统一

### 步骤5：验证和测试

- 检查所有HTML文件，确保logo和CSS样式一致
- 运行React应用，检查`Sidebar`组件的logo显示
- 测试响应式设计，确保在不同设备上显示正常

## 4. 预期成果

- 所有HTML文件使用统一的logo和CSS样式
- React组件中的logo与HTML文件保持一致
- 项目整体视觉风格统一
- 代码维护性提高，便于后续样式更新

## 5. 风险评估

- **文件更新风险**：批量更新HTML文件可能导致意外修改
  - 缓解措施：在更新前备份所有文件，使用版本控制
- **样式冲突风险**：统一样式可能与某些页面的特定需求冲突
  - 缓解措施：保留页面特定样式的灵活性，使用CSS变量
- **React组件兼容性**：更新logo路径可能导致组件错误
  - 缓解措施：在更新前测试React组件，确保logo正确显示

## 6. 工具和资源

- **文件操作**：Node.js脚本（参考`update-nav.cjs`）
- **SVG转PNG**：使用在线工具或命令行工具（如`svgexport`）
- **版本控制**：Git，用于备份和追踪更改
- **测试工具**：浏览器开发者工具，用于检查样式一致性
