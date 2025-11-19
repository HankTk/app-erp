import {
  AxTable,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
  ColumnDefinition,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { User } from '../../api/userApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
  StyledTextarea,
} from './UserListingPage.styles';

const COMPONENT_NAME = 'UserListingPage';

type DialogMode = 'add' | 'edit' | null;

interface ColumnConfig {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, user: User) => React.ReactNode;
}

interface UserListingPageRenderProps {
  users: User[];
  columns: ColumnConfig[];
  loading: boolean;
  error: string | null;
  dialogMode: DialogMode;
  deleteDialogOpen: boolean;
  selectedUser: User | null;
  formData: Record<string, any>;
  submitting: boolean;
  onNoUsersRemaining?: () => void;
  onNavigateBack?: () => void;
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDeleteClick: (user: User) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSave: () => void;
  onDialogClose: () => void;
  onFormDataChange: (data: Record<string, any>) => void;
  onRetry: () => void;
  getFormFields: () => string[];
}

export function UserListingPageRender(props: UserListingPageRenderProps) {
  const {
    users,
    columns,
    loading,
    error,
    dialogMode,
    deleteDialogOpen,
    selectedUser,
    formData,
    submitting,
    onNoUsersRemaining,
    onNavigateBack,
    onAdd,
    onEdit,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    onSave,
    onDialogClose,
    onFormDataChange,
    onRetry,
    getFormFields,
  } = props;
  
  const { l10n } = useI18n();

  // Convert ColumnConfig to ColumnDefinition
  const tableColumns: ColumnDefinition<User, never>[] = columns.map(col => ({
    key: col.key,
    header: col.label,
    align: col.align,
    render: col.render ? (user: User) => col.render!(user[col.key], user) : (user: User) => user[col.key] ?? ''
  }));

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
            <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  {l10n('master.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('user.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('user.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('user.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('user.loading')}</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
            <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  {l10n('master.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('user.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('user.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('user.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('user.error')}: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={onRetry}>
              {l10n('common.retry')}
            </AxButton>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                  {l10n('master.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('user.title')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('user.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={onAdd}>{l10n('user.addNew')}</AxButton>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {users.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('user.noUsers')}</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={users}
              columns={tableColumns}
              getRowKey={(user, index) => user.id || user._id || index}
            />
          )}
        </div>
      </TableCard>

      {/* Add/Edit User Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={onDialogClose}
        title={dialogMode === 'add' ? l10n('user.dialog.add') : l10n('user.dialog.edit')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDialogClose}
              disabled={submitting}
            >
              {l10n('user.dialog.cancel')}
            </AxButton>
            <AxButton 
              variant="primary" 
              onClick={onSave}
              disabled={submitting}
            >
              {submitting ? l10n('user.dialog.loading') : l10n('user.dialog.save')}
            </AxButton>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {getFormFields().map((key) => {
            // Generate user-friendly labels
            const labels: Record<string, string> = {
              userid: l10n('user.form.userId'),
              password: l10n('user.form.password'),
              role: l10n('user.form.role'),
              firstName: l10n('user.form.firstName'),
              lastName: l10n('user.form.lastName'),
              email: l10n('user.form.email'),
              jsonData: l10n('user.form.jsonData'),
            };
            // Fallback label generation with internationalization
            const fallbackLabel = labels[key] || (() => {
              const keyLower = key.toLowerCase();
              if (keyLower === 'userid') return l10n('user.form.userId');
              if (keyLower === 'firstname') return l10n('user.form.firstName');
              if (keyLower === 'lastname') return l10n('user.form.lastName');
              if (keyLower === 'email') return l10n('user.form.email');
              if (keyLower === 'role') return l10n('user.form.role');
              if (keyLower === 'jsondata') return l10n('user.form.jsonData');
              return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
            })();
            const label = labels[key] || fallbackLabel;
            
            const value = formData[key] ?? '';
            
            // Handle jsonData as textarea
            if (key === 'jsonData') {
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <StyledTextarea
                    value={value}
                    onChange={(e) => onFormDataChange({ ...formData, [key]: e.target.value })}
                    placeholder={l10n('user.form.jsonDataPlaceholder')}
                    style={{ marginTop: 'var(--spacing-xs)' }}
                    disabled={submitting}
                  />
                </AxFormGroup>
              );
            }
            
            // Handle role as listbox
            if (key === 'role') {
              const roleOptions = [
                { value: 'user', label: l10n('user.form.roleUser') },
                { value: 'admin', label: l10n('user.form.roleAdmin') },
              ];
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <AxListbox
                    options={roleOptions}
                    value={value || null}
                    onChange={(selectedValue) => onFormDataChange({ ...formData, [key]: selectedValue || '' })}
                    placeholder={l10n('user.form.selectRole')}
                    style={{ marginTop: 'var(--spacing-xs)' }}
                    disabled={submitting}
                    fullWidth
                  />
                </AxFormGroup>
              );
            }
            
            // Handle password as password input
            if (key === 'password') {
              // For password fields, always use password type to ensure masking
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <input
                    type="password"
                    value={value || ''}
                    onChange={(e) => onFormDataChange({ ...formData, [key]: e.target.value })}
                    placeholder={dialogMode === 'edit' ? l10n('user.form.passwordEditPlaceholder') : l10n('user.form.passwordPlaceholder')}
                    autoComplete={dialogMode === 'edit' ? 'new-password' : 'new-password'}
                    disabled={submitting}
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      lineHeight: 'var(--line-height-normal)',
                      padding: 'var(--spacing-sm) calc(var(--spacing-sm) + 6px)',
                      border: '2px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
                      width: '100%',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-background-default)',
                      marginTop: 'var(--spacing-xs)',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-border-focus)';
                      e.target.style.boxShadow = 'var(--shadow-focus-sm)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border-default)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </AxFormGroup>
              );
            }
            
            // Handle other fields
            let inputType = 'text';
            if (key === 'email') {
              inputType = 'email';
            }

            return (
              <AxFormGroup key={key}>
                <AxLabel>{label}</AxLabel>
                <AxInput
                  type={inputType}
                  value={value}
                  onChange={(e) => onFormDataChange({ ...formData, [key]: e.target.value })}
                  style={{ marginTop: 'var(--spacing-xs)' }}
                  disabled={submitting}
                  fullWidth
                />
              </AxFormGroup>
            );
          })}
        </div>
      </AxDialog>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('user.dialog.delete')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              {l10n('user.dialog.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? l10n('user.dialog.loading') : l10n('user.dialog.confirm')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph marginBottom="md">
          {l10n('user.dialog.deleteConfirm')}
        </AxParagraph>
        <AxParagraph color="secondary" size="sm">
          {l10n('user.dialog.deleteMessage')}
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

