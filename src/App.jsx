import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoriesList from './pages/categories/CategoriesList';
import ListingsList from './pages/listings/ListingsList';
import ListingImport from './pages/listings/ListingImport';
import SellersList from './pages/sellers/SellersList';
import SellerDetail from './pages/sellers/SellerDetail';
import BuyersList from './pages/buyers/BuyersList';
import BuyerDetail from './pages/buyers/BuyerDetail';
import OrdersList from './pages/orders/OrdersList';
import OrderDetail from './pages/orders/OrderDetail';
import LogisticsProvidersList from './pages/logisticsProviders/LogisticsProvidersList';

function AdminLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/categories" element={<AdminLayout><CategoriesList /></AdminLayout>} />
        <Route path="/listings" element={<AdminLayout><ListingsList /></AdminLayout>} />
        <Route path="/listings/import" element={<AdminLayout><ListingImport /></AdminLayout>} />
        <Route path="/sellers" element={<AdminLayout><SellersList /></AdminLayout>} />
        <Route path="/sellers/:id" element={<AdminLayout><SellerDetail /></AdminLayout>} />
        <Route path="/buyers" element={<AdminLayout><BuyersList /></AdminLayout>} />
        <Route path="/buyers/:id" element={<AdminLayout><BuyerDetail /></AdminLayout>} />
        <Route path="/orders" element={<AdminLayout><OrdersList /></AdminLayout>} />
        <Route path="/orders/:id" element={<AdminLayout><OrderDetail /></AdminLayout>} />
        <Route path="/logistics-providers" element={<AdminLayout><LogisticsProvidersList /></AdminLayout>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
