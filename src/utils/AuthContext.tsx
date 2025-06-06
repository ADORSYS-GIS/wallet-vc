import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Update localStorage when isLoggedIn changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (isLoggedIn) {
      localStorage.setItem('sessionStart', Date.now().toString());
    } else {
      localStorage.removeItem('sessionStart');
    }
  }, [isLoggedIn]);

  // Reset session timeout on user activity
  useEffect(() => {
    const resetSessionTimeout = () => {
      if (isLoggedIn) {
        localStorage.setItem('sessionStart', Date.now().toString());
      }
    };

    const events = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
    events.forEach((event) =>
      window.addEventListener(event, resetSessionTimeout),
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetSessionTimeout),
      );
    };
  }, [isLoggedIn]);

  // Check for session timeout
  useEffect(() => {
    const checkSession = () => {
      const sessionStart = parseInt(
        localStorage.getItem('sessionStart') || '0',
        10,
      );
      const loggedInState = localStorage.getItem('isLoggedIn') === 'true';
      const currentTime = Date.now();
      const sessionTimeout = 30 * 60 * 1000;

      if (loggedInState && currentTime - sessionStart >= sessionTimeout) {
        logout();
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/', { replace: true });
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sessionStart');
    navigate('/login', {
      replace: true,
      state: { logoutMessage: 'Logout successful!' },
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
