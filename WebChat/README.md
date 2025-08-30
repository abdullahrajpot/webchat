# WebChat - Task Management & Chat Application

A modern React application built with Vite, Material-UI, and Socket.IO for real-time chat and task management.

## Features

- 🔐 User Authentication & Authorization
- 💬 Real-time Chat with File Sharing
- 📋 Task Management System
- 📊 Dashboard with Analytics
- 🌐 Multi-language Support
- 📱 Responsive Design
- 🎨 Modern UI with Material-UI

## Tech Stack

- **Frontend**: React 18, Vite, Material-UI
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **Forms**: React Hook Form + Yup
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WebChat
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Build Settings**: The project uses the following build configuration:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**: Set the following in Vercel dashboard:
   ```
   VITE_API_BASE_URL=your-api-url
   VITE_SOCKET_URL=your-socket-url
   ```

4. **Deploy**: Vercel will automatically deploy on every push to main branch

### Build Configuration

The project includes optimized build settings:

- **Code Splitting**: Automatic chunk splitting for better performance
- **Console Removal**: Console statements are removed in production
- **Minification**: Terser minification for smaller bundle sizes
- **Caching**: Optimized static asset caching

### Troubleshooting Deployment Issues

If you encounter deployment errors:

1. **Check Build Logs**: Review the build output in Vercel dashboard
2. **Verify Dependencies**: Ensure all dependencies are in `package.json`
3. **Environment Variables**: Confirm all required env vars are set
4. **Node Version**: Ensure Node.js version is >= 18.0.0

Common Issues:
- **FUNCTION_THROTTLED**: Increase function timeout in `vercel.json`
- **BUILD_FAILED**: Check for missing dependencies or syntax errors
- **ROUTING_ISSUES**: Verify `vercel.json` rewrite rules

## Project Structure

```
src/
├── app/                    # Main application code
│   ├── _components/       # Shared components
│   ├── _config/          # Configuration files
│   ├── _layouts/         # Layout components
│   ├── _routes/          # Routing configuration
│   ├── pages/            # Page components
│   └── _styles/          # Global styles
├── @jumbo/               # Jumbo UI components
└── @assets/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
