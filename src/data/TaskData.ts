/**
 * 任务数据导出模块
 * Task Data Export Module
 * 
 * 该模块从 tasks.json 读取任务数据，并使用 transformTasksData 函数
 * 将其转换为 TaskData 格式，供 TaskFlowDemo 组件使用。
 */

import tasksData from './tasks.json';
import { transformTasksData } from './transformTaskData';
import type { TaskData } from '../types/Task';

/**
 * 转换后的任务数据数组
 * Array of transformed task data ready for TaskNode components
 */
export const taskDataArray: TaskData[] = transformTasksData(tasksData);

/**
 * 获取所有任务数据
 * @returns TaskData 数组
 */
export function getAllTasks(): TaskData[] {
  return taskDataArray;
}

/**
 * 根据任务ID获取单个任务
 * @param taskId - 任务ID
 * @returns TaskData 或 undefined
 */
export function getTaskById(taskId: string): TaskData | undefined {
  return taskDataArray.find((task) => task.taskId === taskId);
}

/**
 * 根据商人名称获取任务
 * @param traderName - 商人名称
 * @returns TaskData 数组
 */
export function getTasksByTrader(traderName: string): TaskData[] {
  return taskDataArray.filter((task) => task.trader.name === traderName);
}

/**
 * 根据任务组获取任务
 * @param taskGroup - 任务组名称
 * @returns TaskData 数组
 */
export function getTasksByGroup(taskGroup: string): TaskData[] {
  return taskDataArray.filter((task) => task.taskGroup === taskGroup);
}

/**
 * 获取没有前置任务的起始任务
 * @returns TaskData 数组
 */
export function getRootTasks(): TaskData[] {
  return taskDataArray.filter(
    (task) => !task.unlockRequirements.some((req) => req.type === 'task')
  );
}

/**
 * 获取所有商人列表
 * @returns 商人名称数组
 */
export function getAllTraders(): string[] {
  const traders = new Set<string>();
  taskDataArray.forEach((task) => {
    traders.add(task.trader.name);
  });
  return Array.from(traders);
}

/**
 * 获取所有任务组列表
 * @returns 任务组名称数组
 */
export function getAllTaskGroups(): string[] {
  const groups = new Set<string>();
  taskDataArray.forEach((task) => {
    if (task.taskGroup) {
      groups.add(task.taskGroup);
    }
  });
  return Array.from(groups);
}

export default taskDataArray;
