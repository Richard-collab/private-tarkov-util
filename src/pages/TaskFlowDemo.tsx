/**
 * TaskFlowDemo - 任务流程图演示页面
 * 
 * 该页面用于展示从 tarkov.dev API 获取的任务数据
 * 使用 React Flow 展示任务之间的依赖关系
 * 
 * 性能优化:
 * - 使用 dagre 进行 LR (左到右) 布局预计算
 * - 使用轻量级 TaskNodeLite 组件
 * - 使用 react-window 虚拟化任务列表
 * - 使用 Context 管理过滤状态
 * - 防抖搜索避免频繁重渲染
 */

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import type { Node, Edge } from '@xyflow/react';

import { TaskViewProvider } from '../context/TaskViewContext';
import TaskFlow from '../components/TaskFlow';
import TaskListVirtual from '../components/TaskListVirtual';
import MerchantFilter from '../components/MerchantFilter';
import TaskSearchBar from '../components/TaskSearchBar';
import { taskDataArray, getRootTasks } from '../data/TaskData';
import type { TaskData } from '../types/Task';

/**
 * 根据任务数据生成 React Flow 节点
 * @param tasks - 任务数据数组
 * @returns Node 数组
 */
function generateNodes(tasks: TaskData[]): Node<TaskData>[] {
  return tasks.map((task) => ({
    id: task.taskId,
    type: 'taskLite',
    position: { x: 0, y: 0 }, // 位置由 dagre 计算
    data: task,
  }));
}

/**
 * 根据任务数据生成边（连接线）
 * @param tasks - 任务数据数组
 * @returns Edge 数组
 */
function generateEdges(tasks: TaskData[]): Edge[] {
  const edges: Edge[] = [];
  const taskSet = new Set(tasks.map((t) => t.taskId));
  
  tasks.forEach((task) => {
    const prereqTasks = task.unlockRequirements
      .filter((req) => req.type === 'task' && req.taskId && taskSet.has(req.taskId))
      .map((req) => req.taskId!);
    
    prereqTasks.forEach((prereqId) => {
      edges.push({
        id: `edge-${prereqId}-${task.taskId}`,
        source: prereqId,
        target: task.taskId,
        animated: true,
      });
    });
  });
  
  return edges;
}

/**
 * 任务流程图内部组件
 * 与 TaskViewContext 分离以便在 Provider 内部使用 hooks
 */
function TaskFlowDemoContent() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listDimensions, setListDimensions] = useState({ width: 320, height: 600 });

  // 生成节点和边（只计算一次）
  const rawNodes = useMemo(() => generateNodes(taskDataArray), []);
  const rawEdges = useMemo(() => generateEdges(taskDataArray), []);

  // 获取起始节点ID
  const startNodeId = useMemo(() => {
    const rootTasks = getRootTasks();
    return rootTasks.length > 0 ? rootTasks[0].taskId : undefined;
  }, []);

  // 获取选中的任务名称
  const selectedTaskName = useMemo(() => {
    if (!selectedTask) return null;
    const task = taskDataArray.find((t) => t.taskId === selectedTask);
    return task?.taskName || selectedTask;
  }, [selectedTask]);

  // 处理节点点击
  const handleNodeClick = useCallback((nodeId: string, task: TaskData) => {
    setSelectedTask(nodeId);
  }, []);

  // 处理列表任务点击
  const handleTaskListClick = useCallback((taskId: string) => {
    setSelectedTask(taskId);
    // 注意：实际聚焦到节点由 TaskFlow 组件的 searchTerm 变化触发
    // 这里可以通过 context 或其他方式触发聚焦
  }, []);

  // 监听容器大小变化以更新列表尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setListDimensions({
          width: 320,
          height: container.clientHeight - 120, // 减去工具栏和标题高度
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: 'calc(100vh - 48px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 页面标题和工具栏 */}
      <Paper sx={{ p: 2, mb: 1, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              任务流程图
            </Typography>
            <Typography variant="body2" color="text.secondary">
              展示 {taskDataArray.length} 个任务之间的依赖关系。
              {selectedTaskName && (
                <span style={{ marginLeft: 8 }}>
                  当前选中: <strong>{selectedTaskName}</strong>
                </span>
              )}
            </Typography>
          </Box>

          {/* 过滤器和搜索框 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <MerchantFilter tasks={taskDataArray} width={180} />
            <TaskSearchBar width={240} />
          </Box>
        </Box>
      </Paper>

      {/* 主内容区域：左侧任务列表 + 右侧流程图 */}
      <Box sx={{ flex: 1, display: 'flex', gap: 1, minHeight: 0 }}>
        {/* 左侧任务列表 */}
        <Paper
          sx={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <TaskListVirtual
            tasks={taskDataArray}
            height={listDimensions.height}
            width={listDimensions.width}
            onTaskClick={handleTaskListClick}
            selectedTaskId={selectedTask}
          />
        </Paper>

        {/* 右侧流程图 */}
        <Paper sx={{ flex: 1, minWidth: 0 }}>
          <TaskFlow
            rawNodes={rawNodes}
            rawEdges={rawEdges}
            startNodeId={startNodeId}
            onNodeClick={handleNodeClick}
          />
        </Paper>
      </Box>
    </Box>
  );
}

/**
 * TaskFlowDemo 页面组件
 */
export default function TaskFlowDemo() {
  return (
    <TaskViewProvider>
      <TaskFlowDemoContent />
    </TaskViewProvider>
  );
}
