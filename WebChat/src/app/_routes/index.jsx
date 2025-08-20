import Login1 from "@app/pages/auth/login1";
import { createBrowserRouter } from "react-router-dom";
import SamplePage from "@app/pages/UserDashboard";
import { StretchedLayout } from "@app/_layouts/StretchedLayout";
import { SoloLayout } from "@app/_layouts/SoloLayout"; 
import withAuth from "@app/_hoc/withAuth";
import { Page, NotFound404 } from "@app/_components/_core";
import Signup1 from "@app/pages/auth/signup1";
// import DashboardPage from "@app/pages/dashboard/dashboard";
import GuestRoute from "@app/_hoc/GuestRoute";
import Home from "@app/pages/AdminDashboard/Home/Home";
import AssignTask from "@app/pages/AdminDashboard/AssignTask/AssignTask";
import { ContentLayout } from "@app/_layouts/ContentLayout";
import UserHome from "@app/pages/UserDashboard/UserDashboard/UserDashboard";
import UserDashboard from "@app/pages/UserDashboard/UserDashboard/UserDashboard";
import Chat from "@app/pages/AdminDashboard/Chat/Chat";
import { SoloLayout2 } from "@app/_layouts/SoloLayout2";


const routes = [
  {
    path: "/",
    element: <SoloLayout2/>,
    children: [
      {
        path: "/",
        element: <Page Component={SamplePage} hoc={withAuth} />,
      },
      {
        path: "/userdashboard",
        element: <Page Component={UserDashboard} hoc={withAuth} />,
      },
      {
      path: "/chat",
      element: <Page Component={Chat} hoc={withAuth} />,
    },
  
      
    ],
  },

  {
    path: "/admindashboard",
    element: <StretchedLayout />,
    children: [
      {
        path: "home",
        element: <Page Component={Home} hoc={withAuth} />,
      },
       {
        path: "/admindashboard/assign-task",
        element: <Page Component={AssignTask} hoc={withAuth} />,
      },
      {
        path: "/admindashboard/chat",
        element: <Page Component={Chat} hoc={withAuth} />,
      },
    
      
    ],
  },


  {
    path: "/auth",
    element: <SoloLayout />,
    children: [
      {
        path: "login-1",
        element: (
          <GuestRoute>
            <Login1 />
          </GuestRoute>
        )
      },
      {
        path: "signup-1",
        element: (
          <GuestRoute>
            <Signup1 />
          </GuestRoute>
        )
      },
    ],
  },
  {
    path: "*",
    element: <NotFound404 />,
  },
];

export const router = createBrowserRouter(routes);
