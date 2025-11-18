import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme, AxSection, AxSectionTitle, AxContainer, AxHeading3, AxParagraph, AxButton } from '@ui/components';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { Sidebar } from './components/Sidebar';
import { Drawer } from './components/Drawer';
import { AppHeader } from './components/AppHeader';
import { UserListingPage } from './pages/master/UserListingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { WelcomePage } from './pages/auth/WelcomePage';
import { InitialSetupPage } from './pages/auth/InitialSetupPage';
import { CustomerListingPage } from './pages/master/CustomerListingPage';
import { VendorListingPage } from './pages/master/VendorListingPage';
import { OrderEntryPage } from './pages/order/OrderEntryPage';
import { ProductListingPage } from './pages/master/ProductListingPage';
import { AddressListingPage } from './pages/master/AddressListingPage';
import { OrderListingPage } from './pages/order/OrderListingPage';
import { MasterPage } from './pages/master/MasterPage';
import { AccountReceivableListingPage } from './pages/accountReceivable/AccountReceivableListingPage';
import { AccountReceivablePage } from './pages/accountReceivable/AccountReceivablePage';
import { AccountPayableListingPage } from './pages/accountPayable/AccountPayableListingPage';
import { AccountPayablePage } from './pages/accountPayable/AccountPayablePage';
import { PurchaseOrderListingPage } from './pages/purchaseOrder/PurchaseOrderListingPage';
import { PurchaseOrderEntryPage } from './pages/purchaseOrder/PurchaseOrderEntryPage';
import { GeneralLedgerListingPage } from './pages/generalLedger/GeneralLedgerListingPage';
import { GeneralLedgerPage } from './pages/generalLedger/GeneralLedgerPage';
import { InventoryControlPage } from './pages/inventory/InventoryControlPage';
import { RMAListingPage } from './pages/rma/RMAListingPage';
import { RMAEntryPage } from './pages/rma/RMAEntryPage';
import { ShopFloorControlPage } from './pages/rma/ShopFloorControlPage';
import { ShopFloorControlListingPage } from './pages/shopFloorControl/ShopFloorControlListingPage';
import { fetchUsers } from './api/userApi';
import styled from '@emotion/styled';
import { debugProps } from './utils/emotionCache';

const COMPONENT_NAME = 'App';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const AppContainer = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  background-color: var(--color-background-page);
  transition: background-color var(--transition-base);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AxMainContent = styled.div`
  padding: var(--spacing-lg) var(--spacing-lg);
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentSection = styled(AxSection)`
  flex: 1;
  overflow: hidden;
  margin-bottom: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const CompactSectionTitle = styled(AxSectionTitle)`
  margin-bottom: var(--spacing-xs);
`;

const FullWidthContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: var(--color-background-page);
  min-height: 100vh;
  transition: background-color var(--transition-base);
`;

type AppPage = 'welcome' | 'master' | 'users' | 'customers' | 'vendors' | 'products' | 'addresses' | 'orders' | 'order-entry' | 'accounts-receivable' | 'accounts-receivable-detail' | 'purchase-order' | 'purchase-order-entry' | 'accounts-payable' | 'accounts-payable-detail' | 'general-ledger' | 'general-ledger-detail' | 'inventory-control' | 'rma' | 'rma-entry' | 'shop-floor-control' | 'shop-floor-control-entry' | 'shop';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>('welcome');
  const [orderIdToEdit, setOrderIdToEdit] = useState<string | null>(null);
  const [orderIdToView, setOrderIdToView] = useState<string | null>(null);
  const [invoiceIdToView, setInvoiceIdToView] = useState<string | null>(null);
  const [poIdToEdit, setPoIdToEdit] = useState<string | null>(null);
  const [poIdToView, setPoIdToView] = useState<string | null>(null);
  const [apInvoiceIdToView, setApInvoiceIdToView] = useState<string | null>(null);
  const [glOrderIdToView, setGlOrderIdToView] = useState<string | null>(null);
  const [rmaIdToEdit, setRmaIdToEdit] = useState<string | null>(null);
  const [rmaIdToView, setRmaIdToView] = useState<string | null>(null);
  const [shopFloorControlRmaId, setShopFloorControlRmaId] = useState<string | null>(null);
  const [sfcRmaId, setSfcRmaId] = useState<string | null>(null);
  const [sfcPreviousPage, setSfcPreviousPage] = useState<AppPage | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { l10n } = useI18n();

  // Check if there are any users in the system
  useEffect(() => {
    const checkUsers = async () => {
      try {
        const users = await fetchUsers();
        const hasUsersInSystem = users.length > 0;
        setHasUsers(hasUsersInSystem);
        
        // If no users exist and we have a saved user in localStorage, clear it
        // because the saved user might be invalid
        if (!hasUsersInSystem) {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error checking users:', err);
        // If we can't check, default to false (show initial setup) to be safe
        // This ensures the initial setup page appears if there's a network/API issue
        setHasUsers(false);
      } finally {
        setCheckingUsers(false);
      }
    };

    // Load user from localStorage on mount, but still check if users exist
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Set user temporarily, but still check if users exist in system
        // This allows us to validate the saved user is still valid
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    // Always check users to determine if we should show initial setup or login
    checkUsers();
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setCurrentPage('welcome');
    setHasUsers(true); // After login, we know users exist
  };

  const handleSetupComplete = (createdUser: any) => {
    setUser(createdUser);
    localStorage.setItem('user', JSON.stringify(createdUser));
    setCurrentPage('welcome');
    setHasUsers(true); // After setup, we know users exist
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('welcome');
    // Re-check if users exist after logout
    checkUsersAfterAction();
  };

  const checkUsersAfterAction = async () => {
    try {
      const users = await fetchUsers();
      setHasUsers(users.length > 0);
    } catch (err) {
      console.error('Error checking users:', err);
    }
  };

  const handleNoUsersRemaining = () => {
    // Log out the current user
    setUser(null);
    localStorage.removeItem('user');
    // Set hasUsers to false to trigger initial setup page
    setHasUsers(false);
  };

  const getPageTitle = (page: AppPage, translate: (key: string) => string): string | undefined => {
    switch (page) {
      case 'users':
        return translate('user.title');
      case 'customers':
        return translate('sidebar.customers');
      case 'vendors':
        return translate('sidebar.vendors');
      case 'products':
        return translate('sidebar.products');
      case 'addresses':
        return translate('sidebar.addresses');
      case 'orders':
        return translate('sidebar.orders');
      case 'order-entry':
        return translate('sidebar.orderEntry');
      case 'accounts-receivable':
        return translate('module.accountsReceivable');
      case 'accounts-receivable-detail':
        return translate('module.accountsReceivable');
      case 'purchase-order':
        return translate('module.purchaseOrder');
      case 'purchase-order-entry':
        return translate('module.purchaseOrder');
      case 'accounts-payable':
        return translate('module.accountsPayable');
      case 'accounts-payable-detail':
        return translate('module.accountsPayable');
      case 'general-ledger':
        return translate('module.generalLedger');
      case 'general-ledger-detail':
        return translate('module.generalLedger');
      case 'inventory-control':
        return translate('module.inventoryControl');
      case 'rma':
        return translate('module.rma');
      case 'rma-entry':
        return translate('module.rma');
      case 'shop-floor-control':
      case 'shop-floor-control-entry':
        return translate('module.shopFloorControl');
      case 'shop':
        return translate('module.shop');
      case 'master':
        return translate('master.title');
      case 'welcome':
        return undefined; // Welcome page doesn't show title
      default:
        return undefined;
    }
  };

  // Show loading state while checking users
  if (checkingUsers) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-page)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show initial setup page if no users exist
  if (!user && hasUsers === false) {
    return <InitialSetupPage onSetupComplete={handleSetupComplete} />;
  }

  // Show login page if not authenticated and users exist
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app with welcome or users page
  return (
    <AppWrapper {...debugProps(COMPONENT_NAME, 'AppWrapper')}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page === 'welcome' || page === 'master' || page === 'users' || page === 'customers' || page === 'vendors' || page === 'products' || page === 'addresses' || page === 'orders' || page === 'order-entry' || page === 'accounts-receivable' || page === 'accounts-receivable-detail' || page === 'purchase-order' || page === 'purchase-order-entry' || page === 'accounts-payable' || page === 'accounts-payable-detail' || page === 'general-ledger' || page === 'general-ledger-detail' || page === 'inventory-control' || page === 'rma' || page === 'rma-entry' || page === 'shop-floor-control' || page === 'shop-floor-control-entry' || page === 'shop') {
            setCurrentPage(page);
          }
        }}
        onLogout={handleLogout}
      />
      <Drawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen(!drawerOpen)}
        theme={theme}
        onThemeChange={toggleTheme}
      />
      <AppHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSettingsClick={() => setDrawerOpen(!drawerOpen)}
        title={getPageTitle(currentPage, l10n)}
      />
      {currentPage === 'orders' || currentPage === 'order-entry' || currentPage === 'accounts-receivable' || currentPage === 'accounts-receivable-detail' || currentPage === 'purchase-order' || currentPage === 'purchase-order-entry' || currentPage === 'accounts-payable' || currentPage === 'accounts-payable-detail' || currentPage === 'general-ledger' || currentPage === 'general-ledger-detail' || currentPage === 'inventory-control' || currentPage === 'customers' || currentPage === 'vendors' || currentPage === 'products' || currentPage === 'addresses' || currentPage === 'users' || currentPage === 'master' || currentPage === 'rma' || currentPage === 'rma-entry' || currentPage === 'shop-floor-control' || currentPage === 'shop-floor-control-entry' || currentPage === 'shop' ? (
        <FullWidthContainer {...debugProps(COMPONENT_NAME, 'FullWidthContainer')}>
          <AppContainer {...debugProps(COMPONENT_NAME, 'AppContainer')}>
            {currentPage === 'orders' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <OrderListingPage 
                  onNavigateToOrderEntry={() => {
                    setOrderIdToEdit(null);
                    setOrderIdToView(null);
                    setCurrentPage('order-entry');
                  }}
                  onEditOrder={(orderId: string) => {
                    setOrderIdToEdit(orderId);
                    setOrderIdToView(null);
                    setCurrentPage('order-entry');
                  }}
                  onViewOrder={(orderId: string) => {
                    setOrderIdToView(orderId);
                    setOrderIdToEdit(null);
                    setCurrentPage('order-entry');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'order-entry' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <OrderEntryPage 
                  orderIdToEdit={orderIdToEdit || orderIdToView}
                  readOnly={!!orderIdToView}
                  onNavigateToOrders={() => {
                    setOrderIdToEdit(null);
                    setOrderIdToView(null);
                    setCurrentPage('orders');
                  }}
                  onNavigateBack={() => {
                    setOrderIdToEdit(null);
                    setOrderIdToView(null);
                    setCurrentPage('orders');
                  }}
                />
              </div>
            ) : currentPage === 'customers' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <CustomerListingPage 
                  onNavigateBack={() => setCurrentPage('master')}
                />
              </div>
            ) : currentPage === 'vendors' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <VendorListingPage 
                  onNavigateBack={() => setCurrentPage('master')}
                />
              </div>
            ) : currentPage === 'products' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <ProductListingPage 
                  onNavigateBack={() => setCurrentPage('master')}
                />
              </div>
            ) : currentPage === 'addresses' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <AddressListingPage 
                  onNavigateBack={() => setCurrentPage('master')}
                />
              </div>
            ) : currentPage === 'users' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <UserListingPage 
                  onNoUsersRemaining={handleNoUsersRemaining}
                  onNavigateBack={() => setCurrentPage('master')}
                />
              </div>
            ) : currentPage === 'accounts-receivable' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <AccountReceivableListingPage 
                  onViewInvoice={(orderId: string) => {
                    setInvoiceIdToView(orderId);
                    setCurrentPage('accounts-receivable-detail');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'accounts-receivable-detail' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <AccountReceivablePage 
                  invoiceId={invoiceIdToView}
                  onNavigateBack={() => {
                    setInvoiceIdToView(null);
                    setCurrentPage('accounts-receivable');
                  }}
                />
              </div>
            ) : currentPage === 'purchase-order' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <PurchaseOrderListingPage 
                  onNavigateToPOEntry={() => {
                    setPoIdToEdit(null);
                    setPoIdToView(null);
                    setCurrentPage('purchase-order-entry');
                  }}
                  onEditPO={(poId: string) => {
                    setPoIdToEdit(poId);
                    setPoIdToView(null);
                    setCurrentPage('purchase-order-entry');
                  }}
                  onViewPO={(poId: string) => {
                    setPoIdToView(poId);
                    setPoIdToEdit(null);
                    setCurrentPage('purchase-order-entry');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'purchase-order-entry' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <PurchaseOrderEntryPage 
                  poIdToEdit={poIdToEdit || poIdToView}
                  readOnly={!!poIdToView}
                  onNavigateToPOs={() => {
                    setPoIdToEdit(null);
                    setPoIdToView(null);
                    setCurrentPage('purchase-order');
                  }}
                  onNavigateBack={() => {
                    setPoIdToEdit(null);
                    setPoIdToView(null);
                    setCurrentPage('purchase-order');
                  }}
                />
              </div>
            ) : currentPage === 'accounts-payable' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <AccountPayableListingPage 
                  onViewInvoice={(prId: string) => {
                    setApInvoiceIdToView(prId);
                    setCurrentPage('accounts-payable-detail');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'accounts-payable-detail' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <AccountPayablePage 
                  invoiceId={apInvoiceIdToView}
                  onNavigateBack={() => {
                    setApInvoiceIdToView(null);
                    setCurrentPage('accounts-payable');
                  }}
                />
              </div>
            ) : currentPage === 'general-ledger' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <GeneralLedgerListingPage 
                  onViewEntry={(orderId: string) => {
                    setGlOrderIdToView(orderId);
                    setCurrentPage('general-ledger-detail');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'general-ledger-detail' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <GeneralLedgerPage 
                  orderId={glOrderIdToView}
                  onNavigateBack={() => {
                    setGlOrderIdToView(null);
                    setCurrentPage('general-ledger');
                  }}
                />
              </div>
            ) : currentPage === 'inventory-control' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <InventoryControlPage 
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'rma' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <RMAListingPage 
                  onNavigateToRMAEntry={() => {
                    setRmaIdToEdit(null);
                    setRmaIdToView(null);
                    setCurrentPage('rma-entry');
                  }}
                  onEditRMA={(rmaId: string) => {
                    setRmaIdToEdit(rmaId);
                    setRmaIdToView(null);
                    setCurrentPage('rma-entry');
                  }}
                  onViewRMA={(rmaId: string) => {
                    setRmaIdToView(rmaId);
                    setRmaIdToEdit(null);
                    setCurrentPage('rma-entry');
                  }}
                  onNavigateToShopFloorControl={(rmaId: string) => {
                    setSfcRmaId(rmaId);
                    setSfcPreviousPage('rma'); // Track that we came from RMA listing page
                    setCurrentPage('shop-floor-control-entry');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'rma-entry' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <RMAEntryPage 
                  rmaIdToEdit={rmaIdToEdit || rmaIdToView}
                  readOnly={!!rmaIdToView}
                  onNavigateToRMAs={() => {
                    setRmaIdToEdit(null);
                    setRmaIdToView(null);
                    setCurrentPage('rma');
                  }}
                  onNavigateToShopFloorControl={(rmaId: string) => {
                    setSfcRmaId(rmaId);
                    setSfcPreviousPage('rma-entry'); // Track that we came from RMA entry page
                    setCurrentPage('shop-floor-control-entry');
                  }}
                  onNavigateBack={() => {
                    setRmaIdToEdit(null);
                    setRmaIdToView(null);
                    setCurrentPage('rma');
                  }}
                />
              </div>
            ) : currentPage === 'shop-floor-control' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <ShopFloorControlListingPage
                  onProcessRMA={(rmaId: string) => {
                    setSfcRmaId(rmaId);
                    setSfcPreviousPage('shop-floor-control'); // Track that we came from SFC listing page
                    setCurrentPage('shop-floor-control-entry');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'shop-floor-control-entry' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                {sfcRmaId ? (
                  <ShopFloorControlPage
                    rmaId={sfcRmaId}
                    backButtonLabel={sfcPreviousPage === 'rma-entry' ? 'Back to RMA' : sfcPreviousPage === 'rma' ? 'Back to RMA' : 'Back to SFC'}
                    onNavigateBack={() => {
                      // Return to the page we came from
                      const previousPage = sfcPreviousPage || 'shop-floor-control';
                      setSfcRmaId(null);
                      setSfcPreviousPage(null);
                      setCurrentPage(previousPage);
                    }}
                  />
                ) : (
                  <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <AxHeading3>Shop Floor Control</AxHeading3>
                    <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                      No RMA selected
                    </AxParagraph>
                    <AxButton 
                      variant="secondary" 
                      onClick={() => {
                        setSfcRmaId(null);
                        setCurrentPage('shop-floor-control');
                      }}
                    >
                      ← Back
                    </AxButton>
                  </div>
                )}
              </div>
            ) : currentPage === 'shop' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                {/* Shop redirects to Shop Floor Control */}
                <ShopFloorControlListingPage
                  onProcessRMA={(rmaId: string) => {
                    setSfcRmaId(rmaId);
                    setSfcPreviousPage('shop-floor-control'); // Track that we came from SFC listing page
                    setCurrentPage('shop-floor-control-entry');
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : currentPage === 'master' ? (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <MasterPage
                  onPageChange={(page) => {
                    if (page === 'users' || page === 'customers' || page === 'vendors' || page === 'products' || page === 'addresses') {
                      setCurrentPage(page);
                    }
                  }}
                  onNavigateBack={() => setCurrentPage('welcome')}
                />
              </div>
            ) : null}
          </AppContainer>
        </FullWidthContainer>
      ) : (
        <AxContainer>
          <AppContainer {...debugProps(COMPONENT_NAME, 'AppContainer')}>
            {currentPage === 'welcome' ? (
              <WelcomePage
                user={user}
                onPageChange={(page) => {
                  if (page === 'master' || page === 'users' || page === 'customers' || page === 'vendors' || page === 'products' || page === 'addresses' || page === 'orders' || page === 'order-entry' || page === 'accounts-receivable' || page === 'accounts-receivable-detail' || page === 'purchase-order' || page === 'purchase-order-entry' || page === 'accounts-payable' || page === 'accounts-payable-detail' || page === 'general-ledger' || page === 'general-ledger-detail' || page === 'inventory-control' || page === 'rma' || page === 'rma-entry' || page === 'shop' || page === 'shop-floor-control' || page === 'shop-floor-control-entry') {
                    setCurrentPage(page);
                  }
                }}
              />
            ) : null}
          </AppContainer>
        </AxContainer>
      )}
    </AppWrapper>
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;

