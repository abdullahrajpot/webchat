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

const AllTasks = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await apiCall(`/api/tasks/admin-tasks?${queryParams}`);
      setTasks(data.tasks || []);
      setPagination(data.pagination || { current: 1, total: 1, count: 0 });
    } catch (error) {
      setError(`Failed to fetch tasks: ${error.message}`);
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field !== 'page' && { page: 1 })
    }));
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
      setLoading(true);
      await apiCall(`/api/tasks/${selectedTask._id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setEditDialogOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      setError(`Failed to update task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("Deleting Task ID:", selectedTask._id);

      if (!selectedTask._id) {
        alert("No task selected for deletion");
        return;
      }

      const response = await apiCall(`/api/tasks/${selectedTask._id}`, { method: 'DELETE' });
      console.log("Delete response:", response);

      setTasks(tasks.filter(task => task._id !== selectedTask._id));
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
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

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Access denied. Admin privileges required.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all tasks across the system
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
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
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
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
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchTasks}
                disabled={loading}
              >
                Refresh
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
              <Typography sx={{ mt: 2 }}>Loading tasks...</Typography>
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
                          Deadline
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
                          Status
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
                            No assignees
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
                        Description
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
                              Task Details
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Flag sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Priority:
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
                                Created by: {task.creator?.name || 'Unknown'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Assignment sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Progress: {task.progress || 0}% complete
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          {task.tags && task.tags.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                Tags
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
              {pagination.total > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={pagination.total}
                    page={pagination.current}
                    onChange={(event, page) => handleFilterChange('page', page)}
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
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editForm.priority}
                label="Priority"
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Progress"
              type="number"
              value={editForm.progress}
              onChange={(e) => setEditForm(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label="Deadline"
              type="date"
              value={editForm.deadline}
              onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Update Task'}
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
            {loading ? <CircularProgress size={20} /> : 'Delete'}
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
          <Edit sx={{ mr: 1 }} /> Edit Task
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete Task
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AllTasks;