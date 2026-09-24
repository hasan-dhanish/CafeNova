import React, { useState } from 'react';
import { ShoppingBag, Check, Plus } from 'lucide-react';
import { FlavorVariant } from '../types';

interface HeroBeverageProps {
  variant: FlavorVariant;
  onAddToCart: (variant: FlavorVariant) => void;
  onOpenCustomizer: (variant: FlavorVariant) => void;
}

export const HeroBeverage: React.FC<HeroBeverageProps> = ({
  variant,
  onAddToCart,
  onOpenCustomizer,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(variant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Background Mound Pedestal (matches video frame 00:01) */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '820px',
          height: '260px',
          backgroundImage: 'url(/images/pedestal-mound.jpg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          opacity: 0.95,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Central Morphing Drink Cup */}
      <div
        onClick={() => onOpenCustomizer(variant)}
        title="Tap to customize recipe"
        style={{
          position: 'relative',
          width: '280px',
          height: '370px',
          zIndex: 15,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Soft cup glow under active beverage */}
        <div
          style={{
            position: 'absolute',
            width: '220px',
            height: '220px',
            borderRadius: '999px',
            backgroundColor: variant.accentColor,
            opacity: 0.28,
            filter: 'blur(45px)',
            zIndex: 1,
            transition: 'background-color 0.5s ease',
          }}
        />

        {/* Cup Image with smooth cross-fade animation */}
        <img
          key={variant.id}
          src={variant.cupImage}
          alt={variant.name}
          className="animate-float"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 2,
            filter: 'drop-shadow(0 25px 35px rgba(10, 18, 8, 0.6))',
            transition: 'all 0.45s ease',
          }}
        />

        {/* Floating Customizer Hint pill on hover */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '-10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#2A3822',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          <Plus size={11} strokeWidth={3} />
          <span>Customize</span>
        </div>
      </div>

      {/* Title & Floating Price Capsule (matches video 00:03) */}
      <div
        key={`meta-${variant.id}`}
        className="animate-tag"
        style={{
          position: 'relative',
          zIndex: 25,
          marginTop: '-12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
        }}
      >
        {/* Flavor Name */}
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.1rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#FAFDF7',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
            lineHeight: 1.1,
          }}
        >
          {variant.name}
        </h2>

        {/* Floating Price Tag Badge with 1-Tap Cart Add */}
        <div
          style={{
            backgroundColor: '#1C2616',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '16px',
            padding: '0.35rem 0.5rem 0.35rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#FAFDF7',
              letterSpacing: '-0.01em',
            }}
          >
            ₹{variant.price}
          </span>

          <button
            type="button"
            onClick={handleQuickAdd}
            title="1-Tap Add to Cart"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: justAdded ? '#4A6B3E' : 'rgba(255, 255, 255, 0.15)',
              color: '#FAFDF7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
            }}
          >
            {justAdded ? <Check size={16} color="#B4E29C" /> : <ShoppingBag size={15} />}
          </button>
        </div>
      </div>

      {/* Big Editorial Headline at Bottom (matches video 00:03 "Chooise you matcha tea") */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5%',
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 'clamp(2.1rem, 5vw, 4.2rem)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'rgba(250, 253, 247, 0.92)',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            lineHeight: 1,
          }}
        >
          Choose your matcha tea
        </h1>
      </div>
    </div>
  );
};
