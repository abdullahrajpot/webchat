import { useAuth } from "@app/_components/_core/AuthProvider/hooks";

const SamplePage = () => {

    const {user ,isAuthenticated }= useAuth();
                console.log(user)
    return (
         <div>
      {isAuthenticated ? `Welcome, ${user?.name}` : "Please log in"}
      
    </div>
    );
};

export default SamplePage;