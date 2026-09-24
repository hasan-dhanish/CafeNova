import React from 'react';
import { LayoutGrid, Sparkles, ShoppingBag, MapPin, Coffee } from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  cartCount: number;
  onOpenCart: () => void;
  tableNumber?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  cartCount,
  onOpenCart,
  tableNumber = 'T02',
}) => {
  return (
    <header
      style={{
        position: 'absolute',
        top: '1.25rem',
        left: '1.25rem',
        right: '1.25rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      {/* Brand Mark */}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Coffee size={20} color="#FAFDF7" />
        </div>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#FAFDF7',
              lineHeight: 1,
              display: 'block',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            swayed
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#C4D4BB',
              fontWeight: 600,
              display: 'block',
              marginTop: '2px',
            }}
          >
            Over Coffee
          </span>
        </div>
      </div>

      {/* Floating Pill Menu (as seen in video) */}
      <nav
        style={{
          pointerEvents: 'auto',
          backgroundColor: 'rgba(28, 38, 22, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '999px',
          padding: '0.35rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Showcase / Arc Mode */}
        <button
          type="button"
          onClick={() => setViewMode('showcase')}
          title="Curved Arc 3D Showcase"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '999px',
            backgroundColor: viewMode === 'showcase' ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
            color: viewMode === 'showcase' ? '#FAFDF7' : '#A3B19B',
            transition: 'all 0.25s ease',
          }}
        >
          <Sparkles size={17} />
        </button>

        {/* Full Grid Menu */}
        <button
          type="button"
          onClick={() => setViewMode('grid')}
          title="Full Food & Beverage Menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '999px',
            backgroundColor: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
            color: viewMode === 'grid' ? '#FAFDF7' : '#A3B19B',
            transition: 'all 0.25s ease',
          }}
        >
          <LayoutGrid size={17} />
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

        {/* Shopping Cart with count badge */}
        <button
          type="button"
          onClick={onOpenCart}
          title="Open Cart"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '999px',
            backgroundColor: cartCount > 0 ? '#4A6B3E' : 'transparent',
            color: '#FAFDF7',
            position: 'relative',
            transition: 'all 0.25s ease',
          }}
        >
          <ShoppingBag size={17} />
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#D94B5A',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {/* Right Table / Location Badge */}
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(28, 38, 22, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          padding: '0.45rem 0.95rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#E2ECD8',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <MapPin size={13} color="#A7C297" />
        <span>Table {tableNumber}</span>
      </div>
    </header>
  );
};
