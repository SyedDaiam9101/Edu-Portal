'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import type { FeeCreateResponse, FeePayResponse, FeeRecord, FeeStatus } from './types';

const STATUS_META: Record<FeeStatus, { label: string; color: string; bg: string }> = {
  DUE: { label: 'Due', color: '#664d03', bg: '#fff3cd' },
  PAID: { label: 'Paid', color: '#0f5132', bg: '#d1e7dd' },
  OVERDUE: { label: 'Overdue', color: '#842029', bg: '#f8d7da' },
  WAIVED: { label: 'Waived', color: '#41464b', bg: '#e2e3e5' },
};

type FeesClientProps = {
  studentId: string;
  studentName: string;
  initialFees: FeeRecord[];
};

function formatCurrency(amount: string, currency: string) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return `${amount} ${currency}`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parsed);
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatMonthInput(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

function toMonthStartIso(monthValue: string) {
  if (!monthValue) return new Date().toISOString();
  const [year, month] = monthValue.split('-').map((part) => Number(part));
  if (!year || !month) return new Date().toISOString();
  const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  return date.toISOString();
}

function sortFees(fees: FeeRecord[]) {
  return [...fees].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
}

export default function FeesClient({ studentId, studentName, initialFees }: FeesClientProps) {
  const [fees, setFees] = useState<FeeRecord[]>(sortFees(initialFees));
  const [amount, setAmount] = useState('100');
  const [month, setMonth] = useState(formatMonthInput(new Date()));
  const [isSaving, setIsSaving] = useState(false);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const totalOutstanding = useMemo(
    () =>
      fees
        .filter((fee) => fee.status === 'DUE' || fee.status === 'OVERDUE')
        .reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0),
    [fees],
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const dueDate = toMonthStartIso(month);
    const optimistic: FeeRecord = {
      id: `temp-${Date.now()}`,
      amount,
      currency: 'USD',
      dueDate,
      status: 'DUE',
      paidAt: null,
      studentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFees((prev) => sortFees([optimistic, ...prev]));

    try {
      const res = await fetch(`${baseUrl}/v1/students/${studentId}/fees`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Number(amount), dueDate }),
      });
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) {
        throw new Error(`Create failed (${res.status})`);
      }

      const json = (await res.json()) as FeeCreateResponse;
      setFees((prev) => sortFees([json.data, ...prev.filter((fee) => fee.id !== optimistic.id)]));
    } catch (err) {
      setFees((prev) => prev.filter((fee) => fee.id !== optimistic.id));
      setError('Failed to create fee. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkPaid = async (fee: FeeRecord) => {
    setError(null);
    setIsPayingId(fee.id);

    const optimistic: FeeRecord = {
      ...fee,
      status: 'PAID',
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFees((prev) => sortFees(prev.map((item) => (item.id === fee.id ? optimistic : item))));

    try {
      const res = await fetch(`${baseUrl}/v1/students/${studentId}/fees/${fee.id}/pay`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) {
        throw new Error(`Pay failed (${res.status})`);
      }
      const json = (await res.json()) as FeePayResponse;
      setFees((prev) => sortFees(prev.map((item) => (item.id === fee.id ? json.data : item))));
    } catch (err) {
      setFees((prev) => sortFees(prev.map((item) => (item.id === fee.id ? fee : item))));
      setError('Failed to mark fee as paid. Try again.');
    } finally {
      setIsPayingId(null);
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ minWidth: 180 }}>
          Amount
          <input
            name="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label style={{ minWidth: 180 }}>
          Month
          <input
            name="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            required
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <button type="submit" style={{ padding: '10px 12px' }} disabled={isSaving}>
          {isSaving ? 'Creating...' : 'Create fee'}
        </button>
        {error ? <p style={{ color: '#b02a37', margin: 0 }}>{error}</p> : null}
      </form>

      <div style={{ marginTop: 16 }}>
        <strong>Outstanding balance:</strong>{' '}
        {formatCurrency(String(totalOutstanding.toFixed(2)), 'USD')}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Fee ledger</h3>
        {fees.length === 0 ? (
          <p>No fees yet for {studentName}.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Due</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Amount</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Paid</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => {
                const status = STATUS_META[fee.status];
                return (
                  <tr key={fee.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {formatDate(fee.dueDate)}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {formatCurrency(fee.amount, fee.currency)}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: status.bg,
                          color: status.color,
                          fontWeight: 600,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {fee.paidAt ? formatDate(fee.paidAt) : '-'}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {fee.status === 'PAID' || fee.status === 'WAIVED' ? null : (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(fee)}
                          disabled={isPayingId === fee.id}
                          style={{ padding: '6px 10px' }}
                        >
                          {isPayingId === fee.id ? 'Saving...' : 'Mark as paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
