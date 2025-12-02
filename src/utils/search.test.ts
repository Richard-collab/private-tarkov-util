/**
 * 搜索工具函数测试
 * Tests for search utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  findTasksByReward,
  isTaskMatchedBySearch,
  isTaskMatchedCombined,
} from './search';
import type { TaskData } from '../types/Task';

/**
 * 创建测试用的任务数据
 */
function createMockTask(overrides: Partial<TaskData> = {}): TaskData {
  return {
    taskId: 'test-task-1',
    taskName: '测试任务',
    trader: {
      id: 'trader-1',
      name: 'Therapist',
      imageUrl: '',
    },
    objectives: [],
    rewards: [
      { type: 'money', value: 10000, description: '10,000 ₽' },
      { type: 'item', value: 1, description: 'AK-47 x1' },
      { type: 'experience', value: 1000, description: '+1000 经验' },
    ],
    unlockRequirements: [],
    followUpTasks: [],
    ...overrides,
  };
}

describe('findTasksByReward', () => {
  const tasks: TaskData[] = [
    createMockTask({
      taskId: 'task-1',
      taskName: '任务一',
      rewards: [
        { type: 'money', value: 10000, description: '10,000 ₽' },
        { type: 'item', value: 1, description: 'AK-47 x1' },
      ],
    }),
    createMockTask({
      taskId: 'task-2',
      taskName: '任务二',
      rewards: [
        { type: 'item', value: 2, description: '医疗包 x2' },
        { type: 'experience', value: 500, description: '+500 经验' },
      ],
    }),
    createMockTask({
      taskId: 'task-3',
      taskName: '任务三',
      rewards: [
        { type: 'item', value: 1, description: 'M4A1 x1' },
        { type: 'unlock', value: 'AK改装配件', description: '解锁 AK改装配件' },
      ],
    }),
  ];

  it('应该返回空结果当搜索词为空', () => {
    const result = findTasksByReward(tasks, '');
    expect(result.matchedIds).toHaveLength(0);
    expect(result.matches).toHaveLength(0);
  });

  it('应该返回空结果当搜索词只有空格', () => {
    const result = findTasksByReward(tasks, '   ');
    expect(result.matchedIds).toHaveLength(0);
  });

  it('应该找到包含 AK 的奖励任务', () => {
    const result = findTasksByReward(tasks, 'AK');
    expect(result.matchedIds).toContain('task-1');
    expect(result.matchedIds).toContain('task-3');
    expect(result.matchedIds).not.toContain('task-2');
  });

  it('应该支持模糊匹配（包含匹配）', () => {
    const result = findTasksByReward(tasks, '医疗');
    expect(result.matchedIds).toContain('task-2');
    expect(result.matchedIds).toHaveLength(1);
  });

  it('应该支持不区分大小写的匹配', () => {
    const result = findTasksByReward(tasks, 'ak');
    expect(result.matchedIds).toContain('task-1');
    expect(result.matchedIds).toContain('task-3');
  });

  it('应该返回匹配的奖励详情', () => {
    const result = findTasksByReward(tasks, 'AK-47');
    expect(result.matches.length).toBeGreaterThan(0);
    const match = result.matches.find((m) => m.taskId === 'task-1');
    expect(match).toBeDefined();
    expect(match?.matchedRewards.length).toBeGreaterThan(0);
    expect(match?.matchedRewards[0].description).toContain('AK-47');
  });

  it('应该按分数排序结果', () => {
    const result = findTasksByReward(tasks, 'AK');
    // 两个结果都应该有，且按分数排序
    expect(result.matches.length).toBe(2);
    // 每个匹配应该有分数
    result.matches.forEach((match) => {
      expect(match.score).toBeGreaterThan(0);
    });
  });

  it('应该返回空结果当没有匹配', () => {
    const result = findTasksByReward(tasks, '不存在的物品');
    expect(result.matchedIds).toHaveLength(0);
    expect(result.matches).toHaveLength(0);
  });
});

describe('isTaskMatchedBySearch', () => {
  const task = createMockTask({
    taskName: '采集任务',
    trader: { id: '1', name: 'Prapor', imageUrl: '' },
    rewards: [{ type: 'item', value: 1, description: '黄金手表 x1' }],
  });

  it('应该在搜索词为空时返回 true', () => {
    expect(isTaskMatchedBySearch(task, '')).toBe(true);
  });

  it('应该按任务名称匹配', () => {
    expect(isTaskMatchedBySearch(task, '采集')).toBe(true);
    expect(isTaskMatchedBySearch(task, '任务')).toBe(true);
    expect(isTaskMatchedBySearch(task, '不匹配')).toBe(false);
  });

  it('应该按商人名称匹配', () => {
    expect(isTaskMatchedBySearch(task, 'Prapor')).toBe(true);
    expect(isTaskMatchedBySearch(task, 'prapor')).toBe(true);
    expect(isTaskMatchedBySearch(task, 'Therapist')).toBe(false);
  });

  it('当 searchByReward 为 true 时应该只按奖励匹配', () => {
    expect(isTaskMatchedBySearch(task, '黄金', true)).toBe(true);
    expect(isTaskMatchedBySearch(task, '手表', true)).toBe(true);
    expect(isTaskMatchedBySearch(task, '采集', true)).toBe(false);
    expect(isTaskMatchedBySearch(task, 'Prapor', true)).toBe(false);
  });
});

describe('isTaskMatchedCombined', () => {
  const task = createMockTask({
    taskName: '战斗任务',
    trader: { id: '1', name: 'Skier', imageUrl: '' },
    rewards: [{ type: 'item', value: 1, description: '突击步枪 x1' }],
  });

  it('应该在所有条件为空时返回 true', () => {
    expect(isTaskMatchedCombined(task, '', '', null)).toBe(true);
  });

  it('应该按商人过滤', () => {
    expect(isTaskMatchedCombined(task, '', '', 'Skier')).toBe(true);
    expect(isTaskMatchedCombined(task, '', '', 'Prapor')).toBe(false);
  });

  it('应该按任务名称/商人搜索', () => {
    expect(isTaskMatchedCombined(task, '战斗', '', null)).toBe(true);
    expect(isTaskMatchedCombined(task, 'Skier', '', null)).toBe(true);
    expect(isTaskMatchedCombined(task, '采集', '', null)).toBe(false);
  });

  it('应该按奖励搜索', () => {
    expect(isTaskMatchedCombined(task, '', '突击步枪', null)).toBe(true);
    expect(isTaskMatchedCombined(task, '', '手枪', null)).toBe(false);
  });

  it('应该组合所有条件', () => {
    // 所有条件都匹配
    expect(isTaskMatchedCombined(task, '战斗', '突击', 'Skier')).toBe(true);
    // 商人不匹配
    expect(isTaskMatchedCombined(task, '战斗', '突击', 'Prapor')).toBe(false);
    // 名称不匹配
    expect(isTaskMatchedCombined(task, '采集', '突击', 'Skier')).toBe(false);
    // 奖励不匹配
    expect(isTaskMatchedCombined(task, '战斗', '手枪', 'Skier')).toBe(false);
  });
});
