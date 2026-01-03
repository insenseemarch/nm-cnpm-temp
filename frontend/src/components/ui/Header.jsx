import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import NotificationBell from './NotificationBell';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for user dropdown menu
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Avatar and display name logic
  const userAvatar =
    currentUser?.photoURL ||
    currentUser?.avatar ||
    'https://cdn-icons-png.flaticon.com/512/3237/3237472.png';
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Người dùng';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get current path from location hook
  const currentPath = location.pathname;

  const navigationItems = [
    { name: 'Trang chủ', href: '/', active: currentPath === '/' },
    { name: 'Cây gia phả', href: '/explore', active: currentPath === '/explore' },
    { name: 'Thành viên', href: '/members', active: currentPath === '/members' },
    { name: 'Thành tích', href: '/achievements', active: currentPath === '/achievements' },
    { name: 'Sự kiện', href: '/events', active: currentPath === '/events' },
    { name: 'Tâm sự', href: '/confessions', active: currentPath === '/confessions' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-cosmic border-b mystical-border'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="https://ik.imagekit.io/thu2005/logo%201.png"
                alt="RiO Universe Logo"
                className="w-[100px] h-[100px] ml-2 object-contain transition-all duration-300 group-hover:scale-110"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <Link
                key={item?.name}
                to={item?.href}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 group ${
                  currentPath === item.href
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item?.name}
                {currentPath === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary to-accent cosmic-glow"></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Desktop CTA / User Profile */}
          <div className="hidden lg:flex items-center">
            {currentUser ? (
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none group"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                      {displayName}
                    </span>
                    <div className="relative">
                      <img
                        src={userAvatar}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-accent/50 group-hover:border-accent transition-all object-cover bg-background"
                      />
                      <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-background bg-green-400" />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-background/95 backdrop-blur-cosmic border mystical-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-5">
                      <div className="px-4 py-3 border-b mystical-border">
                        <p className="text-sm text-foreground font-medium truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Hồ sơ cá nhân
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="cosmic-button text-primary-foreground font-medium rounded-full px-4 py-2"
                >
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-foreground"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-cosmic border-t mystical-border">
            <div className="px-6 py-4 space-y-4">
              {currentUser && (
                <div className="flex items-center space-x-3 pb-4 border-b mystical-border w-full">
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-accent bg-background"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <div className="ml-auto">
                    <NotificationBell />
                  </div>
                </div>
              )}

              {navigationItems?.map((item) => (
                <Link
                  key={item?.name}
                  to={item?.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                    currentPath === item.href
                      ? 'text-accent bg-accent/10 rounded-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item?.name}
                </Link>
              ))}
              <div className="pt-4 border-t mystical-border">
                {/* Conditional mobile CTA */}
                {currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground mb-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button
                      variant="default"
                      fullWidth
                      className="cosmic-button text-primary-foreground font-medium"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
