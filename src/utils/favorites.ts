/**
 * 收藏功能工具模块
 * 
 * 该模块提供本地存储收藏物品的功能，包含：
 * - 添加/移除收藏
 * - 检查是否已收藏
 * - 获取所有收藏的物品ID列表
 * - 切换收藏状态
 * 
 * 使用 localStorage 持久化存储收藏数据
 */

const FAVORITES_STORAGE_KEY = 'favorited_items';

/**
 * 获取所有收藏物品的ID列表
 * @returns {string[]} 收藏物品ID数组
 */
export function getFavoriteIds(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 检查物品是否已被收藏
 * @param {string} itemId - 物品ID
 * @returns {boolean} 是否已收藏
 */
export function isFavorited(itemId: string): boolean {
  const favorites = getFavoriteIds();
  return favorites.includes(itemId);
}

/**
 * 添加物品到收藏
 * @param {string} itemId - 物品ID
 */
export function addFavorite(itemId: string): void {
  const favorites = getFavoriteIds();
  if (!favorites.includes(itemId)) {
    favorites.push(itemId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }
}

/**
 * 从收藏中移除物品
 * @param {string} itemId - 物品ID
 */
export function removeFavorite(itemId: string): void {
  const favorites = getFavoriteIds();
  const index = favorites.indexOf(itemId);
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }
}

/**
 * 切换物品的收藏状态
 * @param {string} itemId - 物品ID
 * @returns {boolean} 切换后的收藏状态
 */
export function toggleFavorite(itemId: string): boolean {
  if (isFavorited(itemId)) {
    removeFavorite(itemId);
    return false;
  } else {
    addFavorite(itemId);
    return true;
  }
}
