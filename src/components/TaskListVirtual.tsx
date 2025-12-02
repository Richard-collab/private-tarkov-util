/**
 * TaskListVirtual - 虚拟化任务列表组件
 * 
 * 使用 react-window 实现虚拟滚动，优化大量任务的渲染性能
 * Uses react-window for virtualized scrolling to optimize rendering of many tasks
 */

import { memo, useCallback, useMemo, type ReactElement } from 'react';
import { List, type RowComponentProps } from 'react-window';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { TaskData } from '../types/Task';
import { useTaskView } from '../context/TaskViewContext';

/**
 * TaskListVirtual Props
 */
interface TaskListVirtualProps {
  /** 任务数据数组 */
  tasks: TaskData[];
  /** 列表高度 */
  height: number;
  /** 列表宽度 */
  width: number;
  /** 点击任务回调，用于在流程图中聚焦对应节点 */
  onTaskClick?: (taskId: string) => void;
  /** 当前选中的任务ID */
  selectedTaskId?: string | null;
}

/**
 * 单个任务行的数据（通过 rowProps 传递）
 */
interface TaskRowData {
  tasks: TaskData[];
  matchedTaskIds: Set<string>;
  onTaskClick?: (taskId: string) => void;
  selectedTaskId?: string | null;
}

/**
 * 检查任务是否匹配过滤条件
 */
function isTaskMatched(
  task: TaskData,
  merchantFilter: string | null,
  searchTerm: string
): boolean {
  if (merchantFilter && task.trader.name !== merchantFilter) {
    return false;
  }
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesName = task.taskName.toLowerCase().includes(lowerSearch);
    const matchesMerchant = task.trader.name.toLowerCase().includes(lowerSearch);
    if (!matchesName && !matchesMerchant) {
      return false;
    }
  }
  return true;
}

/**
 * 任务行组件 - 使用 react-window RowComponentProps
 */
const TaskRow = memo(function TaskRow({
  index,
  style,
  tasks,
  matchedTaskIds,
  onTaskClick,
  selectedTaskId,
}: RowComponentProps<TaskRowData>): ReactElement {
  const task = tasks[index];
  const isMatched = matchedTaskIds.has(task.taskId);
  const isSelected = selectedTaskId === task.taskId;

  const handleClick = useCallback(() => {
    if (onTaskClick) {
      onTaskClick(task.taskId);
    }
  }, [onTaskClick, task.taskId]);

  return (
    <Box
      style={style}
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 0.5,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        opacity: isMatched ? 1 : 0.4,
        filter: isMatched ? 'none' : 'grayscale(50%)',
        transition: 'background-color 0.15s, opacity 0.15s',
        '&:hover': {
          bgcolor: isSelected ? 'action.selected' : 'action.hover',
        },
      }}
    >
      {/* 商人头像 */}
      <Avatar
        src={task.trader.imageUrl}
        alt={task.trader.name}
        sx={{ width: 32, height: 32, flexShrink: 0 }}
      >
        {!task.trader.imageUrl && <PersonIcon fontSize="small" />}
      </Avatar>

      {/* 任务信息 */}
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? 'bold' : 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.taskName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.trader.name}
          {task.taskGroup && ` · ${task.taskGroup}`}
        </Typography>
      </Box>

      {/* 等级标签 */}
      {task.minPlayerLevel && task.minPlayerLevel > 1 && (
        <Chip
          label={`Lv.${task.minPlayerLevel}`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  );
});

/**
 * TaskListVirtual 组件
 */
export default function TaskListVirtual({
  tasks,
  height,
  width,
  onTaskClick,
  selectedTaskId,
}: TaskListVirtualProps) {
  const { merchantFilter, searchTerm } = useTaskView();

  // 计算匹配的任务ID集合
  const matchedTaskIds = useMemo(() => {
    const matched = new Set<string>();
    tasks.forEach((task) => {
      if (isTaskMatched(task, merchantFilter, searchTerm)) {
        matched.add(task.taskId);
      }
    });
    return matched;
  }, [tasks, merchantFilter, searchTerm]);

  // 统计匹配数量
  const matchedCount = matchedTaskIds.size;
  const totalCount = tasks.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 统计信息 */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {merchantFilter || searchTerm
            ? `显示 ${matchedCount} / ${totalCount} 个任务`
            : `共 ${totalCount} 个任务`}
        </Typography>
      </Box>

      {/* 虚拟化列表 */}
      <Box sx={{ flex: 1 }}>
        <List
          style={{ height: height - 40, width }} // 减去统计信息的高度
          rowCount={tasks.length}
          rowHeight={56} // 每行高度
          rowComponent={TaskRow}
          rowProps={{
            tasks,
            matchedTaskIds,
            onTaskClick,
            selectedTaskId,
          }}
          overscanCount={5}
        />
      </Box>
    </Box>
  );
}
