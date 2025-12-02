/**
 * TaskFlowDemo - 任务流程图演示页面
 * 
 * 该页面用于展示从 tarkov.dev API 获取的任务数据
 * 使用 React Flow 展示任务之间的依赖关系
 */

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography, Paper } from '@mui/material';
import TaskNodeComponent from '../components/TaskNode';
import type { TaskNode } from '../components/TaskNode';
import type { Edge, Connection, NodeTypes } from '@xyflow/react';
import { taskDataArray } from '../data/TaskData';
import type { TaskData } from '../types/Task';

/**
 * 为任务节点计算布局位置
 * @param tasks - 任务数据数组
 * @returns 带位置信息的 TaskNode 数组
 */
function layoutTasks(tasks: TaskData[]): TaskNode[] {
  // 构建任务层级映射（基于前置任务数量）
  const taskLevelMap = new Map<string, number>();
  const taskMap = new Map<string, TaskData>();
  
  tasks.forEach((task) => {
    taskMap.set(task.taskId, task);
  });
  
  // 计算每个任务的层级（深度优先搜索）
  function getTaskLevel(taskId: string, visited: Set<string> = new Set()): number {
    if (visited.has(taskId)) return 0;
    visited.add(taskId);
    
    if (taskLevelMap.has(taskId)) {
      return taskLevelMap.get(taskId)!;
    }
    
    const task = taskMap.get(taskId);
    if (!task) return 0;
    
    const prereqTasks = task.unlockRequirements
      .filter((req) => req.type === 'task' && req.taskId)
      .map((req) => req.taskId!);
    
    if (prereqTasks.length === 0) {
      taskLevelMap.set(taskId, 0);
      return 0;
    }
    
    const maxPrereqLevel = Math.max(
      ...prereqTasks.map((prereqId) => getTaskLevel(prereqId, new Set(visited)))
    );
    const level = maxPrereqLevel + 1;
    taskLevelMap.set(taskId, level);
    return level;
  }
  
  // 计算所有任务的层级
  tasks.forEach((task) => getTaskLevel(task.taskId));
  
  // 按层级分组
  const levelGroups = new Map<number, TaskData[]>();
  tasks.forEach((task) => {
    const level = taskLevelMap.get(task.taskId) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(task);
  });
  
  // 生成带位置的节点
  const NODE_HEIGHT = 500; // 节点垂直间距
  const NODE_WIDTH = 450;  // 节点水平间距
  
  const nodes: TaskNode[] = [];
  
  levelGroups.forEach((tasksInLevel, level) => {
    const yPosition = level * NODE_HEIGHT;
    const totalWidth = tasksInLevel.length * NODE_WIDTH;
    const startX = -totalWidth / 2 + NODE_WIDTH / 2;
    
    tasksInLevel.forEach((task, index) => {
      nodes.push({
        id: task.taskId,
        type: 'task',
        position: { x: startX + index * NODE_WIDTH, y: yPosition },
        data: task,
      });
    });
  });
  
  return nodes;
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
 * 从 taskDataArray 生成初始节点
 */
const initialNodes: TaskNode[] = layoutTasks(taskDataArray);

/**
 * 从 taskDataArray 生成初始边
 */
const initialEdges: Edge[] = generateEdges(taskDataArray);

/**
 * TaskFlowDemo 页面组件
 */
export default function TaskFlowDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // 自定义节点类型
  const nodeTypes: NodeTypes = useMemo(() => ({
    task: TaskNodeComponent,
  }), []);

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 处理节点点击
  const onNodeClick = useCallback((_event: React.MouseEvent, node: TaskNode) => {
    setSelectedTask(node.data.taskId);
  }, []);

  // 获取选中的任务名称
  const selectedTaskName = useMemo(() => {
    if (!selectedTask) return null;
    const task = taskDataArray.find((t) => t.taskId === selectedTask);
    return task?.taskName || selectedTask;
  }, [selectedTask]);

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 页面标题 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          任务流程图
        </Typography>
        <Typography variant="body2" color="text.secondary">
          展示 {taskDataArray.length} 个任务之间的依赖关系和流程。点击任务节点查看详情。
          {selectedTaskName && (
            <span style={{ marginLeft: 16 }}>
              当前选中: <strong>{selectedTaskName}</strong>
            </span>
          )}
        </Typography>
      </Paper>

      {/* React Flow 画布 */}
      <Box sx={{ flex: 1, minHeight: 600 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </Box>
    </Box>
  );
}
