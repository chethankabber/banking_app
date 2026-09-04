import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="loading-state">Loading customer...</div>;
  if (!data) return <div className="empty-state">Customer not found</div>;

  const { customer, accounts, loans, kyc, tickets } = data;

  return (
    <div>
      <div className="page-header">
        <h1>
          {customer.firstName} {customer.lastName}
        </h1>
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
          Back to Customers
        </button>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer ID</div>
            <div className="detail-value">{customer.customerId}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{customer.email}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Phone</div>
            <div className="detail-value">{customer.phone}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge status={customer.status} />
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">City / State</div>
            <div className="detail-value">
              {customer.city || '-'} {customer.state ? `, ${customer.state}` : ''}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Occupation</div>
            <div className="detail-value">{customer.occupation || '-'}</div>
          </div>
        </div>
      </div>

      <div className="section-title">Accounts ({accounts.length})</div>
      <div className="table-wrapper">
        {accounts.length === 0 ? (
          <div className="empty-state">No accounts</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Branch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a._id}>
                  <td>
                    <Link to={`/accounts/${a._id}`}>{a.accountNumber}</Link>
                  </td>
                  <td>{a.accountType}</td>
                  <td>{a.balance}</td>
                  <td>{a.branch}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-title">Loans ({loans.length})</div>
      <div className="table-wrapper">
        {loans.length === 0 ? (
          <div className="empty-state">No loans</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Loan Number</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l._id}>
                  <td>
                    <Link to={`/loans/${l._id}`}>{l.loanNumber}</Link>
                  </td>
                  <td>{l.loanType}</td>
                  <td>{l.amount}</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-title">KYC ({kyc.length})</div>
      <div className="table-wrapper">
        {kyc.length === 0 ? (
          <div className="empty-state">No KYC records</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Document Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kyc.map((k) => (
                <tr key={k._id}>
                  <td>
                    <Link to={`/kyc/${k._id}`}>{k.documentType}</Link>
                  </td>
                  <td>{k.documentNumber}</td>
                  <td>
                    <StatusBadge status={k.verificationStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-title">Support Tickets ({tickets.length})</div>
      <div className="table-wrapper">
        {tickets.length === 0 ? (
          <div className="empty-state">No support tickets</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <Link to={`/tickets/${t._id}`}>{t.ticketNumber}</Link>
                  </td>
                  <td>{t.subject}</td>
                  <td>
                    <StatusBadge status={t.priority} />
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
