/**
 * 视口工具函数测试
 * Tests for viewport utility functions
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { panToNode, highlightNode, getNodeCenter, panToNodeAndHighlight } from './viewport';
import type { ReactFlowInstance } from '@xyflow/react';

/**
 * 创建模拟的 ReactFlowInstance
 */
function createMockReactFlowInstance(nodeExists: boolean = true): ReactFlowInstance {
  return {
    getNode: vi.fn().mockReturnValue(
      nodeExists
        ? { id: 'test-node', position: { x: 100, y: 200 } }
        : undefined
    ),
    setCenter: vi.fn(),
    fitView: vi.fn(),
    getNodes: vi.fn().mockReturnValue([]),
    getEdges: vi.fn().mockReturnValue([]),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
    addNodes: vi.fn(),
    addEdges: vi.fn(),
    toObject: vi.fn(),
    getViewport: vi.fn(),
    setViewport: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomTo: vi.fn(),
    screenToFlowPosition: vi.fn(),
    flowToScreenPosition: vi.fn(),
    getIntersectingNodes: vi.fn(),
    isNodeIntersecting: vi.fn(),
    deleteElements: vi.fn(),
    getInternalNode: vi.fn(),
    updateNode: vi.fn(),
    updateNodeData: vi.fn(),
  } as unknown as ReactFlowInstance;
}

describe('panToNode', () => {
  it('应该在 instance 为 null 时返回 false', () => {
    const result = panToNode(null, 'test-node');
    expect(result).toBe(false);
  });

  it('应该在节点不存在时返回 false', () => {
    const instance = createMockReactFlowInstance(false);
    const result = panToNode(instance, 'non-existent-node');
    expect(result).toBe(false);
    expect(instance.getNode).toHaveBeenCalledWith('non-existent-node');
    expect(instance.setCenter).not.toHaveBeenCalled();
  });

  it('应该在节点存在时返回 true 并调用 setCenter', () => {
    const instance = createMockReactFlowInstance(true);
    const result = panToNode(instance, 'test-node');
    expect(result).toBe(true);
    expect(instance.getNode).toHaveBeenCalledWith('test-node');
    expect(instance.setCenter).toHaveBeenCalled();
  });

  it('应该使用默认选项计算正确的中心位置', () => {
    const instance = createMockReactFlowInstance(true);
    panToNode(instance, 'test-node');
    
    // 默认 nodeWidth=320, nodeHeight=100
    // 节点位置 x=100, y=200
    // 中心位置应该是 x=100+160=260, y=200+50=250
    expect(instance.setCenter).toHaveBeenCalledWith(
      260, // 100 + 320/2
      250, // 200 + 100/2
      expect.objectContaining({
        zoom: 1.5,
        duration: 300,
      })
    );
  });

  it('应该使用自定义选项', () => {
    const instance = createMockReactFlowInstance(true);
    panToNode(instance, 'test-node', {
      zoom: 2,
      duration: 500,
      nodeWidth: 400,
      nodeHeight: 200,
    });
    
    // 中心位置应该是 x=100+200=300, y=200+100=300
    expect(instance.setCenter).toHaveBeenCalledWith(
      300, // 100 + 400/2
      300, // 200 + 200/2
      expect.objectContaining({
        zoom: 2,
        duration: 500,
      })
    );
  });
});

describe('highlightNode', () => {
  beforeEach(() => {
    // 清理 DOM
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  it('应该给节点添加高亮类', () => {
    // 创建模拟的节点元素
    const nodeElement = document.createElement('div');
    nodeElement.setAttribute('data-id', 'test-node');
    document.body.appendChild(nodeElement);

    highlightNode('test-node');
    
    expect(nodeElement.classList.contains('task-node-highlight')).toBe(true);
  });

  it('应该在持续时间后移除高亮类', () => {
    const nodeElement = document.createElement('div');
    nodeElement.setAttribute('data-id', 'test-node');
    document.body.appendChild(nodeElement);

    highlightNode('test-node', { duration: 1000 });
    
    expect(nodeElement.classList.contains('task-node-highlight')).toBe(true);
    
    // 快进时间
    vi.advanceTimersByTime(1000);
    
    expect(nodeElement.classList.contains('task-node-highlight')).toBe(false);
  });

  it('应该支持自定义高亮类名', () => {
    const nodeElement = document.createElement('div');
    nodeElement.setAttribute('data-id', 'test-node');
    document.body.appendChild(nodeElement);

    highlightNode('test-node', { highlightClass: 'custom-highlight' });
    
    expect(nodeElement.classList.contains('custom-highlight')).toBe(true);
  });

  it('应该在节点不存在时不抛出错误', () => {
    expect(() => highlightNode('non-existent-node')).not.toThrow();
  });
});

describe('getNodeCenter', () => {
  it('应该计算正确的中心位置', () => {
    const center = getNodeCenter({ x: 100, y: 200 }, 320, 100);
    expect(center).toEqual({ x: 260, y: 250 });
  });

  it('应该使用默认尺寸', () => {
    const center = getNodeCenter({ x: 0, y: 0 });
    // 默认 width=320, height=100
    expect(center).toEqual({ x: 160, y: 50 });
  });

  it('应该处理负坐标', () => {
    const center = getNodeCenter({ x: -100, y: -200 }, 320, 100);
    expect(center).toEqual({ x: 60, y: -150 });
  });
});

describe('panToNodeAndHighlight', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  it('应该在节点不存在时返回 false', () => {
    const instance = createMockReactFlowInstance(false);
    const result = panToNodeAndHighlight(instance, 'non-existent-node');
    expect(result).toBe(false);
  });

  it('应该先平移再高亮', () => {
    const nodeElement = document.createElement('div');
    nodeElement.setAttribute('data-id', 'test-node');
    document.body.appendChild(nodeElement);

    const instance = createMockReactFlowInstance(true);
    const result = panToNodeAndHighlight(instance, 'test-node', { duration: 300 });
    
    expect(result).toBe(true);
    expect(instance.setCenter).toHaveBeenCalled();
    
    // 高亮应该在平移动画完成后才添加
    expect(nodeElement.classList.contains('task-node-highlight')).toBe(false);
    
    // 等待平移动画完成
    vi.advanceTimersByTime(300);
    
    expect(nodeElement.classList.contains('task-node-highlight')).toBe(true);
  });
});
