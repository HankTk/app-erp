import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchRMAs, RMA } from '../../api/rmaApi';
import { fetchSFCs, fetchSFCsByStatus, createSFCFromRMA, SFC } from '../../api/sfcApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { ShopFloorControlListingPageRender } from './ShopFloorControlListingPage.render';

interface ShopFloorControlListingPageProps {
  onProcessRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
}

export function ShopFloorControlListingPage({ onProcessRMA, onNavigateBack }: ShopFloorControlListingPageProps = {} as ShopFloorControlListingPageProps) {
  const { l10n } = useI18n();
  const [sfcs, setSfcs] = useState<SFC[]>([]);
  const [rmas, setRmas] = useState<RMA[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customersData, sfcsData, rmasData] = await Promise.all([
        fetchCustomers(),
        statusFilter ? fetchSFCsByStatus(statusFilter) : fetchSFCs(),
        fetchRMAs(), // Fetch RMAs to find ones that need SFC creation
      ]);
      setCustomers(customersData);
      setRmas(rmasData);
      
      // Filter SFCs if status filter is set
      let filteredSFCs = sfcsData;
      if (statusFilter) {
        filteredSFCs = filteredSFCs.filter(sfc => sfc.status === statusFilter);
      }
      setSfcs(filteredSFCs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SFC data');
      console.error('Error loading shop floor control data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || `${customer?.lastName || ''} ${customer?.firstName || ''}`.trim() || customer?.email || 'Unknown Customer';
  };

  const handleProcess = async (sfc: SFC) => {
    if (sfc.id && onProcessRMA && sfc.rmaId) {
      onProcessRMA(sfc.rmaId);
    }
  };

  const handleCreateSFC = async (rma: RMA) => {
    if (!rma.id) return;
    
    try {
      setProcessing(rma.id);
      setError(null);
      const sfc = await createSFCFromRMA(rma.id);
      // Reload data to show the new SFC
      await loadData();
      // Navigate to process the SFC
      if (sfc.id && onProcessRMA && sfc.rmaId) {
        onProcessRMA(sfc.rmaId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SFC');
      console.error('Error creating SFC:', err);
    } finally {
      setProcessing(null);
    }
  };

  // Find RMAs that need SFC creation (APPROVED or RECEIVED status, and no SFC exists)
  const rmasNeedingSFC = rmas.filter(rma => {
    if (rma.status !== 'APPROVED' && rma.status !== 'RECEIVED') return false;
    if (!rma.id) return false;
    // Check if SFC already exists for this RMA
    return !sfcs.some(sfc => sfc.rmaId === rma.id);
  });

  return (
    <ShopFloorControlListingPageRender
      sfcs={sfcs}
      rmasNeedingSFC={rmasNeedingSFC}
      loading={loading}
      error={error}
      statusFilter={statusFilter}
      processing={processing}
      onProcessRMA={onProcessRMA}
      onNavigateBack={onNavigateBack}
      onStatusFilterChange={setStatusFilter}
      onProcess={handleProcess}
      onCreateSFC={handleCreateSFC}
      onRetry={loadData}
      getCustomerName={getCustomerName}
    />
  );
}

