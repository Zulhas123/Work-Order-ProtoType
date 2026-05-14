import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import WorkOrderListPage from "./pages/WorkOrderListPage";
import WorkOrderCreatePage from "./pages/WorkOrderCreatePage";
import WorkOrderExecutionPage from "./pages/WorkOrderExecutionPage";
import WorkOrderReviewPage from "./pages/WorkOrderReviewPage";
import PayslipPage from "./pages/PayslipPage";
import UsersPage from "./pages/UsersPage";
import MasterSettingsPage from "./pages/MasterSettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LanguagePage from "./pages/LanguagePage";
import ReportPage from "./pages/ReportPage";
import SmsConfigPage from "./pages/SmsConfigPage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/work-orders" element={<WorkOrderListPage />} />
        <Route path="/work-orders/create" element={<WorkOrderCreatePage mode="create" />} />
        <Route path="/work-orders/:id/edit" element={<WorkOrderCreatePage mode="edit" />} />
        <Route path="/work-orders/:id/execution" element={<WorkOrderExecutionPage />} />
        <Route path="/work-orders/:id/review" element={<WorkOrderReviewPage />} />
        <Route path="/work-orders/:id/payslip" element={<PayslipPage />} />
        <Route path="/master" element={<MasterSettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/sms" element={<SmsConfigPage />} />
        <Route path="*" element={<PlaceholderPage title="Not Found" />} />
      </Routes>
    </AppShell>
  );
}
