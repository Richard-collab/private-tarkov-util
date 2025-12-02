/**
 * 视口控制工具
 * Viewport control utilities
 * 
 * 提供控制 React Flow 视口的功能
 * Provides functionality to control React Flow viewport
 */

import type { ReactFlowInstance } from '@xyflow/react';

/**
 * 视口跳转选项接口
 * Pan to node options interface
 */
export interface PanToNodeOptions {
  /** 缩放级别 (默认: 1.5) */
  zoom?: number;
  /** 动画持续时间 (毫秒, 默认: 300) */
  duration?: number;
  /** 节点宽度 (用于计算中心位置) */
  nodeWidth?: number;
  /** 节点高度 (用于计算中心位置) */
  nodeHeight?: number;
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: Required<PanToNodeOptions> = {
  zoom: 1.5,
  duration: 300,
  nodeWidth: 320,
  nodeHeight: 100,
};

/**
 * 高亮节点选项接口
 * Highlight node options interface
 */
export interface HighlightNodeOptions {
  /** 高亮持续时间 (毫秒, 默认: 1500) */
  duration?: number;
  /** 闪烁次数 (默认: 2) */
  flashCount?: number;
  /** 高亮类名 */
  highlightClass?: string;
}

/**
 * 默认高亮选项
 */
const DEFAULT_HIGHLIGHT_OPTIONS: Required<HighlightNodeOptions> = {
  duration: 1500,
  flashCount: 2,
  highlightClass: 'task-node-highlight',
};

/**
 * 将视口平滑移动到指定节点并居中显示
 * Pan to a node and center it in the viewport
 * 
 * @param reactFlowInstance - React Flow 实例
 * @param nodeId - 节点 ID
 * @param options - 跳转选项
 * @returns 是否成功跳转到节点
 * 
 * @example
 * ```ts
 * const success = panToNode(reactFlowInstance, 'task-123', { zoom: 1.5, duration: 300 });
 * if (success) {
 *   console.log('成功跳转到节点');
 * }
 * ```
 */
export function panToNode(
  reactFlowInstance: ReactFlowInstance | null,
  nodeId: string,
  options: PanToNodeOptions = {}
): boolean {
  if (!reactFlowInstance) {
    return false;
  }
  
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const node = reactFlowInstance.getNode(nodeId);
  
  if (!node) {
    return false;
  }
  
  // 计算节点中心位置
  const centerX = node.position.x + opts.nodeWidth / 2;
  const centerY = node.position.y + opts.nodeHeight / 2;
  
  // 平滑移动到节点中心
  reactFlowInstance.setCenter(centerX, centerY, {
    zoom: opts.zoom,
    duration: opts.duration,
  });
  
  return true;
}

/**
 * 高亮节点（短暂闪烁或添加样式）
 * Highlight a node (brief flash or add style)
 * 
 * @param nodeId - 节点 ID
 * @param options - 高亮选项
 * 
 * @example
 * ```ts
 * highlightNode('task-123', { duration: 1500, flashCount: 2 });
 * ```
 */
export function highlightNode(
  nodeId: string,
  options: HighlightNodeOptions = {}
): void {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  
  // 查找节点对应的 DOM 元素
  const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
  
  if (!nodeElement) {
    return;
  }
  
  // 添加高亮类
  nodeElement.classList.add(opts.highlightClass);
  
  // 在持续时间后移除高亮类
  setTimeout(() => {
    nodeElement.classList.remove(opts.highlightClass);
  }, opts.duration);
}

/**
 * 跳转并高亮节点
 * Pan to a node and highlight it
 * 
 * @param reactFlowInstance - React Flow 实例
 * @param nodeId - 节点 ID
 * @param panOptions - 跳转选项
 * @param highlightOptions - 高亮选项
 * @returns 是否成功跳转到节点
 * 
 * @example
 * ```ts
 * panToNodeAndHighlight(reactFlowInstance, 'task-123');
 * ```
 */
export function panToNodeAndHighlight(
  reactFlowInstance: ReactFlowInstance | null,
  nodeId: string,
  panOptions: PanToNodeOptions = {},
  highlightOptions: HighlightNodeOptions = {}
): boolean {
  const success = panToNode(reactFlowInstance, nodeId, panOptions);
  
  if (success) {
    // 延迟高亮，等待视口动画完成
    const panDuration = panOptions.duration ?? DEFAULT_OPTIONS.duration;
    setTimeout(() => {
      highlightNode(nodeId, highlightOptions);
    }, panDuration);
  }
  
  return success;
}

/**
 * 计算节点中心位置
 * Calculate node center position
 * 
 * @param position - 节点位置 { x, y }
 * @param width - 节点宽度
 * @param height - 节点高度
 * @returns 中心位置 { x, y }
 */
export function getNodeCenter(
  position: { x: number; y: number },
  width: number = DEFAULT_OPTIONS.nodeWidth,
  height: number = DEFAULT_OPTIONS.nodeHeight
): { x: number; y: number } {
  return {
    x: position.x + width / 2,
    y: position.y + height / 2,
  };
}

export default panToNode;
