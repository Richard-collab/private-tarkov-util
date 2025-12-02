/**
 * TaskViewContext - 任务视图上下文
 * 
 * 提供任务过滤和搜索的全局状态管理
 * Provides global state management for task filtering and search
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

/**
 * 任务视图上下文值接口
 * Task view context value interface
 */
interface TaskViewContextValue {
  /** 当前选中的商人过滤器 (null = 全部) */
  merchantFilter: string | null;
  /** 设置商人过滤器 */
  setMerchantFilter: (merchant: string | null) => void;
  /** 当前搜索词 */
  searchTerm: string;
  /** 设置搜索词 */
  setSearchTerm: (term: string) => void;
  /** 奖励搜索词 */
  rewardSearchTerm: string;
  /** 设置奖励搜索词 */
  setRewardSearchTerm: (term: string) => void;
  /** 当前选中的任务ID */
  selectedTaskId: string | null;
  /** 设置选中的任务ID */
  setSelectedTaskId: (taskId: string | null) => void;
  /** 需要跳转到的任务ID（用于触发视口跳转） */
  focusTaskId: string | null;
  /** 设置需要跳转到的任务ID */
  setFocusTaskId: (taskId: string | null) => void;
  /** 清除所有过滤器 */
  clearFilters: () => void;
}

/**
 * 创建上下文
 */
const TaskViewContext = createContext<TaskViewContextValue | null>(null);

/**
 * TaskViewProvider Props
 */
interface TaskViewProviderProps {
  children: ReactNode;
}

/**
 * TaskViewProvider - 任务视图上下文提供者
 * 
 * @param children - 子组件
 */
export function TaskViewProvider({ children }: TaskViewProviderProps) {
  const [merchantFilter, setMerchantFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [rewardSearchTerm, setRewardSearchTerm] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);

  const clearFilters = useCallback(() => {
    setMerchantFilter(null);
    setSearchTerm('');
    setRewardSearchTerm('');
  }, []);

  const value = useMemo<TaskViewContextValue>(() => ({
    merchantFilter,
    setMerchantFilter,
    searchTerm,
    setSearchTerm,
    rewardSearchTerm,
    setRewardSearchTerm,
    selectedTaskId,
    setSelectedTaskId,
    focusTaskId,
    setFocusTaskId,
    clearFilters,
  }), [merchantFilter, searchTerm, rewardSearchTerm, selectedTaskId, focusTaskId, clearFilters]);

  return (
    <TaskViewContext.Provider value={value}>
      {children}
    </TaskViewContext.Provider>
  );
}

/**
 * useTaskView - 使用任务视图上下文的 Hook
 * 
 * @returns TaskViewContextValue
 * @throws 如果在 TaskViewProvider 外部使用则抛出错误
 */
export function useTaskView(): TaskViewContextValue {
  const context = useContext(TaskViewContext);
  if (!context) {
    throw new Error('useTaskView must be used within a TaskViewProvider');
  }
  return context;
}

export default TaskViewContext;
