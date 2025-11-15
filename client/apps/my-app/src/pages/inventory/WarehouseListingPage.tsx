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
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxCheckbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, Warehouse } from '../../api/warehouseApi';
import styled from '@emotion/styled';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
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
`;

const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100% - 6rem);
  overflow: hidden;
`;

type DialogMode = 'add' | 'edit' | null;

interface WarehouseListingPageProps {
  onNavigateBack?: () => void;
}

export function WarehouseListingPage({ onNavigateBack }: WarehouseListingPageProps = {}) {
  const { t } = useI18n();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<Partial<Warehouse>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const warehousesData = await fetchWarehouses();
      setWarehouses(warehousesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouses');
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleAdd = () => {
    setFormData({
      warehouseCode: '',
      warehouseName: '',
      address: '',
      description: '',
      active: true,
    });
    setDialogMode('add');
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({ ...warehouse });
    setDialogMode('edit');
  };

  const handleDelete = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWarehouse?.id) return;
    try {
      await deleteWarehouse(selectedWarehouse.id);
      await loadWarehouses();
      setDeleteDialogOpen(false);
      setSelectedWarehouse(null);
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      alert('Failed to delete warehouse');
    }
  };

  const handleSubmit = async () => {
    if (!formData.warehouseCode || !formData.warehouseName) {
      alert('Warehouse code and name are required');
      return;
    }

    try {
      setSubmitting(true);
      if (dialogMode === 'add') {
        await createWarehouse(formData as Warehouse);
      } else if (dialogMode === 'edit' && selectedWarehouse?.id) {
        await updateWarehouse(selectedWarehouse.id, formData as Warehouse);
      }
      await loadWarehouses();
      setDialogMode(null);
      setSelectedWarehouse(null);
      setFormData({});
    } catch (err) {
      console.error('Error saving warehouse:', err);
      alert('Failed to save warehouse');
    } finally {
      setSubmitting(false);
    }
  };

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
                  ← {t('common.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {t('inventory.warehouses')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {t('inventory.warehousesSubtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight>
              <AxButton variant="primary" onClick={handleAdd}>
                {t('common.add')}
              </AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{t('common.loading')}</AxParagraph>
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
                  ← {t('common.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {t('inventory.warehouses')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {t('inventory.warehousesSubtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight>
              <AxButton variant="primary" onClick={handleAdd}>
                {t('common.add')}
              </AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={loadWarehouses}>
              {t('common.retry')}
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
                ← {t('common.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {t('inventory.warehouses')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {t('inventory.warehousesSubtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <AxButton variant="primary" onClick={handleAdd}>
              {t('common.add')}
            </AxButton>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large">
        <AxTable fullWidth variant="bordered">
          <AxTableHead>
            <AxTableRow>
              <AxTableHeader>{t('inventory.warehouseCode')}</AxTableHeader>
              <AxTableHeader>{t('inventory.warehouseName')}</AxTableHeader>
              <AxTableHeader>{t('inventory.address')}</AxTableHeader>
              <AxTableHeader>{t('common.status')}</AxTableHeader>
              <AxTableHeader align="center">{t('common.actions')}</AxTableHeader>
            </AxTableRow>
          </AxTableHead>
          <AxTableBody>
            {warehouses.map((warehouse) => (
              <AxTableRow key={warehouse.id}>
                <AxTableCell>{warehouse.warehouseCode || '-'}</AxTableCell>
                <AxTableCell>{warehouse.warehouseName || '-'}</AxTableCell>
                <AxTableCell>{warehouse.address || '-'}</AxTableCell>
                <AxTableCell>
                  {warehouse.active ? (
                    <span style={{ color: 'var(--color-success)' }}>{t('common.active')}</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)' }}>{t('common.inactive')}</span>
                  )}
                </AxTableCell>
                <AxTableCell align="center">
                  <AxButton
                    variant="secondary"
                    size="small"
                    onClick={() => handleEdit(warehouse)}
                    style={{ marginRight: 'var(--spacing-xs)' }}
                  >
                    {t('common.edit')}
                  </AxButton>
                  <AxButton
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(warehouse)}
                  >
                    {t('common.delete')}
                  </AxButton>
                </AxTableCell>
              </AxTableRow>
            ))}
          </AxTableBody>
        </AxTable>
      </TableCard>

      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedWarehouse(null);
          setFormData({});
        }}
        title={dialogMode === 'add' ? t('inventory.addWarehouse') : t('inventory.editWarehouse')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton
              variant="secondary"
              onClick={() => {
                setDialogMode(null);
                setSelectedWarehouse(null);
                setFormData({});
              }}
              disabled={submitting}
            >
              {t('common.cancel')}
            </AxButton>
            <AxButton variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('common.saving') || 'Saving...' : t('common.save')}
            </AxButton>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>{t('inventory.warehouseCode')} *</AxLabel>
            <AxInput
              value={formData.warehouseCode || ''}
              onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{t('inventory.warehouseName')} *</AxLabel>
            <AxInput
              value={formData.warehouseName || ''}
              onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{t('inventory.address')}</AxLabel>
            <AxInput
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{t('common.description')}</AxLabel>
            <AxInput
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              disabled={submitting}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxCheckbox
              label={t('common.active')}
              checked={formData.active ?? true}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              disabled={submitting}
            />
          </AxFormGroup>
        </div>
      </AxDialog>

      <AxDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedWarehouse(null);
        }}
        title={t('common.confirmDelete')}
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton
              variant="secondary"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedWarehouse(null);
              }}
              disabled={submitting}
            >
              {t('common.cancel')}
            </AxButton>
            <AxButton variant="danger" onClick={handleDeleteConfirm} disabled={submitting}>
              {submitting ? t('common.deleting') || 'Deleting...' : t('common.delete')}
            </AxButton>
          </div>
        }
      >
        <p>{t('inventory.confirmDeleteWarehouse', { name: selectedWarehouse?.warehouseName })}</p>
      </AxDialog>
    </PageContainer>
  );
}

