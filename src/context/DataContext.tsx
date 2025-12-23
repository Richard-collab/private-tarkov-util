import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request, gql } from 'graphql-request';
import itemsData from '../data/items.json';

// Define the shape of an item
export interface Item {
  id: string;
  name: string;
  image8xLink: string;
  avg24hPrice: number;
  basePrice: number;
  height: number;
  width: number;
  weight: number;
}

// Define the shape of the context
interface DataContextValue {
  items: Item[];
  gameMode: 'regular' | 'pve';
  isLoading: boolean;
  lastUpdated: number | null;
  toggleGameMode: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEY_ITEMS = 'tarkov_data_items';
const STORAGE_KEY_MODE = 'tarkov_data_mode';
const STORAGE_KEY_TIMESTAMP = 'tarkov_data_timestamp';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(itemsData.items);
  const [gameMode, setGameMode] = useState<'regular' | 'pve'>('regular');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (storedMode === 'regular' || storedMode === 'pve') {
        setGameMode(storedMode);
      }

      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      const storedTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);

      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      if (storedTimestamp) {
        setLastUpdated(parseInt(storedTimestamp, 10));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  const fetchData = useCallback(async (mode: 'regular' | 'pve') => {
    setIsLoading(true);
    const query = gql`
      query getItems($gameMode: GameMode) {
        items(lang: zh, gameMode: $gameMode) {
          id
          name
          image8xLink
          avg24hPrice
          basePrice
          height
          width
          weight
        }
      }
    `;

    try {
      const data: any = await request('https://api.tarkov.dev/graphql', query, {
        gameMode: mode,
      });

      if (data && data.items) {
        const newItems = data.items;
        const timestamp = Date.now();

        setItems(newItems);
        setLastUpdated(timestamp);

        // Try to update local storage
        try {
          localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newItems));
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, timestamp.toString());
          // Also update the mode in storage to match the fetched data
          localStorage.setItem(STORAGE_KEY_MODE, mode);
        } catch (storageError) {
          console.warn('Failed to save to localStorage (quota exceeded?):', storageError);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Ideally show a notification to the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleGameMode = useCallback(() => {
    const newMode = gameMode === 'regular' ? 'pve' : 'regular';
    setGameMode(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);

    // When toggling, we should fetch new data for that mode
    // However, if we just switched, maybe we should check if we have cached data for that mode?
    // For simplicity, current implementation just overwrites "items" in storage.
    // So if we switch modes, we probably should re-fetch immediately.
    fetchData(newMode);
  }, [gameMode, fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData(gameMode);
  }, [fetchData, gameMode]);

  return (
    <DataContext.Provider
      value={{
        items,
        gameMode,
        isLoading,
        lastUpdated,
        toggleGameMode,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
