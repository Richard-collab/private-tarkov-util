/**
 * TaskSearchBar - 任务搜索框组件
 * 
 * 带防抖功能的搜索框，用于按任务名称或商人搜索
 * Debounced search box for searching tasks by title or merchant
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import debounce from 'lodash.debounce';
import { useTaskView } from '../context/TaskViewContext';

/**
 * TaskSearchBar Props
 */
interface TaskSearchBarProps {
  /** 防抖延迟时间 (ms) */
  debounceMs?: number;
  /** 占位符文本 */
  placeholder?: string;
  /** 组件宽度 */
  width?: number | string;
}

/**
 * TaskSearchBar 组件
 */
export default function TaskSearchBar({
  debounceMs = 250,
  placeholder = '搜索任务或商人...',
  width = 280,
}: TaskSearchBarProps) {
  const { searchTerm, setSearchTerm } = useTaskView();
  const [inputValue, setInputValue] = useState(searchTerm);
  
  // 创建防抖函数的引用
  const debouncedSetSearchTerm = useRef(
    debounce((value: string) => {
      setSearchTerm(value);
    }, debounceMs)
  ).current;

  // 同步外部 searchTerm 到输入框
  useEffect(() => {
    if (searchTerm !== inputValue) {
      setInputValue(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // 组件卸载时取消防抖
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // 处理输入变化
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      debouncedSetSearchTerm(value);
    },
    [debouncedSetSearchTerm]
  );

  // 清除搜索
  const handleClear = useCallback(() => {
    setInputValue('');
    debouncedSetSearchTerm.cancel();
    setSearchTerm('');
  }, [debouncedSetSearchTerm, setSearchTerm]);

  // 处理回车键立即搜索
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        debouncedSetSearchTerm.cancel();
        setSearchTerm(inputValue);
      } else if (event.key === 'Escape') {
        handleClear();
      }
    },
    [debouncedSetSearchTerm, inputValue, setSearchTerm, handleClear]
  );

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      sx={{ width }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
        endAdornment: inputValue ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              aria-label="清除搜索"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
