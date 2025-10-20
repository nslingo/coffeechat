import { authClient } from './lib/auth-client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BrowsePosts from './pages/BrowsePosts';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import UserProfile from './pages/UserProfile';
import EditPost from './pages/EditPost';

// Component to handle query invalidation on user change
function App() {
  const { data: session, isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = session?.user?.id || null;
    
    // If user changed (including logout), clear all queries
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== currentUserId) {
      queryClient.clear();
    }
    
    previousUserIdRef.current = currentUserId;
  }, [session?.user?.id, queryClient]);

  if (isPending) return (
  <div className="flex justify-center items-center h-screen" role="status">
    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
  )

  const isAuthenticated = !!session && session.user?.emailVerified;
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
              <BrowsePosts />
            </ProtectedRoute>
          )
        },
        {
          path: 'posts/create',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreatePost />
            </ProtectedRoute>
          )
        },
        {
          path: 'posts/:postId',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PostDetail />
            </ProtectedRoute>
          )
        },
        {
          path: 'posts/:postId/edit',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EditPost />
            </ProtectedRoute>
          )
        },
        {
          path: 'messages',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Messages />
            </ProtectedRoute>
          )
        },
        {
          path: 'messages/:userId',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Conversation />
            </ProtectedRoute>
          )
        },
        {
          path: 'users/:userId',
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserProfile />
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
