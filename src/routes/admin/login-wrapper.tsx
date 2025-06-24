import AdminLogin from './login';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLoginWrapper() {
  console.log('AdminLoginWrapper rendering');
  const { styles } = useTheme();
  
  return (
    <div className={styles.container}>
      <AdminLogin />
    </div>
  );
}