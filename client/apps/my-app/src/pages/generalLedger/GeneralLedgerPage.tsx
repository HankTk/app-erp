import { GeneralLedgerDetailPage } from './GeneralLedgerDetailPage';

interface GeneralLedgerPageProps {
  orderId?: string | null;
  onNavigateBack?: () => void;
}

export function GeneralLedgerPage(props: GeneralLedgerPageProps = {}) {
  const { orderId, onNavigateBack } = props;

  return (
    <GeneralLedgerDetailPage
      orderId={orderId}
      onNavigateBack={onNavigateBack}
    />
  );
}

