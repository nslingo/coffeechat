import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

interface LayoutProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Layout = ({ isAuthenticated, userName, onLogout }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={onLogout}
      />
      <main className="pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;