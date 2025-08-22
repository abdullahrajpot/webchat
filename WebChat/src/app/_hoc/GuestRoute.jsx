import { useAuth } from "@app/_components/_core/AuthProvider/hooks";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect authenticated users based on their role
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admindashboard/home" replace />;
    } else {
      return <Navigate to="/userdashboard" replace />;
    }
  }
  
  // Allow unauthenticated users to access the page
  return children;
};

export default GuestRoute;