import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
    <Router>
      <Routes>
        {/* Entry routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* DHO routes */}
        <Route
          path="/dho/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoCommandCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dho/ai-priorities"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoAIPriorities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dho/phc-details"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoPHCDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dho/resource-allocation"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoResourceAllocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dho/disease-monitoring"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoDiseaseMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dho/notifications"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dho/analytics"
          element={
            <ProtectedRoute allowedRoles={['DHO']}>
              <DhoAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Medical Officer routes */}
        <Route
          path="/mo/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mo/daily-update"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoDailyUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mo/staff"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoStaffAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mo/beds"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoBedAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mo/tests"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoTestAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mo/requests"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoRequestsIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mo/notifications"
          element={
            <ProtectedRoute allowedRoles={['MO']}>
              <MoNotifications />
            </ProtectedRoute>
          }
        />

        {/* Pharmacist routes */}
        <Route
          path="/pharmacist/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Pharmacist']}>
              <PharmacistInventoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist/inventory"
          element={
            <ProtectedRoute allowedRoles={['Pharmacist']}>
              <PharmacistMedicineInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist/stock-update"
          element={
            <ProtectedRoute allowedRoles={['Pharmacist']}>
              <PharmacistStockUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist/transfers"
          element={
            <ProtectedRoute allowedRoles={['Pharmacist']}>
              <PharmacistTransferOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist/transactions"
          element={
            <ProtectedRoute allowedRoles={['Pharmacist']}>
              <PharmacistTransactionHistory />
            </ProtectedRoute>
          }
        />

        {/* MP routes */}
        <Route
          path="/mp/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MP']}>
              <MpDistrictOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mp/analytics"
          element={
            <ProtectedRoute allowedRoles={['MP']}>
              <MpConstituencyAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mp/heatmap"
          element={
            <ProtectedRoute allowedRoles={['MP']}>
              <MpDiseaseHeatmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mp/utilization"
          element={
            <ProtectedRoute allowedRoles={['MP']}>
              <MpResourceUtilization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mp/reports"
          element={
            <ProtectedRoute allowedRoles={['MP']}>
              <MpPerformanceReports />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
