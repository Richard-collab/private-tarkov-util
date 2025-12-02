/**
 * TaskNode - React Flow 任务节点组件
 * 
 * 该组件用于在 React Flow 图中展示任务信息，包括：
 * 1. 发布任务商人 (Trader)
 * 2. 任务名称 (Task Name)
 * 3. 任务目标 (Task Objectives)
 * 4. 任务奖励 (Task Rewards)
 * 5. 解锁该任务条件 (Unlock Requirements)
 * 6. 后续任务 (Follow-up Tasks)
 * 
 * 后台存储数据：任务id、任务组
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import type { TaskData } from '../types/Task';

/**
 * TaskNode 节点类型定义
 */
export type TaskNode = Node<TaskData, 'task'>;

/**
 * TaskNode Props 类型
 */
type TaskNodeProps = NodeProps<TaskNode>;

/**
 * 获取奖励类型对应的颜色
 */
const getRewardColor = (type: string): 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'default' => {
  const colorMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'default'> = {
    experience: 'success',
    money: 'warning',
    item: 'info',
    skill: 'primary',
    reputation: 'secondary',
    unlock: 'default',
  };
  return colorMap[type] || 'default';
};

/**
 * TaskNode 组件
 * 用于在 React Flow 中展示任务详细信息
 */
function TaskNodeComponent({ data, selected }: TaskNodeProps) {
  const {
    trader,
    taskName,
    objectives,
    rewards,
    unlockRequirements,
    followUpTasks,
    taskGroup,
    minPlayerLevel,
  } = data;

  return (
    <>
      {/* 输入连接点 - 用于连接前置任务 */}
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#555' }}
      />
      
      <Card
        sx={{
          minWidth: 320,
          maxWidth: 400,
          border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
          borderRadius: 2,
          boxShadow: selected ? 4 : 2,
          bgcolor: 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* 商人信息和任务名称 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={trader.imageUrl}
              alt={trader.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {!trader.imageUrl && <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {trader.name}
              </Typography>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {taskName}
              </Typography>
            </Box>
          </Box>

          {/* 任务组和等级标签 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {taskGroup && (
              <Chip 
                label={taskGroup} 
                size="small" 
                variant="outlined"
                color="primary"
              />
            )}
            {minPlayerLevel && (
              <Chip 
                label={`Lv.${minPlayerLevel}+`} 
                size="small" 
                color="secondary"
              />
            )}
          </Box>

          {/* 任务目标 */}
          <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 1, minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2">任务目标</Typography>
                <Chip label={objectives.length} size="small" sx={{ height: 20 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, py: 0 }}>
              <List dense disablePadding>
                {objectives.map((objective, index) => (
                  <ListItem key={objective.id || index} disablePadding sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
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
                        sx: { 
                          color: objective.optional ? 'text.secondary' : 'text.primary'
                        }
                      }}
                    />
                    {objective.optional && (
                      <Chip label="可选" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 1 }} />

          {/* 任务奖励 */}
          <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 1, minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardGiftcardIcon fontSize="small" color="success" />
                <Typography variant="subtitle2">任务奖励</Typography>
                <Chip label={rewards.length} size="small" sx={{ height: 20 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, py: 0 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {rewards.map((reward, index) => (
                  <Chip
                    key={index}
                    label={reward.description || `${reward.type}: ${reward.value}`}
                    size="small"
                    color={getRewardColor(reward.type)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* 解锁条件 */}
          {unlockRequirements.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 1, minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockOpenIcon fontSize="small" color="warning" />
                    <Typography variant="subtitle2">解锁条件</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1, py: 0 }}>
                  <List dense disablePadding>
                    {unlockRequirements.map((req, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <LockOpenIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            req.type === 'task' 
                              ? `完成任务: ${req.taskName || req.taskId}`
                              : req.type === 'level'
                              ? `达到等级: ${req.level}`
                              : req.description || `${req.type}: ${req.value}`
                          }
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </>
          )}

          {/* 后续任务 */}
          {followUpTasks.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 1, minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowForwardIcon fontSize="small" color="info" />
                    <Typography variant="subtitle2">后续任务</Typography>
                    <Chip label={followUpTasks.length} size="small" sx={{ height: 20 }} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1, py: 0 }}>
                  <List dense disablePadding>
                    {followUpTasks.map((task, index) => (
                      <ListItem key={task.taskId || index} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <ArrowForwardIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={task.taskName}
                          secondary={task.traderName}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </CardContent>
      </Card>

      {/* 输出连接点 - 用于连接后续任务 */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#555' }}
      />
    </>
  );
}

/**
 * 导出 memo 包装的组件以优化性能
 */
export default memo(TaskNodeComponent);
