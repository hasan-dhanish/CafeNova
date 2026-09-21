'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MonitorCheck,
  Grid,
  UtensilsCrossed,
  PackageCheck,
  BarChart3,
  ExternalLink,
  Coffee,
  Clock,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.user) {
          setCurrentUser(res.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { label: 'Kitchen KDS', href: '/admin/kds', icon: MonitorCheck },
    { label: 'Table Management', href: '/admin/tables', icon: Grid },
    { label: 'Menu Catalog', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Stock & Inventory', href: '/admin/inventory', icon: PackageCheck },
    { label: 'Sales & Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F6F3EE' }}>
      {/* 1. Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--primary-espresso)',
          color: '#FAF7F2',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Coffee size={20} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#FAF7F2',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              CaféNova
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#C7BDB3',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}
            >
              Management WebApp
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/admin/kds' && pathname === '/admin');

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--primary-terracotta)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#DDD5CC',
                  transition: 'background-color 0.15s ease',
                  textDecoration: 'none',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#9C9086',
                paddingLeft: '0.75rem',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Customer Facing
            </span>
            <Link
              href="/menu?table=T01"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: '#DDD5CC',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UtensilsCrossed size={15} />
                <span>Menu Card WebApp</span>
              </div>
              <ExternalLink size={13} />
            </Link>
          </div>
        </nav>

        {/* Live System Time */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            fontSize: '0.82rem',
            color: '#B5ABA0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} />
            <span>Station Clock</span>
          </div>
          <span style={{ fontWeight: 700, color: '#FAF7F2' }}>{currentTime || '--:--:--'}</span>
        </div>
      </aside>

      {/* 2. Main Workstation Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: '60px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-espresso)' }}>
              Artisan Operations Console
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--status-green-bg)',
                color: 'var(--status-green)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              Live Sync Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-espresso)',
                    color: '#FAF7F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--primary-espresso)' }}>
                    {currentUser.name}
                  </span>
                  <span
                    style={{
                      marginLeft: '0.4rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-terracotta-subtle)',
                      color: 'var(--primary-terracotta)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Sign out of station"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
