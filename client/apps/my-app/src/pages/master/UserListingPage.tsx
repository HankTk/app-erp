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
  AxListbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchUsers, createUser, updateUser, deleteUser, User } from '../../api/userApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'UserListingPage';

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

const StyledTextarea = styled.textarea`
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  padding: var(--spacing-sm) calc(var(--spacing-sm) + 6px);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  width: 100%;
  min-height: 120px;
  resize: vertical;
  color: var(--color-text-primary);
  background-color: var(--color-background-default);

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: var(--shadow-focus-sm);
  }

  &:disabled {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

interface ColumnConfig {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, user: User) => React.ReactNode;
}

type DialogMode = 'add' | 'edit' | null;

interface UserListingPageProps {
  onNoUsersRemaining?: () => void;
  onNavigateBack?: () => void;
}

export function UserListingPage({ onNoUsersRemaining, onNavigateBack }: UserListingPageProps) {
  const { l10n } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Helper function to reorder columns: move status after created date
  const reorderColumns = (cols: ColumnConfig[]): ColumnConfig[] => {
    const statusIndex = cols.findIndex(col => col.key.toLowerCase() === 'status');
    const createdIndex = cols.findIndex(col => 
      col.key.toLowerCase().includes('created') || 
      col.key.toLowerCase().includes('createdat') ||
      col.key.toLowerCase() === 'created_date'
    );
    
    if (statusIndex !== -1 && createdIndex !== -1 && statusIndex < createdIndex) {
      const statusCol = cols[statusIndex];
      const newCols = [...cols];
      newCols.splice(statusIndex, 1);
      newCols.splice(createdIndex, 0, statusCol);
      return newCols;
    }
    
    return cols;
  };

  // Generate columns from user data
  const generateColumns = (firstUser: User, onEdit: (user: User) => void, onDelete: (user: User) => void): ColumnConfig[] => {
    const userKeys = Object.keys(firstUser);
    
    const generatedColumns: ColumnConfig[] = userKeys.map((key) => {
      // Skip internal or action keys, id field, and password
      if (key.toLowerCase().includes('action') || 
          key.toLowerCase().includes('_id') || 
          key === 'id' ||
          key === 'password' ||
          key === '__v' || 
          key.startsWith('__')) {
        return null;
      }
      
      // Generate label with special handling for created_date
      let label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
      if (key.toLowerCase() === 'created_date') {
        label = 'Created Date';
      } else if (key.toLowerCase().includes('created') && key.toLowerCase().includes('date')) {
        label = 'Created Date';
      }
      
      const column: ColumnConfig = {
        key,
        label,
        align: 'left',
      };

      // Special handling for status field
      if (key.toLowerCase() === 'status') {
        column.render = (value) => {
          const status = String(value || '').toLowerCase();
          let color = 'var(--color-text-secondary)';
          if (status.includes('active')) {
            color = 'var(--color-success)';
          } else if (status.includes('inactive')) {
            color = 'var(--color-error)';
          } else if (status.includes('pending')) {
            color = 'var(--color-warning)';
          }
          return (
            <span style={{ color, fontWeight: 500 }}>
              {value}
            </span>
          );
        };
      }

      // Special handling for balance or amount fields
      if (key.toLowerCase().includes('balance') || key.toLowerCase().includes('amount')) {
        column.align = 'right';
        column.render = (value) => {
          if (typeof value === 'number') {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
          }
          return value;
        };
      }

      // Special handling for date fields
      if (key.toLowerCase().includes('date') || 
          key.toLowerCase().includes('created') || 
          key.toLowerCase().includes('updated') ||
          key.toLowerCase() === 'created_date') {
        column.render = (value) => {
          if (value) {
            try {
              const date = new Date(value);
              return date.toLocaleDateString();
            } catch {
              return value;
            }
          }
          return value;
        };
      }

      // Special handling for jsonData field
      if (key === 'jsonData') {
        column.render = (value) => {
          if (value === null || value === undefined) {
            return <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>null</span>;
          }
          if (typeof value === 'object') {
            try {
              return (
                <pre style={{ 
                  margin: 0, 
                  fontSize: 'var(--font-size-sm)', 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxWidth: '300px'
                }}>
                  {JSON.stringify(value, null, 2)}
                </pre>
              );
            } catch {
              return String(value);
            }
          }
          return String(value);
        };
      }

      return column;
    }).filter((col): col is ColumnConfig => col !== null);

    // Reorder columns: move status after created date
    const reorderedColumns = reorderColumns(generatedColumns);

    // Always add Actions column at the end
    reorderedColumns.push({
      key: 'actions',
      label: l10n('user.actions'),
      align: 'center',
      render: (_, user) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => onEdit(user)}
            style={{ minWidth: '80px' }}
          >
            {l10n('user.edit')}
          </AxButton>
          <AxButton 
            variant="danger" 
            size="small"
            onClick={() => onDelete(user)}
            style={{ minWidth: '80px' }}
          >
            {l10n('user.delete')}
          </AxButton>
        </div>
      ),
    });

    return reorderedColumns;
  };

  const handleEdit = (user: User) => {
    // Convert jsonData object to JSON string for editing
    const formDataCopy = { ...user };
    if (formDataCopy.jsonData && typeof formDataCopy.jsonData === 'object') {
      formDataCopy.jsonData = JSON.stringify(formDataCopy.jsonData, null, 2);
    } else if (formDataCopy.jsonData === null || formDataCopy.jsonData === undefined) {
      formDataCopy.jsonData = '';
    }
    // Don't populate password field for security (user can enter new password if needed)
    formDataCopy.password = '';
    setFormData(formDataCopy);
    setSelectedUser(user);
    setDialogMode('edit');
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Update users and columns state
  const updateUsersAndColumns = (usersData: User[]) => {
    if (usersData.length === 0) {
      setUsers([]);
      setColumns([]);
      return;
    }

    const generatedColumns = generateColumns(usersData[0], handleEdit, handleDeleteClick);
    setUsers(usersData);
    setColumns(generatedColumns);
  };

  // Load users and update state
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await fetchUsers();
      updateUsersAndColumns(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setFormData({});
    setSelectedUser(null);
    setDialogMode('add');
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const userId = selectedUser.id || selectedUser._id;
      await deleteUser(userId);

      // Refresh the users list
      const updatedUsers = await fetchUsers();
      updateUsersAndColumns(updatedUsers);

      // Check if no users remain after deletion
      if (updatedUsers.length === 0 && onNoUsersRemaining) {
        onNoUsersRemaining();
      }

      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      // Prepare form data for API
      const dataToSave: Record<string, any> = { ...formData };
      
      // If editing and password is empty, don't include it (to keep current password)
      if (dialogMode === 'edit' && (!dataToSave.password || dataToSave.password.trim() === '')) {
        delete dataToSave.password;
      }
      
      // Parse jsonData from string to object if it's a valid JSON string
      if (dataToSave.jsonData) {
        if (typeof dataToSave.jsonData === 'string' && dataToSave.jsonData.trim() !== '') {
          try {
            dataToSave.jsonData = JSON.parse(dataToSave.jsonData);
          } catch (e) {
            alert('Invalid JSON format in Json Data field. Please check your JSON syntax.');
            setSubmitting(false);
            return;
          }
        }
      } else {
        // If jsonData is empty, set it to null
        dataToSave.jsonData = null;
      }
      
      const userId = selectedUser?.id || selectedUser?._id;
      
      if (dialogMode === 'edit' && userId) {
        await updateUser(userId, dataToSave);
      } else {
        await createUser(dataToSave);
      }

      // Refresh the users list
      await loadUsers();

      setDialogMode(null);
      setFormData({});
      setSelectedUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err instanceof Error ? err.message : `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const getFormFields = () => {
    // Return the specific User model fields: userid, password, role, firstName, lastName, email, jsonData
    // Exclude: id (auto-generated), fullName (computed field)
    return ['userid', 'password', 'role', 'firstName', 'lastName', 'email', 'jsonData'];
  };

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
                  ← Back
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
              <AxButton variant="primary" onClick={handleAdd}>{l10n('user.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading users...</AxParagraph>
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
                  ← Back
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
              <AxButton variant="primary" onClick={handleAdd}>{l10n('user.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
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
                ← Back
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
            <AxButton variant="primary" onClick={handleAdd}>{l10n('user.addNew')}</AxButton>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {users.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No users found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  {columns.map((column) => (
                    <AxTableHeader key={column.key} align={column.align}>
                      {column.label}
                    </AxTableHeader>
                  ))}
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {users.map((user, index) => (
                  <AxTableRow key={user.id || user._id || index}>
                    {columns.map((column) => (
                      <AxTableCell key={column.key} align={column.align}>
                        {column.render
                          ? column.render(user[column.key], user)
                          : user[column.key] ?? ''}
                      </AxTableCell>
                    ))}
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          )}
        </div>
      </TableCard>

      {/* Add/Edit User Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setFormData({});
          setSelectedUser(null);
        }}
        title={dialogMode === 'add' ? l10n('user.dialog.add') : l10n('user.dialog.edit')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDialogMode(null);
                setFormData({});
                setSelectedUser(null);
              }}
              disabled={submitting}
            >
              {l10n('user.dialog.cancel')}
            </AxButton>
            <AxButton 
              variant="primary" 
              onClick={handleSave}
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
              userid: 'User ID',
              password: 'Password',
              role: 'Role',
              firstName: 'First Name',
              lastName: 'Last Name',
              email: 'Email',
              jsonData: 'JSON Data',
            };
            const label = labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
            
            const value = formData[key] ?? '';
            
            // Handle jsonData as textarea
            if (key === 'jsonData') {
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <StyledTextarea
                    value={value}
                    onChange={(e) => {
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    placeholder='{"key": "value"}'
                    style={{ marginTop: 'var(--spacing-xs)' }}
                    disabled={submitting}
                  />
                </AxFormGroup>
              );
            }
            
            // Handle role as listbox
            if (key === 'role') {
              const roleOptions = [
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ];
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <AxListbox
                    options={roleOptions}
                    value={value || null}
                    onChange={(selectedValue) => {
                      setFormData({ ...formData, [key]: selectedValue || '' });
                    }}
                    placeholder="Select role"
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
                    onChange={(e) => {
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    placeholder={dialogMode === 'edit' ? 'Enter new password (leave blank to keep current)' : 'Enter password'}
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
                      backgroundColor: 'var(--color-background-default)',
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
                  onChange={(e) => {
                    setFormData({ ...formData, [key]: e.target.value });
                  }}
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
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        title={l10n('user.dialog.delete')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={submitting}
            >
              {l10n('user.dialog.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? l10n('user.dialog.loading') : l10n('user.dialog.confirm')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          {l10n('user.dialog.deleteConfirm')}
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {l10n('user.dialog.deleteMessage')}
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

