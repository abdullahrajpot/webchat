# File Sharing Setup Instructions

## Backend Setup

1. **Install multer dependency:**
   ```bash
   cd Backend
   npm install multer
   ```

2. **Start the backend server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Verify uploads directory:**
   - The `uploads/` directory will be created automatically
   - Make sure the backend has write permissions

## Frontend Setup

1. **Start the frontend:**
   ```bash
   cd WebChat
   npm start
   # or
   npm run dev
   ```

## File Sharing Features

### Supported File Types:
- **Images:** JPG, JPEG, PNG, GIF (with preview)
- **Videos:** MP4, AVI, MOV
- **Audio:** MP3, WAV, OGG
- **Documents:** PDF, DOC, DOCX, TXT
- **Archives:** ZIP, RAR

### File Size Limit:
- Maximum file size: 50MB per file

### How to Use:

1. **Upload Files:**
   - Click the attachment icon (📎) in the message input
   - Select a file from your device
   - File will be uploaded and shared in the group

2. **View Files:**
   - Images show a preview thumbnail
   - Other files show an icon with file info
   - Click on images to download them

3. **Download Files:**
   - Click the download button on any file message
   - Files are downloaded with their original names

### Security Features:
- Only group members can upload/download files
- Authentication required for all file operations
- Files are stored securely on the server

### Real-time Updates:
- File uploads appear instantly for all group members
- No page refresh needed
- Socket.io handles real-time file sharing notifications

## Troubleshooting

### If file upload fails:
1. Check if multer is installed: `npm list multer`
2. Verify backend server is running
3. Check file size (must be < 50MB)
4. Ensure file type is supported

### If images don't show previews:
1. Check if the uploads directory exists
2. Verify static file serving is working
3. Check browser console for errors

### If downloads fail:
1. Verify user is a member of the group
2. Check authentication token
3. Ensure file exists on server