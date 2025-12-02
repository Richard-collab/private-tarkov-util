/**
 * TaskFlowDemo - 任务流程图演示页面
 * 
 * 该页面用于演示 TaskNode 组件在 React Flow 中的使用
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

/**
 * 示例任务数据
 */
const sampleTasks: TaskNode[] = [
  {
    id: 'task-1',
    type: 'task',
    position: { x: 250, y: 0 },
    data: {
      taskId: 'quest-001',
      taskGroup: '新手任务',
      trader: {
        id: 'prapor',
        name: 'Prapor',
        imageUrl: '',
      },
      taskName: '首次出击',
      objectives: [
        {
          id: 'obj-1',
          description: '在任意地图存活并撤离',
          type: 'extract',
          count: 1,
        },
        {
          id: 'obj-2',
          description: '收集 3 个止痛药',
          type: 'collect',
          count: 3,
          optional: false,
        },
      ],
      rewards: [
        { type: 'experience', value: 1000, description: '+1000 经验' },
        { type: 'money', value: 50000, description: '50,000 ₽' },
        { type: 'reputation', value: 0.02, description: 'Prapor +0.02' },
      ],
      unlockRequirements: [],
      followUpTasks: [
        { taskId: 'quest-002', taskName: '物资补给', traderName: 'Prapor' },
      ],
      minPlayerLevel: 1,
    },
  },
  {
    id: 'task-2',
    type: 'task',
    position: { x: 250, y: 450 },
    data: {
      taskId: 'quest-002',
      taskGroup: '新手任务',
      trader: {
        id: 'prapor',
        name: 'Prapor',
        imageUrl: '',
      },
      taskName: '物资补给',
      objectives: [
        {
          id: 'obj-1',
          description: '在海关找到物资箱',
          type: 'find',
          count: 1,
        },
        {
          id: 'obj-2',
          description: '将物资箱交给 Prapor',
          type: 'handover',
          count: 1,
        },
        {
          id: 'obj-3',
          description: '收集额外物资',
          type: 'collect',
          count: 5,
          optional: true,
        },
      ],
      rewards: [
        { type: 'experience', value: 2500, description: '+2500 经验' },
        { type: 'money', value: 100000, description: '100,000 ₽' },
        { type: 'item', value: 'MBSS背包', description: 'MBSS背包 x1' },
        { type: 'unlock', value: '解锁商人物品', description: '解锁 Prapor LL2' },
      ],
      unlockRequirements: [
        { type: 'task', taskId: 'quest-001', taskName: '首次出击' },
        { type: 'level', level: 5 },
      ],
      followUpTasks: [
        { taskId: 'quest-003', taskName: '深入敌后', traderName: 'Prapor' },
        { taskId: 'quest-004', taskName: '医疗援助', traderName: 'Therapist' },
      ],
      minPlayerLevel: 5,
    },
  },
  {
    id: 'task-3',
    type: 'task',
    position: { x: 0, y: 900 },
    data: {
      taskId: 'quest-003',
      taskGroup: '主线任务',
      trader: {
        id: 'prapor',
        name: 'Prapor',
        imageUrl: '',
      },
      taskName: '深入敌后',
      objectives: [
        {
          id: 'obj-1',
          description: '在工厂击杀 10 名 Scav',
          type: 'kill',
          count: 10,
        },
      ],
      rewards: [
        { type: 'experience', value: 5000, description: '+5000 经验' },
        { type: 'money', value: 200000, description: '200,000 ₽' },
      ],
      unlockRequirements: [
        { type: 'task', taskId: 'quest-002', taskName: '物资补给' },
      ],
      followUpTasks: [],
      minPlayerLevel: 8,
    },
  },
  {
    id: 'task-4',
    type: 'task',
    position: { x: 500, y: 900 },
    data: {
      taskId: 'quest-004',
      taskGroup: '医疗任务',
      trader: {
        id: 'therapist',
        name: 'Therapist',
        imageUrl: '',
      },
      taskName: '医疗援助',
      objectives: [
        {
          id: 'obj-1',
          description: '收集 5 个急救包',
          type: 'collect',
          count: 5,
        },
        {
          id: 'obj-2',
          description: '交给 Therapist',
          type: 'handover',
          count: 5,
        },
      ],
      rewards: [
        { type: 'experience', value: 3000, description: '+3000 经验' },
        { type: 'reputation', value: 0.05, description: 'Therapist +0.05' },
        { type: 'skill', value: '急救技能', description: '急救技能 +1' },
      ],
      unlockRequirements: [
        { type: 'task', taskId: 'quest-002', taskName: '物资补给' },
        { type: 'level', level: 6 },
      ],
      followUpTasks: [],
      minPlayerLevel: 6,
    },
  },
];

/**
 * 初始边（连接线）
 */
const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'task-1', target: 'task-2', animated: true },
  { id: 'e2-3', source: 'task-2', target: 'task-3', animated: true },
  { id: 'e2-4', source: 'task-2', target: 'task-4', animated: true },
];

/**
 * TaskFlowDemo 页面组件
 */
export default function TaskFlowDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(sampleTasks);
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

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 页面标题 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          任务流程图
        </Typography>
        <Typography variant="body2" color="text.secondary">
          展示任务之间的依赖关系和流程。点击任务节点查看详情。
          {selectedTask && (
            <span style={{ marginLeft: 16 }}>
              当前选中: <strong>{selectedTask}</strong>
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
