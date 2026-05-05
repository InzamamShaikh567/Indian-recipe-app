import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMoon,
  FaSun,
  FaHeart,
  FaUtensils,
  FaBars,
  FaTimes,
  FaUser,
  FaChevronDown,
  FaBell,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { useNotifications } from "../context/NotificationContext";
import "./Navbar.css";

const Navbar = ({ onSearch, onOpenAuthModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { favoriteCount } = useFavorites();
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Debounce search query by 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0)?.toUpperCase() || "U";
  };

  const navLinks = [
    { path: "/", label: "Home", icon: <FaUtensils /> },
    {
      path: "/favorites",
      label: "Favorites",
      icon: <FaHeart />,
      badge: favoriteCount,
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: <FaBell />,
      badge: unreadCount,
    },
    { path: "/add-recipe", label: "Add Recipe", icon: <FaUtensils /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🍛</span>
          <span className="navbar-brand-text">Indian Recipes</span>
        </Link>

        <div className="navbar-search">
          <FaSearch className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={handleSearch}
            className="navbar-search-input"
          />
        </div>

        <div className="navbar-right">
          {/* Desktop Navigation - always hidden on mobile via CSS */}
          <div className="navbar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${
                  location.pathname === link.path ? "navbar-link-active" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="navbar-link-icon">{link.icon}</span>
                <span className="navbar-link-text">{link.label}</span>
                {link.badge > 0 && (
                  <span className="navbar-link-badge">{link.badge}</span>
                )}
              </Link>
            ))}

            <button
              className="navbar-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Desktop Profile - outside navbar-nav so it doesn't show in mobile menu */}
          {isAuthenticated ? (
            <div className="navbar-profile navbar-profile-desktop">
              <button
                className="navbar-profile-toggle"
                onClick={handleProfileClick}
                aria-label="Profile menu"
              >
                <FaUser />
                <span className="navbar-profile-username">
                  {user?.username}
                </span>
                <FaChevronDown
                  className={`navbar-profile-chevron ${
                    profileDropdownOpen ? "open" : ""
                  }`}
                />
              </button>

              {profileDropdownOpen && (
                <div
                  className={`navbar-profile-dropdown ${
                    profileDropdownOpen ? "show" : ""
                  }`}
                >
                  <Link
                    to="/dashboard"
                    className="navbar-profile-dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="navbar-profile-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    className="navbar-profile-dropdown-item navbar-profile-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar-login-btn" onClick={onOpenAuthModal}>
              Login
            </button>
          )}

          {/* Mobile Profile - outside navbar-nav */}
          {isAuthenticated && (
            <div className="navbar-profile navbar-profile-mobile">
              <button
                className="navbar-profile-toggle navbar-profile-toggle-mobile"
                onClick={handleProfileClick}
                aria-label="Profile menu"
              >
                <span className="navbar-profile-initial">
                  {getUserInitial()}
                </span>
              </button>

              {profileDropdownOpen && (
                <div
                  className={`navbar-profile-dropdown navbar-profile-dropdown-mobile ${
                    profileDropdownOpen ? "show" : ""
                  }`}
                >
                  <Link
                    to="/dashboard"
                    className="navbar-profile-dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="navbar-profile-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    className="navbar-profile-dropdown-item navbar-profile-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="navbar-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ position: "relative" }}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
            {unreadCount > 0 && (
              <span className="navbar-menu-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="navbar-mobile-menu"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="navbar-mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Search */}
            <div className="navbar-nav-search">
              <FaSearch className="navbar-nav-search-icon" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={handleSearch}
                className="navbar-nav-search-input"
              />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${
                  location.pathname === link.path ? "navbar-link-active" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="navbar-link-icon">{link.icon}</span>
                <span className="navbar-link-text">{link.label}</span>
                {link.badge > 0 && (
                  <span className="navbar-link-badge">{link.badge}</span>
                )}
              </Link>
            ))}

            <button
              className="navbar-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
