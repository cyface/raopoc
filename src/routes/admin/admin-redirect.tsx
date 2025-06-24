import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { useTheme } from '../../context/ThemeContext';

export default function AdminRedirect() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { styles } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/admin/me`, {
          method: 'GET',
          credentials: 'include',
        });
        
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className={styles.container} style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className={styles.subheading}>Checking authentication...</div>
      </div>
    );
  }

  // Redirect based on authentication status
  return isAuthenticated ? 
    <Navigate to="/admin/leads" replace /> : 
    <Navigate to="/admin/login" replace />;
}