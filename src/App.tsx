import React from 'react';
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  RouterProvider, 
  Outlet 
} from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import Conversations from './pages/Conversations';
import LeadPipeline from './pages/LeadPipeline';
import Campaigns from './pages/Campaigns';
import Escalations from './pages/Escalations';
import Settings from './pages/Settings';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#134E4A',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 30px -10px rgba(13, 148, 136, 0.2)',
            border: '1px solid rgba(13, 148, 136, 0.1)',
          },
        }}
      />
    </>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'dashboard',
  component: DashboardLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardOverview,
});

const conversationsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/conversations',
  component: Conversations,
});

const leadsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/leads',
  component: LeadPipeline,
});

const campaignsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/campaigns',
  component: Campaigns,
});

const escalationsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/escalations',
  component: Escalations,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/settings',
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute.addChildren([
    indexRoute,
    conversationsRoute,
    leadsRoute,
    campaignsRoute,
    escalationsRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
