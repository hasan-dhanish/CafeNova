import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | CaféNova',
  description: 'Terms and conditions for table ordering and digital services.',
};

export default function TermsPage() {
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
          <FileText size={22} color="var(--primary-espresso)" />
          <h1 style={{ fontSize: '1.6rem', margin: 0, color: 'var(--primary-espresso)' }}>
            Terms of Service
          </h1>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Last updated: September 2026 &bull; CaféNova Operations
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              1. Digital Table Ordering
            </h2>
            <p>
              By scanning a table QR code and submitting an order through the CaféNova Menu Card, you confirm that you are seated at the corresponding table and agree to settle the total bill either via online payment or at the café counter before departure.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              2. Order Cancellations &amp; Modifications
            </h2>
            <p>
              Once an order is accepted by the kitchen staff into the preparation pipeline, cancellations or recipe modifications cannot be guaranteed due to rapid culinary and beverage brewing workflows.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              3. Pricing &amp; Taxes
            </h2>
            <p>
              All prices displayed on the digital menu card are authoritative as verified by our server database. Item prices are subject to statutory Goods and Services Tax (GST) as detailed in your itemized bill summary.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
              4. Support &amp; Assistance
            </h2>
            <p>
              If you experience any issues with order submission or payment verification, please inform your table server or lead barista immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
