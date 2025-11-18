import { useState } from 'react';
import { WarehouseListingPage } from './WarehouseListingPage';
import { InventoryListingPage } from './InventoryListingPage';
import { InventoryControlPageRender } from './InventoryControlPage.render';

interface InventoryControlPageProps {
  onNavigateBack?: () => void;
}

type View = 'menu' | 'warehouses' | 'inventory';

export function InventoryControlPage({ onNavigateBack }: InventoryControlPageProps = {}) {
  const [currentView, setCurrentView] = useState<View>('menu');

  if (currentView === 'warehouses') {
    return (
      <WarehouseListingPage
        onNavigateBack={() => setCurrentView('menu')}
      />
    );
  }

  if (currentView === 'inventory') {
    return (
      <InventoryListingPage
        onNavigateBack={() => setCurrentView('menu')}
      />
    );
  }

  return (
    <InventoryControlPageRender
      currentView={currentView}
      onNavigateBack={onNavigateBack}
      onViewChange={setCurrentView}
    />
  );
}

