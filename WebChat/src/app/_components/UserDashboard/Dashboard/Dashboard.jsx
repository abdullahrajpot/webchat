// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   Grid,
//   Paper,
//   Alert,
//   Snackbar,
//   Fab,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Chip,
//   Stack
// } from '@mui/material';
// import { Add, Refresh } from '@mui/icons-material';
// import TaskStatsCards from './components/TaskStatsCards';
// import TaskChart from './components/TaskChart';
// import TaskList from './components/TaskList';
// import axios from 'axios';

// // API configuration - adjust base URL as needed
// const API_BASE =  'http://localhost:5001/api';

// const Dashboard = () => {
//   // State management
//   const [stats, setStats] = useState({});
//   const [chartData, setChartData] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });
//   const [loading, setLoading] = useState({
//     stats: false,
//     chart: false,
//     tasks: false
//   });
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     search: '',
//     status: '',
//     priority: ''
//   });
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [createTaskDialog, setCreateTaskDialog] = useState(false);
//   const [newTask, setNewTask] = useState({
//     title: '',
//     description: '',
//     deadline: '',
//     priority: 'Medium',
//     tags: []
//   });

//   // Fetch dashboard stats
//   const fetchStats = async () => {
//     setLoading(prev => ({ ...prev, stats: true }));
//     try {
//       const response = await axios.get(`${API_BASE}/tasks/dashboard/stats`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setStats(response.data);
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//       showSnackbar('Error fetching dashboard stats', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, stats: false }));
//     }
//   };

//   // Fetch chart data
//   const fetchChartData = async (period = 'monthly') => {
//     setLoading(prev => ({ ...prev, chart: true }));
//     try {
//       const response = await axios.get(`${API_BASE}/tasks/dashboard/chart?period=${period}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setChartData(response.data);
//     } catch (error) {
//       console.error('Error fetching chart data:', error);
//       showSnackbar('Error fetching chart data', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, chart: false }));
//     }
//   };

//   // Fetch tasks with filters
//   const fetchTasks = async (currentFilters = filters) => {
//     setLoading(prev => ({ ...prev, tasks: true }));
//     try {
//       const queryParams = new URLSearchParams();
//       Object.keys(currentFilters).forEach(key => {
//         if (currentFilters[key]) {
//           queryParams.append(key, currentFilters[key]);
//         }
//       });

//       const response = await axios.get(`${API_BASE}/tasks/user-tasks?${queryParams}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       setTasks(response.data.tasks);
//       setPagination(response.data.pagination);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       showSnackbar('Error fetching tasks', 'error');
//     } finally {
//       setLoading(prev => ({ ...prev, tasks: false }));
//     }
//   };

//   // Update task status
//   const handleStatusUpdate = async (taskId, status) => {
//     try {
//       await axios.patch(
//         `${API_BASE}/tasks/${taskId}/status`,
//         { status },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
      
//       // Refresh data
//       fetchStats();
//       fetchTasks();
//       showSnackbar(`Task status updated to ${status}`, 'success');
//     } catch (error) {
//       console.error('Error updating task status:', error);
//       showSnackbar('Error updating task status', 'error');
//     }
//   };



//   // Handle filter changes
//   const handleFilterChange = (newFilters) => {
//     const updatedFilters = { ...filters, ...newFilters, page: 1 };
//     setFilters(updatedFilters);
//     fetchTasks(updatedFilters);
//   };

//   // Handle page change
//   const handlePageChange = (page) => {
//     const updatedFilters = { ...filters, page };
//     setFilters(updatedFilters);
//     fetchTasks(updatedFilters);
//   };

  

//   // Initial data fetch
//   useEffect(() => {
//     fetchStats();
//     fetchChartData();
//     fetchTasks();
//   }, []);

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//       {/* Header */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
//         <Typography variant="h4" component="h1" gutterBottom>
//           Dashboard
//         </Typography>
//         <Button
//           variant="outlined"
//           startIcon={<Refresh />}
//           onClick={() => {
//             fetchStats();
//             fetchChartData();
//             fetchTasks();
//           }}
//         >
//           Refresh
//         </Button>
//       </Box>

//       <Grid container spacing={3}>
//         {/* Stats Cards */}
//         <Grid item xs={12}>
//           <TaskStatsCards stats={stats} />
//         </Grid>

//         {/* Chart and Orders sections */}
//         <Grid item xs={12} lg={8}>
//           <TaskChart 
//             data={chartData} 
//             loading={loading.chart}
//             onPeriodChange={fetchChartData}
//           />
//         </Grid>

//         <Grid item xs={12} lg={4}>
//           <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
//             <Typography variant="h6" gutterBottom>
//               Quick Stats
//             </Typography>
//             <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <Typography color="text.secondary">Completion Rate</Typography>
//                 <Typography variant="h6">
//                   {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
//                 </Typography>
//               </Box>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <Typography color="text.secondary">Overdue Tasks</Typography>
//                 <Typography variant="h6" color={stats.overdue > 0 ? 'error.main' : 'success.main'}>
//                   {stats.overdue || 0}
//                 </Typography>
//               </Box>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <Typography color="text.secondary">Active Tasks</Typography>
//                 <Typography variant="h6">
//                   {(stats.pending || 0) + (stats.inProgress || 0)}
//                 </Typography>
//               </Box>
//             </Box>
//           </Paper>
//         </Grid>

//         {/* Task List */}
//         <Grid item xs={12}>
//           <TaskList
//             tasks={tasks}
//             loading={loading.tasks}
//             pagination={pagination}
//             onStatusUpdate={handleStatusUpdate}
//             onPageChange={handlePageChange}
//             onFilterChange={handleFilterChange}
//             filters={filters}
//           />
//         </Grid>
//       </Grid>

    

      

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
//       >
//         <Alert 
//           onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
//           severity={snackbar.severity}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default Dashboard;











import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  Snackbar,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import { 
  Refresh, 
  TrendingUp, 
  Assignment, 
  CheckCircle, 
  Schedule,
  MoreVert,
  RadioButtonUnchecked,
  CheckCircleOutline,
  AccessTime
} from '@mui/icons-material';
import TaskStatsCards from './components/TaskStatsCards';
import TaskChart from './components/TaskChart';
import TaskList from './components/TaskList';
import axios from 'axios';
import { useAuth } from '@app/_components/_core/AuthProvider/hooks';


// API configuration - adjust base URL as needed
const API_BASE = 'http://localhost:5001/api';

const Dashboard = () => {
  // State management
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const { user, token } = useAuth();
  
  const [projectStats, setProjectStats] = useState({
    completed: 0,
    inProgress: 0,
    activityRecord: {
      completed: 0,
      inProgress: 0,
      weeklyImprovement: 0
    }
  });
  const [taskProgress, setTaskProgress] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });
  const [loading, setLoading] = useState({
    stats: false,
    chart: false,
    tasks: false
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    priority: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Add debugging and validation for auth state
  console.log('Dashboard Auth state:', { user, token, hasToken: !!token });

  // Early return if no authentication
  if (!user || !token) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {!user ? 'Loading user data...' : 'Authentication required. Please login again.'}
          </Typography>
        </Box>
      </Container>
    );
  }

  // API helper with consistent token usage
  const apiCall = async (endpoint, options = {}) => {
    try {
      console.log(`Making API call to: ${API_BASE}${endpoint}`);
      console.log('Using token:', token ? 'Token present' : 'No token');

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        }
      });

      console.log(`API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error Response:`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error occurred' };
        }

        const errorMessage = errorData.details || errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API Success Response:`, data);
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  };

  // Updated axios calls to use consistent token
  const createAxiosConfig = () => ({
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!token) {
      console.warn('No token available for fetchStats');
      return;
    }
    
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const response = await axios.get(`${API_BASE}/tasks/dashboard/stats`, createAxiosConfig());
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showSnackbar(`Error fetching dashboard stats: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Fetch chart data
  const fetchChartData = async (period = 'monthly') => {
    if (!token) {
      console.warn('No token available for fetchChartData');
      return;
    }
    
    setLoading(prev => ({ ...prev, chart: true }));
    try {
      const response = await axios.get(`${API_BASE}/tasks/dashboard/chart?period=${period}`, createAxiosConfig());
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      showSnackbar(`Error fetching chart data: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  // Fetch tasks with filters
  const fetchTasks = async (currentFilters = filters) => {
    if (!token) {
      console.warn('No token available for fetchTasks');
      return;
    }
    
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const queryParams = new URLSearchParams();
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) {
          queryParams.append(key, currentFilters[key]);
        }
      });

      const response = await axios.get(`${API_BASE}/tasks/user-tasks?${queryParams}`, createAxiosConfig());
      
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showSnackbar(`Error fetching tasks: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Fetch project statistics
  const fetchProjectStats = async () => {
    if (!token) {
      console.warn('No token available for fetchProjectStats');
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE}/tasks/dashboard/project-stats`, createAxiosConfig());
      setProjectStats(response.data);
    } catch (error) {
      console.error('Error fetching project stats:', error);
      showSnackbar(`Error fetching project statistics: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Fetch task progress data
  const fetchTaskProgress = async () => {
    if (!token) {
      console.warn('No token available for fetchTaskProgress');
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE}/tasks/dashboard/task-progress`, createAxiosConfig());
      setTaskProgress(response.data);
    } catch (error) {
      console.error('Error fetching task progress:', error);
      showSnackbar(`Error fetching task progress: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Fetch today's tasks
  const fetchTodayTasks = async () => {
    if (!token) {
      console.warn('No token available for fetchTodayTasks');
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE}/tasks/dashboard/today-tasks`, createAxiosConfig());
      setTodayTasks(response.data);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      showSnackbar(`Error fetching today's tasks: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Fetch recent projects
  const fetchRecentProjects = async () => {
    if (!token) {
      console.warn('No token available for fetchRecentProjects');
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE}/tasks/dashboard/recent-projects`, createAxiosConfig());
      setRecentProjects(response.data);
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      showSnackbar(`Error fetching recent projects: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Update task status
  const handleStatusUpdate = async (taskId, status) => {
    if (!token) {
      console.warn('No token available for handleStatusUpdate');
      showSnackbar('Authentication required', 'error');
      return;
    }
    
    try {
      await axios.patch(
        `${API_BASE}/tasks/${taskId}/status`,
        { status },
        createAxiosConfig()
      );
      
      // Refresh data
      fetchStats();
      fetchTasks();
      fetchTodayTasks();
      fetchProjectStats();
      showSnackbar(`Task status updated to ${status}`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showSnackbar(`Error updating task status: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchTasks(updatedFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchTasks(updatedFilters);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  // Get fidelity chip color
  const getFidelityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Initial data fetch - only run when token is available
  useEffect(() => {
    if (!token || !user) {
      console.warn('Skipping data fetch - no token or user available');
      return;
    }

    console.log('Fetching dashboard data with token:', !!token);
    
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchStats(),
          fetchChartData(),
          fetchTasks(),
          fetchTodayTasks(),
          fetchProjectStats(),
          fetchTaskProgress(),
          fetchRecentProjects()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showSnackbar('Failed to load dashboard data', 'error');
      }
    };

    fetchAllData();
  }, [token, user]); // Add token and user as dependencies

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            if (!token) {
              showSnackbar('Authentication required for refresh', 'error');
              return;
            }
            fetchStats();
            fetchChartData();
            fetchTasks();
            fetchTodayTasks();
            fetchProjectStats();
            fetchTaskProgress();
            fetchRecentProjects();
          }}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <TaskStatsCards stats={stats} />
        </Grid>

        {/* Task Progress Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Task Progress</Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            
            <Box sx={{ height: 300, position: 'relative' }}>
              {taskProgress.length > 0 ? (
                taskProgress.map((item, index) => (
                  <Box key={item.date} sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', position: 'absolute', left: `${index * 14.28}%`, width: '12%' }}>
                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                      {/* Progress percentage on top */}
                      {item.progress > 70 && (
                        <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', bgcolor: '#ff4757', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                          {item.progress}%
                        </Box>
                      )}
                      
                      {/* Change indicator */}
                      {item.change > 0 && (
                        <Typography variant="caption" sx={{ color: 'success.main', fontSize: '10px', position: 'absolute', top: item.progress > 70 ? 10 : -15, left: '50%', transform: 'translateX(-50%)' }}>
                          +{item.change}%
                        </Typography>
                      )}
                      
                      {/* Progress bar */}
                      <Box sx={{ 
                        height: `${Math.max((item.progress / 100) * 250, 10)}px`, 
                        bgcolor: item.progress > 70 ? '#2c2c2c' : '#f1f2f6', 
                        borderRadius: '4px 4px 0 0', 
                        mb: 1, 
                        position: 'relative' 
                      }}>
                        {item.progress > 70 && (
                          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', bgcolor: '#ff4757', borderRadius: '4px 4px 0 0' }} />
                        )}
                      </Box>
                      
                      {/* Date label */}
                      <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                  <Typography variant="body2">No progress data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Project Statistics */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Project Statistic</Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>

            {/* Circular Progress */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={8}
                  sx={{ color: '#f1f2f6' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={projectStats.completed}
                  size={120}
                  thickness={8}
                  sx={{ 
                    color: '#ff4757', 
                    position: 'absolute',
                    left: 0,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
                <Box sx={{ 
                  top: 0, 
                  left: 0, 
                  bottom: 0, 
                  right: 0, 
                  position: 'absolute', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {projectStats.completed}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Activity Record */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Activity Record
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{projectStats.activityRecord.completed}%</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">In Progress</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{projectStats.activityRecord.inProgress}%</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">
                You completed {projectStats.activityRecord.weeklyImprovement}% more tasks this week than last week
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Project Overview & Today's Tasks */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            {/* Project Overview Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Project Overview</Typography>
              <Chip 
                label="High Fidelity" 
                size="small" 
                sx={{ 
                  bgcolor: '#ffe8e8', 
                  color: '#ff4757',
                  '& .MuiChip-label': { fontSize: '10px', fontWeight: 600 }
                }} 
              />
            </Box>

            {/* Project Title */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Create Design System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We need to create a design system for our UI consistent with our company style.
            </Typography>

            {/* Project Details */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label="In Progress" size="small" color="primary" />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Assignment sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">Assignee</Typography>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '10px' } }}>
                  <Avatar sx={{ bgcolor: '#ff6b6b' }}>A</Avatar>
                  <Avatar sx={{ bgcolor: '#4ecdc4' }}>B</Avatar>
                  <Avatar sx={{ bgcolor: '#45b7d1' }}>C</Avatar>
                </AvatarGroup>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">Timeline</Typography>
                <Typography variant="body2">Jan 24, 2026</Typography>
              </Box>
            </Box>

            {/* Today's Tasks */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Today's Task
            </Typography>

            <List dense sx={{ p: 0 }}>
              {todayTasks.length > 0 ? (
                todayTasks.slice(0, 3).map((task, index) => (
                  <ListItem 
                    key={task._id || index} 
                    sx={{ p: 0, mb: 1, cursor: 'pointer' }}
                    onClick={() => handleStatusUpdate(task._id, task.status === 'Completed' ? 'Pending' : 'Completed')}
                  >
                    <ListItemAvatar sx={{ minWidth: 30 }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: getPriorityColor(task.priority),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {task.status === 'Completed' ? (
                          <CheckCircleOutline sx={{ color: 'white', fontSize: 10 }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ color: 'white', fontSize: 10 }} />
                        )}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '12px',
                            textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                            color: task.status === 'Completed' ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.title}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', textAlign: 'center', py: 2 }}>
                  No tasks scheduled for today
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <TaskChart 
            data={chartData} 
            loading={loading.chart}
            onPeriodChange={fetchChartData}
          />
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Completion Rate</Typography>
                <Typography variant="h6">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Overdue Tasks</Typography>
                <Typography variant="h6" color={stats.overdue > 0 ? 'error.main' : 'success.main'}>
                  {stats.overdue || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Active Tasks</Typography>
                <Typography variant="h6">
                  {(stats.pending || 0) + (stats.inProgress || 0)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Task Summary with Fidelity Tags */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Task Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You can edit all the stuff as you wish
            </Typography>

            <Grid container spacing={3}>
              {/* Recent Projects */}
              {recentProjects.length > 0 ? (
                recentProjects.map((project, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Chip 
                            label={project.status || 'In Progress'} 
                            size="small" 
                            color={project.status === 'Completed' ? 'success' : 'primary'} 
                          />
                          <Chip 
                            label={`${project.priority || 'Medium'} Fidelity`} 
                            size="small" 
                            color={getFidelityColor(project.priority)} 
                          />
                        </Box>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '14px' }}>
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '12px' }}>
                          {project.description || project.category || 'Project'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="body2" color="error.main" sx={{ fontSize: '12px' }}>
                            {project.totalTasks}
                          </Typography>
                          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '10px' } }}>
                            {project.assigneeDetails && project.assigneeDetails.length > 0 ? (
                              project.assigneeDetails.map((assignee, idx) => (
                                <Avatar 
                                  key={idx}
                                  src={assignee.avatar}
                                  sx={{ bgcolor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa502'][idx % 4] }}
                                >
                                  {assignee.name ? assignee.name.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                              ))
                            ) : (
                              <Avatar sx={{ bgcolor: '#ff6b6b' }}>U</Avatar>
                            )}
                            {project.assigneeDetails && project.assigneeDetails.length > 3 && (
                              <Avatar>+{project.assigneeDetails.length - 3}</Avatar>
                            )}
                          </AvatarGroup>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress || 0} 
                            sx={{ flex: 1, mr: 1 }} 
                          />
                          <Typography variant="body2" sx={{ fontSize: '12px' }}>
                            {project.progress || 0}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent projects found. Create some tasks to see project statistics.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Task List */}
        <Grid item xs={12}>
          <TaskList
            tasks={tasks}
            loading={loading.tasks}
            pagination={pagination}
            onStatusUpdate={handleStatusUpdate}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;