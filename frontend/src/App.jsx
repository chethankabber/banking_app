import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';

import AccountList from './pages/accounts/AccountList';
import AccountDetail from './pages/accounts/AccountDetail';

import LoanList from './pages/loans/LoanList';
import LoanDetail from './pages/loans/LoanDetail';

import KycList from './pages/kyc/KycList';
import KycDetail from './pages/kyc/KycDetail';

import TicketList from './pages/tickets/TicketList';
import TicketDetail from './pages/tickets/TicketDetail';

const withLayout = (element) => <PrivateRoute><Layout>{element}</Layout></PrivateRoute>;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={withLayout(<Dashboard />)} />

      <Route path="/customers" element={withLayout(<CustomerList />)} />
      <Route path="/customers/:id" element={withLayout(<CustomerDetail />)} />

      <Route path="/accounts" element={withLayout(<AccountList />)} />
      <Route path="/accounts/:id" element={withLayout(<AccountDetail />)} />

      <Route path="/loans" element={withLayout(<LoanList />)} />
      <Route path="/loans/:id" element={withLayout(<LoanDetail />)} />

      <Route path="/kyc" element={withLayout(<KycList />)} />
      <Route path="/kyc/:id" element={withLayout(<KycDetail />)} />

      <Route path="/tickets" element={withLayout(<TicketList />)} />
      <Route path="/tickets/:id" element={withLayout(<TicketDetail />)} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
