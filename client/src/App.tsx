import { authClient } from './lib/auth-client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;

  const isAuthenticated = !!session;
  const userName = session?.user?.name || '';

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <Layout 
          isAuthenticated={isAuthenticated}
          userName={userName}
          onLogout={async () => {
            await authClient.signOut();
          }}
        />
      ),
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: 'login',
          element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        },
        {
          path: 'signup',
          element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          )
        },
        {
          path: 'profile',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile />
            </ProtectedRoute>
          )
        },
        {
          path: 'posts',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Browse Posts</h1>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          )
        },
        {
          path: 'messages',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">Coming soon...</p>
              </div>
            </ProtectedRoute>
          )
        },
        {
          path: '*',
          element: <Navigate to="/" replace />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App
