import { AccountReceivableDetailPage } from './AccountReceivableDetailPage';

interface AccountReceivablePageProps {
  invoiceId?: string | null;
  onNavigateBack?: () => void;
}

export function AccountReceivablePage(props: AccountReceivablePageProps = {}) {
  const { invoiceId, onNavigateBack } = props;

  return (
    <AccountReceivableDetailPage
      invoiceId={invoiceId}
      onNavigateBack={onNavigateBack}
    />
  );
}

