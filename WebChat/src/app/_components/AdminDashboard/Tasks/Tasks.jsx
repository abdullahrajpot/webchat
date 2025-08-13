// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   TextField,
//   Typography,
//   Button,
//   Avatar,
//   Chip,
//   IconButton,
//   Collapse,
//   FormControl,
//   Select,
//   MenuItem,
//   Divider,
//   Grid,
//   Card,
//   CardContent,
//   InputAdornment,
//   AvatarGroup,
//   Stack
// } from '@mui/material';
// import {
//   Add,
//   Close,
//   AttachFile,
//   Download,
//   Comment,
//   CalendarToday,
//   Flag,
//   PersonAdd,
//   Delete
// } from '@mui/icons-material';
// import axios from 'axios';

// const Tasks = () => {
//   const [taskTitle, setTaskTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [deadline, setDeadline] = useState('');
//   const [priority, setPriority] = useState('');
//   const [tags, setTags] = useState([]);
//   const [newTag, setNewTag] = useState('');
//   const [showTagInput, setShowTagInput] = useState(false);
//   const [assignees, setAssignees] = useState([]);
//   const [attachments, setAttachments] = useState([]);
//   const [comment, setComment] = useState('');

//   const taskId = '64b3faeab1234567890abcd'; // replace with real ID from backend

//   useEffect(() => {
//     const fetchTask = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5001/api/tasks/${taskId}`);
//         const t = res.data;
//         setTaskTitle(t.title || '');
//         setDescription(t.description || '');
//         setDeadline(t.deadline ? t.deadline.slice(0, 16) : '');
//         setPriority(t.priority || '');
//         setTags(t.tags || []);
//         setAssignees(t.assignees || []);
//         setAttachments(t.attachments || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchTask();
//   }, [taskId]);

//   const addTag = () => {
//     if (newTag.trim() && !tags.includes(newTag.trim())) {
//       setTags([...tags, newTag.trim()]);
//       setNewTag('');
//       setShowTagInput(false);
//     }
//   };

//   const removeTag = (tagToRemove) => {
//     setTags(tags.filter(tag => tag !== tagToRemove));
//   };

//   const handleFileUpload = (event) => {
//     const files = Array.from(event.target.files);
//     const newAttachments = files.map(file => ({
//       id: Date.now() + Math.random(),
//       name: file.name,
//       size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
//       type: file.type
//     }));
//     setAttachments([...attachments, ...newAttachments]);
//   };

//   const removeAttachment = (id) => {
//     setAttachments(attachments.filter(att => att.id !== id));
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'Urgent': return 'error';
//       case 'High': return 'warning';
//       case 'Medium': return 'info';
//       case 'Low': return 'success';
//       default: return 'default';
//     }
//   };

//   const saveTask = async () => {
//     try {
//       await axios.put(`http://localhost:5001/api/tasks/${taskId}`, {
//         title: taskTitle,
//         description,
//         deadline,
//         priority,
//         tags,
//         assignees,
//         attachments
//       });
//       alert("✅ Task saved!");
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to save task");
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
//       <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
//         {/* Header Section */}
//           <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
//               Assign Task
//             </Typography>
//         <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'flex-start', mb: 4 }}>
         

//           <Box sx={{ textAlign: 'right' }}>
//             <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
//               Created by
//             </Typography>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>MJ</Avatar>
//               <Typography variant="body2" fontWeight={500}>Michele Jordan</Typography>
//             </Box>
//           </Box>
//         </Box>

//         <Grid container spacing={4}>
//           {/* Main Content */}
//           <Grid item xs={12} lg={8}>

//  <Box sx={{ flex: 1, mr: 3 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//               <TextField
//                 value={taskTitle}
//                 onChange={(e) => setTaskTitle(e.target.value)}
//                 variant="standard"
//                 InputProps={{
//                   disableUnderline: true,
//                   sx: { fontSize: '1.5rem', fontWeight: 600 }
//                 }}
//                 placeholder="Enter task title..."
//                 fullWidth
//               />
//             </Box>
//             <TextField
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               variant="standard"
//               InputProps={{ disableUnderline: true }}
//               placeholder="Add task description..."
//               multiline
//               rows={3}
//               fullWidth
//               sx={{ color: 'text.secondary' }}
//             />
//           </Box>

//             <Stack spacing={3}>
//               {/* Attachments Section */}
//               <Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                   <AttachFile />
//                   <Typography variant="h6">Attachments</Typography>
//                 </Box>

//                 <Stack spacing={2}>
//                   {attachments.map((attachment) => (
//                     <Card key={attachment.id} variant="outlined" sx={{ '&:hover .action-buttons': { opacity: 1 } }}>
//                       <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
//                         <Avatar variant="rounded" sx={{ bgcolor: 'grey.200' }}>
//                           <AttachFile />
//                         </Avatar>
//                         <Box sx={{ flex: 1 }}>
//                           <Typography variant="body1" fontWeight={500}>{attachment.name}</Typography>
//                           <Typography variant="caption" color="text.secondary">{attachment.size}</Typography>
//                         </Box>
//                         <Box className="action-buttons" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex', gap: 1 }}>
//                           <IconButton size="small">
//                             <Download />
//                           </IconButton>
//                           <IconButton size="small" color="error" onClick={() => removeAttachment(attachment.id)}>
//                             <Delete />
//                           </IconButton>
//                         </Box>
//                       </CardContent>
//                     </Card>
//                   ))}

//                   <Button
//                     variant="outlined"
//                     component="label"
//                     startIcon={<Add />}
//                     sx={{ alignSelf: 'flex-start', textTransform: 'none', borderStyle: 'dashed' }}
//                   >
//                     Add Attachment
//                     <input type="file" multiple onChange={handleFileUpload} hidden />
//                   </Button>
//                 </Stack>
//               </Box>

//               {/* Comments Section */}
//               <Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                   <Comment />
//                   <Typography variant="h6">Comments</Typography>
//                 </Box>

//                 <Box sx={{ display: 'flex', gap: 2 }}>
//                   <Avatar sx={{ bgcolor: 'primary.main' }}>MJ</Avatar>
//                   <Box sx={{ flex: 1 }}>
//                     <TextField
//                       value={comment}
//                       onChange={(e) => setComment(e.target.value)}
//                       placeholder="Add a comment..."
//                       multiline
//                       rows={3}
//                       fullWidth
//                       variant="outlined"
//                     />
//                     {comment && (
//                       <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
//                         <Button variant="contained" size="small">Comment</Button>
//                         <Button size="small" onClick={() => setComment('')}>Cancel</Button>
//                       </Box>
//                     )}
//                   </Box>
//                 </Box>
//               </Box>
//             </Stack>
//           </Grid>

//           {/* Sidebar */}
//           <Grid item xs={12} lg={4}>
//             <Stack spacing={3}>
//               {/* Assignees */}
//               <Box>
//                 <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
//                   Assignee
//                 </Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <AvatarGroup max={4}>
//                     {assignees.map((assignee) => (
//                       <Avatar
//                         key={assignee.id}
//                         sx={{ bgcolor: assignee.color, width: 32, height: 32 }}
//                         title={assignee.name}
//                       >
//                         {assignee.avatar}
//                       </Avatar>
//                     ))}
//                   </AvatarGroup>
//                   <IconButton size="small" sx={{ border: '2px dashed', borderColor: 'grey.300', ml: 1 }}>
//                     <PersonAdd />
//                   </IconButton>
//                 </Box>
//               </Box>

//               {/* Due Date */}
//               <Box>
//                 <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
//                   Due Date
//                 </Typography>
//                 <TextField
//                   type="datetime-local"
//                   value={deadline}
//                   onChange={(e) => setDeadline(e.target.value)}
//                   fullWidth
//                   size="small"
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <CalendarToday fontSize="small" />
//                       </InputAdornment>
//                     )
//                   }}
//                 />
//               </Box>

//               {/* Priority */}
//               <Box>
//                 <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
//                   Set Priority
//                 </Typography>
//                 <FormControl fullWidth size="small">
//                   <Select
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value)}
//                     startAdornment={<Flag color={getPriorityColor(priority)} sx={{ mr: 1 }} />}
//                   >
//                     <MenuItem value="Low">Low</MenuItem>
//                     <MenuItem value="Medium">Medium</MenuItem>
//                     <MenuItem value="High">High</MenuItem>
//                     <MenuItem value="Urgent">Urgent</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* Tags */}
//               <Box>
//                 <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
//                   Tags
//                 </Typography>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
//                   {tags.map((tag) => (
//                     <Chip
//                       key={tag}
//                       label={tag}
//                       onDelete={() => removeTag(tag)}
//                       color="primary"
//                       variant="outlined"
//                       size="small"
//                     />
//                   ))}
//                 </Box>
                
//                 {showTagInput ? (
//                   <Box sx={{ display: 'flex', gap: 1 }}>
//                     <TextField
//                       value={newTag}
//                       onChange={(e) => setNewTag(e.target.value)}
//                       onKeyDown={(e) => e.key === 'Enter' && addTag()}
//                       placeholder="Tag name"
//                       size="small"
//                       fullWidth
//                     />
//                     <IconButton size="small" onClick={addTag} color="primary">
//                       <Add />
//                     </IconButton>
//                     <IconButton size="small" onClick={() => setShowTagInput(false)}>
//                       <Close />
//                     </IconButton>
//                   </Box>
//                 ) : (
//                   <Button
//                     onClick={() => setShowTagInput(true)}
//                     startIcon={<Add />}
//                     size="small"
//                     sx={{ textTransform: 'none' }}
//                   >
//                     Add tag
//                   </Button>
//                 )}
//               </Box>

//               <Divider />

//               {/* Timestamps */}
//               <Box>
//                 <Stack spacing={1}>
//                   <Box>
//                     <Typography variant="caption" color="text.secondary">Created</Typography>
//                     <Typography variant="body2">Feb 2, 2023 4:30 PM</Typography>
//                   </Box>
//                   <Box>
//                     <Typography variant="caption" color="text.secondary">Updated</Typography>
//                     <Typography variant="body2">Feb 2, 2023 4:55 PM</Typography>
//                   </Box>
//                 </Stack>
//               </Box>
//             </Stack>
//           </Grid>
//         </Grid>

//         {/* Action Buttons */}
//         <Divider sx={{ my: 3 }} />
//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
//           <Button variant="text">Cancel</Button>
//           <Button variant="contained" onClick={saveTask}>Save Task</Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default Tasks;



import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Add prop-types for validation
import { useNavigate } from 'react-router-dom'; // Add navigation for redirects
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
  CircularProgress
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
  Clear
} from '@mui/icons-material';
import axios from 'axios';

// API functions
const createTask = async (taskData) => {
  const response = await axios.post('http://localhost:5001/api/tasks', taskData);
  return response.data;
};

const fetchUsers = async () => {
  const response = await axios.get('http://localhost:5001/api/users');
  return response.data;
};

const Tasks = ({ User, onTaskCreated }) => {
  const navigate = useNavigate();
  
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

  // Check user session on component mount
  useEffect(() => {
    if (!User || !User._id) {
      showSnackbar('Please login to create tasks', 'error');
      // You might want to redirect to login here
      // navigate('/login');
    }
  }, [User, navigate]);

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const users = await fetchUsers();
        setAvailableUsers(users.filter(user => user.role === 'user')); // Only users with 'user' role
      } catch (err) {
        console.error('Error fetching users:', err);
        showSnackbar('Failed to load users', 'error');
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!User || !User._id) {
      showSnackbar('Please login to create tasks', 'error');
      return;
    }

    if (!title.trim()) {
      showSnackbar('Task title is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        priority,
        tags: tags.filter(tag => tag.trim()),
        assignees: selectedUsers,
        attachments,
        creator: User._id
      };

      const newTask = await createTask(taskData);
      showSnackbar('Task created successfully!');
      
      // Reset form
      resetForm();
      
      // Callback to parent component
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
      selectedUsers.includes(user._id)
    );
    setAssignees(selectedUserObjects);
    setShowAssigneeDialog(false);
    showSnackbar(`${selectedUserObjects.length} assignees selected`);
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
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: file.type
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ flex: 1, mr: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
              Create New Task
            </Typography>
            
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              placeholder="Enter task title..."
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                sx: { fontSize: '1.1rem', fontWeight: 500 }
              }}
            />

            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              placeholder="Add task description..."
              multiline
              rows={4}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Creating as
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: User ? getUserColor(User._id) : 'primary.main' 
              }}>
                {User ? getUserInitials(User) : 'U'}
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={500}>
                  {User?.name || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getCurrentDateTime()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Attachments Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AttachFile color="primary" />
                  <Typography variant="h6">Attachments</Typography>
                  <Chip 
                    label={attachments.length} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>

                <Stack spacing={2}>
                  {attachments.map((attachment) => (
                    <Card key={attachment.id} variant="outlined" sx={{ 
                      '&:hover .action-buttons': { opacity: 1 },
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { boxShadow: 2 }
                    }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                        <Avatar variant="rounded" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                          <AttachFile />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={500}>{attachment.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{attachment.size}</Typography>
                        </Box>
                        <Box className="action-buttons" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                          <IconButton size="small" color="error" onClick={() => removeAttachment(attachment.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Add />}
                    sx={{ 
                      alignSelf: 'flex-start', 
                      textTransform: 'none', 
                      borderStyle: 'dashed',
                      py: 1.5,
                      px: 3,
                      '&:hover': { bgcolor: 'primary.light', color: 'white' }
                    }}
                  >
                    Add Attachment
                    <input type="file" multiple onChange={handleFileUpload} hidden />
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Assignees */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Assignees ({assignees.length})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <AvatarGroup max={4}>
                    {assignees.map((assignee) => (
                      <Avatar
                        key={assignee._id}
                        sx={{ 
                          bgcolor: getUserColor(assignee._id), 
                          width: 36, 
                          height: 36,
                          fontSize: '0.9rem',
                          border: '2px solid white'
                        }}
                        title={assignee.name}
                      >
                        {getUserInitials(assignee)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAdd />}
                    onClick={() => setShowAssigneeDialog(true)}
                    disabled={usersLoading}
                    sx={{ ml: 1, textTransform: 'none' }}
                  >
                    {usersLoading ? 'Loading...' : 'Add Assignee'}
                  </Button>
                </Box>
              </Box>

              {/* Due Date */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Due Date
                </Typography>
                <TextField
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarToday fontSize="small" color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Priority */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Priority Level
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    startAdornment={<Flag color={getPriorityColor(priority)} sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="Low">🟢 Low Priority</MenuItem>
                    <MenuItem value="Medium">🔵 Medium Priority</MenuItem>
                    <MenuItem value="High">🟠 High Priority</MenuItem>
                    <MenuItem value="Urgent">🔴 Urgent Priority</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Tags ({tags.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
                
                {showTagInput ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Tag name"
                      size="small"
                      fullWidth
                    />
                    <IconButton size="small" onClick={addTag} color="primary">
                      <Add />
                    </IconButton>
                    <IconButton size="small" onClick={() => setShowTagInput(false)}>
                      <Close />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    onClick={() => setShowTagInput(true)}
                    startIcon={<Add />}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                  >
                    Add tag
                  </Button>
                )}
              </Box>

              <Divider />

              {/* Form Summary */}
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Task Summary
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="caption">
                    • Title: {title ? `"${title.substring(0, 30)}${title.length > 30 ? '...' : ''}"` : 'Not set'}
                  </Typography>
                  <Typography variant="caption">
                    • Priority: {priority}
                  </Typography>
                  <Typography variant="caption">
                    • Assignees: {assignees.length}
                  </Typography>
                  <Typography variant="caption">
                    • Tags: {tags.length}
                  </Typography>
                  <Typography variant="caption">
                    • Attachments: {attachments.length}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Divider sx={{ my: 4 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<Clear />}
            onClick={resetForm}
            sx={{ textTransform: 'none' }}
          >
            Clear Form
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              sx={{ 
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              {loading ? 'Creating Task...' : 'Create Task'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Assignee Selection Dialog */}
      <Dialog open={showAssigneeDialog} onClose={() => setShowAssigneeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd color="primary" />
          Select Assignees
        </DialogTitle>
        <DialogContent>
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {availableUsers.map((user) => (
                <ListItem key={user._id} dense button onClick={() => {
                  if (selectedUsers.includes(user._id)) {
                    setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                  } else {
                    setSelectedUsers([...selectedUsers, user._id]);
                  }
                }}>
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getUserColor(user._id) }}>
                      {getUserInitials(user)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name} 
                    secondary={user.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssigneeDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssigneeUpdate} 
            variant="contained"
            startIcon={<Add />}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tasks;