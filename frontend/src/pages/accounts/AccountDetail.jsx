import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/accounts/${id}`);
        setAccount(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id]);

  if (loading) return <div className="loading-state">Loading account...</div>;
  if (!account) return <div className="empty-state">Account not found</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Account {account.accountNumber}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/accounts')}>
          Back to Accounts
        </button>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">
              {account.customer ? (
                <Link to={`/customers/${account.customer._id}`}>
                  {account.customer.firstName} {account.customer.lastName}
                </Link>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Account Type</div>
            <div className="detail-value">{account.accountType}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Balance</div>
            <div className="detail-value">{account.balance}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Branch</div>
            <div className="detail-value">{account.branch}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge status={account.status} />
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Opened At</div>
            <div className="detail-value">{new Date(account.openedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
