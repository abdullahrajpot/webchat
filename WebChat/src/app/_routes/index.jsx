// router.js
import Login1 from "@app/pages/auth/login1";
import { createBrowserRouter, Navigate } from "react-router-dom";
import SamplePage from "@app/pages/UserDashboard";
import { StretchedLayout } from "@app/_layouts/StretchedLayout";
import { SoloLayout } from "@app/_layouts/SoloLayout"; 
import withAuth from "@app/_hoc/withAuth";
import { Page, NotFound404 } from "@app/_components/_core";
import Signup1 from "@app/pages/auth/signup1";
import GuestRoute from "@app/_hoc/GuestRoute";
import Home from "@app/pages/AdminDashboard/Home/Home";
import AssignTask from "@app/pages/AdminDashboard/AssignTask/AssignTask";
import UserDashboard from "@app/pages/UserDashboard/UserDashboard/UserDashboard";
import Chat from "@app/pages/AdminDashboard/Chat/Chat";
import { SoloLayout2 } from "@app/_layouts/SoloLayout2";
import AllTasks from "@app/pages/AdminDashboard/AllTasks/AllTasks";

const routes = [
  // User Routes
  {
    path: "/",
    element: <SoloLayout2/>,
    children: [
      {
        path: "/",
        element: <Page Component={SamplePage} hoc={(Component) => withAuth(Component, ['user'])} />,
      },
      {
        path: "/userdashboard",
        element: <Page Component={UserDashboard} hoc={(Component) => withAuth(Component, ['user'])} />,
      },
      {
        path: "/chat",
        element: <Page Component={Chat} hoc={(Component) => withAuth(Component, ['user'])} />,
      },
    ],
  },

  // Admin Routes
  {
    path: "/admindashboard",
    element: <StretchedLayout />,
    children: [
      // Redirect /admindashboard to /admindashboard/home
      {
        index: true,
        element: <Navigate to="/admindashboard/home" replace />
      },
      {
        path: "home",
        element: <Page Component={Home} hoc={(Component) => withAuth(Component, ['admin'])} />,
      },
      {
        path: "assign-task",
        element: <Page Component={AssignTask} hoc={(Component) => withAuth(Component, ['admin'])} />,
      },
      {
        path: "all-tasks",
        element: <Page Component={AllTasks} hoc={(Component) => withAuth(Component, ['admin'])} />,
      },
       {
        path: "chat",
        element: <Page Component={Chat} hoc={(Component) => withAuth(Component, ['admin'])} />,
      },
    ],
  },



  // Auth Routes
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