/**
 * 任务相关类型定义
 * Types related to Task functionality
 */

/**
 * 任务目标接口
 * Task objective interface
 */
export interface TaskObjective {
  id: string;
  description: string;
  type: string; // e.g., 'kill', 'collect', 'handover', 'find', 'place', 'visit'
  count?: number;
  optional?: boolean;
  item?: {
    id: string;
    name: string;
  };
}

/**
 * 任务奖励接口
 * Task reward interface
 */
export interface TaskReward {
  type: 'experience' | 'money' | 'item' | 'skill' | 'reputation' | 'unlock';
  value: string | number;
  description?: string;
}

/**
 * 解锁条件接口
 * Unlock requirement interface
 */
export interface UnlockRequirement {
  type: 'task' | 'level' | 'reputation' | 'skill';
  taskId?: string;
  taskName?: string;
  level?: number;
  value?: number;
  description?: string;
}

/**
 * 后续任务接口
 * Follow-up task interface
 */
export interface FollowUpTask {
  taskId: string;
  taskName: string;
  traderName?: string;
}

/**
 * 商人接口
 * Trader interface
 */
export interface Trader {
  id: string;
  name: string;
  imageUrl?: string;
}

/**
 * 任务数据接口
 * Task data interface - represents all task information
 */
export interface TaskData {
  // 后台存储的数据
  taskId: string;        // 任务ID
  taskGroup?: string;    // 任务组
  
  // 展示的数据
  trader: Trader;                      // 发布任务商人
  taskName: string;                    // 任务名称
  objectives: TaskObjective[];         // 任务目标
  rewards: TaskReward[];               // 任务奖励
  unlockRequirements: UnlockRequirement[]; // 解锁该任务条件
  followUpTasks: FollowUpTask[];       // 后续任务
  
  // 可选元数据
  minPlayerLevel?: number;
  wikiLink?: string;
}
