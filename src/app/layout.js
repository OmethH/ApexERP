import './globals.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Power World ERP — Fitness Management System',
  description: 'Enterprise resource planning system for Power World Fitness Centres. Manage members, branches, staff, and payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

