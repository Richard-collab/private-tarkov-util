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
            ... on TaskObjectiveBasic {
                count
            }
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
            experience
        }
        wikiLink
    }
}
`;

// 获取任务数据并保存到文件
request('https://api.tarkov.dev/graphql', tasksQuery)
    .then(async (data) => {
        console.log('获取到任务数据:', data.tasks.length, '个任务');
        
        // 将数据保存为 JSON 文件
        try {
            const outputPath = path.join(__dirname, 'tasks.json');
            await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
            console.log('数据已保存到', outputPath);
        } catch (error) {
            console.error('保存文件时出错:', error);
        }
    })
    .catch((error) => {
        console.error('请求失败:', error);
    });
