import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import {
  MoreVert,
  Search,
  CalendarToday,
  Flag,
  Person,
  Assignment
} from '@mui/icons-material';

const TaskList = ({
  tasks = [],
  loading = false,
  pagination = {},
  onStatusUpdate,
  onPageChange,
  onFilterChange,
  filters = {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleStatusChange = (status) => {
    if (selectedTask && onStatusUpdate) {
      onStatusUpdate(selectedTask._id, status);
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      case 'On Hold': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    const taskDate = new Date(date);
    const now = new Date();
    const isOverdue = taskDate < now;

    return {
      formatted: taskDate.toLocaleDateString(),
      isOverdue
    };
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Debounce search
    clearTimeout(handleSearchChange.timeoutId);
    handleSearchChange.timeoutId = setTimeout(() => {
      onFilterChange({ ...filters, search: value });
    }, 500);
  };

  const handleFilterChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2">
            My Tasks
          </Typography>

          {/* Filters */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority || ''}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All Priority</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Loading tasks...</Typography>
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks found
            </Typography>
            <Typography color="text.secondary">
              {Object.keys(filters).some(key => filters[key])
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'
              }
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {tasks.map((task) => {
              const deadline = formatDate(task.deadline);

              return (
                <Card key={task._id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority)}
                          size="small"
                          icon={<Flag />}
                        />
                      </Box>

                      {task.description && (
                        <Typography
                          color="text.secondary"
                          sx={{ mb: 2 }}
                          variant="body2"
                        >
                          {task.description.length > 150
                            ? `${task.description.substring(0, 150)}...`
                            : task.description
                          }
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16 }} />
                          <Typography
                            variant="caption"
                            color={deadline.isOverdue ? 'error.main' : 'text.secondary'}
                          >
                            {deadline.formatted}
                            {deadline.isOverdue && ' (Overdue)'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16 }} />
                          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                            <Avatar
                              src={task.creator?.avatar}
                              alt={task.creator?.name}
                              sx={{ width: 24, height: 24 }}
                            >
                              {task.creator?.name?.charAt(0)}
                            </Avatar>
                            {task.assignees?.map((assignee) => (
                              <Avatar
                                key={assignee._id}
                                src={assignee.avatar}
                                alt={assignee.name}
                                sx={{ width: 24, height: 24 }}
                              >
                                {assignee.name?.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </Box>
                      </Box>

                      {/* Progress bar */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress || 0}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {task.progress || 0}%
                        </Typography>
                      </Box>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {task.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    <IconButton
                      onClick={(e) => handleMenuClick(e, task)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Card>
              );
            })}

            {/* Pagination */}
            {pagination.total > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pagination.total}
                  page={pagination.current}
                  onChange={(event, page) => onPageChange(page)}
                  color="primary"
                />
              </Box>
            )}
          </Stack>
        )}

        {/* Status Update Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleStatusChange('Pending')}>
            <Chip label="Pending" color="warning" size="small" sx={{ mr: 1 }} />
            Mark as Pending
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('In Progress')}>
            <Chip label="In Progress" color="info" size="small" sx={{ mr: 1 }} />
            Mark as In Progress
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('Completed')}>
            <Chip label="Completed" color="success" size="small" sx={{ mr: 1 }} />
            Mark as Completed
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('On Hold')}>
            <Chip label="On Hold" color="default" size="small" sx={{ mr: 1 }} />
            Mark as On Hold
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default TaskList;