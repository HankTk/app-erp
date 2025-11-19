import React from 'react';
import {
  AxTable,
  ColumnDefinition,
} from '@ui/components';
import { I18N } from '../i18n/I18nProvider';
import { Card, Heading, Description, SizeSection, SizeLabel } from './TablePage.styles';

type SampleData = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

type AlignmentData = {
  id: number;
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
};

const createColumns = (): ColumnDefinition<SampleData, never>[] => [
  {
    key: 'id',
    header: 'ID',
    align: undefined,
    render: (row: SampleData) => row.id,
  },
  {
    key: 'name',
    header: 'Name',
    align: undefined,
    render: (row: SampleData) => row.name,
  },
  {
    key: 'email',
    header: 'Email',
    align: undefined,
    render: (row: SampleData) => row.email,
  },
  {
    key: 'role',
    header: 'Role',
    align: undefined,
    render: (row: SampleData) => row.role,
  },
  {
    key: 'status',
    header: 'Status',
    align: undefined,
    render: (row: SampleData) => row.status,
  },
];

const createCompactColumns = (): ColumnDefinition<SampleData, never>[] => [
  {
    key: 'name',
    header: 'Name',
    align: undefined,
    render: (row: SampleData) => row.name,
  },
  {
    key: 'email',
    header: 'Email',
    align: undefined,
    render: (row: SampleData) => row.email,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (row: SampleData) => row.status,
  },
];

const createAlignmentColumns = (): ColumnDefinition<AlignmentData, never>[] => [
  {
    key: 'left',
    header: <I18N l10n="table.left" />,
    align: 'left',
    render: (row: AlignmentData) => row.left,
  },
  {
    key: 'center',
    header: <I18N l10n="table.center" />,
    align: 'center',
    render: (row: AlignmentData) => row.center,
  },
  {
    key: 'right',
    header: <I18N l10n="table.right" />,
    align: 'right',
    render: (row: AlignmentData) => row.right,
  },
];

export function TablePage() {
  const sampleData: SampleData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Editor', status: 'Active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
  ];

  const columns = createColumns();
  const compactColumns = createCompactColumns();

  const alignmentData: AlignmentData[] = [
    {
      id: 1,
      left: <I18N l10n="table.leftAligned" />,
      center: <I18N l10n="table.centerAligned" />,
      right: <I18N l10n="table.rightAligned" />,
    },
    {
      id: 2,
      left: '$1,234.56',
      center: 'Status: Active',
      right: '100%',
    },
  ];
  const alignmentColumns = createAlignmentColumns();

  return (
    <>
      <Card padding="large">
        <Heading><I18N l10n="table.default" /></Heading>
        <Description>
          <I18N l10n="table.defaultDescription" />
        </Description>
        <AxTable
          fullWidth
          data={sampleData}
          columns={columns}
          getRowKey={(row: SampleData) => row.id.toString()}
        />
      </Card>

      <Card padding="large">
        <Heading><I18N l10n="table.bordered" /></Heading>
        <Description>
          <I18N l10n="table.borderedDescription" />
        </Description>
        <AxTable
          fullWidth
          variant="bordered"
          data={sampleData}
          columns={columns}
          getRowKey={(row: SampleData) => row.id.toString()}
        />
      </Card>

      <Card padding="large">
        <Heading><I18N l10n="table.striped" /></Heading>
        <Description>
          <I18N l10n="table.stripedDescription" />
        </Description>
        <AxTable
          fullWidth
          variant="striped"
          data={sampleData}
          columns={columns}
          getRowKey={(row: SampleData) => row.id.toString()}
        />
      </Card>

      <Card padding="large">
        <Heading><I18N l10n="table.sizes" /></Heading>
        <Description>
          <I18N l10n="table.sizesDescription" />
        </Description>
        
        <SizeSection>
          <SizeLabel><I18N l10n="table.smallSize" /></SizeLabel>
          <AxTable
            fullWidth
            size="small"
            data={sampleData.slice(0, 3)}
            columns={compactColumns}
            getRowKey={(row: SampleData) => row.id.toString()}
          />
        </SizeSection>

        <SizeSection>
          <SizeLabel><I18N l10n="table.mediumSize" /></SizeLabel>
          <AxTable
            fullWidth
            size="medium"
            data={sampleData.slice(0, 3)}
            columns={compactColumns}
            getRowKey={(row: SampleData) => row.id.toString()}
          />
        </SizeSection>

        <div>
          <SizeLabel><I18N l10n="table.largeSize" /></SizeLabel>
          <AxTable
            fullWidth
            size="large"
            data={sampleData.slice(0, 3)}
            columns={compactColumns}
            getRowKey={(row: SampleData) => row.id.toString()}
          />
        </div>
      </Card>

      <Card padding="large">
        <Heading><I18N l10n="table.textAlignment" /></Heading>
        <Description>
          <I18N l10n="table.textAlignmentDescription" />
        </Description>
        <AxTable
          fullWidth
          data={alignmentData}
          columns={alignmentColumns}
          getRowKey={(row: AlignmentData) => row.id.toString()}
        />
      </Card>
    </>
  );
}

