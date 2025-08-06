import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Navigation = ({ isAuthenticated, userName, onLogout }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/posts', label: 'Browse Posts' },
    { path: '/messages', label: 'Messages' },
    { path: '/profile', label: 'Profile' },
  ] : [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31.84 2.41 2 2.83V22h2v-2.17c1.16-.41 2-1.51 2-2.83 0-1.66-1.34-3-3-3zM20.5 10H19V8.5C19 5.46 16.54 3 13.5 3S8 5.46 8 8.5V10H6.5C5.67 10 5 10.67 5 11.5v7C5 19.33 5.67 20 6.5 20H9c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1h2.5c.83 0 1.5-.67 1.5-1.5v-7C22 10.67 21.33 10 20.5 10z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">CoffeeChat</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-700">Hello, {userName?.split(' ')[0] || 'User'}</span>
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile auth section */}
              <div className="pt-4 pb-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="px-3">
                    <div className="text-base font-medium text-gray-800">{userName}</div>
                    <button
                      onClick={() => {
                        onLogout?.();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-3 space-y-2">
                    <Link
                      to="/login"
                      className="block text-base font-medium text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/login"
                      className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;