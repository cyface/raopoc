console.log('main.tsx starting');

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import './i18n'

// Import admin route components and their loaders/actions
import AdminRedirect from './routes/admin/admin-redirect'
import AdminLogin, { adminLoginAction } from './routes/admin/login'
import AdminLeads, { adminLeadsLoader } from './routes/admin/leads'
import AdminLeadDetail, { adminLeadDetailLoader } from './routes/admin/lead-detail'

console.log('main.tsx imports loaded');

// Create the router with data router configuration
const router = createBrowserRouter([
  // Admin routes with data router features
  {
    path: '/admin',
    element: <AdminRedirect />
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
    action: adminLoginAction
  },
  {
    path: '/admin/leads',
    element: <AdminLeads />,
    loader: adminLeadsLoader
  },
  {
    path: '/admin/leads/:id',
    element: <AdminLeadDetail />,
    loader: adminLeadDetailLoader
  },
  // Catch-all route for onboarding flow - handled by App component
  {
    path: '*',
    element: <App />
  }
]);

const root = document.getElementById('root');
console.log('root element:', root);

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>,
  )
  console.log('React app rendered');
} else {
  console.error('No root element found!');
}