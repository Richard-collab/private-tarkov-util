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

  const clearFilters = useCallback(() => {
    setMerchantFilter(null);
    setSearchTerm('');
  }, []);

  const value = useMemo<TaskViewContextValue>(() => ({
    merchantFilter,
    setMerchantFilter,
    searchTerm,
    setSearchTerm,
    clearFilters,
  }), [merchantFilter, searchTerm, clearFilters]);

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
