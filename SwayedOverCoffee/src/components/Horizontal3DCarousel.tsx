import React from 'react';
import { ChaiItem } from '../data/chaiData';

interface Horizontal3DCarouselProps {
  items: ChaiItem[];
  activeIndex: number;
  direction?: 'right' | 'left';
  transitionSeq?: number;
  onSelect: (index: number, forcedDir?: 'right' | 'left') => void;
}

export const Horizontal3DCarousel: React.FC<Horizontal3DCarouselProps> = ({
  items,
  activeIndex,
  direction = 'right',
  transitionSeq = 0,
  onSelect,
}) => {
  const len = items.length;

  // Symmetrical circular offsets: -2, -1, [ACTIVE CHAI IN CENTER], +1, +2
  // The selected flavor is NOT displayed on the flanking list — it is exclusively the hero chai glass & text!
  const farLeftIdx = (activeIndex - 2 + len) % len;
  const nearLeftIdx = (activeIndex - 1 + len) % len;
  const nearRightIdx = (activeIndex + 1) % len;
  const farRightIdx = (activeIndex + 2) % len;

  const leftItems = [
    { item: items[farLeftIdx], index: farLeftIdx, slot: 'far-left', dir: 'left' as const },
    { item: items[nearLeftIdx], index: nearLeftIdx, slot: 'near-left', dir: 'left' as const },
  ];

  const rightItems = [
    { item: items[nearRightIdx], index: nearRightIdx, slot: 'near-right', dir: 'right' as const },
    { item: items[farRightIdx], index: farRightIdx, slot: 'far-right', dir: 'right' as const },
  ];

  // Fluid sliding animation class during navigation
  const slideAnimClass = direction === 'right' ? 'flavor-slide-left' : 'flavor-slide-right';

  const renderCard = (
    entry: { item: ChaiItem; index: number; slot: string; dir: 'right' | 'left' },
    wing: 'left' | 'right'
  ) => {
    const { item, index, slot, dir } = entry;

    return (
      <button
        key={`flavor-card-${item.id}-${slot}-${transitionSeq}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(index, dir);
        }}
        className={`flavor-3d-card flavor-card-squircle flavor-card-wing-${wing} ${slideAnimClass}`}
        aria-label={`Select ${item.name} (${item.flavorTag})`}
        title={`Switch to ${item.name} - ${item.flavorTag}`}
      >
        {/* Ambient Floating Glow Shadow */}
        <div className="flavor-card-shadow" />

        {/* Card Surface Container */}
        <div className="flavor-card-surface">
          {/* Pencil-drawn Sketch Illustration */}
          <div className="flavor-card-sketch-wrap">
            <img
              src={item.sketchImage}
              alt={item.name}
              className="flavor-card-sketch-img"
              loading="eager"
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flavor-3d-carousel-container" aria-label="Artisanal Tea Flavors Horizontal 3D Carousel">
      {/* Desktop 3D Layout: Symmetrical 2 Cards Left & 2 Cards Right Flanking the Central Hero Stage */}
      <div className="flavor-3d-desktop-track">
        {/* Left Wing (2 cards) */}
        <div className="flavor-3d-wing flavor-3d-wing-left">
          {leftItems.map((entry) => renderCard(entry, 'left'))}
        </div>

        {/* Center Gap for the Round-Ended Rectangle Box & Hero Chai Glass */}
        <div className="flavor-3d-center-gap" />

        {/* Right Wing (2 cards) */}
        <div className="flavor-3d-wing flavor-3d-wing-right">
          {rightItems.map((entry) => renderCard(entry, 'right'))}
        </div>
      </div>

      {/* Mobile Layout: 4 Unselected Flavor Cards Strip */}
      <div className="flavor-3d-mobile-track">
        {[...leftItems, ...rightItems].map((entry) => renderCard(entry, entry.dir))}
      </div>
    </div>
  );
};
