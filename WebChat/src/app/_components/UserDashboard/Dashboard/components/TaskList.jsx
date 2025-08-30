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
  RemoveCircle,
  CheckCircle,
  PauseCircle,
  PlayArrow,
  Schedule,
  AttachFile,
  Visibility,
  Download
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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const API_BASE_URL = 'https://profound-harmony-production.up.railway.app';

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

  const handleStatusUpdate = () => {
    if (selectedTask) {
      setNewStatus(selectedTask.status);
      setStatusDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleStatusSubmit = async () => {
    if (!selectedTask || !newStatus) return;

    setUpdatingStatus(true);
    try {
      await apiCall(`/api/tasks/${selectedTask._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      setStatusDialogOpen(false);
      setSelectedTask(null);
      setNewStatus('');
      
      // Refresh the task list
      onFilterChange({});
    } catch (error) {
      setError(`Failed to update task status: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle />;
      case 'In Progress': return <PlayArrow />;
      case 'Pending': return <Schedule />;
      case 'On Hold': return <PauseCircle />;
      default: return <Assignment />;
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

// Replace the viewAttachment and downloadAttachment functions with these:

// Securely view an attachment
const viewAttachment = async (attachment) => {
  try {
    const rawUrl = attachment?.url || attachment?.fileUrl || attachment?.file_path || attachment?.path;
    if (!rawUrl) {
      setError('No file URL provided');
      return;
    }

    // Extract filename from URL
    const filename = String(rawUrl).split('/').pop();
    if (!filename) {
      setError('Invalid file URL');
      return;
    }

    // Use the view endpoint
    const viewUrl = `${API_BASE_URL}/api/tasks/files/${encodeURIComponent(filename)}`;
    
    const response = await fetch(viewUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to view file: ${response.status}`);
    }

    // Open in new tab for viewing
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    
  } catch (error) {
    console.error('View attachment error:', error);
    setError(`Failed to view file: ${error.message}`);
  }
};

// Add this helper function to your React component
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Securely download an attachment
const downloadAttachment = async (attachment) => {
  try {
    const rawUrl = attachment?.url || attachment?.fileUrl || attachment?.file_path || attachment?.path;
    if (!rawUrl) {
      setError('No file URL provided');
      return;
    }

    // Extract filename from URL
    const filename = String(rawUrl).split('/').pop();
    if (!filename) {
      setError('Invalid file URL');
      return;
    }

    // Use the download endpoint
    const downloadUrl = `${API_BASE_URL}/api/tasks/files/${encodeURIComponent(filename)}/download`;
    
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    // Get the blob and create download link
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Use the original filename if available, otherwise use the stored filename
    link.download = attachment.name || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (error) {
    console.error('Download attachment error:', error);
    setError(`Failed to download file: ${error.message}`);
  }
};

  // Calculate progress based on task status
  const calculateProgress = (task) => {
    switch (task.status) {
      case 'Completed':
        return 100;
      case 'In Progress':
        return task.progress || 50; // Default to 50% if no progress set
      case 'On Hold':
        return task.progress || 25; // Default to 25% if no progress set
      case 'Pending':
        return 0;
      default:
        return task.progress || 0;
    }
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
                  <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      flexWrap: { xs: 'wrap', md: 'nowrap' }
                    }}>
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
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16 }} />
                          {formatDate(task.createdAt || task.deadline)}
                        </Typography>
                      </Box>

                      {/* Progress Bar */}
                      <Box sx={{ minWidth: { xs: '100%', sm: 180 }, mr: { xs: 0, md: 2 } }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(task)}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: calculateProgress(task) === 100 ? 'success.main' : 'primary.main'
                            }
                          }}
                        />
                      </Box>

                      {/* Deadline */}
                      <Box sx={{ minWidth: { xs: 'auto', md: 120 }, textAlign: { xs: 'left', md: 'center' }, flex: { xs: '1 1 45%', md: '0 0 auto' } }}>
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
                      <Box sx={{ minWidth: { xs: 'auto', md: 100 }, textAlign: { xs: 'left', md: 'center' }, flex: { xs: '1 1 45%', md: '0 0 auto' } }}>
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
                      <Box sx={{ minWidth: { xs: 'auto', md: 80 }, display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
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
                                {t('alltask.progress')}: {calculateProgress(task)}% complete
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
{task.attachments && task.attachments.length > 0 && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
      Attachments
    </Typography>
    <Stack spacing={1}>
      {task.attachments.map((attachment) => (
        <Paper 
          key={attachment.id || attachment._id} 
          variant="outlined" 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderRadius: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <AttachFile sx={{ color: 'primary.main', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {attachment.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(attachment.size)} • {attachment.type}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => viewAttachment(attachment)}
              startIcon={<Visibility />}
            >
              View
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              onClick={() => downloadAttachment(attachment)}
              startIcon={<Download />}
            >
              Download
            </Button>
          </Box>
        </Paper>
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

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(newStatus)}
            Update Task Status
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Update status for task: <strong>{selectedTask?.title}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Pending">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="warning" />
                  Pending
                </Box>
              </MenuItem>
              <MenuItem value="In Progress">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlayArrow color="info" />
                  In Progress
                </Box>
              </MenuItem>
              <MenuItem value="Completed">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" />
                  Completed
                </Box>
              </MenuItem>
              <MenuItem value="On Hold">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PauseCircle color="default" />
                  On Hold
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updatingStatus}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusSubmit} 
            variant="contained"
            disabled={updatingStatus || !newStatus}
            startIcon={updatingStatus ? <CircularProgress size={16} /> : null}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleStatusUpdate}>
          <Edit sx={{ mr: 1 }} /> Update Status
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskList;