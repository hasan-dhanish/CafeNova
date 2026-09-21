'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Plus,
  QrCode,
  Users,
  RotateCw,
  ExternalLink,
  Check,
  X,
  Printer,
  Coffee,
} from 'lucide-react';

interface TableDto {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  activeOrderCount: number;
  activeOrders: { id: string; orderNumber: string; status: string; total: number }[];
  qrSecretToken: string;
}

export default function TableManagementClient() {
  const [tables, setTables] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrTable, setSelectedQrTable] = useState<TableDto | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      const json = await res.json();
      if (res.ok && json.success) {
        setTables(json.data);
      }
    } catch (err) {
      console.error('Failed to load tables', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTables();
      }
    } catch (err) {
      console.error('Failed to update table status', err);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: newTableNumber.trim().toUpperCase(),
          capacity: Number(newCapacity),
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create table');
      }

      setNewTableNumber('');
      setIsAddModalOpen(false);
      fetchTables();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--primary-espresso)' }}>
            Table Layout & QR Generator
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
            Manage floor seating, live occupancy status, and print table QR ordering cards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchTables}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={16} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Table Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {tables.map((table) => {
          const statusBg =
            table.status === 'OCCUPIED'
              ? 'var(--status-amber-bg)'
              : table.status === 'RESERVED'
              ? 'var(--status-slate-bg)'
              : 'var(--status-green-bg)';

          const statusColor =
            table.status === 'OCCUPIED'
              ? 'var(--status-amber)'
              : table.status === 'RESERVED'
              ? 'var(--status-slate)'
              : 'var(--status-green)';

          return (
            <div
              key={table.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Card Top: Number and Status Chip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                    Table {table.tableNumber}
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {table.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <Users size={15} />
                  <span>Capacity: {table.capacity} Guests</span>
                </div>

                {/* Active orders on table */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {table.activeOrderCount > 0 ? (
                    <span style={{ color: 'var(--primary-terracotta)', fontWeight: 600 }}>
                      🔥 {table.activeOrderCount} Active Kitchen Order(s)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No active orders</span>
                  )}
                </div>
              </div>

              {/* Card Footer: QR Modal & Quick Status Toggle */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedQrTable(table)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <QrCode size={14} />
                  <span>Table QR</span>
                </button>

                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value)}
                  style={{
                    padding: '0.3rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code & Print Modal */}
      {selectedQrTable && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 26, 23, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedQrTable(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '420px',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedQrTable(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable QR Card Content */}
            <div
              id="printable-qr-card"
              style={{
                border: '2px solid var(--primary-espresso)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1.25rem',
                backgroundColor: '#FAF7F2',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Coffee size={20} color="var(--primary-espresso)" />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                  CaféNova
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-terracotta)', fontWeight: 600, marginBottom: '1.25rem' }}>
                Artisan Roasters
              </p>

              {/* QR Code graphic */}
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  margin: '0 auto 1.25rem auto',
                  backgroundColor: '#FFFFFF',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* SVG QR Code representation */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `http://localhost:3000/menu?table=${selectedQrTable.tableNumber}`
                  )}`}
                  alt={`QR for Table ${selectedQrTable.tableNumber}`}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-espresso)', display: 'block', marginBottom: '0.25rem' }}>
                Table {selectedQrTable.tableNumber}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Scan to browse Menu Card & place order
              </p>
            </div>

            {/* Test Link and Print Button */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <a
                href={`/menu?table=${selectedQrTable.tableNumber}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>Test Menu Link</span>
                <ExternalLink size={13} />
              </a>

              <button
                type="button"
                className="btn btn-dark btn-sm"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Printer size={14} />
                <span>Print QR Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 26, 23, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '400px',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Add New Table</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Table Number / Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. T06 or Patio-02"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
