// Currency formatter for LKR
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact currency (e.g., 1.2M, 500K)
export function formatCompactCurrency(amount) {
  if (amount >= 1000000) return `LKR ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `LKR ${(amount / 1000).toFixed(1)}K`;
  return `LKR ${amount}`;
}

// Date formatter
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Relative date (e.g., "2 days ago")
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Status badge class
export function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'active': return 'badge-active';
    case 'expired': return 'badge-expired';
    case 'pending': return 'badge-pending';
    case 'inactive': return 'badge-error';
    case 'completed': return 'badge-success';
    default: return 'badge-default';
  }
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
