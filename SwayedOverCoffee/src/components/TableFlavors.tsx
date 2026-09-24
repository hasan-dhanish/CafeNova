import React from 'react';
import { ChaiItem } from '../data/chaiData';

interface TableFlavorsProps {
  items: ChaiItem[];
  activeIndex: number;
  direction: 'right' | 'left';
  transitionSeq: number;
  onSelect: (index: number, forcedDir?: 'right' | 'left') => void;
}

export const TableFlavors: React.FC<TableFlavorsProps> = ({
  items,
  activeIndex,
  direction,
  transitionSeq,
  onSelect,
}) => {
  const len = items.length;

  // Symmetrical circular offsets: -2, -1, [ACTIVE CHAI GLASS IN CENTER], +1, +2
  // The active item is NEVER shown as a card — it IS the center chai glass!
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

  // When moving right (Next), cards slide to the left; when moving left (Prev), cards slide to the right
  const slideAnimClass = direction === 'right' ? 'table-slide-anim-left' : 'table-slide-anim-right';

  const renderCard = (entry: { item: ChaiItem; index: number; slot: string; dir: 'right' | 'left' }) => {
    const { item, index, slot, dir } = entry;

    return (
      <button
        key={`card-${item.id}-${slot}-${transitionSeq}`}
        type="button"
        onClick={() => onSelect(index, dir)}
        className={`table-flavor-dish ${slideAnimClass}`}
        aria-label={`Select ${item.name} (${item.flavorTag})`}
        title={`Switch to ${item.name}`}
      >
        {/* Table Contact Ambient Occlusion Shadow */}
        <div className="table-dish-shadow" />

        {/* Squircle Ceramic Tasting Saucer */}
        <div className="table-dish-body">
          <div className="table-dish-inner">
            <img
              src={item.ingredientImage}
              alt={item.flavorTag}
              className="table-dish-img"
              loading="eager"
            />
          </div>
        </div>

        {/* Dish Label on Wooden Table */}
        <div className="table-dish-meta">
          <span className="table-dish-title">{item.name.replace(' Chai', '')}</span>
          <span className="table-dish-flavor">{item.flavorTag}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="table-flavors-container" aria-label="Available Tea Flavors on Table">
      {/* Desktop Layout: 2 Cards on Left Wing, 2 Cards on Right Wing flanking the glass */}
      <div className="table-flavors-desktop">
        {/* Left Wing (Cards sliding smoothly on the wooden table) */}
        <div className="table-flavors-wing table-flavors-left">
          {leftItems.map(renderCard)}
        </div>

        {/* Center Gap for the Hero Chai Glass */}
        <div className="table-flavors-center-gap" />

        {/* Right Wing (Cards sliding smoothly on the wooden table) */}
        <div className="table-flavors-wing table-flavors-right">
          {rightItems.map(renderCard)}
        </div>
      </div>

      {/* Mobile Layout: 4 Cards flanking the center on mobile */}
      <div className="table-flavors-mobile">
        {leftItems.map(renderCard)}
        <div className="table-flavors-mobile-gap" />
        {rightItems.map(renderCard)}
      </div>
    </div>
  );
};
