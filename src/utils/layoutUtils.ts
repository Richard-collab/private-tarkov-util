/**
 * Layout utility using dagre for LR (left-to-right) graph layout
 * 
 * 使用 dagre 库计算任务图的自动布局
 */

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

/**
 * 节点和边的布局配置
 */
interface LayoutOptions {
  /** 节点宽度 */
  nodeWidth?: number;
  /** 节点高度 */
  nodeHeight?: number;
  /** 排列方向: 'TB' | 'BT' | 'LR' | 'RL' */
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  /** 节点之间的水平间距 */
  nodesep?: number;
  /** 层级之间的垂直间距 */
  ranksep?: number;
}

/**
 * 默认布局配置
 */
const defaultOptions: Required<LayoutOptions> = {
  nodeWidth: 350,
  nodeHeight: 180,
  rankdir: 'LR',
  nodesep: 50,
  ranksep: 100,
};

/**
 * 导出节点默认尺寸，供其他组件使用
 */
export const NODE_WIDTH = defaultOptions.nodeWidth;
export const NODE_HEIGHT = defaultOptions.nodeHeight;

/**
 * 使用 dagre 计算节点和边的布局位置
 * 
 * @param nodes - React Flow 节点数组
 * @param edges - React Flow 边数组
 * @param options - 布局配置选项
 * @returns 带有计算位置的节点和边数组
 * 
 * @example
 * ```tsx
 * const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
 *   rawNodes,
 *   rawEdges,
 *   { rankdir: 'LR' }
 * );
 * ```
 */
export function getLayoutedElements<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node<T>[]; edges: Edge[] } {
  const opts = { ...defaultOptions, ...options };
  
  // 创建 dagre 图实例
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // 设置图的全局配置
  dagreGraph.setGraph({
    rankdir: opts.rankdir,
    nodesep: opts.nodesep,
    ranksep: opts.ranksep,
  });

  // 添加节点到 dagre 图
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  });

  // 添加边到 dagre 图
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 计算布局
  dagre.layout(dagreGraph);

  // 获取计算后的节点位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      position: {
        // dagre 返回的是节点中心位置，需要转换为左上角位置
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * 查找起始节点（没有前置任务的节点）
 * 
 * @param nodes - 节点数组
 * @param edges - 边数组
 * @returns 起始节点ID，如果没有找到则返回第一个节点的ID或 undefined
 */
export function findStartNodeId<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[]
): string | undefined {
  if (nodes.length === 0) return undefined;

  // 找出所有目标节点（有入边的节点）
  const targetNodeIds = new Set(edges.map((edge) => edge.target));
  
  // 找出没有入边的节点（起始节点）
  const startNodes = nodes.filter((node) => !targetNodeIds.has(node.id));
  
  // 返回第一个起始节点，如果没有则返回第一个节点
  return startNodes.length > 0 ? startNodes[0].id : nodes[0].id;
}

export default getLayoutedElements;
