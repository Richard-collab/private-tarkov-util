/**
 * 任务搜索工具
 * Task search utilities
 * 
 * 提供按奖励物品搜索任务的功能
 * Provides functionality to search tasks by reward items
 */

import type { TaskData, TaskReward } from '../types/Task';

/**
 * 搜索匹配结果接口
 * Search match result interface
 */
export interface SearchMatchResult {
  /** 匹配的任务ID */
  taskId: string;
  /** 匹配的奖励信息 */
  matchedRewards: TaskReward[];
  /** 匹配分数（用于排序） */
  score: number;
}

/**
 * 搜索结果接口
 * Search result interface
 */
export interface SearchResult {
  /** 匹配的任务ID列表 */
  matchedIds: string[];
  /** 详细匹配信息 */
  matches: SearchMatchResult[];
}

/**
 * 标准化搜索字符串（转小写，去除首尾空格）
 * Normalize search string (lowercase, trim)
 * 
 * @param str - 要标准化的字符串
 * @returns 标准化后的字符串
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * 检查奖励是否与搜索词匹配
 * Check if a reward matches the search query
 * 
 * @param reward - 任务奖励
 * @param normalizedQuery - 标准化的搜索词
 * @returns 是否匹配
 */
function isRewardMatched(reward: TaskReward, normalizedQuery: string): boolean {
  // 检查奖励描述是否包含搜索词
  if (reward.description && normalizeString(reward.description).includes(normalizedQuery)) {
    return true;
  }
  
  // 检查奖励值（如果是字符串）是否包含搜索词
  if (typeof reward.value === 'string' && normalizeString(reward.value).includes(normalizedQuery)) {
    return true;
  }
  
  return false;
}

/**
 * 计算匹配分数
 * Calculate match score based on match quality
 * 
 * @param reward - 匹配的奖励
 * @param normalizedQuery - 标准化的搜索词
 * @returns 匹配分数（越高越好）
 */
function calculateMatchScore(reward: TaskReward, normalizedQuery: string): number {
  let score = 0;
  
  // 精确匹配得分更高
  const description = reward.description ? normalizeString(reward.description) : '';
  const value = typeof reward.value === 'string' ? normalizeString(reward.value) : '';
  
  if (description === normalizedQuery || value === normalizedQuery) {
    score += 100;
  } else if (description.startsWith(normalizedQuery) || value.startsWith(normalizedQuery)) {
    score += 50;
  } else {
    score += 10;
  }
  
  return score;
}

/**
 * 按奖励物品搜索任务
 * Find tasks by reward item name (fuzzy matching)
 * 
 * @param tasks - 任务数据数组
 * @param query - 搜索词
 * @returns 搜索结果，包含匹配的任务ID列表和详细匹配信息
 * 
 * @example
 * ```ts
 * const result = findTasksByReward(tasks, '卢布');
 * console.log(result.matchedIds); // ['task1', 'task2', ...]
 * console.log(result.matches); // [{ taskId: 'task1', matchedRewards: [...], score: 100 }, ...]
 * ```
 */
export function findTasksByReward(tasks: TaskData[], query: string): SearchResult {
  const normalizedQuery = normalizeString(query);
  
  // 空查询返回空结果
  if (!normalizedQuery) {
    return { matchedIds: [], matches: [] };
  }
  
  const matches: SearchMatchResult[] = [];
  
  tasks.forEach((task) => {
    const matchedRewards: TaskReward[] = [];
    let totalScore = 0;
    
    task.rewards.forEach((reward) => {
      if (isRewardMatched(reward, normalizedQuery)) {
        matchedRewards.push(reward);
        totalScore += calculateMatchScore(reward, normalizedQuery);
      }
    });
    
    if (matchedRewards.length > 0) {
      matches.push({
        taskId: task.taskId,
        matchedRewards,
        score: totalScore,
      });
    }
  });
  
  // 按分数排序（降序）
  matches.sort((a, b) => b.score - a.score);
  
  return {
    matchedIds: matches.map((m) => m.taskId),
    matches,
  };
}

/**
 * 检查任务是否匹配搜索条件（名称、商人或奖励）
 * Check if a task matches the search criteria (name, merchant, or reward)
 * 
 * @param task - 任务数据
 * @param searchTerm - 搜索词
 * @param searchByReward - 是否按奖励搜索
 * @returns 是否匹配
 */
export function isTaskMatchedBySearch(
  task: TaskData,
  searchTerm: string,
  searchByReward: boolean = false
): boolean {
  if (!searchTerm) {
    return true;
  }
  
  const normalizedQuery = normalizeString(searchTerm);
  
  if (searchByReward) {
    // 只按奖励搜索
    return task.rewards.some((reward) => isRewardMatched(reward, normalizedQuery));
  }
  
  // 默认搜索：任务名称和商人名称
  const matchesName = normalizeString(task.taskName).includes(normalizedQuery);
  const matchesMerchant = normalizeString(task.trader.name).includes(normalizedQuery);
  
  return matchesName || matchesMerchant;
}

/**
 * 组合搜索：同时支持按名称/商人和按奖励搜索
 * Combined search: supports searching by name/merchant and by reward
 * 
 * @param task - 任务数据
 * @param searchTerm - 搜索词
 * @param rewardSearchTerm - 奖励搜索词
 * @param merchantFilter - 商人过滤器
 * @returns 是否匹配
 */
export function isTaskMatchedCombined(
  task: TaskData,
  searchTerm: string,
  rewardSearchTerm: string,
  merchantFilter: string | null
): boolean {
  // 商人过滤
  if (merchantFilter && task.trader.name !== merchantFilter) {
    return false;
  }
  
  // 名称/商人搜索
  if (searchTerm) {
    const normalizedSearch = normalizeString(searchTerm);
    const matchesName = normalizeString(task.taskName).includes(normalizedSearch);
    const matchesMerchant = normalizeString(task.trader.name).includes(normalizedSearch);
    if (!matchesName && !matchesMerchant) {
      return false;
    }
  }
  
  // 奖励搜索
  if (rewardSearchTerm) {
    const normalizedReward = normalizeString(rewardSearchTerm);
    const matchesReward = task.rewards.some((reward) => isRewardMatched(reward, normalizedReward));
    if (!matchesReward) {
      return false;
    }
  }
  
  return true;
}

export default findTasksByReward;
