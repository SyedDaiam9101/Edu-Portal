'use client';

import { useState } from 'react';

type RevenuePoint = {
  month: string;
  revenue: number;
};

type RevenueChartProps = {
  data: RevenuePoint[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((point) => point.revenue));

  return (
    <section
      style={{
        borderRadius: 16,
        padding: 16,
        border: '1px solid #e5e5e5',
        background: '#fff',
        marginTop: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Revenue Analytics</h2>
        <span style={{ fontSize: 12, color: '#666' }}>Last 6 months</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 12,
          marginTop: 16,
          alignItems: 'end',
        }}
      >
        {data.map((point, index) => {
          const height = Math.round((point.revenue / max) * 120);
          const isActive = activeIndex === index;
          return (
            <div key={point.month} style={{ display: 'grid', gap: 6, justifyItems: 'center', position: 'relative' }}>
              {isActive ? (
                <div
                  style={{
                    position: 'absolute',
                    top: -28,
                    padding: '4px 8px',
                    borderRadius: 8,
                    background: '#111',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCurrency(point.revenue)}
                </div>
              ) : null}
              <div style={{ fontSize: 11, color: '#5b5b5b' }}>{formatCurrency(point.revenue)}</div>
              <div
                style={{
                  width: '100%',
                  height: 120,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  style={{
                    width: '100%',
                    height: Math.max(12, height),
                    background: isActive ? '#b9d7c8' : '#D1E7DD',
                    borderRadius: 12,
                    border: `1px solid ${isActive ? '#9ac5af' : '#b9d7c8'}`,
                    transition: 'all 120ms ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 12, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
                {point.month}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
