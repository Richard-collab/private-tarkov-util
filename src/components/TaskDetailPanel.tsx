/**
 * TaskDetailPanel - 任务详情面板组件
 * 
 * 右侧抽屉面板，显示任务详细信息：
 * - 任务名称和描述
 * - 任务奖励（物品图标、名称、数量）
 * - 后续任务列表（可点击跳转）
 * - 先决任务列表
 */

import { memo, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { TaskData, TaskReward, TaskObjective, UnlockRequirement, FollowUpTask } from '../types/Task';

/**
 * TaskDetailPanel Props
 */
interface TaskDetailPanelProps {
  /** 是否打开面板 */
  open: boolean;
  /** 关闭面板回调 */
  onClose: () => void;
  /** 当前选中的任务数据 */
  task: TaskData | null;
  /** 点击后续任务回调，用于跳转到对应节点 */
  onFollowUpTaskClick?: (taskId: string) => void;
  /** 点击前置任务回调，用于跳转到对应节点 */
  onPrerequisiteTaskClick?: (taskId: string) => void;
  /** 面板宽度 */
  width?: number;
}

/**
 * 获取奖励类型对应的图标
 */
function getRewardIcon(type: TaskReward['type']) {
  switch (type) {
    case 'experience':
      return <EmojiEventsIcon fontSize="small" color="success" />;
    case 'money':
      return <MonetizationOnIcon fontSize="small" color="warning" />;
    case 'item':
      return <InventoryIcon fontSize="small" color="info" />;
    case 'skill':
      return <StarIcon fontSize="small" color="primary" />;
    case 'reputation':
      return <PersonIcon fontSize="small" color="secondary" />;
    case 'unlock':
      return <LockOpenIcon fontSize="small" color="action" />;
    default:
      return <CardGiftcardIcon fontSize="small" />;
  }
}

/**
 * 获取奖励类型对应的颜色
 */
function getRewardColor(type: TaskReward['type']): 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'default' {
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'default'> = {
    experience: 'success',
    money: 'warning',
    item: 'info',
    skill: 'primary',
    reputation: 'secondary',
    unlock: 'default',
  };
  return colorMap[type] || 'default';
}

/**
 * 奖励项组件
 */
const RewardItem = memo(function RewardItem({ reward }: { reward: TaskReward }) {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getRewardIcon(reward.type)}
          <Typography variant="body2" sx={{ flex: 1 }}>
            {reward.description || `${reward.type}: ${reward.value}`}
          </Typography>
          <Chip
            label={reward.type}
            size="small"
            color={getRewardColor(reward.type)}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

/**
 * 目标项组件
 */
const ObjectiveItem = memo(function ObjectiveItem({ objective }: { objective: TaskObjective }) {
  return (
    <ListItem disablePadding sx={{ py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 32 }}>
        <CheckCircleOutlineIcon
          fontSize="small"
          color={objective.optional ? 'disabled' : 'action'}
        />
      </ListItemIcon>
      <ListItemText
        primary={objective.description}
        secondary={objective.count ? `需要: ${objective.count}` : undefined}
        primaryTypographyProps={{
          variant: 'body2',
          sx: { color: objective.optional ? 'text.secondary' : 'text.primary' }
        }}
      />
      {objective.optional && (
        <Chip label="可选" size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
      )}
    </ListItem>
  );
});

/**
 * 前置任务项组件
 */
const PrerequisiteItem = memo(function PrerequisiteItem({
  requirement,
  onClick,
}: {
  requirement: UnlockRequirement;
  onClick?: (taskId: string) => void;
}) {
  const handleClick = useCallback(() => {
    if (requirement.type === 'task' && requirement.taskId && onClick) {
      onClick(requirement.taskId);
    }
  }, [requirement, onClick]);

  const isTask = requirement.type === 'task';
  const label = requirement.type === 'task'
    ? requirement.taskName || requirement.taskId
    : requirement.type === 'level'
    ? `等级 ${requirement.level}`
    : requirement.description || `${requirement.type}: ${requirement.value}`;

  if (isTask && onClick) {
    return (
      <ListItemButton onClick={handleClick} sx={{ py: 0.5, borderRadius: 1 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <ArrowBackIcon fontSize="small" color="warning" />
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{ variant: 'body2' }}
        />
      </ListItemButton>
    );
  }

  return (
    <ListItem disablePadding sx={{ py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 32 }}>
        <LockOpenIcon fontSize="small" color="action" />
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{ variant: 'body2' }}
      />
    </ListItem>
  );
});

/**
 * 后续任务项组件
 */
const FollowUpItem = memo(function FollowUpItem({
  task,
  onClick,
}: {
  task: FollowUpTask;
  onClick?: (taskId: string) => void;
}) {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(task.taskId);
    }
  }, [task.taskId, onClick]);

  if (onClick) {
    return (
      <ListItemButton onClick={handleClick} sx={{ py: 0.5, borderRadius: 1 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <ArrowForwardIcon fontSize="small" color="info" />
        </ListItemIcon>
        <ListItemText
          primary={task.taskName}
          secondary={task.traderName}
          primaryTypographyProps={{ variant: 'body2' }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </ListItemButton>
    );
  }

  return (
    <ListItem disablePadding sx={{ py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 32 }}>
        <ArrowForwardIcon fontSize="small" color="action" />
      </ListItemIcon>
      <ListItemText
        primary={task.taskName}
        secondary={task.traderName}
        primaryTypographyProps={{ variant: 'body2' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    </ListItem>
  );
});

/**
 * TaskDetailPanel 组件
 */
function TaskDetailPanel({
  open,
  onClose,
  task,
  onFollowUpTaskClick,
  onPrerequisiteTaskClick,
  width = 400,
}: TaskDetailPanelProps) {
  if (!task) {
    return null;
  }

  const {
    trader,
    taskName,
    taskGroup,
    minPlayerLevel,
    objectives,
    rewards,
    unlockRequirements,
    followUpTasks,
    wikiLink,
  } = task;

  // 获取前置任务需求（仅任务类型）
  const taskPrerequisites = unlockRequirements.filter((req) => req.type === 'task');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width, maxWidth: '100vw' },
      }}
    >
      {/* 头部 */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Avatar
          src={trader.imageUrl}
          alt={trader.name}
          sx={{ width: 56, height: 56 }}
        >
          {!trader.imageUrl && <PersonIcon />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {trader.name}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
            {taskName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            {taskGroup && (
              <Chip
                label={taskGroup}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
            {minPlayerLevel && minPlayerLevel > 1 && (
              <Chip
                label={`Lv.${minPlayerLevel}+`}
                size="small"
                color="secondary"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" edge="end">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        {/* 任务目标 */}
        {objectives.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlineIcon fontSize="small" color="primary" />
              任务目标
              <Chip label={objectives.length} size="small" sx={{ height: 18, ml: 'auto' }} />
            </Typography>
            <List dense disablePadding>
              {objectives.map((objective) => (
                <ObjectiveItem key={objective.id} objective={objective} />
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 任务奖励 */}
        {rewards.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CardGiftcardIcon fontSize="small" color="success" />
              任务奖励
              <Chip label={rewards.length} size="small" sx={{ height: 18, ml: 'auto' }} />
            </Typography>
            {rewards.map((reward, index) => (
              <RewardItem key={index} reward={reward} />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 前置任务 */}
        {taskPrerequisites.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowBackIcon fontSize="small" color="warning" />
              前置任务
              <Chip label={taskPrerequisites.length} size="small" sx={{ height: 18, ml: 'auto' }} />
            </Typography>
            <List dense disablePadding>
              {taskPrerequisites.map((req, index) => (
                <PrerequisiteItem
                  key={req.taskId || index}
                  requirement={req}
                  onClick={onPrerequisiteTaskClick}
                />
              ))}
            </List>
          </Box>
        )}

        {/* 后续任务 */}
        {followUpTasks.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowForwardIcon fontSize="small" color="info" />
              后续任务
              <Chip label={followUpTasks.length} size="small" sx={{ height: 18, ml: 'auto' }} />
            </Typography>
            <List dense disablePadding>
              {followUpTasks.map((task) => (
                <FollowUpItem
                  key={task.taskId}
                  task={task}
                  onClick={onFollowUpTaskClick}
                />
              ))}
            </List>
          </Box>
        )}

        {/* Wiki 链接 */}
        {wikiLink && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              component="a"
              href={wikiLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              查看 Wiki 详情 →
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default memo(TaskDetailPanel);
