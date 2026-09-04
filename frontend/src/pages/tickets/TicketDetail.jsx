import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const statusFlow = ['Open', 'In Progress', 'Resolved', 'Closed'];

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [assignId, setAssignId] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data.data);
      setResolution(data.data.resolution || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await api.patch(`/tickets/${id}/status`, { status, resolution });
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignId) return;
    setUpdating(true);
    try {
      await api.patch(`/tickets/${id}/assign`, { assignedTo: assignId });
      setAssignId('');
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not assign ticket');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-state">Loading ticket...</div>;
  if (!ticket) return <div className="empty-state">Ticket not found</div>;

  const currentIndex = statusFlow.indexOf(ticket.status);
  const nextStatus = statusFlow[currentIndex + 1];

  return (
    <div>
      <div className="page-header">
        <h1>Ticket {ticket.ticketNumber}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </button>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">
              {ticket.customer ? (
                <Link to={`/customers/${ticket.customer._id}`}>
                  {ticket.customer.firstName} {ticket.customer.lastName}
                </Link>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Category</div>
            <div className="detail-value">{ticket.category}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Priority</div>
            <div className="detail-value">
              <StatusBadge status={ticket.priority} />
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Assigned To</div>
            <div className="detail-value">{ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</div>
          </div>
          <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
            <div className="detail-label">Subject</div>
            <div className="detail-value">{ticket.subject}</div>
          </div>
          <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
            <div className="detail-label">Description</div>
            <div className="detail-value">{ticket.description}</div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Resolution Notes</label>
          <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={2} />
        </div>

        {nextStatus && (
          <div className="form-actions">
            <button className="btn" disabled={updating} onClick={() => handleStatusChange(nextStatus)}>
              Move to {nextStatus}
            </button>
          </div>
        )}

        <form onSubmit={handleAssign} style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>Assign Ticket (paste Admin/Agent ID)</label>
            <input value={assignId} onChange={(e) => setAssignId(e.target.value)} placeholder="Admin Mongo ID" />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" type="submit" disabled={updating}>
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
