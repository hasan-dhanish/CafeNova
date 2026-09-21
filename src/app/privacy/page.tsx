import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | CaféNova',
  description: 'How CaféNova handles table orders, payments, and dining data.',
};

export default function PrivacyPage() {
  return (
    <div className="mobile-container" style={{ padding: '3rem 1rem 5rem 1rem' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.88rem',
          color: 'var(--primary-terracotta)',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Home</span>
      </Link>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={22} color="var(--primary-terracotta)" />
          <h1 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--primary-espresso)' }}>
            Privacy Policy
          </h1>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Last updated: September 2026 &bull; CaféNova Operations
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              1. Information We Collect
            </h2>
            <p>
              When you scan a table QR code and browse our digital menu, we do not require account registration. We only collect the minimal information necessary to fulfill your food and beverage order, including table number, items selected, recipe customizations, and any special kitchen notes you provide.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              2. Payment Data Security
            </h2>
            <p>
              Online payments (UPI, Card, NetBanking) are processed through secure, PCI-DSS compliant payment gateways. CaféNova never stores your credit/debit card numbers or bank credentials on our servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              3. Device &amp; AR Permissions
            </h2>
            <p>
              If you choose to view signature products in Augmented Reality (AR), camera access is requested locally by your mobile browser (WebXR / QuickLook). Camera feeds remain on your device and are never recorded or transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              4. Contact &amp; Inquiries
            </h2>
            <p>
              For questions regarding our privacy practices or to request data removal, contact our management team at <code>privacy@cafenova.com</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
