import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { Dashboard } from '../pages/Dashboard';
import { ProjectList } from '../pages/ProjectList';
import { ProjectDetail } from '../pages/ProjectDetail';
import { TaskList } from '../pages/TaskList';
import { TaskDetail } from '../pages/TaskDetail';
import { Analytics } from '../pages/Analytics';
import { AuditLogs } from '../pages/AuditLogs';
import { RealtimeMonitoring } from '../pages/RealtimeMonitoring';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/projects',
        element: <ProjectList />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetail />,
      },
      {
        path: '/tasks',
        element: <TaskList />,
      },
      {
        path: '/tasks/:id',
        element: <TaskDetail />,
      },
      {
        path: '/statistics',
        element: <Analytics />,
      },
      {
        path: '/audit',
        element: <AuditLogs />,
      },
      {
        path: '/monitoring',
        element: <RealtimeMonitoring />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
