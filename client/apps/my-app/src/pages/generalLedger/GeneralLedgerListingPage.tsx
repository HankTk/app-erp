import { useState, useEffect } from 'react';
import {
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxFormGroup,
  AxListbox,
  AxInput,
} from '@ui/components';
import { fetchOrders, Order } from '../../api/orderApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchProducts, Product } from '../../api/productApi';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  padding: var(--spacing-lg);
  box-sizing: border-box;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100vh - 280px);
  overflow: hidden;
`;

interface GLEntry {
  id: string;
  date: string;
  type: 'REVENUE' | 'COST' | 'PAYMENT';
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  description: string;
  quantity: number;
  amount: number;
  cost?: number;
  status: string;
}

interface GeneralLedgerListingPageProps {
  onViewEntry?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function GeneralLedgerListingPage({ onViewEntry, onNavigateBack }: GeneralLedgerListingPageProps = {} as GeneralLedgerListingPageProps) {
  const [glEntries, setGlEntries] = useState<GLEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, customersData, productsData] = await Promise.all([
        fetchOrders(),
        fetchCustomers(),
        fetchProducts(),
      ]);
      
      setCustomers(customersData);
      setProducts(productsData);
      
      // Generate GL entries from orders
      const entries: GLEntry[] = [];
      
      // Process orders that have been shipped or invoiced
      const processedOrders = ordersData.filter(order => 
        order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID'
      );
      
      processedOrders.forEach(order => {
        const customer = customersData.find(c => c.id === order.customerId);
        const customerName = customer 
          ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email)
          : 'Unknown';
        
        const shipDate = order.shipDate || order.invoiceDate || order.orderDate;
        const invoiceDate = order.invoiceDate || order.orderDate;
        
        // Calculate total quantity
        const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        
        // Calculate product cost using actual product cost from products data
        const productCost = order.items?.reduce((sum, item) => {
          const product = productsData.find(p => p.id === item.productId);
          const itemCost = product?.cost || (item.unitPrice || 0) * 0.7; // Use product cost, fallback to 70% of unit price
          return sum + (itemCost * (item.quantity || 0));
        }, 0) || 0;
        
        // REVENUE entry - when order is shipped/invoiced
        if (order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID') {
          entries.push({
            id: `${order.id}-revenue`,
            date: shipDate || invoiceDate || order.orderDate || '',
            type: 'REVENUE',
            orderId: order.id || '',
            orderNumber: order.orderNumber || '',
            invoiceNumber: order.invoiceNumber,
            customerId: order.customerId || '',
            customerName,
            description: `Revenue from Order ${order.orderNumber}${order.invoiceNumber ? ` / Invoice ${order.invoiceNumber}` : ''}`,
            quantity: totalQuantity,
            amount: order.total || 0,
            status: order.status,
          });
        }
        
        // COST entry - product cost and shipping cost
        if (order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID') {
          const shippingCost = order.shippingCost || 0;
          const totalCost = productCost + shippingCost;
          
          if (totalCost > 0) {
            entries.push({
              id: `${order.id}-cost`,
              date: shipDate || invoiceDate || order.orderDate || '',
              type: 'COST',
              orderId: order.id || '',
              orderNumber: order.orderNumber || '',
              invoiceNumber: order.invoiceNumber,
              customerId: order.customerId || '',
              customerName,
              description: `Cost for Order ${order.orderNumber}${order.invoiceNumber ? ` / Invoice ${order.invoiceNumber}` : ''} (Product: $${productCost.toFixed(2)}, Shipping: $${shippingCost.toFixed(2)})`,
              quantity: totalQuantity,
              amount: totalCost,
              cost: totalCost,
              status: order.status,
            });
          }
        }
        
        // PAYMENT entry - when payment is received
        if (order.status === 'PAID' && order.jsonData?.paymentAmount) {
          const paymentAmount = order.jsonData.paymentAmount || 0;
          const paymentDate = order.jsonData.paymentDate || order.orderDate || '';
          
          if (paymentAmount > 0) {
            entries.push({
              id: `${order.id}-payment`,
              date: paymentDate,
              type: 'PAYMENT',
              orderId: order.id || '',
              orderNumber: order.orderNumber || '',
              invoiceNumber: order.invoiceNumber,
              customerId: order.customerId || '',
              customerName,
              description: `Payment received for Order ${order.orderNumber}${order.invoiceNumber ? ` / Invoice ${order.invoiceNumber}` : ''}`,
              quantity: 0,
              amount: paymentAmount,
              status: 'PAID',
            });
          }
        }
      });
      
      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setGlEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load general ledger entries');
      console.error('Error fetching GL entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEntries = glEntries.filter(entry => {
    if (typeFilter && entry.type !== typeFilter) return false;
    if (dateFrom && entry.date < dateFrom) return false;
    if (dateTo && entry.date > dateTo) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REVENUE':
        return '#047857'; // Green
      case 'COST':
        return '#DC2626'; // Red
      case 'PAYMENT':
        return '#2563EB'; // Blue
      default:
        return '#6B7280';
    }
  };

  const getTypeBackgroundColor = (type: string) => {
    switch (type) {
      case 'REVENUE':
        return '#D1FAE5';
      case 'COST':
        return '#FEE2E2';
      case 'PAYMENT':
        return '#DBEAFE';
      default:
        return '#F3F4F6';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REVENUE':
        return 'Revenue';
      case 'COST':
        return 'Cost';
      case 'PAYMENT':
        return 'Payment';
      default:
        return type;
    }
  };

  // Calculate totals
  const totalDebit = filteredEntries
    .filter(e => e.type === 'COST')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = filteredEntries
    .filter(e => e.type === 'REVENUE' || e.type === 'PAYMENT')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = filteredEntries
    .filter(e => e.type === 'REVENUE')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCost = filteredEntries
    .filter(e => e.type === 'COST')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPayment = filteredEntries
    .filter(e => e.type === 'PAYMENT')
    .reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalCost;

  if (loading) {
    return (
      <PageContainer>
        <HeaderCard padding="large">
          <HeaderSection>
            <HeaderLeft>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  General Ledger
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Financial transactions based on shipping and payments
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading general ledger entries...</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <HeaderCard padding="large">
          <HeaderSection>
            <HeaderLeft>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  General Ledger
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Financial transactions based on shipping and payments
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </AxButton>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderCard padding="large">
        <HeaderSection>
          <HeaderLeft>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                ← Back
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                General Ledger
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Financial transactions based on shipping and payments
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <AxFormGroup style={{ margin: 0, minWidth: '150px' }}>
              <AxInput
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="From Date"
              />
            </AxFormGroup>
            <AxFormGroup style={{ margin: 0, minWidth: '150px' }}>
              <AxInput
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="To Date"
              />
            </AxFormGroup>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: null, label: 'All Types' },
                  { value: 'REVENUE', label: 'Revenue' },
                  { value: 'COST', label: 'Cost' },
                  { value: 'PAYMENT', label: 'Payment' },
                ]}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                placeholder="Filter by type"
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large">
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredEntries.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No general ledger entries found</AxParagraph>
            </div>
          ) : (
            <>
              <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Date</AxTableHeader>
                  <AxTableHeader>Type</AxTableHeader>
                  <AxTableHeader>Order/Invoice</AxTableHeader>
                  <AxTableHeader>Customer</AxTableHeader>
                  <AxTableHeader>Description</AxTableHeader>
                  <AxTableHeader align="right">Quantity</AxTableHeader>
                  <AxTableHeader align="right">Debit</AxTableHeader>
                  <AxTableHeader align="right">Credit</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredEntries.map((entry) => {
                  // Debit for COST, Credit for REVENUE and PAYMENT
                  const debitAmount = entry.type === 'COST' ? entry.amount : 0;
                  const creditAmount = entry.type === 'REVENUE' || entry.type === 'PAYMENT' ? entry.amount : 0;
                  
                  return (
                    <AxTableRow key={entry.id}>
                      <AxTableCell>{formatDate(entry.date)}</AxTableCell>
                      <AxTableCell>
                        <span 
                          style={{ 
                            color: getTypeColor(entry.type), 
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            backgroundColor: getTypeBackgroundColor(entry.type),
                            display: 'inline-block',
                            fontSize: 'var(--font-size-sm)',
                          }}
                        >
                          {getTypeLabel(entry.type)}
                        </span>
                      </AxTableCell>
                      <AxTableCell>
                        {entry.orderNumber}
                        {entry.invoiceNumber && ` / ${entry.invoiceNumber}`}
                      </AxTableCell>
                      <AxTableCell>{entry.customerName}</AxTableCell>
                      <AxTableCell>{entry.description}</AxTableCell>
                      <AxTableCell align="right">{entry.quantity}</AxTableCell>
                      <AxTableCell align="right" style={{ 
                        color: debitAmount > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)',
                        fontWeight: debitAmount > 0 ? 'var(--font-weight-bold)' : 'normal'
                      }}>
                        {debitAmount > 0 ? `$${debitAmount.toFixed(2)}` : '-'}
                      </AxTableCell>
                      <AxTableCell align="right" style={{ 
                        color: creditAmount > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)',
                        fontWeight: creditAmount > 0 ? 'var(--font-weight-bold)' : 'normal'
                      }}>
                        {creditAmount > 0 ? `$${creditAmount.toFixed(2)}` : '-'}
                      </AxTableCell>
                      <AxTableCell align="center">
                        {onViewEntry && entry.orderId && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onViewEntry(entry.orderId)}
                            style={{ minWidth: '80px' }}
                          >
                            View
                          </AxButton>
                        )}
                      </AxTableCell>
                    </AxTableRow>
                  );
                })}
              </AxTableBody>
              </AxTable>
              
              {/* Summary */}
              <div style={{ 
                marginTop: 'var(--spacing-lg)', 
                padding: 'var(--spacing-md)', 
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--spacing-lg)',
                flexWrap: 'wrap'
              }}>
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Total Debit
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                    ${totalDebit.toFixed(2)}
                  </AxParagraph>
                </div>
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Total Credit
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                    ${totalCredit.toFixed(2)}
                  </AxParagraph>
                </div>
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Total Revenue
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                    ${totalRevenue.toFixed(2)}
                  </AxParagraph>
                </div>
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Total Cost
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                    ${totalCost.toFixed(2)}
                  </AxParagraph>
                </div>
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Net Income
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: netIncome >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    ${netIncome.toFixed(2)}
                  </AxParagraph>
                </div>
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Total Payments
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                    ${totalPayment.toFixed(2)}
                  </AxParagraph>
                </div>
              </div>
            </>
          )}
        </div>
      </TableCard>
    </PageContainer>
  );
}

