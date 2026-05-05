import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { gsap } from 'gsap';
import './index.css';
import Home from './components/Home';
import RecipeDetail from './components/RecipeDetail';
import AddRecipe from './components/AddRecipe';
import EditRecipe from './components/EditRecipe';
import Favorites from './components/Favorites';
import Navbar from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Notifications from './components/Notifications';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';

// Page transition wrapper
const PageTransition = ({ children }) => {
  const location = useLocation();
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;

    // Animate page in
    gsap.fromTo(
      pageRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );

    return () => {
      // Clean up animations
      gsap.killTweensOf(pageRef.current);
    };
  }, [location.pathname]);

  return <div ref={pageRef} className="page-transition">{children}</div>;
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <NotificationProvider>
          <div className="App">
            <Navbar onSearch={setSearchQuery} onOpenAuthModal={() => setAuthModalOpen(true)} />
            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PageTransition>
                      <Home searchQuery={searchQuery} />
                    </PageTransition>
                  }
                />
                <Route
                  path="/recipe/:id"
                  element={
                    <PageTransition>
                      <RecipeDetail />
                    </PageTransition>
                  }
                />
                <Route
                  path="/add-recipe"
                  element={
                    <PageTransition>
                      <AddRecipe onOpenAuthModal={() => setAuthModalOpen(true)} />
                    </PageTransition>
                  }
                />
                <Route
                  path="/edit-recipe/:id"
                  element={
                    <PageTransition>
                      <EditRecipe />
                    </PageTransition>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <PageTransition>
                      <Favorites />
                    </PageTransition>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PageTransition>
                      <UserDashboard />
                    </PageTransition>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PageTransition>
                      <AdminDashboard />
                    </PageTransition>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PageTransition>
                      <Notifications />
                    </PageTransition>
                  }
                />
              </Routes>
            </main>
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            <ScrollToTop />
          </div>
          </NotificationProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
