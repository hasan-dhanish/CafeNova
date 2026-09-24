import React, { useState } from 'react';
import { X, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { FlavorVariant, CartItem } from '../types';

interface ProductDetailsDrawerProps {
  variant: FlavorVariant | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductDetailsDrawer: React.FC<ProductDetailsDrawerProps> = ({
  variant,
  onClose,
  onAddToCart,
}) => {
  const [sweetness, setSweetness] = useState('Standard (50%)');
  const [milk, setMilk] = useState('Whole Milk');
  const [iceLevel, setIceLevel] = useState('Regular Ice');
  const [quantity, setQuantity] = useState(1);

  if (!variant) return null;

  const sweetnessOptions = ['Zero (0%)', 'Subtle (25%)', 'Standard (50%)', 'Sweet (100%)'];
  const milkOptions = ['Whole Milk', 'Oat Milk (+₹40)', 'Almond Milk (+₹40)'];
  const iceOptions = ['No Ice', 'Light Ice', 'Regular Ice'];

  const extraMilkCost = milk.includes('+₹40') ? 40 : 0;
  const unitPrice = variant.price + extraMilkCost;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      variant,
      quantity,
      sweetness,
      milk,
      iceLevel,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 22, 12, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#1E2818',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '1.75rem',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          color: '#FAFDF7',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#A3B19B',
                fontWeight: 700,
              }}
            >
              {variant.tag}
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FAFDF7', marginTop: '2px' }}>
              {variant.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#C0CEB8', marginTop: '4px', lineHeight: 1.4 }}>
              {variant.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAFDF7',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tasting Notes */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {variant.notes.map((note) => (
            <span
              key={note}
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                padding: '0.25rem 0.65rem',
                color: '#D2E0CA',
              }}
            >
              {note}
            </span>
          ))}
        </div>

        {/* Sweetness */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A3B19B', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
            Sweetness Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {sweetnessOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSweetness(opt)}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: sweetness === opt ? '#4A6B3E' : 'rgba(255, 255, 255, 0.06)',
                  color: sweetness === opt ? '#FAFDF7' : '#C4D4BB',
                  border: sweetness === opt ? '1px solid #78A766' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Milk Choice */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A3B19B', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
            Choice of Milk
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {milkOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setMilk(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: milk === opt ? '#4A6B3E' : 'rgba(255, 255, 255, 0.06)',
                  color: milk === opt ? '#FAFDF7' : '#C4D4BB',
                  border: milk === opt ? '1px solid #78A766' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{opt}</span>
                {milk === opt && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Ice Level */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A3B19B', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
            Ice Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
            {iceOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setIceLevel(opt)}
                style={{
                  padding: '0.55rem',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: iceLevel === opt ? '#4A6B3E' : 'rgba(255, 255, 255, 0.06)',
                  color: iceLevel === opt ? '#FAFDF7' : '#C4D4BB',
                  border: iceLevel === opt ? '1px solid #78A766' : '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Add to Cart Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ width: '38px', height: '38px', color: '#FAFDF7', fontSize: '1.2rem', fontWeight: 700 }}
            >
              -
            </button>
            <span style={{ width: '28px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              style={{ width: '38px', height: '38px', color: '#FAFDF7', fontSize: '1.2rem', fontWeight: 700 }}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            style={{
              flex: 1,
              backgroundColor: '#4A6B3E',
              color: '#FAFDF7',
              borderRadius: '14px',
              padding: '0.85rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(74, 107, 62, 0.4)',
              cursor: 'pointer',
            }}
          >
            <span>Add to Order</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
