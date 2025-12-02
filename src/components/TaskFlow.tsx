/**
 * TaskFlow - 优化的任务流程图组件
 * 
 * 使用 React Flow 展示任务依赖关系，具有以下特性：
 * - 使用 dagre 进行 LR (左到右) 布局
 * - 支持商人过滤和搜索匹配状态
 * - 初始加载时自动聚焦到起始节点
 * - 使用轻量级节点组件提升性能
 * - 支持按奖励物品搜索任务
 * - 支持点击节点跳转并高亮
 */

import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge, ReactFlowInstance, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TaskNodeLiteComponent from './TaskNodeLite';
import type { TaskNodeData } from './TaskNodeLite';
import { getLayoutedElements, findStartNodeId, NODE_WIDTH, NODE_HEIGHT } from '../utils/layoutUtils';
import { useTaskView } from '../context/TaskViewContext';
import { panToNodeAndHighlight } from '../utils/viewport';
import { isTaskMatchedCombined } from '../utils/search';
import type { TaskData } from '../types/Task';

/**
 * TaskFlow Props
 */
interface TaskFlowProps {
  /** 原始任务节点数据 */
  rawNodes: Node<TaskData>[];
  /** 原始边数据 */
  rawEdges: Edge[];
  /** 可选的起始节点ID */
  startNodeId?: string;
  /** 节点点击回调 */
  onNodeClick?: (nodeId: string, task: TaskData) => void;
}

/**
 * 自定义节点类型映射
 */
const nodeTypes: NodeTypes = {
  taskLite: TaskNodeLiteComponent,
};

/**
 * TaskFlow 组件
 */
export default function TaskFlow({
  rawNodes,
  rawEdges,
  startNodeId,
  onNodeClick,
}: TaskFlowProps) {
  const { merchantFilter, searchTerm, rewardSearchTerm, focusTaskId, setFocusTaskId } = useTaskView();
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const hasInitialized = useRef(false);

  // 处理节点，添加匹配状态和转换为轻量级节点类型
  const processedNodes = useMemo(() => {
    return rawNodes.map((node) => {
      const matched = isTaskMatchedCombined(
        node.data,
        searchTerm,
        rewardSearchTerm,
        merchantFilter
      );
      return {
        ...node,
        type: 'taskLite',
        data: {
          ...node.data,
          matched,
        } as TaskNodeData,
      };
    });
  }, [rawNodes, merchantFilter, searchTerm, rewardSearchTerm]);

  // 处理边，根据源和目标节点的匹配状态设置样式
  const processedEdges = useMemo(() => {
    const nodeMatchMap = new Map<string, boolean>();
    processedNodes.forEach((node) => {
      nodeMatchMap.set(node.id, node.data.matched ?? true);
    });

    return rawEdges.map((edge) => {
      const sourceMatched = nodeMatchMap.get(edge.source) ?? true;
      const targetMatched = nodeMatchMap.get(edge.target) ?? true;
      const isMatched = sourceMatched && targetMatched;

      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: isMatched ? 1 : 0.2,
          stroke: isMatched ? undefined : '#999',
        },
        animated: isMatched,
      };
    });
  }, [rawEdges, processedNodes]);

  // 使用 dagre 计算 LR 布局
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(processedNodes, processedEdges, {
      rankdir: 'LR',
      nodeWidth: 320,
      nodeHeight: 100,
      nodesep: 30,
      ranksep: 80,
    });
  }, [processedNodes, processedEdges]);

  // React Flow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // 当布局计算结果变化时更新节点和边
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // 确定起始节点ID
  const effectiveStartNodeId = useMemo(() => {
    return startNodeId || findStartNodeId(rawNodes, rawEdges);
  }, [startNodeId, rawNodes, rawEdges]);

  // 初始化时聚焦到起始节点
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;

    // 延迟一帧确保节点已渲染
    requestAnimationFrame(() => {
      if (effectiveStartNodeId && !hasInitialized.current) {
        hasInitialized.current = true;
        const node = instance.getNode(effectiveStartNodeId);
        if (node) {
          instance.setCenter(
            node.position.x + 160, // 节点宽度的一半
            node.position.y + 50,  // 节点高度的一半
            { zoom: 1.2, duration: 500 }
          );
        } else {
          instance.fitView({ padding: 0.2, duration: 500 });
        }
      } else if (!hasInitialized.current) {
        hasInitialized.current = true;
        instance.fitView({ padding: 0.2, duration: 500 });
      }
    });
  }, [effectiveStartNodeId]);

  // 搜索时聚焦到第一个匹配的节点
  useEffect(() => {
    if (!reactFlowInstance.current || (!searchTerm && !rewardSearchTerm)) return;

    const firstMatchedNode = processedNodes.find((node) => node.data.matched);
    if (firstMatchedNode) {
      panToNodeAndHighlight(
        reactFlowInstance.current,
        firstMatchedNode.id,
        { zoom: 1.5, duration: 300, nodeWidth: NODE_WIDTH, nodeHeight: NODE_HEIGHT }
      );
    }
  }, [searchTerm, rewardSearchTerm, processedNodes]);

  // 响应 focusTaskId 变化，跳转并高亮对应节点
  useEffect(() => {
    if (!reactFlowInstance.current || !focusTaskId) return;

    panToNodeAndHighlight(
      reactFlowInstance.current,
      focusTaskId,
      { zoom: 1.5, duration: 300, nodeWidth: NODE_WIDTH, nodeHeight: NODE_HEIGHT }
    );

    // 清除 focusTaskId 以便下次可以再次触发跳转
    setFocusTaskId(null);
  }, [focusTaskId, setFocusTaskId]);

  // 节点点击处理
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<TaskNodeData>) => {
      if (onNodeClick) {
        onNodeClick(node.id, node.data);
      }
    },
    [onNodeClick]
  );

  // 双击节点聚焦
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<TaskNodeData>) => {
      if (reactFlowInstance.current) {
        // 使用节点尺寸常量计算中心位置
        reactFlowInstance.current.setCenter(
          node.position.x + NODE_WIDTH / 2,
          node.position.y + NODE_HEIGHT / 2,
          { zoom: 1.8, duration: 300 }
        );
      }
    },
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onInit={onInit}
      nodeTypes={nodeTypes}
      fitView={false}
      minZoom={0.1}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
    >
      <Controls />
      <MiniMap
        nodeStrokeWidth={3}
        zoomable
        pannable
        style={{ height: 120, width: 200 }}
      />
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
    </ReactFlow>
  );
}
