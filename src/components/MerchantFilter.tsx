/**
 * MerchantFilter - 商人过滤器组件
 * 
 * 下拉选择器，用于按商人筛选任务
 * Dropdown selector for filtering tasks by merchant
 */

import { useCallback, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useTaskView } from '../context/TaskViewContext';
import type { TaskData } from '../types/Task';

/**
 * MerchantFilter Props
 */
interface MerchantFilterProps {
  /** 任务数据数组，用于提取商人列表 */
  tasks: TaskData[];
  /** 组件宽度 */
  width?: number | string;
}

/**
 * 商人信息
 */
interface MerchantInfo {
  name: string;
  imageUrl?: string;
  taskCount: number;
}

/**
 * MerchantFilter 组件
 */
export default function MerchantFilter({ tasks, width = 200 }: MerchantFilterProps) {
  const { merchantFilter, setMerchantFilter } = useTaskView();

  // 从任务数据中提取商人列表
  const merchants = useMemo<MerchantInfo[]>(() => {
    const merchantMap = new Map<string, MerchantInfo>();

    tasks.forEach((task) => {
      const { name, imageUrl } = task.trader;
      if (merchantMap.has(name)) {
        merchantMap.get(name)!.taskCount++;
      } else {
        merchantMap.set(name, {
          name,
          imageUrl,
          taskCount: 1,
        });
      }
    });

    // 按任务数量排序
    return Array.from(merchantMap.values()).sort(
      (a, b) => b.taskCount - a.taskCount
    );
  }, [tasks]);

  // 处理选择变化
  const handleChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setMerchantFilter(value === '' ? null : value);
    },
    [setMerchantFilter]
  );

  return (
    <FormControl size="small" sx={{ width }}>
      <InputLabel id="merchant-filter-label">商人筛选</InputLabel>
      <Select
        labelId="merchant-filter-label"
        id="merchant-filter"
        value={merchantFilter || ''}
        label="商人筛选"
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>全部商人</em>
        </MenuItem>
        {merchants.map((merchant) => (
          <MenuItem key={merchant.name} value={merchant.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={merchant.imageUrl}
                alt={merchant.name}
                sx={{ width: 24, height: 24 }}
              >
                {!merchant.imageUrl && <PersonIcon fontSize="small" />}
              </Avatar>
              <span>
                {merchant.name} ({merchant.taskCount})
              </span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
