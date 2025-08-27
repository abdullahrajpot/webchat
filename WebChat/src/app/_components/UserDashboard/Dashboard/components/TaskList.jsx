import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Pagination,
  Stack,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Collapse
} from '@mui/material';
import {
  Delete,
  Edit,
  MoreVert,
  Search,
  FilterList,
  Add,
  CalendarToday,
  Flag,
  Person,
  Assignment,
  Refresh,
  ExpandMore,
  ExpandLess,
  AddCircle,
  RemoveCircle
} from '@mui/icons-material';
import { useAuth } from '@app/_components/_core/AuthProvider/hooks';
import { useTranslation } from 'react-i18next';

const TaskList = ({
  tasks,
  loading,
  pagination,
  onStatusUpdate,
  onPageChange,
  onFilterChange,
  filters
}) => {
  const { user, token } = useAuth();
  const [error, setError] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const { t } = useTranslation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    progress: 0,
    deadline: '',
    assignees: []
  });

  const API_BASE_URL = 'http://localhost:5001';

  // Toggle expansion of task details
  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return newExpanded;
    });
  };

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedTask) {
      setEditForm({
        title: selectedTask.title,
        description: selectedTask.description,
        status: selectedTask.status,
        priority: selectedTask.priority,
        progress: selectedTask.progress || 0,
        deadline: selectedTask.deadline ? new Date(selectedTask.deadline).toISOString().split('T')[0] : '',
        assignees: selectedTask.assignees?.map(a => a._id) || []
      });
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    try {
      await apiCall(`/api/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setEditDialogOpen(false);
      setSelectedTask(null);
      // Refresh the task list by calling the parent's refresh function
      onFilterChange({}); // This will trigger a refetch with current filters
    } catch (error) {
      setError(`Failed to update task: ${error.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedTask._id) {
        alert("No task selected for deletion");
        return;
      }

      await apiCall(`/api/tasks/${selectedTask._id}`, { method: 'DELETE' });
      
      // Remove the task from the list
      const updatedTasks = tasks.filter(task => task._id !== selectedTask._id);
      // This would typically be handled by the parent component refreshing the data
      onFilterChange({}); // Trigger a refetch
      
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setError("Failed to delete task");
    }
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
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('alltask.searchtask')}
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('alltask.status')}</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Status"
                  onChange={(e) => onFilterChange({ status: e.target.value })}
                >
                  <MenuItem value="">{t('alltask.allstatus')}</MenuItem>
                  <MenuItem value="Pending">{t('alltask.pending')}</MenuItem>
                  <MenuItem value="In Progress">{t('alltask.inprogress')}</MenuItem>
                  <MenuItem value="Completed">{t('alltask.completed')}</MenuItem>
                  <MenuItem value="On Hold">{t('alltask.onhold')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('alltask.priority')}</InputLabel>
                <Select
                  value={filters.priority || ''}
                  label="Priority"
                  onChange={(e) => onFilterChange({ priority: e.target.value })}
                >
                  <MenuItem value="">{t('alltask.allpriorities')}</MenuItem>
                  <MenuItem value="Low">{t('alltask.low')}</MenuItem>
                  <MenuItem value="Medium">{t('alltask.medium')}</MenuItem>
                  <MenuItem value="High">{t('alltask.high')}</MenuItem>
                  <MenuItem value="Urgent">{t('alltask.urgent')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => onFilterChange({})}
                disabled={loading}
              >
                {t('alltask.refresh')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tasks List */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>{t('alltask.loadingtask')}</Typography>
            </Box>
          ) : tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tasks found
              </Typography>
              <Typography color="text.secondary">
                {Object.values(filters).some(val => val) 
                  ? 'Try adjusting your filters' 
                  : 'No tasks have been created yet'
                }
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {tasks.map((task) => (
                <Paper 
                  key={task._id} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {/* Main Task Card Header */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Expand/Collapse Button */}
                      <IconButton
                        onClick={() => toggleTaskExpansion(task._id)}
                        size="small"
                        sx={{
                          backgroundColor: expandedTasks.has(task._id) ? 'error.light' : 'primary.light',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: expandedTasks.has(task._id) ? 'error.main' : 'primary.main',
                          },
                          width: 32,
                          height: 32
                        }}
                      >
                        {expandedTasks.has(task._id) ? <RemoveCircle /> : <AddCircle />}
                      </IconButton>

                      {/* Task Avatar/Icon */}
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}
                      >
                        {task.title?.charAt(0).toUpperCase() || 'T'}
                      </Avatar>

                      {/* Task Info */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16 }} />
                          {formatDate(task.createdAt || task.deadline)}
                        </Typography>
                      </Box>

                      {/* Progress Bar */}
                      <Box sx={{ minWidth: 200, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress || 0}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: task.progress === 100 ? 'success.main' : 'primary.main'
                            }
                          }}
                        />
                      </Box>

                      {/* Deadline */}
                      <Box sx={{ minWidth: 120, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                         {t('alltask.deadline')}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: isOverdue(task.deadline) && task.status !== 'Completed' ? 'error.main' : 'text.primary'
                          }}
                        >
                          {formatDate(task.deadline)}
                        </Typography>
                      </Box>

                      {/* Status */}
                      <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t('alltask.status')}
                        </Typography>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>

                      {/* Team Members */}
                      <Box sx={{ minWidth: 80, display: 'flex', justifyContent: 'center' }}>
                        {task.assignees && task.assignees.length > 0 ? (
                          <AvatarGroup 
                            max={3} 
                            sx={{ 
                              '& .MuiAvatar-root': { 
                                width: 32, 
                                height: 32,
                                border: '2px solid white',
                                fontSize: '0.8rem'
                              } 
                            }}
                          >
                            {task.assignees.map((assignee) => (
                              <Avatar
                                key={assignee._id}
                                src={assignee.avatar}
                                alt={assignee.name}
                              >
                                {assignee.name?.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                           {t('alltask.noassigness')}
                          </Typography>
                        )}
                      </Box>

                      {/* More Actions */}
                      <IconButton
                        onClick={(e) => handleMenuClick(e, task)}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expandable Description Section */}
                  <Collapse in={expandedTasks.has(task._id)} timeout="auto" unmountOnExit>
                    <Divider />
                    <Box sx={{ p: 3, pt: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {t('alltask.description')}
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3, 
                          lineHeight: 1.6,
                          backgroundColor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          fontStyle: task.description ? 'normal' : 'italic'
                        }}
                      >
                        {task.description || 'No description provided for this task.'}
                      </Typography>

                      {/* Additional Details */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                             {t('alltask.taskdetails')}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Flag sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {t('alltask.priority')}
                              </Typography>
                              <Chip
                                label={task.priority}
                                color={getPriorityColor(task.priority)}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {t('alltask.createdby')}: {task.creator?.name || 'Unknown'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {t('alltask.progress')}: {task.progress || 0}% complete
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          {task.tags && task.tags.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                               {t('alltask.tags')}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {task.tags.map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Paper>
              ))}

              {/* Pagination */}
              {pagination && pagination.total > 1 && (
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
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('alltask.edittask')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('alltask.titles')}
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('alltask.description')}
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>{t('alltask.status')}</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="Pending">{t('alltask.pending')}</MenuItem>
                <MenuItem value="In Progress">{t('alltask.inprogress')}</MenuItem>
                <MenuItem value="Completed">{t('alltask.completed')}</MenuItem>
                <MenuItem value="On Hold">{t('alltask.onhold')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('alltask.priority')}</InputLabel>
              <Select
                value={editForm.priority}
                label={t('alltask.priority')}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="Low">{t('alltask.low')}</MenuItem>
                <MenuItem value="Medium">{t('alltask.medium')}</MenuItem>
                <MenuItem value="High">{t('alltask.high')}</MenuItem>
                <MenuItem value="Urgent">{t('alltask.urgent')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('alltask.progress')}
              type="number"
              value={editForm.progress}
              onChange={(e) => setEditForm(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label={t('alltask.deadline')}
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('alltask.cancel')}</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={loading}
          >
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the task "{selectedTask?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} /> {t('alltask.edittask')}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />{t('alltask.deletetask')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList;