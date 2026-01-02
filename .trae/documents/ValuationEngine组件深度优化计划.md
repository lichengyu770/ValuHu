# ValuationEngine组件深度优化计划

## 1. 组件结构优化
将ValuationEngine拆分为更小的子组件，提高代码的可维护性和复用性：

### 1.1 拆分方案
- **StepNavigation**：提取步骤导航部分，负责多步骤流程的显示和交互
- **SmartSuggestions**：提取智能建议卡片，负责展示智能建议和推荐模板
- **ValuationForm**：提取估价参数输入表单，包括模板管理工具栏
- **TemplateManager**：提取模板管理功能，包括模板选择、保存和删除
- **Modals**：将各种模态框拆分为独立组件
  - ShareModal：分享功能模态框
  - HistoryModal：历史记录详情模态框
  - SampleModal：样本展示模态框

### 1.2 组件目录结构
```
src/pages/ValuationEngine/
├── index.tsx              # 主组件，负责状态管理和组件协调
├── StepNavigation.tsx     # 步骤导航组件
├── SmartSuggestions.tsx   # 智能建议组件
├── ValuationForm.tsx      # 估价参数输入表单
├── TemplateManager.tsx    # 模板管理组件
└── modals/
    ├── ShareModal.tsx     # 分享模态框
    ├── HistoryModal.tsx   # 历史记录模态框
    └── SampleModal.tsx    # 样本模态框
```

## 2. useEffect依赖优化
使用useCallback包装依赖项中使用的函数，确保依赖数组正确，避免不必要的重渲染：

### 2.1 需要优化的函数
- `handleValuationSubmit`
- `fetchSmartSuggestions`
- `handleRealTimeValuation`
- `autoSaveForm`
- `fetchTemplates`
- `loadSharedResult`

### 2.2 优化方案
为每个在useEffect依赖数组中使用的函数添加useCallback包装，确保函数引用的稳定性。

## 3. 重复逻辑优化
提取重复逻辑为可复用的函数，减少代码冗余：

### 3.1 重复逻辑识别
- 错误处理逻辑：多处使用`message.error`和类型检查
- 报告生成逻辑：HTML、PDF、Excel报告生成有相似结构
- 模态框状态管理：各种模态框的显示/隐藏逻辑
- 本地存储操作：localStorage的get/set操作

### 3.2 提取方案
- 创建`useErrorHandling`自定义Hook，统一处理错误
- 提取`generateReport`函数，封装报告生成的通用逻辑
- 提取`useModalState`自定义Hook，管理模态框状态
- 提取`useLocalStorage`自定义Hook，封装本地存储操作

## 4. 其他优化

### 4.1 类型定义优化
将类型定义提取到单独的文件中，便于管理和复用：
- 创建`src/types/valuation.ts`文件，存放所有估价相关的类型定义

### 4.2 状态管理优化
考虑将复杂状态迁移到Zustand store中，提高状态管理的可维护性：
- 创建`src/stores/valuationStore.ts`，管理估价相关的状态

## 5. 优化步骤

1. **创建类型定义文件**：将类型定义提取到单独的文件
2. **拆分组件**：按照拆分方案创建各个子组件
3. **优化useEffect依赖**：使用useCallback包装函数
4. **提取重复逻辑**：创建自定义Hook和通用函数
5. **优化状态管理**：（可选）迁移到Zustand store
6. **测试验证**：确保所有功能正常工作
7. **运行lint和build**：验证代码质量

## 6. 预期效果

- 代码结构更加清晰，便于维护和扩展
- 组件复用性提高，减少代码冗余
- 性能优化，减少不必要的重渲染
- 类型系统更加完善，便于管理
- 错误处理更加统一，提高用户体验