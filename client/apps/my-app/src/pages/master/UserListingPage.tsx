import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { AxButton } from '@ui/components';
import { fetchUsers, createUser, updateUser, deleteUser, User } from '../../api/userApi';
import { UserListingPageRender } from './UserListingPage.render';

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
        label = l10n('user.table.createdDate');
      } else if (key.toLowerCase().includes('created') && key.toLowerCase().includes('date')) {
        label = l10n('user.table.createdDate');
      } else if (key.toLowerCase() === 'userid') {
        label = l10n('user.form.userId');
      } else if (key.toLowerCase() === 'firstname') {
        label = l10n('user.form.firstName');
      } else if (key.toLowerCase() === 'lastname') {
        label = l10n('user.form.lastName');
      } else if (key.toLowerCase() === 'email') {
        label = l10n('user.form.email');
      } else if (key.toLowerCase() === 'role') {
        label = l10n('user.form.role');
      } else if (key.toLowerCase() === 'status') {
        label = l10n('user.table.status');
      } else if (key.toLowerCase() === 'jsondata') {
        label = l10n('user.form.jsonData');
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
            return <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>{l10n('user.table.null')}</span>;
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
      setError(err instanceof Error ? err.message : l10n('user.error.loadFailed'));
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
      alert(err instanceof Error ? err.message : l10n('user.error.deleteFailed'));
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
            alert(l10n('user.error.invalidJson'));
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
      alert(err instanceof Error ? err.message : (dialogMode === 'edit' ? l10n('user.error.updateFailed') : l10n('user.error.createFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const getFormFields = () => {
    // Return the specific User model fields: userid, password, role, firstName, lastName, email, jsonData
    // Exclude: id (auto-generated), fullName (computed field)
    return ['userid', 'password', 'role', 'firstName', 'lastName', 'email', 'jsonData'];
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDialogClose = () => {
    setDialogMode(null);
    setFormData({});
    setSelectedUser(null);
  };

  const handleFormDataChange = (data: Record<string, any>) => {
    setFormData(data);
  };

  return (
    <UserListingPageRender
      users={users}
      columns={columns}
      loading={loading}
      error={error}
      dialogMode={dialogMode}
      deleteDialogOpen={deleteDialogOpen}
      selectedUser={selectedUser}
      formData={formData}
      submitting={submitting}
      onNoUsersRemaining={onNoUsersRemaining}
      onNavigateBack={onNavigateBack}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      onSave={handleSave}
      onDialogClose={handleDialogClose}
      onFormDataChange={handleFormDataChange}
      onRetry={() => window.location.reload()}
      getFormFields={getFormFields}
    />
  );
}

