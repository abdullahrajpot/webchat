// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardHeader,
//   CardContent,
//   Checkbox,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Divider,
//   IconButton,
//   InputAdornment,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Menu,
//   MenuItem,
//   Paper,
//   Stack,
//   TextField,
//   Typography,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Send as SendIcon,
//   AttachFile as AttachFileIcon,
//   InsertEmoticon as EmojiIcon,
//   MoreVert as MoreVertIcon,
//   Add as AddIcon,
//   Groups as GroupsIcon,
//   Close as CloseIcon,
//   Image as ImageIcon,
//   Description as DescriptionIcon,
//   Videocam as VideoIcon,
//   Call as CallIcon,
//   Info as InfoIcon,
//   Settings as SettingsIcon,
//   PersonAdd as PersonAddIcon,
//   Delete as DeleteIcon,
//   Download as DownloadIcon,
//   Circle as CircleIcon
// } from '@mui/icons-material';

// // Mock data
// const mockUsers = [
//   { id: 1, name: 'Christy Lin', avatar: '👩‍💼', status: 'online', lastSeen: 'now' },
//   { id: 2, name: 'Domnic Harris', avatar: '👨‍💻', status: 'online', lastSeen: '2 min ago' },
//   { id: 3, name: 'Garry Sobars', avatar: '👨‍🎨', status: 'away', lastSeen: '10 min ago' },
//   { id: 4, name: 'Jeson Born', avatar: '👨‍🚀', status: 'offline', lastSeen: '1 hour ago' },
//   { id: 5, name: 'Sarah Wilson', avatar: '👩‍🔬', status: 'online', lastSeen: 'now' },
//   { id: 6, name: 'Mike Johnson', avatar: '👨‍⚕️', status: 'busy', lastSeen: '5 min ago' }
// ];

// const mockChats = [
//   {
//     id: 1,
//     name: 'Project Alpha Team',
//     type: 'group',
//     members: [1, 2, 3, 5],
//     lastMessage: 'Sure thing. I will go through with the documents.',
//     timestamp: '2 min ago',
//     unread: 2,
//     avatar: '🚀'
//   },
//   {
//     id: 2,
//     name: 'Garry Sobars',
//     type: 'direct',
//     members: [3],
//     lastMessage: 'Perfect! have a wonderful day...',
//     timestamp: '10 min ago',
//     unread: 0,
//     avatar: '👨‍🎨'
//   },
//   {
//     id: 3,
//     name: 'Design Review',
//     type: 'group',
//     members: [1, 3, 4, 6],
//     lastMessage: 'No, I think I\'m good with that.',
//     timestamp: '1 hour ago',
//     unread: 5,
//     avatar: '🎨'
//   },
//   {
//     id: 4,
//     name: 'Development Team',
//     type: 'group',
//     members: [2, 4, 5, 6],
//     lastMessage: 'Let\'s schedule a meeting for tomorrow.',
//     timestamp: '3 hours ago',
//     unread: 1,
//     avatar: '💻'
//   }
// ];

// const mockMessages = [
//   {
//     id: 1,
//     chatId: 1,
//     senderId: 2,
//     senderName: 'Domnic Harris',
//     content: 'Hey team! How\'s the progress on the new feature?',
//     timestamp: new Date(Date.now() - 3600000),
//     type: 'text'
//   },
//   {
//     id: 2,
//     chatId: 1,
//     senderId: 1,
//     senderName: 'Christy Lin',
//     content: 'Going well! I\'ve finished the UI mockups.',
//     timestamp: new Date(Date.now() - 3300000),
//     type: 'text'
//   },
//   {
//     id: 3,
//     chatId: 1,
//     senderId: 3,
//     senderName: 'Garry Sobars',
//     content: '',
//     timestamp: new Date(Date.now() - 3000000),
//     type: 'file',
//     fileName: 'design-mockups.png',
//     fileSize: '2.4 MB'
//   },
//   {
//     id: 4,
//     chatId: 1,
//     senderId: 1,
//     senderName: 'Christy Lin',
//     content: 'Thanks for sharing! The designs look great.',
//     timestamp: new Date(Date.now() - 2700000),
//     type: 'text'
//   },
//   {
//     id: 5,
//     chatId: 1,
//     senderId: 2,
//     senderName: 'Domnic Harris',
//     content: 'Sure thing. I will go through the documents.',
//     timestamp: new Date(Date.now() - 120000),
//     type: 'text'
//   }
// ];

// const Chat = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [activeTab, setActiveTab] = useState(0);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState(mockMessages);
//   const [chats, setChats] = useState(mockChats);
//   const [users] = useState(mockUsers);
//   const [user] = useState({ id: 1, name: 'Christy Lin', avatar: '👩‍💼' });

//   // Dialog states
//   const [createGroupDialog, setCreateGroupDialog] = useState(false);
//   const [groupName, setGroupName] = useState('');
//   const [selectedMembers, setSelectedMembers] = useState([]);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [chatInfoDialog, setChatInfoDialog] = useState(false);

//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, selectedChat]);

//   // Define filteredChats and filteredContacts
//   const filteredChats = chats.filter(chat =>
//     chat.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredContacts = users.filter(user =>
//     user.name.toLowerCase().includes(searchTerm.toLowerCase()) && user.id !== user.id
//   );

//   const handleSendMessage = () => {
//     if (!message.trim() || !selectedChat) return;

//     const newMessage = {
//       id: Date.now(),
//       chatId: selectedChat.id,
//       senderId: user.id,
//       senderName: user.name,
//       content: message.trim(),
//       timestamp: new Date(),
//       type: 'text'
//     };

//     setMessages(prev => [...prev, newMessage]);

//     setChats(prev => prev.map(chat => 
//       chat.id === selectedChat.id 
//         ? { ...chat, lastMessage: message.trim(), timestamp: 'now' }
//         : chat
//     ));

//     setMessage('');
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file || !selectedChat) return;

//     const newMessage = {
//       id: Date.now(),
//       chatId: selectedChat.id,
//       senderId: user.id,
//       senderName: user.name,
//       content: '',
//       timestamp: new Date(),
//       type: 'file',
//       fileName: file.name,
//       fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
//     };

//     setMessages(prev => [...prev, newMessage]);
//     setChats(prev => prev.map(chat => 
//       chat.id === selectedChat.id 
//         ? { ...chat, lastMessage: `📎 ${file.name}`, timestamp: 'now' }
//         : chat
//     ));
//   };

//   const handleCreateGroup = () => {
//     if (!groupName.trim() || selectedMembers.length === 0) return;

//     const newGroup = {
//       id: Date.now(),
//       name: groupName,
//       type: 'group',
//       members: [user.id, ...selectedMembers],
//       lastMessage: 'Group created',
//       timestamp: 'now',
//       unread: 0,
//       avatar: '👥'
//     };

//     setChats(prev => [newGroup, ...prev]);
//     setCreateGroupDialog(false);
//     setGroupName('');
//     setSelectedMembers([]);
//     setSelectedChat(newGroup);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'online': return 'success';
//       case 'away': return 'warning';
//       case 'busy': return 'error';
//       default: return 'default';
//     }
//   };

//   const formatTime = (timestamp) => {
//     if (typeof timestamp === 'string') return timestamp;
//     const now = new Date();
//     const diff = now - timestamp;

//     if (diff < 60000) return 'now';
//     if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
//     if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
//     return timestamp.toLocaleDateString();
//   };

//   const getChatMessages = (chatId) => {
//     return messages.filter(msg => msg.chatId === chatId).sort((a, b) => a.timestamp - b.timestamp);
//   };

//   const getChatMembers = (chat) => {
//     return chat.members.map(memberId => users.find(user => user.id === memberId)).filter(Boolean);
//   };

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
//       {/* Sidebar */}
//       <Paper elevation={3} sx={{ width: 360, display: 'flex', flexDirection: 'column' }}>
//         {/* Header */}
//         <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
//           <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
//             <Avatar sx={{ bgcolor: 'primary.main' }}>{user.avatar}</Avatar>
//             <Box>
//               <Typography variant="subtitle1" fontWeight="medium">
//                 {user.name}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Life must be big
//               </Typography>
//             </Box>
//           </Stack>
//           <TextField
//             fullWidth
//             placeholder="Search here..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//               sx: { borderRadius: 2 }
//             }}
//           />
//         </Box>

//         {/* Tabs */}
//         <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
//           <Button
//             fullWidth
//             onClick={() => setActiveTab(0)}
//             sx={{
//               borderRadius: 0,
//               borderBottom: activeTab === 0 ? 2 : 0,
//               borderColor: 'primary.main',
//               color: activeTab === 0 ? 'primary.main' : 'text.secondary',
//               bgcolor: activeTab === 0 ? 'primary.light' : 'transparent'
//             }}
//           >
//             CHATS
//           </Button>
//           <Button
//             fullWidth
//             onClick={() => setActiveTab(1)}
//             sx={{
//               borderRadius: 0,
//               borderBottom: activeTab === 1 ? 2 : 0,
//               borderColor: 'primary.main',
//               color: activeTab === 1 ? 'primary.main' : 'text.secondary',
//               bgcolor: activeTab === 1 ? 'primary.light' : 'transparent'
//             }}
//           >
//             CONTACTS
//           </Button>
//         </Box>

//         {/* Content */}
//         <Box sx={{ flex: 1, overflow: 'hidden' }}>
//           {activeTab === 0 && (
//             <>
//               {/* Favorites */}
//               <Box sx={{ p: 1.5, bgcolor: 'grey.100' }}>
//                 <Typography variant="overline" color="text.secondary">
//                   FAVORITES
//                 </Typography>
//               </Box>

//               {/* Chat List */}
//               <Box sx={{ height: 'calc(100% - 120px)', overflowY: 'auto' }}>
//                 <List>
//                   {filteredChats.map((chat) => (
//                     <ListItemButton
//                       key={chat.id}
//                       selected={selectedChat?.id === chat.id}
//                       onClick={() => setSelectedChat(chat)}
//                       sx={{
//                         '&.Mui-selected': {
//                           bgcolor: 'primary.light',
//                           borderRight: 2,
//                           borderColor: 'primary.main'
//                         }
//                       }}
//                     >
//                       <ListItemAvatar>
//                         <Avatar sx={{ bgcolor: 'primary.light' }}>
//                           {chat.avatar}
//                         </Avatar>
//                       </ListItemAvatar>
//                       <ListItemText
//                         primary={
//                           <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                             <Typography fontWeight={chat.unread > 0 ? 'bold' : 'medium'}>
//                               {chat.name}
//                             </Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               {chat.timestamp}
//                             </Typography>
//                           </Box>
//                         }
//                         secondary={
//                           <>
//                             <Typography
//                               variant="body2"
//                               color="text.secondary"
//                               noWrap
//                               sx={{ display: 'flex', alignItems: 'center' }}
//                             >
//                               {chat.lastMessage}
//                             </Typography>
//                             {chat.unread > 0 && (
//                               <Chip
//                                 label={chat.unread}
//                                 size="small"
//                                 color="error"
//                                 sx={{ position: 'absolute', right: 16, top: 16 }}
//                               />
//                             )}
//                           </>
//                         }
//                       />
//                     </ListItemButton>
//                   ))}
//                 </List>
//               </Box>

//               {/* Create Group Button */}
//               <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   startIcon={<AddIcon />}
//                   onClick={() => setCreateGroupDialog(true)}
//                   sx={{ borderRadius: 2, borderStyle: 'dashed' }}
//                 >
//                   Create New Group
//                 </Button>
//               </Box>
//             </>
//           )}

//           {activeTab === 1 && (
//             <Box sx={{ height: '100%', overflowY: 'auto' }}>
//               <List>
//                 {filteredContacts.map((user) => (
//                   <ListItem key={user.id} secondaryAction={
//                     <IconButton edge="end">
//                       <PersonAddIcon />
//                     </IconButton>
//                   }>
//                     <ListItemAvatar>
//                       <Avatar>
//                         {user.avatar}
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText
//                       primary={user.name}
//                       secondary={
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Typography variant="caption" color="text.secondary">
//                             {user.status}
//                           </Typography>
//                           <CircleIcon color={getStatusColor(user.status)} sx={{ fontSize: 8 }} />
//                           <Typography variant="caption" color="text.secondary">
//                             {user.lastSeen}
//                           </Typography>
//                         </Box>
//                       }
//                     />
//                   </ListItem>
//                 ))}
//               </List>
//             </Box>
//           )}
//         </Box>
//       </Paper>

//       {/* Chat Area */}
//       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         {selectedChat ? (
//           <>
//             {/* Chat Header */}
//             <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
//               <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
//                 {selectedChat.avatar}
//               </Avatar>
//               <Box sx={{ flex: 1 }}>
//                 <Typography variant="subtitle1" fontWeight="medium">
//                   {selectedChat.name}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {selectedChat.type === 'group' 
//                     ? `${selectedChat.members.length} members`
//                     : 'Last seen 2 min ago'
//                   }
//                 </Typography>
//               </Box>
//               <Stack direction="row" spacing={1}>
//                 <IconButton>
//                   <VideoIcon />
//                 </IconButton>
//                 <IconButton>
//                   <CallIcon />
//                 </IconButton>
//                 <IconButton onClick={handleMenuOpen}>
//                   <MoreVertIcon />
//                 </IconButton>
//                 <Menu
//                   anchorEl={anchorEl}
//                   open={Boolean(anchorEl)}
//                   onClose={handleMenuClose}
//                 >
//                   <MenuItem onClick={() => { setChatInfoDialog(true); handleMenuClose(); }}>
//                     <ListItemIcon>
//                       <InfoIcon fontSize="small" />
//                     </ListItemIcon>
//                     <ListItemText>Chat Info</ListItemText>
//                   </MenuItem>
//                   <MenuItem onClick={handleMenuClose}>
//                     <ListItemIcon>
//                       <SettingsIcon fontSize="small" />
//                     </ListItemIcon>
//                     <ListItemText>Settings</ListItemText>
//                   </MenuItem>
//                   <Divider />
//                   <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
//                     <ListItemIcon>
//                       <DeleteIcon fontSize="small" color="error" />
//                     </ListItemIcon>
//                     <ListItemText>Delete Chat</ListItemText>
//                   </MenuItem>
//                 </Menu>
//               </Stack>
//             </Paper>

//             {/* Messages */}
//             <Box sx={{ 
//               flex: 1, 
//               overflowY: 'auto', 
//               p: 2,
//               background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 50%, #f3f4f6 100%)'
//             }}>
//               <Stack spacing={2}>
//                 {getChatMessages(selectedChat.id).map((msg, index) => {
//                   const isOwnMessage = msg.senderId === user.id;
//                   const showAvatar = !isOwnMessage && (
//                     index === 0 || 
//                     getChatMessages(selectedChat.id)[index - 1]?.senderId !== msg.senderId
//                   );

//                   return (
//                     <Box
//                       key={msg.id}
//                       sx={{
//                         display: 'flex',
//                         justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
//                         alignItems: 'flex-end',
//                         gap: 1
//                       }}
//                     >
//                       {!isOwnMessage && showAvatar && (
//                         <Avatar sx={{ width: 32, height: 32 }}>
//                           {users.find(u => u.id === msg.senderId)?.avatar}
//                         </Avatar>
//                       )}
//                       <Box sx={{ maxWidth: '70%' }}>
//                         {!isOwnMessage && showAvatar && (
//                           <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
//                             {msg.senderName}
//                           </Typography>
//                         )}
//                         <Paper
//                           elevation={0}
//                           sx={{
//                             p: 1.5,
//                             borderRadius: 2,
//                             bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
//                             color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
//                             borderTopLeftRadius: isOwnMessage ? 12 : 0,
//                             borderTopRightRadius: isOwnMessage ? 0 : 12
//                           }}
//                         >
//                           {msg.type === 'text' ? (
//                             <Typography>{msg.content}</Typography>
//                           ) : (
//                             <Stack direction="row" spacing={1} alignItems="center">
//                               <DescriptionIcon />
//                               <Box>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {msg.fileName}
//                                 </Typography>
//                                 <Typography variant="caption">
//                                   {msg.fileSize}
//                                 </Typography>
//                               </Box>
//                               <IconButton size="small">
//                                 <DownloadIcon />
//                               </IconButton>
//                             </Stack>
//                           )}
//                         </Paper>
//                         <Typography
//                           variant="caption"
//                           color="text.secondary"
//                           sx={{ 
//                             display: 'block',
//                             textAlign: isOwnMessage ? 'right' : 'left',
//                             mt: 0.5
//                           }}
//                         >
//                           {formatTime(msg.timestamp)}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   );
//                 })}
//                 <div ref={messagesEndRef} />
//               </Stack>
//             </Box>

//             {/* Message Input */}
//             <Paper elevation={0} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
//               <Stack direction="row" spacing={1} alignItems="center">
//                 <TextField
//                   fullWidth
//                   placeholder="Type a message..."
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <IconButton>
//                           <EmojiIcon />
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <input
//                           type="file"
//                           ref={fileInputRef}
//                           onChange={handleFileUpload}
//                           style={{ display: 'none' }}
//                         />
//                         <IconButton onClick={() => fileInputRef.current?.click()}>
//                           <AttachFileIcon />
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                     sx: { borderRadius: 4 }
//                   }}
//                 />
//                 <IconButton
//                   color="primary"
//                   disabled={!message.trim()}
//                   onClick={handleSendMessage}
//                   sx={{ 
//                     bgcolor: 'primary.main',
//                     color: 'primary.contrastText',
//                     '&:hover': { bgcolor: 'primary.dark' },
//                     '&.Mui-disabled': { bgcolor: 'grey.300' }
//                   }}
//                 >
//                   <SendIcon />
//                 </IconButton>
//               </Stack>
//             </Paper>
//           </>
//         ) : (
//           <Box sx={{
//             flex: 1,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             bgcolor: 'background.paper'
//           }}>
//             <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
//               <Typography variant="h3" sx={{ mb: 2 }}>💬</Typography>
//               <Typography variant="h5" sx={{ mb: 1, fontWeight: 'medium' }}>
//                 Welcome to Jumbo chat app
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                 Select a chat from the sidebar to start messaging with your team members.
//               </Typography>
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={() => setCreateGroupDialog(true)}
//                 sx={{ borderRadius: 2 }}
//               >
//                 Create New Group
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </Box>

//       {/* Create Group Dialog */}
//       <Dialog
//         open={createGroupDialog}
//         onClose={() => setCreateGroupDialog(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>
//           <Stack direction="row" spacing={1} alignItems="center">
//             <GroupsIcon color="primary" />
//             <Typography variant="h6">Create New Group</Typography>
//           </Stack>
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label="Group Name"
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//             sx={{ mb: 3 }}
//           />
//           <Typography variant="subtitle1" sx={{ mb: 1 }}>
//             Add Members:
//           </Typography>
//           <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
//             <List>
//               {users.filter(u => u.id !== user.id).map((user) => (
//                 <ListItem
//                   key={user.id}
//                   secondaryAction={
//                     <Checkbox
//                       edge="end"
//                       checked={selectedMembers.includes(user.id)}
//                       onChange={() => {
//                         if (selectedMembers.includes(user.id)) {
//                           setSelectedMembers(prev => prev.filter(id => id !== user.id));
//                         } else {
//                           setSelectedMembers(prev => [...prev, user.id]);
//                         }
//                       }}
//                     />
//                   }
//                   disablePadding
//                 >
//                   <ListItemButton>
//                     <ListItemAvatar>
//                       <Avatar>
//                         {user.avatar}
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText
//                       primary={user.name}
//                       secondary={
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <Typography variant="caption" color="text.secondary">
//                             {user.status}
//                           </Typography>
//                           <CircleIcon color={getStatusColor(user.status)} sx={{ fontSize: 8 }} />
//                         </Stack>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setCreateGroupDialog(false)}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleCreateGroup}
//             disabled={!groupName.trim() || selectedMembers.length === 0}
//           >
//             Create Group
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Chat Info Dialog */}
//       <Dialog
//         open={chatInfoDialog}
//         onClose={() => setChatInfoDialog(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>Chat Info</DialogTitle>
//         <DialogContent>
//           {selectedChat && (
//             <Stack spacing={2}>
//               <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//                 <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
//                   {selectedChat.avatar}
//                 </Avatar>
//               </Box>
//               <Typography variant="h6" align="center">
//                 {selectedChat.name}
//               </Typography>
//               <Divider />
//               <Typography variant="subtitle1">Members</Typography>
//               <List>
//                 {getChatMembers(selectedChat).map((member) => (
//                   <ListItem key={member.id}>
//                     <ListItemAvatar>
//                       <Avatar>
//                         {member.avatar}
//                       </Avatar>
//                     </ListItemAvatar>
//                     <ListItemText
//                       primary={member.name}
//                       secondary={
//                         <Stack direction="row" spacing={1} alignItems="center">
//                           <Typography variant="caption" color="text.secondary">
//                             {member.status}
//                           </Typography>
//                           <CircleIcon color={getStatusColor(member.status)} sx={{ fontSize: 8 }} />
//                         </Stack>
//                       }
//                     />
//                   </ListItem>
//                 ))}
//               </List>
//             </Stack>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChatInfoDialog(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Chat;










import React, { useState, useEffect, useRef } from 'react';
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
    CircularProgress
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
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user, token } = useAuth();

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
                socketRef.current.on('groupHistory', ({ groupId, messages }) => {
                    console.log('Received group history:', { groupId, messages });
                    if (!mounted) return;
                    setGroups(prev => prev.map(group =>
                        group.id === groupId
                            ? { ...group, messages: messages }
                            : group
                    ));
                });

                // Listen for new messages
                socketRef.current.on('newMessage', ({ groupId, message }) => {
                    console.log('New message received:', { groupId, message });
                    console.log('Current groups:', groups);
                    console.log('Selected chat:', selectedChat);
                    if (!mounted) return;

                    setGroups(prev => {
                        const updated = prev.map(group =>
                            group.id === groupId
                                ? { ...group, messages: [...(group.messages || []), message] }
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

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!message.trim() || !selectedChat?.id || !socketRef.current) return;

        const messageContent = message.trim();

        if (selectedChat.type === 'group') {
            // Create optimistic message
            const optimisticMessage = {
                id: `temp-${Date.now()}`,
                senderId: user.id,
                senderName: user.name,
                content: messageContent,
                type: 'text',
                timestamp: new Date().toISOString()
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

            // Emit the message via socket for real-time updates
            if (socketRef.current) {
                socketRef.current.emit('sendMessage', {
                    groupId: selectedChat.id,
                    content: data.messageData.content,
                    type: 'file',
                    fileName: data.messageData.fileName,
                    fileSize: data.messageData.fileSize,
                    fileUrl: data.messageData.fileUrl,
                    fileType: data.messageData.fileType,
                    senderId: user.id
                });
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
            case 'online': return 'success';
            case 'away': return 'warning';
            case 'busy': return 'error';
            default: return 'default';
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

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                gap: 2
            }}>
                <CircularProgress />
                <Typography>Loading chat application...</Typography>
                {connectionStatus === 'connecting' && (
                    <Typography variant="body2" color="text.secondary">
                        Connecting to server...
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        zIndex: 9999,
                        maxWidth: 400
                    }}
                    action={
                        <Button
                            size="small"
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
                            RETRY
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
                bottom: 16,
                left: 16,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <Badge
                    variant="dot"
                    color={
                        connectionStatus === 'connected' ? 'success' :
                            connectionStatus === 'error' ? 'error' : 'warning'
                    }
                >
                    <Typography variant="caption" color="text.secondary">
                        {connectionStatus === 'connected' ? 'Connected' :
                            connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                    </Typography>
                </Badge>
            </Box>

            {/* Sidebar */}
            <Paper elevation={3} sx={{ width: 360, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{user.name.charAt(0)}</Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                                {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.role === 'admin' ? 'Admin' : 'User'}
                            </Typography>
                        </Box>
                    </Stack>
                    <TextField
                        fullWidth
                        placeholder="Search here..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                        }}
                    />
                </Box>

                {/* Tabs */}
                <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab(0)}
                        sx={{
                            borderRadius: 0,
                            borderBottom: activeTab === 0 ? 2 : 0,
                            borderColor: 'primary.main',
                            color: activeTab === 0 ? 'primary.main' : 'text.secondary',
                            bgcolor: activeTab === 0 ? 'primary.light' : 'transparent'
                        }}
                    >
                        CHATS ({filteredGroups.length})
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setActiveTab(1)}
                        sx={{
                            borderRadius: 0,
                            borderBottom: activeTab === 1 ? 2 : 0,
                            borderColor: 'primary.main',
                            color: activeTab === 1 ? 'primary.main' : 'text.secondary',
                            bgcolor: activeTab === 1 ? 'primary.light' : 'transparent'
                        }}
                    >
                        CONTACTS ({filteredUsers.length})
                    </Button>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {activeTab === 0 && (
                        <>
                            {/* Group List */}
                            <Box sx={{ height: 'calc(100% - 120px)', overflowY: 'auto' }}>
                                {filteredGroups.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {error ? 'Failed to load groups' : 'No groups found'}
                                        </Typography>
                                        {user.role === 'admin' && !error && (
                                            <Button
                                                variant="text"
                                                startIcon={<AddIcon />}
                                                onClick={() => setCreateGroupDialog(true)}
                                                sx={{ mt: 1 }}
                                            >
                                                Create your first group
                                            </Button>
                                        )}
                                    </Box>
                                ) : (
                                    <List>
                                        {filteredGroups.map((group) => (
                                            <ListItemButton
                                                key={group.id}
                                                selected={selectedChat?.id === group.id}
                                                onClick={() => {
                                                    setSelectedChat(group);
                                                    joinGroup(group.id);
                                                }}
                                                sx={{
                                                    '&.Mui-selected': {
                                                        bgcolor: 'primary.light',
                                                        borderRight: 2,
                                                        borderColor: 'primary.main'
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                        <GroupsIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography fontWeight="medium">
                                                                {group.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatTime(group.messages[group.messages.length - 1]?.timestamp)}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            noWrap
                                                        >
                                                            {group.messages[group.messages.length - 1]?.content || 'No messages yet'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                )}
                            </Box>

                            {/* Create Group Button (only for admin) */}
                            {user.role === 'admin' && (
                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setCreateGroupDialog(true)}
                                        sx={{ borderRadius: 2, borderStyle: 'dashed' }}
                                    >
                                        Create New Group
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}

                    {activeTab === 1 && (
                        <Box sx={{ height: '100%', overflowY: 'auto' }}>
                            {filteredUsers.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {searchTerm ? 'No users found matching your search' :
                                            error ? 'Failed to load users' : 'No users available'}
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {filteredUsers.map((user) => (
                                        <ListItem key={user.id}>
                                            <ListItemAvatar>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    variant="dot"
                                                    color={getStatusColor(user.status)}
                                                >
                                                    <Avatar>{user.name.charAt(0)}</Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="subtitle2">
                                                            {user.name}
                                                        </Typography>
                                                        <Chip
                                                            label="user"
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem', height: '18px' }}
                                                        />
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {user.email}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Status: {user.status || 'offline'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                {selectedChat.type === 'group' ? <GroupsIcon /> : selectedChat.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    {selectedChat.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedChat.type === 'group'
                                        ? `${selectedChat.members?.length || 0} members`
                                        : 'Online'}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <IconButton>
                                    <VideoIcon />
                                </IconButton>
                                <IconButton>
                                    <CallIcon />
                                </IconButton>
                                <IconButton onClick={handleMenuOpen}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleMenuClose}>
                                        <ListItemIcon>
                                            <InfoIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Chat Info</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose}>
                                        <ListItemIcon>
                                            <SettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Settings</ListItemText>
                                    </MenuItem>
                                    {isAdmin && [
                                        <Divider key="divider" />,
                                        <MenuItem key="delete" onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                                            <ListItemIcon>
                                                <DeleteIcon fontSize="small" color="error" />
                                            </ListItemIcon>
                                            <ListItemText>Delete Chat</ListItemText>
                                        </MenuItem>
                                    ]}
                                </Menu>
                            </Stack>
                        </Paper>

                        {/* Messages */}
                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 2,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 50%, #f3f4f6 100%)'
                        }}>
                            <Stack spacing={2}>
                                {selectedChat.messages?.map((msg) => {
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
                                                gap: 1
                                            }}
                                        >
                                            {!isOwnMessage && (
                                                <Avatar sx={{ width: 32, height: 32 }}>
                                                    {sender?.name?.charAt(0) || '?'}
                                                </Avatar>
                                            )}
                                            <Box sx={{ maxWidth: '70%' }}>
                                                {!isOwnMessage && sender && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                        {sender.name}
                                                    </Typography>
                                                )}
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
                                                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                                                        borderTopLeftRadius: isOwnMessage ? 12 : 0,
                                                        borderTopRightRadius: isOwnMessage ? 0 : 12
                                                    }}
                                                >
                                                    {msg.type === 'text' ? (
                                                        <Typography>{msg.content}</Typography>
                                                    ) : msg.type === 'file' ? (
                                                        <Box>
                                                            {/* Debug info */}
                                                            {console.log('Rendering file message:', msg)}
                                                            
                                                            {/* Show image preview if it's an image */}
                                                            {isPreviewableImage(msg.fileType, msg.fileName) && msg.fileUrl && (
                                                                <Box sx={{ mb: 1, maxWidth: 300 }}>
                                                                    <img
                                                                        src={`${API_BASE_URL}${msg.fileUrl}`}
                                                                        alt={msg.fileName}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: 'auto',
                                                                            borderRadius: 8,
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
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                {getFileIcon(msg.fileType, msg.fileName)}
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {msg.fileName}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {msg.fileSize} • {msg.fileType || 'file'}
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleFileDownload(msg.fileUrl, msg.fileName)}
                                                                    disabled={!msg.fileUrl}
                                                                    sx={{
                                                                        bgcolor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                                        '&:hover': {
                                                                            bgcolor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <DownloadIcon />
                                                                </IconButton>
                                                            </Stack>
                                                        </Box>
                                                    ) : (
                                                        <Typography color="error">
                                                            Unknown message type: {msg.type}
                                                        </Typography>
                                                    )}
                                                </Paper>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        textAlign: isOwnMessage ? 'right' : 'left',
                                                        mt: 0.5
                                                    }}
                                                >
                                                    {formatTime(msg.timestamp)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </Stack>
                        </Box>

                        {/* Message Input */}
                        <Paper elevation={0} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                    fullWidth
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton>
                                                    <EmojiIcon />
                                                </IconButton>
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
                                                >
                                                    <AttachFileIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 4 }
                                    }}
                                />
                                <IconButton
                                    color="primary"
                                    disabled={!message.trim()}
                                    onClick={handleSendMessage}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&.Mui-disabled': { bgcolor: 'grey.300' }
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
                        bgcolor: 'background.paper'
                    }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                            <Typography variant="h3" sx={{ mb: 2 }}>💬</Typography>
                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'medium' }}>
                                {user.role === 'admin' ? 'Admin Chat Dashboard' : 'Welcome to Chat'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                {user.role === 'admin'
                                    ? 'Select a group or create a new one to start chatting'
                                    : 'Select a group to start chatting with your team'}
                            </Typography>
                            {user.role === 'admin' && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateGroupDialog(true)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Create New Group
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
                >
                    <DialogTitle>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <GroupsIcon color="primary" />
                            <Typography variant="h6">Create New Group</Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            sx={{ mb: 3 }}
                            error={!groupName.trim() && groupName.length > 0}
                            helperText={!groupName.trim() && groupName.length > 0 ? "Group name is required" : ""}
                        />
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Add Members (Users only):
                        </Typography>
                        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                            {users.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {error ? 'Failed to load users. Please try again.' : 'No users available to add'}
                                    </Typography>
                                    {error && (
                                        <Button
                                            size="small"
                                            onClick={fetchUsers}
                                            sx={{ mt: 1 }}
                                        >
                                            Retry Loading Users
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <List>
                                    {users.map((user) => (
                                        <ListItem
                                            key={user.id}
                                            secondaryAction={
                                                <Checkbox
                                                    edge="end"
                                                    checked={selectedMembers.includes(user.id)}
                                                    onChange={() => toggleMemberSelection(user.id)}
                                                />
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton onClick={() => toggleMemberSelection(user.id)}>
                                                <ListItemAvatar>
                                                    <Badge
                                                        overlap="circular"
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                        variant="dot"
                                                        color={getStatusColor(user.status)}
                                                    >
                                                        <Avatar>{user.name.charAt(0)}</Avatar>
                                                    </Badge>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={user.name}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {user.email}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {user.status || 'offline'}
                                                                </Typography>
                                                                <Chip
                                                                    label="user"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.6rem', height: '16px' }}
                                                                />
                                                            </Stack>
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                        {selectedMembers.length > 0 && (
                            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'} selected
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setCreateGroupDialog(false);
                            setGroupName('');
                            setSelectedMembers([]);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateGroup}
                            disabled={!groupName.trim() || selectedMembers.length === 0}
                        >
                            Create Group ({selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'})
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default Chat;