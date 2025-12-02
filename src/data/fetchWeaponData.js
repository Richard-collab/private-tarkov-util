/**
 * 从 tarkov.dev GraphQL API 获取武器和改装数据
 * Fetch weapon and modification data from tarkov.dev GraphQL API
 * 
 * 用法: node src/data/fetchWeaponData.js
 * 这个脚本会从 tarkov.dev API 获取最新的武器改装数据并保存到 weaponCache.json
 */

import { request, gql } from 'graphql-request';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GraphQL 查询 - 获取所有武器列表（包含槽位信息以过滤可改装武器）
 */
const weaponsQuery = gql`
{
  items(lang: zh, types: [gun]) {
    id
    name
    shortName
    image8xLink
    avg24hPrice
    basePrice
    properties {
      ... on ItemPropertiesWeapon {
        caliber
        defaultAmmo {
          id
          name
        }
        fireModes
        fireRate
        ergonomics
        recoilVertical
        recoilHorizontal
        slots {
          id
          name
        }
      }
    }
  }
}
`;

/**
 * GraphQL 查询 - 获取武器详情（包含槽位和兼容配件）
 */
const weaponDetailsQuery = gql`
query GetWeaponDetails($id: [ID]) {
  items(lang: zh, ids: $id) {
    id
    name
    shortName
    image8xLink
    avg24hPrice
    basePrice
    properties {
      ... on ItemPropertiesWeapon {
        caliber
        defaultAmmo {
          id
          name
        }
        fireModes
        fireRate
        ergonomics
        recoilVertical
        recoilHorizontal
        slots {
          id
          name
          nameId
          required
          filters {
            allowedItems {
              id
              name
              shortName
              image8xLink
              avg24hPrice
              basePrice
              properties {
                ... on ItemPropertiesMagazine {
                  capacity
                  allowedAmmo {
                    id
                    name
                  }
                }
                ... on ItemPropertiesMod {
                  ergonomicsModifier
                  recoilModifier
                  slots {
                    id
                    name
                    nameId
                    filters {
                      allowedItems {
                        id
                        name
                        shortName
                        image8xLink
                        avg24hPrice
                        basePrice
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

/**
 * GraphQL 查询 - 获取弹药数据
 */
const ammoQuery = gql`
{
  items(lang: zh, types: [ammo]) {
    id
    name
    shortName
    image8xLink
    avg24hPrice
    basePrice
    properties {
      ... on ItemPropertiesAmmo {
        caliber
        damage
        armorDamage
        penetrationPower
        projectileCount
        tracer
      }
    }
  }
}
`;

/**
 * 检查武器是否可改装（有槽位）
 */
function isModifiableWeapon(weapon) {
  return weapon.properties?.slots && weapon.properties.slots.length > 0;
}

/**
 * 主函数 - 获取并保存武器改装数据
 */
async function fetchAndSaveWeaponData() {
  try {
    console.log('正在获取武器列表...');
    const weaponsData = await request('https://api.tarkov.dev/graphql', weaponsQuery);
    
    if (!weaponsData || !Array.isArray(weaponsData.items)) {
      console.error('返回的武器数据格式不符合预期:', weaponsData);
      return;
    }

    // 过滤出可改装的武器（有槽位的武器）
    const modifiableWeapons = weaponsData.items.filter(isModifiableWeapon);
    console.log(`获取到 ${weaponsData.items.length} 把武器，其中 ${modifiableWeapons.length} 把可改装`);

    // 为缓存准备武器列表（只包含可改装的武器）
    const weapons = modifiableWeapons.map(w => ({
      id: w.id,
      name: w.name,
      shortName: w.shortName,
      image8xLink: w.image8xLink,
      avg24hPrice: w.avg24hPrice,
      basePrice: w.basePrice,
      properties: {
        caliber: w.properties?.caliber,
        ergonomics: w.properties?.ergonomics,
        recoilVertical: w.properties?.recoilVertical,
        recoilHorizontal: w.properties?.recoilHorizontal
      }
    }));

    // 获取部分热门武器的详情（用于缓存）
    console.log('正在获取热门武器详情...');
    const popularWeaponIds = modifiableWeapons.slice(0, 20).map(w => w.id);
    const weaponDetails = {};
    
    for (const weaponId of popularWeaponIds) {
      try {
        const detailData = await request('https://api.tarkov.dev/graphql', weaponDetailsQuery, { id: [weaponId] });
        if (detailData.items && detailData.items[0]) {
          weaponDetails[weaponId] = detailData.items[0];
          console.log(`  - 获取 ${detailData.items[0].name} 详情成功`);
        }
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`  - 获取武器 ${weaponId} 详情失败:`, err.message);
      }
    }

    // 获取弹药数据
    console.log('正在获取弹药数据...');
    const ammoData = await request('https://api.tarkov.dev/graphql', ammoQuery);
    
    // 按口径分组弹药
    const ammoByCaliberMap = {};
    if (ammoData && Array.isArray(ammoData.items)) {
      for (const ammo of ammoData.items) {
        if (ammo.properties?.caliber) {
          if (!ammoByCaliberMap[ammo.properties.caliber]) {
            ammoByCaliberMap[ammo.properties.caliber] = [];
          }
          ammoByCaliberMap[ammo.properties.caliber].push(ammo);
        }
      }
      console.log(`获取到 ${ammoData.items.length} 种弹药，分为 ${Object.keys(ammoByCaliberMap).length} 种口径`);
    }

    // 组装最终数据
    const cacheData = {
      weapons,
      weaponDetails,
      ammo: ammoByCaliberMap,
      mods: {},
      lastUpdated: new Date().toISOString()
    };

    // 保存到文件
    const outputPath = path.join(__dirname, 'weaponCache.json');
    await fs.writeFile(outputPath, JSON.stringify(cacheData, null, 2));
    console.log('武器改装数据已保存到', outputPath);
    console.log(`  - ${weapons.length} 把可改装武器`);
    console.log(`  - ${Object.keys(weaponDetails).length} 个武器详情`);
    console.log(`  - ${Object.keys(ammoByCaliberMap).length} 种口径弹药`);

  } catch (error) {
    if (error.response && error.response.errors) {
      console.error('GraphQL 返回错误:');
      console.error(JSON.stringify(error.response.errors, null, 2));
    } else {
      console.error('请求或保存时发生错误:', error);
    }
    process.exitCode = 1;
  }
}

fetchAndSaveWeaponData();
