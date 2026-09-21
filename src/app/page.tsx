import Link from 'next/link';
import {
  QrCode,
  UtensilsCrossed,
  MonitorCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Grid,
  PackageCheck,
  BarChart3,
  Coffee,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-espresso)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF7F2',
              }}
            >
              <Coffee size={20} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--primary-espresso)',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                CaféNova
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--primary-terracotta)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Smart Café Platform
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/menu?table=T01" className="btn btn-outline btn-sm">
              <span>Open Menu Card</span>
              <ExternalLink size={13} />
            </Link>
            <Link href="/admin" className="btn btn-dark btn-sm">
              <span>Café Management</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '3.5rem 1rem', flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            maxWidth: '820px',
            margin: '0 auto 3.5rem auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-terracotta-subtle)',
              color: 'var(--primary-terracotta)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              border: '1px solid rgba(160, 67, 34, 0.2)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Integrated Dual-App Operating System</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: 'var(--primary-espresso)',
            }}
          >
            Two specialized WebApps. One authoritative engine.
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              marginInline: 'auto',
            }}
          >
            A dedicated, frictionless <strong>Menu Card WebApp</strong> for dining customers and a robust <strong>Café Management WebApp</strong> for kitchen, table, stock, and business operations.
          </p>
        </section>

        {/* The Two Dedicated WebApps Grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}
        >
          {/* App 1: Menu Card WebApp */}
          <div
            className="card"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: '5px solid var(--primary-terracotta)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-terracotta-subtle)',
                  color: 'var(--primary-terracotta)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '1rem',
                }}
              >
                <QrCode size={14} />
                <span>CUSTOMER FACING</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--primary-espresso)' }}>
                Menu Card WebApp
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                Dedicated digital menu experience for seated customers. Zero app download required. Diners scan their table QR code, browse recipes, filter dietary preferences, customize items, and track order fulfillment live.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span>Table identification &amp; signed QR routing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span>Instant search &amp; dietary filtering (Veg, Vegan, GF)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span>Single/multi-select recipe customizations &amp; add-ons</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span>Persistent cart &amp; server-authoritative pricing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span>Live order tracking &amp; preparation countdown</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link href="/menu?table=T01" className="btn btn-primary" style={{ flex: 1 }}>
                  <span>Launch Menu (Table T01)</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/menu?table=T02" className="btn btn-outline btn-sm">
                  <span>Table T02</span>
                </Link>
                <Link href="/menu?table=T03" className="btn btn-outline btn-sm">
                  <span>Table T03</span>
                </Link>
              </div>
            </div>
          </div>

          {/* App 2: Café Management WebApp */}
          <div
            className="card"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: '5px solid var(--primary-espresso)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--primary-espresso)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: '1rem',
                }}
              >
                <MonitorCheck size={14} />
                <span>OPERATIONS &amp; STAFF</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--primary-espresso)' }}>
                Café Management WebApp
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                Unified operations console for managers, baristas, and floor runners. Features high-contrast kitchen ticket flow, interactive floor table map, dynamic catalog availability, and real inventory alerts.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span><strong>Kitchen Display System (KDS)</strong> with elapsed timers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span><strong>Table Management</strong> &amp; printable QR code generator</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span><strong>Menu Catalog Editor</strong> &amp; live 86'd availability toggle</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span><strong>Basic Inventory</strong> &amp; low-threshold restock alerts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--status-green)" />
                  <span><strong>Sales &amp; Analytics</strong> with authoritative revenue metrics</span>
                </div>
              </div>
            </div>

            <div>
              <Link href="/admin" className="btn btn-dark" style={{ width: '100%' }}>
                <span>Enter Café Management Console</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Workstation Links */}
        <section
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-espresso)' }}>
              Direct Workstation Shortcuts
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Jump straight to any operational station in the Management WebApp:
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Link href="/admin/kds" className="btn btn-outline btn-sm">
              <MonitorCheck size={14} />
              <span>Kitchen KDS</span>
            </Link>
            <Link href="/admin/tables" className="btn btn-outline btn-sm">
              <Grid size={14} />
              <span>Table QR Map</span>
            </Link>
            <Link href="/admin/menu" className="btn btn-outline btn-sm">
              <UtensilsCrossed size={14} />
              <span>Menu Editor</span>
            </Link>
            <Link href="/admin/inventory" className="btn btn-outline btn-sm">
              <PackageCheck size={14} />
              <span>Stock Tracker</span>
            </Link>
            <Link href="/admin/analytics" className="btn btn-outline btn-sm">
              <BarChart3 size={14} />
              <span>Analytics</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem 0',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <strong>CaféNova Operations Platform</strong> &bull; Production Ready
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link href="/api/health" target="_blank" style={{ color: 'var(--primary-terracotta)' }}>
              Health Check API
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
