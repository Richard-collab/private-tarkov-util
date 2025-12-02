# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 任务流程图功能 (TaskFlow Features)

### 功能概述

任务流程图页面（TaskFlowDemo）提供以下功能：

1. **任务节点查看**：使用 React Flow 展示任务之间的依赖关系图
2. **任务详情面板**：单击任务节点后，右侧弹出抽屉面板展示任务详细信息
3. **奖励物品搜索**：支持按任务奖励物品名称搜索任务
4. **视角跳转**：搜索或点击任务时自动跳转到对应节点并高亮显示

### 使用方法

#### 查看任务详情
- 在流程图或左侧任务列表中**单击**任意任务
- 右侧抽屉面板将显示任务的详细信息，包括：
  - 任务名称和发布商人
  - 任务目标列表
  - 任务奖励（物品、经验、金钱等）
  - 前置任务（可点击跳转）
  - 后续任务（可点击跳转）
- 点击面板中的前置/后续任务可跳转到对应节点

#### 搜索任务
- 使用顶部搜索栏搜索任务
- 点击搜索栏左侧的切换按钮可选择搜索模式：
  - **按名称/商人搜索**（默认）：输入任务名称或商人名称
  - **按奖励物品搜索**：输入奖励物品名称（如"AK"、"医疗包"）
- 搜索支持模糊匹配（包含匹配）
- 按 **Enter** 键可直接跳转到第一个匹配任务
- 奖励搜索模式下会显示匹配结果下拉列表，点击即可跳转

#### 视角控制
- **单击节点**：选中节点并打开详情面板
- **双击节点**：聚焦放大到该节点
- 使用左下角控制按钮进行缩放和适应视图
- 使用右下角小地图快速导航

### 技术实现

- **搜索功能**：`src/utils/search.ts` 提供 `findTasksByReward()` 等搜索函数
- **视角控制**：`src/utils/viewport.ts` 提供 `panToNode()` 等视角控制函数
- **详情面板**：`src/components/TaskDetailPanel.tsx` 抽屉式详情展示组件
- **搜索栏**：`src/components/TaskSearchBar.tsx` 支持多模式搜索的输入组件
- **状态管理**：`src/context/TaskViewContext.tsx` 提供全局搜索和选择状态

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
