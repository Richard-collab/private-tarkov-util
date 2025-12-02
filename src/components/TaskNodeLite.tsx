/**
 * TaskNodeLite - 轻量级任务节点组件
 * 
 * 优化性能的精简版任务节点，适用于大量节点渲染
 * Lightweight task node component optimized for rendering many nodes
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { TaskData } from '../types/Task';

/**
 * 扩展的任务数据，包含匹配状态
 * Extended task data with match status
 */
export interface TaskNodeData extends TaskData {
  /** 是否匹配当前过滤条件 */
  matched?: boolean;
}

/**
 * TaskNodeLite 节点类型定义
 */
export type TaskNodeLiteNode = Node<TaskNodeData, 'taskLite'>;

/**
 * TaskNodeLite Props 类型
 */
type TaskNodeLiteProps = NodeProps<TaskNodeLiteNode>;

/**
 * TaskNodeLite 组件
 * 
 * 精简版任务节点，仅显示核心信息：
 * - 商人头像
 * - 任务名称
 * - 任务组标签
 * - 等级要求
 */
function TaskNodeLiteComponent({ data, selected }: TaskNodeLiteProps) {
  const { trader, taskName, taskGroup, minPlayerLevel, matched = true } = data;

  const isFaded = !matched;

  return (
    <>
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />

      <Box
        className={`task-node ${isFaded ? 'faded' : ''}`}
        sx={{
          minWidth: 280,
          maxWidth: 320,
          p: 1.5,
          borderRadius: 2,
          border: selected ? '2px solid #1976d2' : '1px solid',
          borderColor: selected ? '#1976d2' : 'divider',
          bgcolor: 'background.paper',
          boxShadow: selected ? 3 : 1,
          transition: 'opacity 0.2s, box-shadow 0.2s',
          opacity: isFaded ? 0.4 : 1,
          filter: isFaded ? 'grayscale(50%)' : 'none',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        {/* 商人和任务名称 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={trader.imageUrl}
            alt={trader.name}
            sx={{ width: 36, height: 36 }}
          >
            {!trader.imageUrl && <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.2 }}
            >
              {trader.name}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {taskName}
            </Typography>
          </Box>
        </Box>

        {/* 标签行 */}
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
          {taskGroup && (
            <Chip
              label={taskGroup}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
          {minPlayerLevel && minPlayerLevel > 1 && (
            <Chip
              label={`Lv.${minPlayerLevel}`}
              size="small"
              color="secondary"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </Box>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </>
  );
}

/**
 * 导出 memo 包装的组件以优化性能
 */
export default memo(TaskNodeLiteComponent);
