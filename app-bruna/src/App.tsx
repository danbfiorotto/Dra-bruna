import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Documents } from './pages/Documents';
import { MedicalRecords } from './pages/MedicalRecords';
import { Financial } from './pages/Financial';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';

function App() {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<ProtectedRoute requiredPermission="view_dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requiredPermission="view_dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute requiredPermission="view_patients"><Patients /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute requiredPermission="view_appointments"><Appointments /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute requiredPermission="view_documents"><Documents /></ProtectedRoute>} />
          <Route path="/medical-records" element={<ProtectedRoute requiredPermission="view_medical_records"><MedicalRecords /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute requiredPermission="view_financial"><Financial /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requiredPermission="view_reports"><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredPermission="view_settings"><Settings /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute requiredPermission="view_audit_logs"><AuditLogs /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

export default App;
