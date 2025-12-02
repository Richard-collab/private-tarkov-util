/**
 * 将 tarkov.dev API 任务数据转换为 TaskNode 格式
 * Transform tarkov.dev API task data to TaskNode format
 */

import type { TaskData, TaskObjective, TaskReward, UnlockRequirement, FollowUpTask, Trader } from '../types/Task';

/**
 * tarkov.dev API 返回的任务数据接口
 */
interface APITask {
  id: string;
  name: string;
  trader: {
    id: string;
    name: string;
    imageLink?: string;
  };
  map?: {
    id: string;
    name: string;
  } | null;
  minPlayerLevel?: number;
  taskRequirements?: Array<{
    task: {
      id: string;
      name: string;
    };
  }>;
  objectives?: Array<{
    id: string;
    type: string;
    description: string;
    optional?: boolean;
    count?: number;
    item?: {
      id: string;
      name: string;
    };
    targetNames?: string[];
  }>;
  startRewards?: {
    traderStanding?: Array<{
      trader: { name: string };
      standing: number;
    }>;
    items?: Array<{
      item: { name: string };
      count: number;
    }>;
  };
  finishRewards?: {
    traderStanding?: Array<{
      trader: { name: string };
      standing: number;
    }>;
    items?: Array<{
      item: { name: string };
      count: number;
    }>;
    offerUnlock?: Array<{
      trader: { name: string };
      item: { name: string };
    }>;
    craftUnlock?: Array<{
      station: { name: string };
    }>;
    skillLevelReward?: Array<{
      name: string;
      level: number;
    }>;
    traderUnlock?: Array<{
      name: string;
    }>;
    experience?: number;
  };
  wikiLink?: string;
}

/**
 * API 响应数据接口
 */
export interface APITasksResponse {
  tasks: APITask[];
}

/**
 * 将 API 目标数据转换为 TaskObjective 格式
 * @param objective - API 返回的目标数据
 * @returns TaskObjective 格式数据
 */
function transformObjective(objective: APITask['objectives'][0]): TaskObjective {
  return {
    id: objective.id,
    description: objective.description,
    type: objective.type,
    count: objective.count,
    optional: objective.optional ?? false,
  };
}

/**
 * 将 API 奖励数据转换为 TaskReward 数组
 * @param finishRewards - API 返回的完成奖励数据
 * @returns TaskReward 数组
 */
function transformRewards(finishRewards: APITask['finishRewards']): TaskReward[] {
  const rewards: TaskReward[] = [];

  if (!finishRewards) return rewards;

  // 经验奖励
  if (finishRewards.experience) {
    rewards.push({
      type: 'experience',
      value: finishRewards.experience,
      description: `+${finishRewards.experience} 经验`,
    });
  }

  // 物品奖励
  if (finishRewards.items) {
    finishRewards.items.forEach((item) => {
      rewards.push({
        type: item.item.name === '卢布' ? 'money' : 'item',
        value: item.count,
        description: item.item.name === '卢布' 
          ? `${item.count.toLocaleString()} ₽`
          : `${item.item.name} x${item.count}`,
      });
    });
  }

  // 商人声望奖励
  if (finishRewards.traderStanding) {
    finishRewards.traderStanding.forEach((standing) => {
      rewards.push({
        type: 'reputation',
        value: standing.standing,
        description: `${standing.trader.name} +${standing.standing}`,
      });
    });
  }

  // 技能奖励
  if (finishRewards.skillLevelReward) {
    finishRewards.skillLevelReward.forEach((skill) => {
      rewards.push({
        type: 'skill',
        value: skill.level,
        description: `${skill.name} +${skill.level}`,
      });
    });
  }

  // 解锁商品
  if (finishRewards.offerUnlock) {
    finishRewards.offerUnlock.forEach((unlock) => {
      rewards.push({
        type: 'unlock',
        value: unlock.item.name,
        description: `解锁 ${unlock.trader.name}: ${unlock.item.name}`,
      });
    });
  }

  // 解锁商人
  if (finishRewards.traderUnlock) {
    finishRewards.traderUnlock.forEach((trader) => {
      rewards.push({
        type: 'unlock',
        value: trader.name,
        description: `解锁商人: ${trader.name}`,
      });
    });
  }

  // 解锁制作
  if (finishRewards.craftUnlock) {
    finishRewards.craftUnlock.forEach((craft) => {
      rewards.push({
        type: 'unlock',
        value: craft.station.name,
        description: `解锁制作: ${craft.station.name}`,
      });
    });
  }

  return rewards;
}

/**
 * 将 API 任务需求转换为 UnlockRequirement 数组
 * @param taskRequirements - API 返回的任务需求数据
 * @param minPlayerLevel - 最低玩家等级
 * @returns UnlockRequirement 数组
 */
function transformUnlockRequirements(
  taskRequirements: APITask['taskRequirements'],
  minPlayerLevel?: number
): UnlockRequirement[] {
  const requirements: UnlockRequirement[] = [];

  // 等级需求
  if (minPlayerLevel && minPlayerLevel > 1) {
    requirements.push({
      type: 'level',
      level: minPlayerLevel,
    });
  }

  // 前置任务需求
  if (taskRequirements) {
    taskRequirements.forEach((req) => {
      requirements.push({
        type: 'task',
        taskId: req.task.id,
        taskName: req.task.name,
      });
    });
  }

  return requirements;
}

/**
 * 根据任务需求构建后续任务映射
 * @param tasks - 所有任务数据
 * @returns 任务ID到后续任务列表的映射
 */
function buildFollowUpTasksMap(tasks: APITask[]): Map<string, FollowUpTask[]> {
  const followUpMap = new Map<string, FollowUpTask[]>();

  tasks.forEach((task) => {
    if (task.taskRequirements) {
      task.taskRequirements.forEach((req) => {
        const prerequisiteId = req.task.id;
        const followUp: FollowUpTask = {
          taskId: task.id,
          taskName: task.name,
          traderName: task.trader.name,
        };

        if (followUpMap.has(prerequisiteId)) {
          followUpMap.get(prerequisiteId)!.push(followUp);
        } else {
          followUpMap.set(prerequisiteId, [followUp]);
        }
      });
    }
  });

  return followUpMap;
}

/**
 * 将 API 商人数据转换为 Trader 格式
 * @param trader - API 返回的商人数据
 * @returns Trader 格式数据
 */
function transformTrader(trader: APITask['trader']): Trader {
  return {
    id: trader.id,
    name: trader.name,
    imageUrl: trader.imageLink || '',
  };
}

/**
 * 根据地图信息确定任务组名称
 * @param map - 地图信息
 * @param traderName - 商人名称
 * @returns 任务组名称
 */
function getTaskGroup(map: APITask['map'], traderName: string): string {
  if (map?.name) {
    return map.name;
  }
  return `${traderName}任务`;
}

/**
 * 将单个 API 任务数据转换为 TaskData 格式
 * @param task - API 返回的任务数据
 * @param followUpTasks - 后续任务列表
 * @returns TaskData 格式数据
 */
function transformSingleTask(task: APITask, followUpTasks: FollowUpTask[]): TaskData {
  return {
    taskId: task.id,
    taskGroup: getTaskGroup(task.map, task.trader.name),
    trader: transformTrader(task.trader),
    taskName: task.name,
    objectives: (task.objectives || []).map(transformObjective),
    rewards: transformRewards(task.finishRewards),
    unlockRequirements: transformUnlockRequirements(task.taskRequirements, task.minPlayerLevel),
    followUpTasks: followUpTasks,
    minPlayerLevel: task.minPlayerLevel,
    wikiLink: task.wikiLink,
  };
}

/**
 * 将 tarkov.dev API 返回的任务数据转换为 TaskData 数组
 * Transform tarkov.dev API task data array to TaskData array
 * 
 * @param apiResponse - API 返回的响应数据
 * @returns TaskData 数组
 * 
 * @example
 * ```ts
 * import tasksData from './tasks.json';
 * import { transformTasksData } from './transformTaskData';
 * 
 * const taskDataArray = transformTasksData(tasksData);
 * ```
 */
export function transformTasksData(apiResponse: APITasksResponse): TaskData[] {
  const { tasks } = apiResponse;
  
  // 构建后续任务映射
  const followUpMap = buildFollowUpTasksMap(tasks);
  
  // 转换所有任务
  return tasks.map((task) => {
    const followUpTasks = followUpMap.get(task.id) || [];
    return transformSingleTask(task, followUpTasks);
  });
}

export default transformTasksData;
