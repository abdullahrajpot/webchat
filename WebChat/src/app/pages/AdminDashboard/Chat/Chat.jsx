import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Chip,
    Badge,
    Alert,
    CircularProgress,
    Popover
} from '@mui/material';
import {
    Search as SearchIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    InsertEmoticon as EmojiIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Groups as GroupsIcon,
    Close as CloseIcon,
    Description as DescriptionIcon,
    Image as ImageIcon,
    VideoFile as VideoIcon,
    AudioFile as AudioIcon,
    PictureAsPdf as PdfIcon,
    Videocam as VideocamIcon,
    Call as CallIcon,
    Info as InfoIcon,
    Settings as SettingsIcon,
    PersonAdd as PersonAddIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Circle as CircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import { useAuth } from '@app/_components/_core/AuthProvider/hooks';
import { useTranslation } from 'react-i18next';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Chat = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = useState(0);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [createGroupDialog, setCreateGroupDialog] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [openGroupInfo, setOpenGroupInfo] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, groupId: null, messageId: null });
    const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user, token } = useAuth();
    const {t} = useTranslation();

    // Add debugging and null checks
    console.log('Auth state:', { user, token, hasToken: !!token });

    if (!user) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Typography>Loading user data...</Typography>
            </Box>
        );
    }

    if (!token) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Typography color="error">No authentication token found. Please login again.</Typography>
            </Box>
        );
    }

    const isAdmin = user.role === 'admin';

    // API configuration
    const API_BASE_URL = 'http://localhost:5001';
    const SOCKET_URL = 'http://localhost:5001';

    // API helper function
    const apiCall = async (endpoint, options = {}) => {
        try {
            console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

                // Try to parse as JSON, otherwise use text
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

    // Test server connection
    const testConnection = async () => {
        try {
            const data = await apiCall('/api/test');
            console.log('Server connection test successful:', data);
            return true;
        } catch (error) {
            console.error('Server connection test failed:', error);
            setError(`Cannot connect to server: ${error.message}`);
            return false;
        }
    };

    // API call to fetch users
    const fetchUsers = async () => {
        try {
            setError('');
            console.log('Current user object:', user);
            console.log('Token:', token);
            const userData = await apiCall('/api/users');
            console.log('Raw user data:', userData);

            // Filter users to only show those with 'user' role and exclude current user
            const filteredUsers = userData.filter(u =>
                u.role === 'user' && u._id !== user.id
            ).map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                status: u.status || 'offline'
            }));

            console.log('Filtered users:', filteredUsers);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(`Failed to fetch users: ${error.message}`);
        }
    };

    // API call to fetch groups
    const fetchGroups = async () => {
        try {
            setError('');
            const groupData = await apiCall('/api/chat/groups');
            console.log('Raw group data:', groupData);

            // Transform group data for frontend
            const transformedGroups = await Promise.all(groupData.map(async (group) => {
                try {
                    // Fetch messages for each group
                    const messages = await apiCall(`/api/chat/groups/${group._id}/messages`);

                    const transformedMessages = messages.map(msg => ({
                        id: msg._id,
                        senderId: msg.senderId._id,
                        senderName: msg.senderId.name,
                        content: msg.content,
                        type: msg.type,
                        timestamp: msg.timestamp,
                        fileName: msg.fileName,
                        fileSize: msg.fileSize,
                        fileUrl: msg.fileUrl,
                        fileType: msg.fileType
                    }));

                    return {
                        id: group._id,
                        name: group.name,
                        type: 'group',
                        members: group.members,
                        admin: group.admin,
                        createdAt: group.createdAt,
                        messages: transformedMessages
                    };
                } catch (msgError) {
                    console.error(`Error fetching messages for group ${group._id}:`, msgError);
                    return {
                        id: group._id,
                        name: group.name,
                        type: 'group',
                        members: group.members,
                        admin: group.admin,
                        createdAt: group.createdAt,
                        messages: []
                    };
                }
            }));

            console.log('Transformed groups:', transformedGroups);
            setGroups(transformedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError(`Failed to fetch groups: ${error.message}`);
        }
    };

    // Connect to socket.io server
    useEffect(() => {
        let mounted = true;

        const initializeApp = async () => {
            if (!mounted) return;

            setLoading(true);
            setError('');

            try {
                // Test server connection first
                const isConnected = await testConnection();
                if (!isConnected || !mounted) return;

                // Connect to socket
                console.log(`Connecting to socket at: ${SOCKET_URL}`);
                socketRef.current = io(SOCKET_URL, {
                    transports: ['websocket', 'polling'],
                    timeout: 10000,
                });

                // Socket event handlers
                socketRef.current.on('connect', () => {
                    console.log('Socket connected:', socketRef.current.id);
                    setConnectionStatus('connected');

                    // Authenticate user
                    console.log('Authenticating user:', { userId: user.id, role: user.role });
                    socketRef.current.emit('authenticate', {
                        userId: user.id,
                        role: user.role
                    });
                });

                socketRef.current.on('disconnect', (reason) => {
                    console.log('Socket disconnected:', reason);
                    setConnectionStatus('disconnected');
                });

                socketRef.current.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setConnectionStatus('error');
                    setError(`Socket connection failed: ${error.message}`);
                });

                // Listen for new groups
                socketRef.current.on('groupCreated', (group) => {
                    console.log('New group created:', group);
                    if (!mounted) return;
                    setGroups(prev => [...prev, {
                        ...group,
                        type: 'group'
                    }]);
                });



                

                // Listen for group history when joining a group
   // Update your socket event handler for new messages
socketRef.current.on('newMessage', ({ groupId, message }) => {
    console.log('New message received:', { groupId, message });
    if (!mounted) return;

    setGroups(prev => {
        const updated = prev.map(group =>
            group.id === groupId
                ? { 
                    ...group, 
                    messages: [...(group.messages || []), message],
                    lastActivity: message.timestamp || new Date().toISOString()
                }
                : group
        );
        
        console.log('Updated groups:', updated);
        return updated;
    });

    // Also update selectedChat if it's the current group
    if (selectedChat && selectedChat.id === groupId) {
        setSelectedChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), message]
        }));
    }
});

                socketRef.current.on('error', (error) => {
                    console.error('Socket error:', error);
                    if (mounted) setError(`Socket error: ${error}`);
                });

                // Listen for message deletions
                socketRef.current.on('messageDeleted', ({ groupId, messageId }) => {
                    if (!mounted) return;
                    setGroups(prev => prev.map(group =>
                        group.id === groupId
                            ? { ...group, messages: (group.messages || []).filter(m => (m.id || m._id) !== messageId) }
                            : group
                    ));

                    if (selectedChat && selectedChat.id === groupId) {
                        setSelectedChat(prev => ({
                            ...prev,
                            messages: (prev.messages || []).filter(m => (m.id || m._id) !== messageId)
                        }));
                    }
                });

                // Load initial data
                await Promise.all([
                    fetchUsers(),
                    fetchGroups()
                ]);

            } catch (error) {
                console.error('Error initializing app:', error);
                if (mounted) setError(`Initialization failed: ${error.message}`);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeApp();

        return () => {
            mounted = false;
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user.id, user.role, token]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [groups, selectedChat]);


    
    // Add this helper function near the top of your component
    const sortGroupsByLastMessage = (groups) => {
        return [...groups].sort((a, b) => {
            const aLastMessage = a.messages && a.messages.length > 0
                ? a.messages[a.messages.length - 1]
                : null;
            const bLastMessage = b.messages && b.messages.length > 0
                ? b.messages[b.messages.length - 1]
                : null;

            // If neither has messages, maintain original order
            if (!aLastMessage && !bLastMessage) return 0;

            // Groups with messages come before groups without messages
            if (!aLastMessage) return 1;
            if (!bLastMessage) return -1;

            // Sort by timestamp (most recent first)
            const aTime = new Date(aLastMessage.timestamp).getTime();
            const bTime = new Date(bLastMessage.timestamp).getTime();

            return bTime - aTime;
        });
    };

   // Use useMemo for better performance with the sorting
const filteredGroups = useMemo(() => {
    const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortGroupsByLastMessage(filtered);
}, [groups, searchTerm]);




    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat?.id || !socketRef.current) return;

    const messageContent = message.trim();

    if (selectedChat.type === 'group') {
        const timestamp = new Date().toISOString();
        
        // Create optimistic message
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            senderId: user.id,
            senderName: user.name,
            content: messageContent,
            type: 'text',
            timestamp: timestamp
        };

        // Add message optimistically to local state and update lastActivity
        setGroups(prev => prev.map(group =>
            group.id === selectedChat.id
                ? { 
                    ...group, 
                    messages: [...(group.messages || []), optimisticMessage],
                    lastActivity: timestamp
                }
                : group
        ));

        // Update selectedChat as well
        setSelectedChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), optimisticMessage]
        }));

        // Emit to server
        socketRef.current.emit('sendMessage', {
            groupId: selectedChat.id,
            content: messageContent,
            type: 'text',
            senderId: user.id
        });
    }
    setMessage('');
};

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedChat?.id) return;

        try {
            setLoading(true);
            setError('');

            // Validate file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                event.target.value = '';
                return;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('content', `Shared a file: ${file.name}`);

            console.log('Uploading file:', file.name, 'Size:', file.size);

            // Upload file to backend
            const response = await fetch(`${API_BASE_URL}/api/chat/groups/${selectedChat.id}/upload`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'File upload failed');
            }

            const data = await response.json();
            console.log('File uploaded successfully:', data);

            // Create optimistic message for immediate UI update
            const optimisticMessage = {
                id: data.messageData.id || `temp-${Date.now()}`,
                senderId: user.id,
                senderName: user.name,
                content: data.messageData.content,
                type: 'file',
                fileName: data.messageData.fileName,
                fileSize: data.messageData.fileSize,
                fileUrl: data.messageData.fileUrl,
                fileType: data.messageData.fileType,
                timestamp: data.messageData.timestamp || new Date().toISOString()
            };

            // Add message optimistically to local state
            setGroups(prev => prev.map(group =>
                group.id === selectedChat.id
                    ? { ...group, messages: [...(group.messages || []), optimisticMessage] }
                    : group
            ));

            // Update selectedChat as well
            setSelectedChat(prev => ({
                ...prev,
                messages: [...(prev.messages || []), optimisticMessage]
            }));

            // Try to emit via socket with error handling
            if (socketRef.current && socketRef.current.connected) {
                try {
                    socketRef.current.emit('sendMessage', {
                        groupId: selectedChat.id,
                        content: data.messageData.content,
                        type: 'file',
                        fileName: data.messageData.fileName,
                        fileSize: data.messageData.fileSize,
                        fileUrl: data.messageData.fileUrl,
                        fileType: data.messageData.fileType,
                        senderId: user.id
                    }, (acknowledgment) => {
                        // Handle socket acknowledgment if your server sends one
                        console.log('Socket message acknowledged:', acknowledgment);
                    });
                } catch (socketError) {
                    console.error('Socket emission failed:', socketError);
                    // Don't throw here since the file upload was successful
                    // The optimistic update will still show the file
                }
            } else {
                console.warn('Socket not connected, file uploaded but real-time sync may not work');
            }

        } catch (error) {
            console.error('File upload error:', error);
            setError(`File upload failed: ${error.message}`);
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };



    const handleFileDownload = async (fileUrl, fileName) => {
        try {
            if (!fileUrl) {
                setError('File URL not available for download');
                console.error('File download failed: fileUrl is', fileUrl);
                return;
            }

            if (!fileName) {
                setError('File name not available');
                console.error('File download failed: fileName is', fileName);
                return;
            }

            console.log('Downloading file:', { fileUrl, fileName });

            // Fix the URL construction logic
            let downloadUrl;

            if (fileUrl.startsWith('/uploads/')) {
                // Extract just the filename from the path
                const filename = fileUrl.split('/').pop();
                downloadUrl = `/api/chat/files/${filename}`;
            } else if (fileUrl.startsWith('/api/')) {
                // If it already starts with /api/, use it as is
                downloadUrl = fileUrl;
            } else {
                // Assume it's just a filename
                downloadUrl = `/api/chat/files/${fileUrl}`;
            }

            console.log('Download URL:', `${API_BASE_URL}${downloadUrl}`);

            const response = await fetch(`${API_BASE_URL}${downloadUrl}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Download response error:', errorText);
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('File downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            setError(`Download failed: ${error.message}`);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;

        try {
            setError('');

            // Create group via HTTP API
            await apiCall('/api/chat/groups', {
                method: 'POST',
                body: JSON.stringify({
                    name: groupName.trim(),
                    members: selectedMembers
                })
            });

            // Also emit via socket for real-time updates
            if (socketRef.current) {
                socketRef.current.emit('createGroup', {
                    groupName: groupName.trim(),
                    memberIds: selectedMembers
                });
            }

            setCreateGroupDialog(false);
            setGroupName('');
            setSelectedMembers([]);

            // Refresh groups list
            await fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            setError(`Failed to create group: ${error.message}`);
        }
    };

    const joinGroup = (groupId) => {
        console.log('Joining group:', groupId);
        if (socketRef.current) {
            socketRef.current.emit('joinGroup', groupId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#4caf50';
            case 'away': return '#ff9800';
            case 'busy': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getFileIcon = (fileType, fileName) => {
        if (fileType === 'image') return <ImageIcon />;
        if (fileType === 'video') return <VideoIcon />;
        if (fileType === 'audio') return <AudioIcon />;

        // Check file extension for more specific icons
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <PdfIcon />;

        return <DescriptionIcon />;
    };

    const isPreviewableImage = (fileType, fileName) => {
        if (fileType === 'image') return true;
        const ext = fileName?.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    };

    const handleDeleteMessage = async (groupId, messageId) => {
        try {
            setError('');
            // Optimistic UI update
            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, messages: (group.messages || []).filter(m => (m.id || m._id) !== messageId) }
                    : group
            ));

            if (selectedChat && selectedChat.id === groupId) {
                setSelectedChat(prev => ({
                    ...prev,
                    messages: (prev.messages || []).filter(m => (m.id || m._id) !== messageId)
                }));
            }

            // Call API
            await apiCall(`/api/chat/groups/${groupId}/messages/${messageId}`, {
                method: 'DELETE'
            });

            // Notify via socket (optional, depends on server)
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('deleteMessage', { groupId, messageId });
            }
        } catch (err) {
            console.error('Delete message failed:', err);
            setError(`Failed to delete message: ${err.message}`);
            // Refetch group messages as fallback
            try {
                const messages = await apiCall(`/api/chat/groups/${groupId}/messages`);
                const transformedMessages = messages.map(msg => ({
                    id: msg._id,
                    senderId: msg.senderId._id,
                    senderName: msg.senderId.name,
                    content: msg.content,
                    type: msg.type,
                    timestamp: msg.timestamp,
                    fileName: msg.fileName,
                    fileSize: msg.fileSize,
                    fileUrl: msg.fileUrl,
                    fileType: msg.fileType
                }));
                setGroups(prev => prev.map(g => g.id === groupId ? { ...g, messages: transformedMessages } : g));
                if (selectedChat && selectedChat.id === groupId) {
                    setSelectedChat(prev => ({ ...prev, messages: transformedMessages }));
                }
            } catch {}
        }
    };

    const requestDeleteMessage = (groupId, messageId) => {
        setConfirmDelete({ open: true, groupId, messageId });
    };

    const handleConfirmDeleteClose = () => setConfirmDelete({ open: false, groupId: null, messageId: null });

    const handleConfirmDeleteProceed = async () => {
        const { groupId, messageId } = confirmDelete;
        handleConfirmDeleteClose();
        if (groupId && messageId) {
            await handleDeleteMessage(groupId, messageId);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateLabel = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const today = new Date();
        const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const diffDays = Math.floor((startOfDay(today) - startOfDay(date)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString(undefined, { day: '2-digit', month: 'long' });
    };

    const groupMessagesByDate = (messages = []) => {
        const groupsByDate = [];
        const keyFor = (ts) => {
            const d = new Date(ts);
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        };
        let currentKey = null;
        let current = null;
        for (const m of messages) {
            const k = keyFor(m.timestamp || m.createdAt || m.updatedAt || Date.now());
            if (k !== currentKey) {
                currentKey = k;
                current = { key: k, label: formatDateLabel(m.timestamp || m.createdAt || m.updatedAt), items: [] };
                groupsByDate.push(current);
            }
            current.items.push(m);
        }
        return groupsByDate;
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const toggleMemberSelection = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                gap: 2,
                bgcolor: '#f8fafc'
            }}>
                <CircularProgress size={40} thickness={4} sx={{ color: '#6366f1' }} />
                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Loading chat application...
                </Typography>
                {connectionStatus === 'connecting' && (
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        Connecting to server...
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            bgcolor: '#f8fafc',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        zIndex: 9999,
                        maxWidth: 400,
                        borderRadius: 3,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                    action={
                        <Button
                            size="small"
                            sx={{ fontWeight: 600 }}
                            onClick={async () => {
                                setError('');
                                setLoading(true);
                                try {
                                    await Promise.all([fetchUsers(), fetchGroups()]);
                                } catch (err) {
                                    setError(`Retry failed: ${err.message}`);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            {t('chat.retry')}
                        </Button>
                    }
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon fontSize="small" />
                        {error}
                    </Box>
                </Alert>
            )}

            {/* Connection Status */}
            <Box sx={{
                position: 'fixed',
                bottom: 20,
                left: 20,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: connectionStatus === 'connected' ? '#10b981' :
                            connectionStatus === 'error' ? '#ef4444' : '#f59e0b'
                    }}
                />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {connectionStatus === 'connected' ? 'Connected' :
                        connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                </Typography>
            </Box>

            {/* Sidebar */}
            <Paper elevation={0} sx={{
                width: 380,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'white',
                borderRight: '1px solid #e2e8f0'
            }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
                    <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                        <Avatar sx={{
                            bgcolor: '#6366f1',
                            width: 48,
                            height: 48,
                            fontSize: '1.25rem',
                            fontWeight: 600
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                                {user.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                {user.role === 'admin' ? 'Administrator' : 'User'}
                            </Typography>
                        </Box>
                    </Stack>
                    <TextField
                        fullWidth
                        placeholder={t('chat.searchconversation')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94a3b8' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 3,
                                bgcolor: '#f8fafc',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    border: '2px solid #6366f1'
                                }
                            }
                        }}
                    />
                </Box>

                {/* Tabs */}
                <Box sx={{ display: 'flex', px: 3, mb: 2 }}>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab(0)}
                        sx={{
                            borderRadius: 2,
                            mr: 1,
                            py: 0,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: activeTab === 0 ? '#6366f1' : 'transparent',
                            color: activeTab === 0 ? 'white' : '#64748b',
                            '&:hover': {
                                bgcolor: activeTab === 0 ? '#5b21b6' : '#f1f5f9'
                            }
                        }}
                    >
                       {t('chat.chats')} ({filteredGroups.length})
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab(1)}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: activeTab === 1 ? '#6366f1' : 'transparent',
                            color: activeTab === 1 ? 'white' : '#64748b',
                            '&:hover': {
                                bgcolor: activeTab === 1 ? '#5b21b6' : '#f1f5f9'
                            }
                        }}
                    >
                       {t('chat.contacts')} ({filteredUsers.length})
                    </Button>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {activeTab === 0 && (
                        <>
                            {/* Group List */}
                            <Box sx={{ height: 'calc(100% - 120px)', overflowY: 'auto', px: 2 }}>
                                {filteredGroups.length === 0 ? (
                                    <Box sx={{ p: 0, textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                                            💬
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                                            {error ? 'Failed to load groups' : 'No conversations yet'}
                                        </Typography>
                                        {user.role === 'admin' && !error && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<AddIcon />}
                                                onClick={() => setCreateGroupDialog(true)}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {t('chat.createyourfirstgroup')}
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {filteredGroups.map((group) => {
                                            const lastMessage = group.messages[group.messages.length - 1];
                                            return (
                                                <ListItemButton
                                                    key={group.id}
                                                    selected={selectedChat?.id === group.id}
                                                    onClick={() => {
                                                        setSelectedChat(group);
                                                        joinGroup(group.id);
                                                    }}
                                                    sx={{
                                                        borderRadius: 3,
                                                        mb: 1,
                                                        py: 0,
                                                        px: 2,
                                                        '&.Mui-selected': {
                                                            bgcolor: '#ede9fe',
                                                            '&:hover': {
                                                                bgcolor: '#ddd6fe'
                                                            }
                                                        },
                                                        '&:hover': {
                                                            bgcolor: '#f8fafc'
                                                        }
                                                    }}
                                                >
                                                    <ListItemAvatar sx={{ minWidth: 60 }}>
                                                        <Avatar sx={{
                                                            bgcolor: '#e0e7ff',
                                                            color: '#6366f1',
                                                            width: 44,
                                                            height: 44
                                                        }}>
                                                            <GroupsIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                                    {group.name}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                                    {formatTime(lastMessage?.timestamp)}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: '#64748b' }}
                                                                noWrap
                                                            >
                                                                {lastMessage?.content || 'No messages yet'}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            );
                                        })}
                                    </List>
                                )}
                            </Box>

                            {/* Create Group Button (only for admin) */}
                            {user.role === 'admin' && (
                                <Box sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setCreateGroupDialog(true)}
                                        sx={{
                                            borderRadius: 3,
                                            py: 1.5,
                                            border: '2px dashed #cbd5e1',
                                            color: '#64748b',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                border: '2px dashed #6366f1',
                                                color: '#6366f1',
                                                bgcolor: '#fafaff'
                                            }
                                        }}
                                    >
                                        {t('chat.createnewgroup')}
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}

                    {activeTab === 1 && (
                        <Box sx={{ height: '100%', overflowY: 'auto', px: 2 }}>
                            {filteredUsers.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>
                                        👥
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                                        {searchTerm ? 'No users found matching your search' :
                                            error ? 'Failed to load users' : 'No users available'}
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {filteredUsers.map((contact) => (
                                        <ListItemButton
                                            key={contact.id}
                                            sx={{
                                                py: 2.5,
                                                px: 2,
                                                mb: 1,
                                                borderRadius: 3,
                                                '&:hover': {
                                                    bgcolor: '#f8fafc'
                                                }
                                            }}
                                        >
                                            <ListItemAvatar sx={{ minWidth: 60 }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            bgcolor: '#f1f5f9',
                                                            color: '#475569',
                                                            fontSize: '1.1rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {contact.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 2,
                                                            right: 2,
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: getStatusColor(contact.status),
                                                            border: '2px solid white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                </Box>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#1e293b',
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {contact.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#64748b',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {contact.status === 'online' ? 'Active now' :
                                                            contact.status === 'away' ? 'Away' :
                                                                contact.status === 'busy' ? 'Busy' : 'Offline'}
                                                    </Typography>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <Paper elevation={0} sx={{
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #f1f5f9',
                            bgcolor: 'white'
                        }}>
                            <Avatar sx={{
                                mr: 3,
                                bgcolor: '#e0e7ff',
                                color: '#6366f1',
                                width: 48,
                                height: 48
                            }}>
                                {selectedChat.type === 'group' ? <GroupsIcon /> : selectedChat.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                                    {selectedChat.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    {selectedChat.type === 'group'
                                        ? `${selectedChat.members?.length || 0} members`
                                        : 'Online'}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <IconButton sx={{
                                    bgcolor: '#f8fafc',
                                    '&:hover': { bgcolor: '#f1f5f9' }
                                }}>
                                    <VideocamIcon sx={{ color: '#64748b' }} />
                                </IconButton>
                                <IconButton sx={{
                                    bgcolor: '#f8fafc',
                                    '&:hover': { bgcolor: '#f1f5f9' }
                                }}>
                                    <CallIcon sx={{ color: '#64748b' }} />
                                </IconButton>
                                <IconButton onClick={handleMenuOpen} sx={{
                                    bgcolor: '#f8fafc',
                                    '&:hover': { bgcolor: '#f1f5f9' }
                                }}>
                                    <MoreVertIcon sx={{ color: '#64748b' }} />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        elevation: 8,
                                        sx: {
                                            borderRadius: 2,
                                            mt: 1,
                                            minWidth: 180
                                        }
                                    }}
                                >
                                    <MenuItem onClick={() => { setOpenGroupInfo(true); handleMenuClose(); }} sx={{ py: 1.5 }}>
                                        <ListItemIcon>
                                            <InfoIcon fontSize="small" sx={{ color: '#64748b' }} />
                                        </ListItemIcon>
                                        <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}>
                                            {t('chat.chatinfo')}
                                        </ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
                                        <ListItemIcon>
                                            <SettingsIcon fontSize="small" sx={{ color: '#64748b' }} />
                                        </ListItemIcon>
                                        <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}>
                                            {t('chat.settings')}
                                        </ListItemText>
                                    </MenuItem>
                                    {isAdmin && [
                                        <Divider key="divider" sx={{ my: 1 }} />,
                                        <MenuItem key="delete" onClick={handleMenuClose} sx={{ py: 1.5, color: '#ef4444' }}>
                                            <ListItemIcon>
                                                <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                                            </ListItemIcon>
                                            <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 500 } }}>
                                                {t('chat.deletechat')}
                                            </ListItemText>
                                        </MenuItem>
                                    ]}
                                </Menu>
                            </Stack>
                        </Paper>

                        {/* Messages */}
                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 3,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
                        }}>
                            <Stack spacing={3} sx={{
                                '& .message-row-action': { opacity: 0, transition: 'opacity 0.2s' },
                                '& .message-row:hover .message-row-action': { opacity: 1 }
                            }}>
                                {groupMessagesByDate(selectedChat.messages || []).map((group) => (
                                    <React.Fragment key={group.key}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Chip label={group.label} sx={{ bgcolor: '#f1f5f9' }} />
                                        </Box>
                                        {group.items.map((msg) => {
                                            const isOwnMessage = msg.senderId === user.id;
                                            const sender = users.find(u => u.id === msg.senderId) ||
                                                (msg.senderId === user.id ? user : null);

                                            return (
                                                <Box
                                                    key={msg.id || Math.random()}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                                        alignItems: 'flex-end',
                                                        gap: 2
                                                    }}
                                                    className="message-row"
                                                >
                                                    {!isOwnMessage && (
                                                        <Avatar sx={{
                                                            width: 36,
                                                            height: 36,
                                                            bgcolor: '#f1f5f9',
                                                            color: '#475569',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 600
                                                        }}>
                                                            {sender?.name?.charAt(0).toUpperCase() || '?'}
                                                        </Avatar>
                                                    )}
                                                    <Box sx={{ maxWidth: '70%' }}>
                                                        {!isOwnMessage && sender && (
                                                            <Typography variant="caption" sx={{
                                                                ml: 2,
                                                                color: '#64748b',
                                                                fontWeight: 500
                                                            }}>
                                                                {sender.name}
                                                            </Typography>
                                                        )}
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            {(isAdmin || msg.senderId === user.id) && isOwnMessage && (
                                                                <IconButton
                                                                    onClick={() => requestDeleteMessage(selectedChat.id, msg.id || msg._id)}
                                                                    size="small"
                                                                    className="message-row-action"
                                                                    sx={{
                                                                        bgcolor: 'rgba(197, 59, 34, 0.12)',
                                                                        '&:hover': { bgcolor: 'rgba(197, 59, 34, 0.12)' }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="3px" sx={{ color: '#FF0000' }} />
                                                                </IconButton>
                                                            )}
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 2,
                                                                mt: 0.5,
                                                                borderRadius: 3,
                                                                bgcolor: isOwnMessage ? '#6366f1' : 'white',
                                                                color: isOwnMessage ? 'white' : '#1e293b',
                                                                borderTopLeftRadius: isOwnMessage ? 16 : 4,
                                                                borderTopRightRadius: isOwnMessage ? 4 : 16,
                                                                boxShadow: isOwnMessage ? '0 4px 20px rgba(99, 102, 241, 0.2)' : '0 2px 10px rgba(0,0,0,0.08)'
                                                            }}
                                                            className="message-bubble"
                                                        >
                                                            <Box sx={{ position: 'relative' }}>
                                                            {msg.type === 'text' ? (
                                                                <Typography sx={{ fontWeight: 400, lineHeight: 1.5 }}>
                                                                    {msg.content}
                                                                </Typography>
                                                            ) : msg.type === 'file' ? (
                                                                <Box>
                                                                    {/* Show image preview if it's an image */}
                                                                    {isPreviewableImage(msg.fileType, msg.fileName) && msg.fileUrl && (
                                                                        <Box sx={{ mb: 2, maxWidth: 300 }}>
                                                                            <img
                                                                                src={`${API_BASE_URL}${msg.fileUrl}`}
                                                                                alt={msg.fileName}
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: 'auto',
                                                                                    borderRadius: 12,
                                                                                    cursor: 'pointer',
                                                                                    maxHeight: 200,
                                                                                    objectFit: 'cover'
                                                                                }}
                                                                                onClick={() => handleFileDownload(msg.fileUrl, msg.fileName)}
                                                                                onError={(e) => {
                                                                                    e.target.style.display = 'none';
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    )}

                                                                    {/* File info */}
                                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                                        <Box sx={{
                                                                            p: 1.5,
                                                                            borderRadius: 2,
                                                                            bgcolor: isOwnMessage ? 'rgba(255,255,255,0.15)' : '#f8fafc'
                                                                        }}>
                                                                            {getFileIcon(msg.fileType, msg.fileName)}
                                                                        </Box>
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                                                {msg.fileName}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{
                                                                                color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#64748b'
                                                                            }}>
                                                                                {msg.fileSize} • {msg.fileType || 'file'}
                                                                            </Typography>
                                                                        </Box>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleFileDownload(msg.fileUrl, msg.fileName)}
                                                                            disabled={!msg.fileUrl}
                                                                            sx={{
                                                                                bgcolor: isOwnMessage ? 'rgba(255,255,255,0.15)' : '#f8fafc',
                                                                                '&:hover': {
                                                                                    bgcolor: isOwnMessage ? 'rgba(255,255,255,0.25)' : '#f1f5f9'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <DownloadIcon sx={{ fontSize: '1rem' }} />
                                                                        </IconButton>
                                                                    </Stack>
                                                                </Box>
                                                            ) : (
                                                                <Typography color="error">
                                                                    Unknown message type: {msg.type}
                                                                </Typography>
                                                            )}
                                                            </Box>
                                                        </Paper>
                                                            {(isAdmin || msg.senderId === user.id) && !isOwnMessage && (
                                                                <IconButton
                                                                    onClick={() => requestDeleteMessage(selectedChat.id, msg.id || msg._id)}
                                                                    size="small"
                                                                    className="message-row-action"
                                                                    sx={{
                                                                        bgcolor: 'rgba(197, 59, 34, 0.12)',
                                                                        '&:hover': { bgcolor: 'rgba(197, 59, 34, 0.12)' }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" sx={{ color: '#FF0000' }} />
                                                                </IconButton>
                                                            )}
                                                        </Stack>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: 'block',
                                                                textAlign: isOwnMessage ? 'right' : 'left',
                                                                mt: 1,
                                                                ml: isOwnMessage ? 0 : 2,
                                                                color: '#94a3b8'
                                                            }}
                                                        >
                                                            {formatTime(msg.timestamp)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                                <div ref={messagesEndRef} />
                            </Stack>
                        </Box>

                        {/* Message Input */}
                        <Paper elevation={0} sx={{
                            p: 3,
                            borderTop: '1px solid #f1f5f9',
                            bgcolor: 'white'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    fullWidth
                                    placeholder={t('chat.typeamessage')}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton sx={{ color: '#94a3b8' }} onClick={(e) => setEmojiAnchorEl(e.currentTarget)}>
                                                    <EmojiIcon />
                                                </IconButton>
                                                <Popover
                                                    open={Boolean(emojiAnchorEl)}
                                                    anchorEl={emojiAnchorEl}
                                                    onClose={() => setEmojiAnchorEl(null)}
                                                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                >
                                                    <Box sx={{ p: 1 }}>
                                                        <Picker
                                                            data={data}
                                                            onEmojiSelect={(emoji) => {
                                                                const native = emoji.native || emoji.shortcodes || '';
                                                                // insert at cursor end for simplicity
                                                                setMessage(prev => `${prev}${native}`);
                                                            }}
                                                            previewPosition="none"
                                                            navPosition="bottom"
                                                            searchPosition="top"
                                                            maxFrequentRows={2}
                                                            emojiSize={20}
                                                            theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                                                        />
                                                    </Box>
                                                </Popover>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    style={{ display: 'none' }}
                                                />
                                                <IconButton
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={loading}
                                                    sx={{ color: '#94a3b8' }}
                                                >
                                                    <AttachFileIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 4,
                                            bgcolor: '#f8fafc',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none'
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                border: 'none'
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                border: '2px solid #6366f1'
                                            }
                                        }
                                    }}
                                />
                                <IconButton
                                    disabled={!message.trim()}
                                    onClick={handleSendMessage}
                                    sx={{
                                        bgcolor: '#6366f1',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': {
                                            bgcolor: '#5b21b6',
                                            transform: 'scale(1.05)'
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: '#cbd5e1',
                                            color: '#94a3b8'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Stack>
                        </Paper>
                    </>
                ) : (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'white'
                    }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 500, px: 4 }}>
                            <Box sx={{
                                fontSize: '4rem',
                                mb: 3,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                💬
                            </Box>
                            <Typography variant="h4" sx={{
                                mb: 2,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                {user.role === 'admin' ? 'Admin Dashboard' : 'Welcome to Chat'}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#64748b', mb: 4, lineHeight: 1.6 }}>
                                {user.role === 'admin'
                                    ? 'Select a group or create a new one to start managing conversations'
                                    : 'Select a group to start chatting with your team members'}
                            </Typography>
                            {user.role === 'admin' && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateGroupDialog(true)}
                                    sx={{
                                        borderRadius: 3,
                                        py: 1.5,
                                        px: 4,
                                        bgcolor: '#6366f1',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
                                        '&:hover': {
                                            bgcolor: '#5b21b6',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 15px 50px rgba(99, 102, 241, 0.4)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {t('chat.createnewgroup')}
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Create Group Dialog (Admin only) */}
            {user.role === 'admin' && (
                <Dialog
                    open={createGroupDialog}
                    onClose={() => setCreateGroupDialog(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                            p: 1
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: '#ede9fe'
                            }}>
                                <GroupsIcon sx={{ color: '#6366f1' }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
                               {t('chat.createnewgroup')}
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label={t('chat.groupname')}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            sx={{ mb: 4 }}
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                            error={!groupName.trim() && groupName.length > 0}
                            helperText={!groupName.trim() && groupName.length > 0 ? "Group name is required" : ""}
                        />
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                           {t('chat.addmembers')}
                        </Typography>
                        <Box sx={{
                            maxHeight: 300,
                            overflowY: 'auto',
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            p: 1
                        }}>
                            {users.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                                        {error ? 'Failed to load users. Please try again.' : 'No users available to add'}
                                    </Typography>
                                    {error && (
                                        <Button
                                            size="small"
                                            onClick={fetchUsers}
                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                        >
                                            {t('chat.retryloadinguser')}
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {users.map((contact) => (
                                        <ListItem
                                            key={contact.id}
                                            secondaryAction={
                                                <Checkbox
                                                    edge="end"
                                                    checked={selectedMembers.includes(contact.id)}
                                                    onChange={() => toggleMemberSelection(contact.id)}
                                                    sx={{
                                                        color: '#6366f1',
                                                        '&.Mui-checked': {
                                                            color: '#6366f1'
                                                        }
                                                    }}
                                                />
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton
                                                onClick={() => toggleMemberSelection(contact.id)}
                                                sx={{ borderRadius: 2, py: 1.5 }}
                                            >
                                                <ListItemAvatar>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Avatar sx={{
                                                            bgcolor: '#f1f5f9',
                                                            color: '#475569',
                                                            fontWeight: 600
                                                        }}>
                                                            {contact.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                right: 0,
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                bgcolor: getStatusColor(contact.status),
                                                                border: '2px solid white'
                                                            }}
                                                        />
                                                    </Box>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                            {contact.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            {contact.status === 'online' ? 'Active now' : contact.status || 'offline'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                        {selectedMembers.length > 0 && (
                            <Box sx={{
                                mt: 3,
                                p: 2,
                                bgcolor: '#ede9fe',
                                borderRadius: 2,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 600 }}>
                                    {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'} selected
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 2 }}>
                        <Button
                            onClick={() => {
                                setCreateGroupDialog(false);
                                setGroupName('');
                                setSelectedMembers([]);
                            }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                color: '#64748b'
                            }}
                        >
                            {t('chat.cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateGroup}
                            disabled={!groupName.trim() || selectedMembers.length === 0}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                bgcolor: '#6366f1',
                                '&:hover': {
                                    bgcolor: '#5b21b6'
                                }
                            }}
                        >
                            {t('chat.creategroup')} ({selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'})
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            {/* Group Info Dialog */
            }
            {selectedChat && selectedChat.type === 'group' && (
                <Dialog
                    open={openGroupInfo}
                    onClose={() => setOpenGroupInfo(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#e0e7ff', color: '#6366f1', width: 48, height: 48 }}>
                                <GroupsIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    {selectedChat.name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip size="small" label={`${selectedChat.members?.length || 0} members`} />
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        Created {selectedChat.createdAt ? new Date(selectedChat.createdAt).toLocaleString() : '—'}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#64748b' }}>Description</Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ color: '#475569' }}>
                                    This is your group info panel. You can enhance it with group description, rules, or custom fields.
                                </Typography>
                            </Paper>
                        </Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#64748b' }}>Members</Typography>
                        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                            <List>
                                {(selectedChat.members || []).map((member) => (
                                    <ListItem key={member._id || member.id} secondaryAction={<Chip size="small" label={member.role || 'member'} />}>
                                        <ListItemAvatar>
                                            <Avatar>{(member.name || member.email || '?').charAt(0).toUpperCase()}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography sx={{ fontWeight: 600 }}>{member.name || member.email || 'Unknown'}</Typography>}
                                            secondary={<Typography variant="body2" sx={{ color: '#64748b' }}>{member.email}</Typography>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenGroupInfo(false)} sx={{ textTransform: 'none' }}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Confirm Delete Dialog */}
            <Dialog open={confirmDelete.open} onClose={handleConfirmDeleteClose} maxWidth="xs" fullWidth>
                <DialogTitle>Delete message?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteClose} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDeleteProceed} sx={{ textTransform: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Chat;