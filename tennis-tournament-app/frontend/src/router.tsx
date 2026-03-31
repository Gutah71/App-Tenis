import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import LeaguesPage from './pages/LeaguesPage';
import LeagueDetailPage from './pages/LeagueDetailPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import ProfilePage from './pages/ProfilePage';
import MySpacePage from './pages/MySpacePage';
import CreatePage from './pages/CreatePage';
import MyLeaguesPage from './pages/MyLeaguesPage';
import MyTournamentsPage from './pages/MyTournamentsPage';
import StatsPage from './pages/StatsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      // Public
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'leagues', element: <LeaguesPage /> },
      { path: 'leagues/:id', element: <LeagueDetailPage /> },
      { path: 'tournaments', element: <TournamentsPage /> },
      { path: 'tournaments/:id', element: <TournamentDetailPage /> },
      { path: 'contact', element: <ContactPage /> },
      // Authenticated
      { path: 'profile', element: <ProfilePage /> },
      // Player
      { path: 'my-space', element: <MySpacePage /> },
      { path: 'stats', element: <StatsPage /> },
      // Organizer
      { path: 'create', element: <CreatePage /> },
      { path: 'my-leagues', element: <MyLeaguesPage /> },
      { path: 'my-tournaments', element: <MyTournamentsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
