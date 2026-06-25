'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, trend, trendLabel, icon: Icon, accentColor = 'var(--accent-primary)', accentBg = 'var(--accent-muted)' }) {
  const isPositive = parseFloat(trend) >= 0;

  return (
    <div
      className="stat-card"
      style={{ '--stat-accent': accentColor, '--stat-bg': accentBg, '--stat-color': accentColor }}
    >
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">
          {Icon && <Icon size={22} />}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {trend !== undefined && (
        <span className={`stat-card-trend ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}{trend}%
          {trendLabel && <span style={{ fontWeight: 400, marginLeft: '4px' }}>{trendLabel}</span>}
        </span>
      )}
    </div>
  );
}
