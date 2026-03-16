import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      // Add routes here as you build features:
      // { path: 'tournaments', element: <TournamentsPage /> },
      // { path: 'tournaments/:id', element: <TournamentDetailPage /> },
      // { path: 'login', element: <LoginPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
