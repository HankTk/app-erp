import { AccountPayableDetailPage } from './AccountPayableDetailPage';

interface AccountPayablePageProps {
  invoiceId?: string | null;
  onNavigateBack?: () => void;
}

export function AccountPayablePage(props: AccountPayablePageProps = {}) {
  const { invoiceId, onNavigateBack } = props;

  return (
    <AccountPayableDetailPage
      invoiceId={invoiceId}
      onNavigateBack={onNavigateBack}
    />
  );
}

