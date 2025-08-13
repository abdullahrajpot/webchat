import Login1 from "@app/pages/auth/login1";
import { createBrowserRouter } from "react-router-dom";
import SamplePage from "@app/pages";
import { StretchedLayout } from "@app/_layouts/StretchedLayout";
import { SoloLayout } from "@app/_layouts/SoloLayout"; 
import withAuth from "@app/_hoc/withAuth";
import { Page, NotFound404 } from "@app/_components/_core";
import Signup1 from "@app/pages/auth/signup1";
// import DashboardPage from "@app/pages/dashboard/dashboard";
import GuestRoute from "@app/_hoc/GuestRoute";
import Home from "@app/pages/AdminDashboard/Home/Home";
import AssignTask from "@app/pages/AdminDashboard/AssignTask/AssignTask";


const routes = [
  {
    path: "/",
    element: <StretchedLayout />,
    children: [
      {
        path: "/",
        element: <Page Component={SamplePage} hoc={withAuth} />,
      },
      // {
      //   path: "dashboard",
      //   element: <Page Component={DashboardPage} hoc={withAuth} />,
      // },
      
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
