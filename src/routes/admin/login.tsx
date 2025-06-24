import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import type { ActionFunction } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { useTheme } from '../../context/ThemeContext';
import { vars } from '../../styles/theme.css';
import { Sun, Moon } from 'lucide-react';

export const adminLoginAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const response = await fetch(`${getApiUrl()}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      return redirect('/admin/leads');
    } else {
      const error = await response.json();
      return { error: error.message || 'Login failed' };
    }
  } catch {
    return { error: 'Network error occurred' };
  }
};

export default function AdminLogin() {
  console.log('AdminLogin rendering');
  
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { theme, toggleTheme, styles } = useTheme();

  return (
    <div className={styles.container} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}
      >
        {(theme.endsWith('Light') || theme === 'light') ? 
          <Moon size={16} className={styles.themeToggleIcon} /> : 
          <Sun size={16} className={styles.themeToggleIcon} />
        }
        <span className={styles.themeToggleLabel}>
          {(theme.endsWith('Light') || theme === 'light') ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>

      <div style={{
        backgroundColor: vars.color.surface,
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        border: `1px solid var(--border)`
      }}>
        <h1 className={styles.heading} style={{ 
          textAlign: 'center', 
          marginBottom: '2rem'
        }}>
          Admin Login
        </h1>
        
        <Form method="post" className={styles.formContainer}>
          <div className={styles.formField}>
            <label htmlFor="username" className={styles.label}>
              Username:
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="password" className={styles.label}>
              Password:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
            />
          </div>
          
          {actionData?.error && (
            <div className={styles.errorMessage}>
              {actionData.error}
            </div>
          )}
          
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.primaryButton}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </Form>
        
        <div className={styles.subheading} style={{ 
          marginTop: '1rem', 
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          Demo credentials: admin / admin123
        </div>
      </div>
    </div>
  );
}