/**
 * 从 tarkov.dev GraphQL API 获取任务数据
 * Fetch task data from tarkov.dev GraphQL API
 * 
 * 用法: node src/data/fetchTaskData.js
 * 这个脚本会从 tarkov.dev API 获取最新的任务数据并保存到 tasks.json
 */

import { request, gql } from 'graphql-request';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GraphQL 查询 - 获取所有任务数据
 * 已移除在当前 schema 中不存在的字段：
 *  - TaskObjectiveBasic.count
 *  - TaskRewards.experience
 */
const tasksQuery = gql`
{
  tasks(lang: zh) {
    id
    name
    trader {
      id
      name
      imageLink
    }
    map {
      id
      name
    }
    minPlayerLevel
    taskRequirements {
      task {
        id
        name
      }
    }
    objectives {
      id
      type
      description
      optional
      ... on TaskObjectiveItem {
        count
        item {
          id
          name
        }
      }
      ... on TaskObjectiveShoot {
        count
        targetNames
      }
      # TaskObjectiveBasic 没有额外字段，保留通用字段即可
    }
    startRewards {
      traderStanding {
        trader {
          name
        }
        standing
      }
      items {
        item {
          name
        }
        count
      }
    }
    finishRewards {
      traderStanding {
        trader {
          name
        }
        standing
      }
      items {
        item {
          name
        }
        count
      }
      offerUnlock {
        trader {
          name
        }
        item {
          name
        }
      }
      craftUnlock {
        station {
          name
        }
      }
      skillLevelReward {
        name
        level
      }
      traderUnlock {
        name
      }
      # 注意：原查询中使用的 experience 字段在当前 schema 中不存在，已移除
    }
    wikiLink
  }
}
`;

// 使用 async/await，更清晰的错误处理
async function fetchAndSaveTasks() {
  try {
    const data = await request('https://api.tarkov.dev/graphql', tasksQuery);

    if (!data || !Array.isArray(data.tasks)) {
      console.error('返回的数据格式不符合预期:', data);
      return;
    }

    console.log('获取到任务数据:', data.tasks.length, '个任务');

    const outputPath = path.join(__dirname, 'tasks.json');
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log('数据已保存到', outputPath);
  } catch (error) {
    // 更详细的错误输出，尤其是 GraphQL validation errors
    if (error.response && error.response.errors) {
      console.error('GraphQL 返回错误:');
      console.error(JSON.stringify(error.response.errors, null, 2));
    } else {
      console.error('请求或保存时发生错误:', error);
    }
    process.exitCode = 1;
  }
}

fetchAndSaveTasks();