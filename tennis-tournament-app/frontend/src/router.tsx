import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import LeaguesPage from './pages/LeaguesPage';
import ProfilePage from './pages/ProfilePage';
import MyTournamentsPage from './pages/MyTournamentsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tournaments', element: <TournamentsPage /> },
      { path: 'tournaments/new', element: <CreateTournamentPage /> },
      { path: 'tournaments/:id', element: <TournamentDetailPage /> },
      { path: 'leagues', element: <LeaguesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'my-tournaments', element: <MyTournamentsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
