const StatusBadge = ({ status }) => {
  return <span className={`badge badge-${status.replace(/\s+/g, '-').toLowerCase()}`}>{status}</span>;
};

export default StatusBadge;
