'use client';

export default function Badge({ status, children }) {
  const getClass = () => {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-active';
      case 'expired': return 'badge-expired';
      case 'pending': return 'badge-pending';
      case 'inactive': return 'badge-error';
      case 'completed': return 'badge-success';
      case 'info': return 'badge-info';
      default: return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getClass()}`}>
      <span className="badge-dot" />
      {children || status}
    </span>
  );
}
