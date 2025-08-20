import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from './useAuth'; // Import useAuth hook
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  AvatarGroup,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  CircularProgress,
  Fade,
  Zoom,
  Container,
  Tooltip,
  InputLabel
} from '@mui/material';
import {
  Add,
  Close,
  AttachFile,
  CalendarToday,
  Flag,
  PersonAdd,
  Delete,
  Save,
  Clear,
  TaskAlt,
  Description,
  Schedule,
  Label,
  Groups
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@app/_components/_core/AuthProvider/hooks';

// API functions
// Add this helper function to get the token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  
  // Fallback to cookies if using cookie-based auth
  const authCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='));
  return authCookie ? authCookie.split('=')[1] : null;
};

const fetchUsers = async () => {
  const token = getAuthToken();
  const response = await axios.get('http://localhost:5001/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Function to get current user from auth cookie
const getCurrentUserFromAuth = () => {
  try {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-user='));
    
    if (authCookie) {
      const cookieValue = authCookie.split('=')[1];
      const decodedValue = decodeURIComponent(cookieValue);
      const authData = JSON.parse(decodedValue);
      return authData.user;
    }
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
  }
  return null;
};

const Tasks = ({ onTaskCreated }) => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth(); // Get user from useAuth
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  // UI states
  const [showAssigneeDialog, setShowAssigneeDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from multiple sources
  useEffect(() => {
    let user = null;
    
    // First try useAuth
    if (authUser && (authUser._id || authUser.id)) {
      user = authUser;
      console.log('User from useAuth:', user);
    }
    // Fallback to cookie
    else {
      user = getCurrentUserFromAuth();
      console.log('User from cookie:', user);
    }
    
    setCurrentUser(user);
    console.log('Final current user:', user);
    
    if (!user || (!user._id && !user.id)) {
      showSnackbar('Please login to create tasks', 'error');
    }
  }, [authUser, isAuthenticated]);

  // Fetch users and include current user
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        console.log('Fetching users...');
        
        const users = await fetchUsers();
        console.log('Fetched users:', users);
        
        let allUsers = [...users];
        
        // Add current user if not in the list
        if (currentUser) {
          const userId = currentUser._id || currentUser.id;
          const userExists = users.some(u => (u._id || u.id) === userId);
          
          if (!userExists) {
            console.log('Adding current user to available users');
            allUsers = [currentUser, ...users];
          }
        }
        
        console.log('All available users:', allUsers);
        setAvailableUsers(allUsers);
        
      } catch (err) {
        console.error('Error fetching users:', err);
        showSnackbar('Failed to load users', 'error');
      } finally {
        setUsersLoading(false);
      }
    };

    if (currentUser) {
      loadUsers();
    } else {
      setUsersLoading(false);
    }
  }, [currentUser]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

const createTask = async (taskData) => {
  const token = getAuthToken();  
  try {
    const response = await axios.post('http://localhost:5001/api/tasks', taskData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data);
    throw error;
  }
};

// STEP 5: Make sure your handleSubmit function creates proper objects
const handleSubmit = async () => {
  if (!currentUser || (!currentUser._id && !currentUser.id)) {
    showSnackbar('Please login to create tasks', 'error');
    return;
  }

  if (!title.trim()) {
    showSnackbar('Task title is required', 'error');
    return;
  }

  try {
    setLoading(true);
    
    // Make sure attachments are proper objects
    const formattedAttachments = attachments.map(att => {
      // Ensure all required fields are strings
      return {
        id: String(att.id || ''),
        name: String(att.name || ''),
        size: String(att.size || ''),
        type: String(att.type || ''),
        url: att.url ? String(att.url) : undefined
      };
    });

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      tags: tags.filter(tag => tag.trim()),
      assignees: selectedUsers,
      attachments: formattedAttachments, // This should be an array of objects
      creator: currentUser._id || currentUser.id,
      status: 'Pending'
    };

    console.log('About to send task data:', taskData);
    
    const newTask = await createTask(taskData);
    showSnackbar('Task created successfully!');
    
    resetForm();
    
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
  } catch (err) {
    console.error('Error creating task:', err);
    showSnackbar(err.response?.data?.message || 'Failed to create task', 'error');
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('Medium');
    setTags([]);
    setNewTag('');
    setShowTagInput(false);
    setAssignees([]);
    setSelectedUsers([]);
    setAttachments([]);
  };

  // Handle assignee selection
  const handleAssigneeUpdate = () => {
    const selectedUserObjects = availableUsers.filter(user => 
      selectedUsers.includes(user._id || user.id)
    );
    setAssignees(selectedUserObjects);
    setShowAssigneeDialog(false);
    showSnackbar(`${selectedUserObjects.length} assignees selected`);
  };

  // Auto-assign current user
  const handleAutoAssignCurrentUser = () => {
    if (currentUser) {
      const userId = currentUser._id || currentUser.id;
      if (!selectedUsers.includes(userId)) {
        setSelectedUsers(prev => [...prev, userId]);
        const userObject = availableUsers.find(u => (u._id || u.id) === userId);
        if (userObject) {
          setAssignees(prev => [...prev, userObject]);
        }
        showSnackbar('You have been added as an assignee');
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  const newAttachments = files.map(file => ({
    id: Date.now() + Math.random().toString(36).substr(2, 9), // Better ID generation
    name: file.name,
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    type: file.type,
  }));
  setAttachments([...attachments, ...newAttachments]);
};

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
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

  const getUserInitials = (user) => {
    if (!user) return '??';
    return user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getUserColor = (userId) => {
    if (!userId) return '#1976d2';
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#303f9f', '#0288d1', '#00796b'];
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Zoom in timeout={600}>
                <Avatar sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  width: 64, 
                  height: 64, 
                  mx: 'auto',
                  mb: 2,
                  // boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <TaskAlt sx={{ fontSize: 32 }} />
                </Avatar>
              </Zoom>
              <Typography variant="h3" sx={{ 
                color: 'black',
                fontWeight: 700,
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Create New Task
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                color: 'rgba(8, 1, 1, 0.8)',
                fontWeight: 400
              }}>
                Organize your work and collaborate with your team
              </Typography>
            </Box>

            {/* Main Form */}
            <Paper elevation={24} sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {/* User Info Header */}
              <Box sx={{ 
                background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)',
                p: 3,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: currentUser ? getUserColor(currentUser._id || currentUser.id) : 'primary.main',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {currentUser ? getUserInitials(currentUser) : '?'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {currentUser?.name || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Creating task • {getCurrentDateTime()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  {/* Left Column - Main Content */}
                  <Grid item xs={12} lg={7}>
                    <Stack spacing={4}>
                      {/* Basic Info Section */}
                      <Card variant="outlined" sx={{ 
                        borderRadius: 3,
                        border: '2px solid #f1f5f9',
                        '&:hover': { borderColor: 'primary.light' },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                              <Description />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Task Details
                            </Typography>
                          </Box>

                          <Stack spacing={3}>
                            <TextField
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              label="Task Title"
                              placeholder="What needs to be done?"
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  fontSize: '1.1rem',
                                  fontWeight: 500
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TaskAlt color="primary" />
                                  </InputAdornment>
                                )
                              }}
                            />

                            <TextField
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              label="Description"
                              placeholder="Add more details about this task..."
                              multiline
                              rows={4}
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Attachments Section */}
                      <Card variant="outlined" sx={{ 
                        borderRadius: 3,
                        border: '2px solid #f1f5f9',
                        '&:hover': { borderColor: 'primary.light' },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                              <AttachFile />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Attachments
                            </Typography>
                            {attachments.length > 0 && (
                              <Chip 
                                label={attachments.length} 
                                size="small" 
                                color="secondary" 
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                          </Box>

                          <Stack spacing={2}>
                            {attachments.map((attachment) => (
                              <Zoom key={attachment.id} in timeout={300}>
                                <Card variant="outlined" sx={{ 
                                  borderRadius: 2,
                                  '&:hover': { 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.2s ease-in-out'
                                }}>
                                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                                    <Avatar variant="rounded" sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                                      <AttachFile />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" fontWeight={500}>{attachment.name}</Typography>
                                      <Typography variant="caption" color="text.secondary">{attachment.size}</Typography>
                                    </Box>
                                    <Tooltip title="Remove attachment">
                                      <IconButton 
                                        size="small" 
                                        color="error" 
                                        onClick={() => removeAttachment(attachment.id)}
                                        sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </Tooltip>
                                  </CardContent>
                                </Card>
                              </Zoom>
                            ))}

                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<Add />}
                              sx={{ 
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                py: 2,
                                px: 3,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                '&:hover': { 
                                  bgcolor: 'primary.light', 
                                  color: 'white',
                                  borderStyle: 'solid'
                                }
                              }}
                            >
                              Add Files
                              <input type="file" multiple onChange={handleFileUpload} hidden />
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>

                  {/* Right Column - Metadata */}
                  <Grid item xs={12} lg={5}>
                    <Stack spacing={3}>
                      {/* Assignees Card */}
                      <Card variant="outlined" sx={{ 
                        borderRadius: 3,
                        border: '2px solid #f1f5f9',
                        '&:hover': { borderColor: 'primary.light' },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                              <Groups />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Team Members
                            </Typography>
                            {assignees.length > 0 && (
                              <Chip 
                                label={assignees.length} 
                                size="small" 
                                color="info" 
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                          </Box>

                          {assignees.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                                {assignees.map((assignee) => (
                                  <Tooltip key={assignee._id || assignee.id} title={assignee.name}>
                                    <Avatar
                                      sx={{ 
                                        bgcolor: getUserColor(assignee._id || assignee.id), 
                                        width: 40, 
                                        height: 40,
                                        fontSize: '0.9rem',
                                        border: '3px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                      }}
                                    >
                                      {getUserInitials(assignee)}
                                    </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                            </Box>
                          )}

                          <Stack spacing={1}>
                            <Button
                              variant="outlined"
                              startIcon={<PersonAdd />}
                              onClick={() => setShowAssigneeDialog(true)}
                              disabled={usersLoading}
                              fullWidth
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.2
                              }}
                            >
                              {usersLoading ? 'Loading Users...' : `Add Team Members (${availableUsers.length})`}
                            </Button>

                            {currentUser && !assignees.some(a => (a._id || a.id) === (currentUser._id || currentUser.id)) && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={handleAutoAssignCurrentUser}
                                sx={{ textTransform: 'none', fontSize: '0.85rem' }}
                              >
                                + Assign to myself
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Schedule & Priority Card */}
                      <Card variant="outlined" sx={{ 
                        borderRadius: 3,
                        border: '2px solid #f1f5f9',
                        '&:hover': { borderColor: 'primary.light' },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                              <Schedule />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Schedule & Priority
                            </Typography>
                          </Box>

                          <Stack spacing={3}>
                            <Box>
                              <InputLabel sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
                                Due Date
                              </InputLabel>
                              <TextField
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                fullWidth
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                  }
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <CalendarToday color="primary" />
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </Box>

                            <Box>
                              <InputLabel sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
                                Priority Level
                              </InputLabel>
                              <FormControl fullWidth>
                                <Select
                                  value={priority}
                                  onChange={(e) => setPriority(e.target.value)}
                                  sx={{
                                    borderRadius: 2
                                  }}
                                  startAdornment={
                                    <InputAdornment position="start">
                                      <Flag color={getPriorityColor(priority)} />
                                    </InputAdornment>
                                  }
                                >
                                  <MenuItem value="Low">🟢 Low Priority</MenuItem>
                                  <MenuItem value="Medium">🔵 Medium Priority</MenuItem>
                                  <MenuItem value="High">🟠 High Priority</MenuItem>
                                  <MenuItem value="Urgent">🔴 Urgent Priority</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Tags Card */}
                      <Card variant="outlined" sx={{ 
                        borderRadius: 3,
                        border: '2px solid #f1f5f9',
                        '&:hover': { borderColor: 'primary.light' },
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                              <Label />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Tags
                            </Typography>
                            {tags.length > 0 && (
                              <Chip 
                                label={tags.length} 
                                size="small" 
                                color="success" 
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                          </Box>

                          {tags.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                              {tags.map((tag, index) => (
                                <Zoom key={tag} in timeout={200 + index * 100}>
                                  <Chip
                                    label={tag}
                                    onDelete={() => removeTag(tag)}
                                    color="success"
                                    variant="outlined"
                                    sx={{ 
                                      borderRadius: 2,
                                      '&:hover': { bgcolor: 'success.light' }
                                    }}
                                  />
                                </Zoom>
                              ))}
                            </Box>
                          )}

                          {showTagInput ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                placeholder="Enter tag name..."
                                size="small"
                                fullWidth
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                  }
                                }}
                              />
                              <IconButton 
                                size="small" 
                                onClick={addTag} 
                                color="success"
                                sx={{ 
                                  borderRadius: 2,
                                  bgcolor: 'success.light',
                                  '&:hover': { bgcolor: 'success.main', color: 'white' }
                                }}
                              >
                                <Add />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => setShowTagInput(false)}
                                sx={{ borderRadius: 2 }}
                              >
                                <Close />
                              </IconButton>
                            </Box>
                          ) : (
                            <Button
                              onClick={() => setShowTagInput(true)}
                              startIcon={<Add />}
                              variant="outlined"
                              fullWidth
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.2,
                                borderStyle: 'dashed'
                              }}
                            >
                              Add Tag
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ 
                  mt: 4, 
                  pt: 3, 
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Clear />}
                    onClick={resetForm}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={handleSubmit}
                    disabled={loading || !title.trim() || !currentUser}
                    sx={{ 
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      background: loading ? 'grey.400' : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      // boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: loading ? 'grey.400' : 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                        // boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                        transform: 'translateY(-1px)'
                      },
                      '&:disabled': {
                        background: 'grey.300',
                        color: 'grey.500',
                        boxShadow: 'none'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Creating Task...' : 'Create Task'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Assignee Selection Dialog */}
        <Dialog 
          open={showAssigneeDialog} 
          onClose={() => setShowAssigneeDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            pb: 1,
            background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)'
          }}>
            <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
              <PersonAdd />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Select Team Members
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Choose who should work on this task
              </Typography>
            </Box>
            <Chip 
              label={`${availableUsers.length} users`} 
              size="small" 
              color="info" 
              variant="outlined"
            />
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading team members...
                </Typography>
              </Box>
            ) : availableUsers.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No users available. Please check your user data or try refreshing.
                </Alert>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableUsers.map((user, index) => {
                  const userId = user._id || user.id;
                  const isCurrentUser = currentUser && userId === (currentUser._id || currentUser.id);
                  return (
                    <Fade key={userId} in timeout={300 + index * 50}>
                      <ListItem 
                        button 
                        onClick={() => {
                          if (selectedUsers.includes(userId)) {
                            setSelectedUsers(selectedUsers.filter(id => id !== userId));
                          } else {
                            setSelectedUsers([...selectedUsers, userId]);
                          }
                        }}
                        sx={{
                          borderRadius: 0,
                          '&:hover': {
                            bgcolor: 'primary.light',
                            '& .MuiListItemText-primary': {
                              color: 'white'
                            },
                            '& .MuiListItemText-secondary': {
                              color: 'rgba(255,255,255,0.8)'
                            }
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(userId)}
                          tabIndex={-1}
                          disableRipple
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: getUserColor(userId),
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}>
                            {getUserInitials(user)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {user.name || 'Unnamed User'}
                              </Typography>
                              {isCurrentUser && (
                                <Chip label="You" size="small" color="primary" variant="filled" />
                              )}
                            </Box>
                          }
                          secondary={user.email || userId}
                        />
                      </ListItem>
                    </Fade>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <Button 
              onClick={() => setShowAssigneeDialog(false)}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssigneeUpdate} 
              variant="contained"
              startIcon={<Add />}
              disabled={selectedUsers.length === 0}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                fontWeight: 600
              }}
            >
              Add Selected ({selectedUsers.length})
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

Tasks.propTypes = {
  onTaskCreated: PropTypes.func
};

export default Tasks;