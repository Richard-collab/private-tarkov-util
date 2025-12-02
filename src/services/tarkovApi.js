/**
 * Tarkov.dev GraphQL API 服务
 * 
 * 用于从 tarkov.dev 获取武器、配件、弹药等数据
 * 当API不可用时，使用本地缓存数据作为后备
 */

import { request, gql } from 'graphql-request';

const API_URL = 'https://api.tarkov.dev/graphql';

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000;

/**
 * 带超时的fetch请求
 * @param {Promise} promise - 原始Promise
 * @param {number} timeout - 超时时间（毫秒）
 */
const withTimeout = (promise, timeout) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('请求超时')), timeout)
    ),
  ]);
};

/**
 * 获取所有武器列表
 */
export const fetchWeapons = async () => {
  const query = gql`
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
          }
        }
      }
    }
  `;

  try {
    const data = await withTimeout(request(API_URL, query), REQUEST_TIMEOUT);
    return data.items;
  } catch (error) {
    console.warn('API请求失败，使用本地缓存数据:', error.message);
    // 动态导入本地缓存数据
    const { default: cachedData } = await import('../data/weaponCache.json');
    return cachedData.weapons;
  }
};

/**
 * 获取武器详情，包括槽位信息
 * @param {string} weaponId - 武器ID
 */
export const fetchWeaponDetails = async (weaponId) => {
  const query = gql`
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

  try {
    const data = await withTimeout(
      request(API_URL, query, { id: [weaponId] }),
      REQUEST_TIMEOUT
    );
    return data.items[0];
  } catch (error) {
    console.warn('API请求失败，使用本地缓存数据:', error.message);
    // 动态导入本地缓存数据
    const { default: cachedData } = await import('../data/weaponCache.json');
    return cachedData.weaponDetails[weaponId] || null;
  }
};

/**
 * 根据口径获取弹药列表
 * @param {string} caliber - 弹药口径
 */
export const fetchAmmoByCaliber = async (caliber) => {
  const query = gql`
    query GetAmmo($caliber: String) {
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

  try {
    const data = await withTimeout(
      request(API_URL, query, { caliber }),
      REQUEST_TIMEOUT
    );
    // 过滤出匹配口径的弹药
    return data.items.filter(
      (item) => item.properties && item.properties.caliber === caliber
    );
  } catch (error) {
    console.warn('API请求失败，使用本地缓存数据:', error.message);
    // 动态导入本地缓存数据
    const { default: cachedData } = await import('../data/weaponCache.json');
    return cachedData.ammo[caliber] || [];
  }
};

/**
 * 获取配件详情
 * @param {string} modId - 配件ID
 */
export const fetchModDetails = async (modId) => {
  const query = gql`
    query GetModDetails($id: [ID]) {
      items(lang: zh, ids: $id) {
        id
        name
        shortName
        image8xLink
        avg24hPrice
        basePrice
        properties {
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
          ... on ItemPropertiesMagazine {
            capacity
            allowedAmmo {
              id
              name
            }
          }
        }
      }
    }
  `;

  try {
    const data = await withTimeout(
      request(API_URL, query, { id: [modId] }),
      REQUEST_TIMEOUT
    );
    return data.items[0];
  } catch (error) {
    console.warn('API请求失败，使用本地缓存数据:', error.message);
    // 动态导入本地缓存数据
    const { default: cachedData } = await import('../data/weaponCache.json');
    return cachedData.mods[modId] || null;
  }
};
