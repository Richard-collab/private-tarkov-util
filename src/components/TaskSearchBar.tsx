/**
 * TaskSearchBar - 任务搜索框组件
 * 
 * 带防抖功能的搜索框，用于按任务名称、商人或奖励物品搜索
 * Debounced search box for searching tasks by title, merchant, or reward items
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import debounce from 'lodash.debounce';
import { useTaskView } from '../context/TaskViewContext';
import { findTasksByReward } from '../utils/search';
import type { TaskData } from '../types/Task';

/**
 * 搜索模式
 */
type SearchMode = 'name' | 'reward';

/**
 * TaskSearchBar Props
 */
interface TaskSearchBarProps {
  /** 任务数据数组（用于奖励搜索结果） */
  tasks?: TaskData[];
  /** 防抖延迟时间 (ms) */
  debounceMs?: number;
  /** 占位符文本 */
  placeholder?: string;
  /** 组件宽度 */
  width?: number | string;
  /** 点击搜索结果回调 */
  onResultClick?: (taskId: string) => void;
}

/**
 * TaskSearchBar 组件
 */
export default function TaskSearchBar({
  tasks = [],
  debounceMs = 250,
  placeholder,
  width = 280,
  onResultClick,
}: TaskSearchBarProps) {
  const {
    searchTerm,
    setSearchTerm,
    rewardSearchTerm,
    setRewardSearchTerm,
    setFocusTaskId,
  } = useTaskView();

  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [inputValue, setInputValue] = useState(
    searchMode === 'name' ? searchTerm : rewardSearchTerm
  );
  const [showResults, setShowResults] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // 根据搜索模式选择当前使用的搜索词状态
  const currentSearchTerm = searchMode === 'name' ? searchTerm : rewardSearchTerm;
  const setCurrentSearchTerm = searchMode === 'name' ? setSearchTerm : setRewardSearchTerm;

  // 获取占位符文本
  const placeholderText = useMemo(() => {
    if (placeholder) return placeholder;
    return searchMode === 'name'
      ? '搜索任务或商人...'
      : '按奖励物品搜索：输入物品名称';
  }, [placeholder, searchMode]);

  // 创建防抖函数的引用
  const debouncedSetSearchTerm = useRef(
    debounce((value: string, mode: SearchMode) => {
      if (mode === 'name') {
        setSearchTerm(value);
        setRewardSearchTerm('');
      } else {
        setRewardSearchTerm(value);
        setSearchTerm('');
      }
    }, debounceMs)
  ).current;

  // 计算奖励搜索结果
  const rewardSearchResults = useMemo(() => {
    if (searchMode !== 'reward' || !inputValue.trim() || tasks.length === 0) {
      return [];
    }
    const result = findTasksByReward(tasks, inputValue);
    return result.matches.slice(0, 10); // 最多显示10个结果
  }, [searchMode, inputValue, tasks]);

  // 根据搜索结果获取任务信息
  const searchResultTasks = useMemo(() => {
    return rewardSearchResults.map((match) => {
      const task = tasks.find((t) => t.taskId === match.taskId);
      return {
        ...match,
        taskName: task?.taskName || match.taskId,
        traderName: task?.trader.name || '',
      };
    });
  }, [rewardSearchResults, tasks]);

  // 同步外部 searchTerm 到输入框
  useEffect(() => {
    if (currentSearchTerm !== inputValue) {
      setInputValue(currentSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSearchTerm]);

  // 搜索模式切换时更新输入值
  useEffect(() => {
    setInputValue(searchMode === 'name' ? searchTerm : rewardSearchTerm);
  }, [searchMode, searchTerm, rewardSearchTerm]);

  // 组件卸载时取消防抖
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // 处理搜索模式切换
  const handleModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: SearchMode | null) => {
      if (newMode) {
        setSearchMode(newMode);
        setInputValue('');
        setSearchTerm('');
        setRewardSearchTerm('');
        setShowResults(false);
      }
    },
    [setSearchTerm, setRewardSearchTerm]
  );

  // 处理输入变化
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      debouncedSetSearchTerm(value, searchMode);
      
      // 奖励搜索时显示结果列表
      if (searchMode === 'reward' && value.trim()) {
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    },
    [debouncedSetSearchTerm, searchMode]
  );

  // 清除搜索
  const handleClear = useCallback(() => {
    setInputValue('');
    debouncedSetSearchTerm.cancel();
    setSearchTerm('');
    setRewardSearchTerm('');
    setShowResults(false);
  }, [debouncedSetSearchTerm, setSearchTerm, setRewardSearchTerm]);

  // 处理回车键立即搜索
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        debouncedSetSearchTerm.cancel();
        setCurrentSearchTerm(inputValue);
        
        // 奖励搜索时，回车跳转到第一个匹配结果
        if (searchMode === 'reward' && searchResultTasks.length > 0) {
          const firstResult = searchResultTasks[0];
          setFocusTaskId(firstResult.taskId);
          if (onResultClick) {
            onResultClick(firstResult.taskId);
          }
          setShowResults(false);
        }
      } else if (event.key === 'Escape') {
        handleClear();
      }
    },
    [
      debouncedSetSearchTerm,
      inputValue,
      setCurrentSearchTerm,
      searchMode,
      searchResultTasks,
      setFocusTaskId,
      onResultClick,
      handleClear,
    ]
  );

  // 点击搜索结果
  const handleResultClick = useCallback(
    (taskId: string) => {
      setFocusTaskId(taskId);
      if (onResultClick) {
        onResultClick(taskId);
      }
      setShowResults(false);
    },
    [setFocusTaskId, onResultClick]
  );

  // 点击外部关闭结果列表
  const handleClickAway = useCallback(() => {
    setShowResults(false);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }} ref={anchorRef}>
        {/* 搜索模式切换 */}
        <ToggleButtonGroup
          value={searchMode}
          exclusive
          onChange={handleModeChange}
          size="small"
          aria-label="搜索模式"
        >
          <ToggleButton value="name" aria-label="按名称搜索">
            <Tooltip title="按任务名称/商人搜索">
              <TextFieldsIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="reward" aria-label="按奖励搜索">
            <Tooltip title="按奖励物品搜索">
              <CardGiftcardIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* 搜索输入框 */}
        <TextField
          size="small"
          placeholder={placeholderText}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchMode === 'reward' && inputValue.trim() && searchResultTasks.length > 0) {
              setShowResults(true);
            }
          }}
          sx={{ width }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {searchMode === 'reward' ? (
                  <CardGiftcardIcon fontSize="small" color="action" />
                ) : (
                  <SearchIcon fontSize="small" color="action" />
                )}
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

        {/* 奖励搜索结果下拉列表 */}
        <Popper
          open={showResults && searchResultTasks.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <Paper elevation={3} sx={{ width: width, maxHeight: 300, overflow: 'auto', mt: 0.5 }}>
            <List dense disablePadding>
              {searchResultTasks.map((result) => (
                <ListItem key={result.taskId} disablePadding>
                  <ListItemButton onClick={() => handleResultClick(result.taskId)}>
                    <ListItemText
                      primary={result.taskName}
                      secondary={
                        <>
                          {result.traderName}
                          {' · '}
                          {result.matchedRewards.map((r) => r.description).join(', ')}
                        </>
                      }
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
