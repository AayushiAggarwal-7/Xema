import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Shared pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// DHO pages
import DhoCommandCenter from './pages/dho/CommandCenter';
import DhoAIPriorities from './pages/dho/AIPriorities';
import DhoPHCDetails from './pages/dho/PHCDetails';
import DhoResourceAllocation from './pages/dho/ResourceAllocation';
import DhoDiseaseMonitoring from './pages/dho/DiseaseMonitoring';
import DhoNotifications from './pages/dho/Notifications';
import DhoAnalytics from './pages/dho/Analytics';
// FIX 1: Changed double dots (../) to a single dot (./) to match project paths
import DhoReportdetail from './pages/dho/Reportdetail';
// MO pages
import MoDashboard from './pages/mo/Dashboard';
import MoDailyUpdate from './pages/mo/DailyUpdate';
import MoStaffAttendance from './pages/mo/StaffAttendance';
import MoBedAvailability from './pages/mo/BedAvailability';
import MoTestAvailability from './pages/mo/TestAvailability';
import MoRequestsIssues from './pages/mo/RequestsIssues';
import MoNotifications from './pages/mo/Notifications';

// Pharmacist pages
import PharmacistInventoryDashboard from './pages/pharmacist/InventoryDashboard';
import PharmacistMedicineInventory from './pages/pharmacist/MedicineInventory';
import PharmacistStockUpdate from './pages/pharmacist/StockUpdate';
import PharmacistTransferOrders from './pages/pharmacist/TransferOrders';
import PharmacistTransactionHistory from './pages/pharmacist/TransactionHistory';

// MP pages
import MpDistrictOverview from './pages/mp/DistrictOverview';
import MpConstituencyAnalytics from './pages/mp/ConstituencyAnalytics';
import MpDiseaseHeatmap from './pages/mp/DiseaseHeatmap';
import MpResourceUtilization from './pages/mp/ResourceUtilization';
import MpPerformanceReports from './pages/mp/PerformanceReports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Entry routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* DHO routes */}
          <Route
            path="/dho/dashboard"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoCommandCenter />
              </ProtectedRoute>}
          />
          <Route
            path="/dho/report/:phcId"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoReportdetail />
              </ProtectedRoute>
            }
          />
          {/* Update this route to use DhoReportdetail instead of the missing PHCReportDetail */}
          <Route
            path="/dho/phc/:phcId"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoReportdetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dho/phc-details"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoPHCDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dho/resource-allocation"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoResourceAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dho/disease-monitoring"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoDiseaseMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dho/notifications"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dho/analytics"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dho/ai-priorities"
            element={
              <ProtectedRoute allowedRoles={['dho']}>
                <DhoAIPriorities />
              </ProtectedRoute>
            }
          />
          {/* Medical Officer routes */}
          <Route
            path="/medical-officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-officer/daily-update"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoDailyUpdate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-officer/staff"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoStaffAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-officer/beds"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoBedAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-officer/tests"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoTestAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-officer/requests"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoRequestsIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical-officer/notifications"
            element={
              <ProtectedRoute allowedRoles={['medical_officer']}>
                <MoNotifications />
              </ProtectedRoute>
            }
          />

          {/* Pharmacist routes */}
          <Route
            path="/pharmacist/dashboard"
            element={
              <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistInventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacist/inventory"
            element={
              <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistMedicineInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacist/stock-update"
            element={
              <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistStockUpdate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacist/transfers"
            element={
              <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistTransferOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacist/transactions"
            element={
              <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistTransactionHistory />
              </ProtectedRoute>
            }
          />

          {/* MP routes */}
          <Route
            path="/mp/overview"
            element={
              <ProtectedRoute allowedRoles={['mp']}>
                <MpDistrictOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mp/analytics"
            element={
              <ProtectedRoute allowedRoles={['mp']}>
                <MpConstituencyAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mp/heatmap"
            element={
              <ProtectedRoute allowedRoles={['mp']}>
                <MpDiseaseHeatmap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mp/utilization"
            element={
              <ProtectedRoute allowedRoles={['mp']}>
                <MpResourceUtilization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mp/reports"
            element={
              <ProtectedRoute allowedRoles={['mp']}>
                <MpPerformanceReports />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;