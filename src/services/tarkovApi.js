/**
 * Tarkov.dev GraphQL API 服务
 * 
 * 用于从 tarkov.dev 获取武器、配件、弹药等数据
 * 优先使用本地缓存数据，API数据在后台更新
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
 * 获取所有武器列表（只返回可改装的武器，即有槽位的武器）
 * 优先使用本地缓存数据
 */
export const fetchWeapons = async () => {
  // 优先使用本地缓存数据
  try {
    const { default: cachedData } = await import('../data/weaponCache.json');
    if (cachedData.weapons && cachedData.weapons.length > 0) {
      console.log('使用本地缓存的武器数据');
      return cachedData.weapons;
    }
  } catch (cacheError) {
    console.warn('加载本地缓存失败:', cacheError.message);
  }

  // 缓存不可用时，从API获取
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
            slots {
              id
              name
            }
          }
        }
      }
    }
  `;

  try {
    const data = await withTimeout(request(API_URL, query), REQUEST_TIMEOUT);
    // 过滤出有槽位的武器（可改装的武器）
    const modifiableWeapons = data.items.filter(
      (weapon) => weapon.properties?.slots && weapon.properties.slots.length > 0
    );
    return modifiableWeapons;
  } catch (error) {
    console.warn('API请求失败:', error.message);
    return [];
  }
};

/**
 * 获取武器详情，包括槽位信息
 * 优先使用本地缓存数据
 * @param {string} weaponId - 武器ID
 */
export const fetchWeaponDetails = async (weaponId) => {
  // 优先使用本地缓存数据
  try {
    const { default: cachedData } = await import('../data/weaponCache.json');
    if (cachedData.weaponDetails && cachedData.weaponDetails[weaponId]) {
      console.log('使用本地缓存的武器详情:', weaponId);
      return cachedData.weaponDetails[weaponId];
    }
  } catch (cacheError) {
    console.warn('加载本地缓存失败:', cacheError.message);
  }

  // 缓存不可用时，从API获取
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
    }
  `;

  try {
    const data = await withTimeout(
      request(API_URL, query, { id: [weaponId] }),
      REQUEST_TIMEOUT
    );
    return data.items?.[0] || null;
  } catch (error) {
    console.warn('API请求失败:', error.message);
    return null;
  }
};

/**
 * 根据口径获取弹药列表
 * 优先使用本地缓存数据
 * @param {string} caliber - 弹药口径
 */
export const fetchAmmoByCaliber = async (caliber) => {
  // 优先使用本地缓存数据
  try {
    const { default: cachedData } = await import('../data/weaponCache.json');
    if (cachedData.ammo && cachedData.ammo[caliber]) {
      console.log('使用本地缓存的弹药数据:', caliber);
      return cachedData.ammo[caliber];
    }
  } catch (cacheError) {
    console.warn('加载本地缓存失败:', cacheError.message);
  }

  // 缓存不可用时，从API获取
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
    console.warn('API请求失败:', error.message);
    return [];
  }
};

/**
 * 获取配件详情
 * 优先使用本地缓存数据
 * @param {string} modId - 配件ID
 */
export const fetchModDetails = async (modId) => {
  // 优先使用本地缓存数据
  try {
    const { default: cachedData } = await import('../data/weaponCache.json');
    if (cachedData.mods && cachedData.mods[modId]) {
      console.log('使用本地缓存的配件数据:', modId);
      return cachedData.mods[modId];
    }
  } catch (cacheError) {
    console.warn('加载本地缓存失败:', cacheError.message);
  }

  // 缓存不可用时，从API获取
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
                  }
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
    return data.items?.[0] || null;
  } catch (error) {
    console.warn('API请求失败:', error.message);
    return null;
  }
};
