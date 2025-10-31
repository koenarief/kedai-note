import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import AnonymousLayout from './layouts/AnonymousLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx'; // Assuming you create this
// import HomePage from './pages/HomePage.jsx'; // Assuming you create this
// import LoginPage from './pages/LoginPage.jsx'; // Assuming you create this
// import DashboardPage from './pages/DashboardPage.jsx'; // Assuming you create this

const router = createBrowserRouter([
  {
    path: '/',
    element: <AnonymousLayout />,
    children: [
      {
        index: true, // Default child route for '/'
        element: <App />,
      },
      {
        path: 'login',
        element: <App />,
      },
    ],
  },
  {
    path: '/app',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <App />,
      },
      // Add more routes for the main layout
    ],
  },
]);



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

