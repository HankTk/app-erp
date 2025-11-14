# ERP System - Frontend

A monorepo project for an ERP system frontend, featuring a comprehensive component library using React and Styled Components with CSS variables, design tokens, and dark mode support.

> **Note**: This is the frontend portion of the ERP system. The backend is a Spring Boot application located in the `server/` directory. See [server/README.md](../server/README.md) for backend documentation.

## Project Structure

```
client/
├── libs/
│   └── ui/                      # Component library
│       ├── src/
│       │   ├── components/      # React components
│       │   │   ├── AxButton.tsx
│       │   │   ├── AxCard.tsx
│       │   │   ├── AxInput.tsx
│       │   │   ├── AxTable.tsx
│       │   │   ├── AxChart.tsx
│       │   │   ├── AxDialog.tsx
│       │   │   ├── AxCheckbox.tsx
│       │   │   ├── AxRadio.tsx
│       │   │   ├── AxDateRangePicker.tsx
│       │   │   ├── AxProgress.tsx
│       │   │   ├── AxListbox.tsx
│       │   │   ├── AxForm.tsx
│       │   │   ├── AxLabel.tsx
│       │   │   ├── AxLayout.tsx
│       │   │   └── AxSpacing.tsx
│       │   ├── theme/           # Theme provider
│       │   │   └── ThemeProvider.tsx
│       │   ├── tokens.css       # CSS design tokens
│       │   └── index.ts         # Exports
│       └── package.json
├── apps/
│   ├── my-app/                  # Main ERP application
│   │   ├── src/
│   │   │   ├── api/             # API client functions
│   │   │   ├── pages/           # Application pages
│   │   │   │   ├── auth/        # Authentication pages
│   │   │   │   ├── master/      # Master data pages
│   │   │   │   └── order/       # Order management pages
│   │   │   ├── components/      # App-specific components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── i18n/            # Internationalization
│   │   └── package.json
│   ├── my-dev/                  # Demo/development application
│   │   ├── src/
│   │   │   ├── pages/           # Component showcase pages
│   │   │   └── components/      # App components
│   │   └── package.json
│   └── my-electron/             # Electron application
│       ├── src/
│       │   └── main.ts          # Electron main process
│       └── package.json
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
└── nx.json                      # Nx configuration
```

## Setup

### Install Dependencies

```bash
pnpm install
```

**Note**: This project sets `ignore-scripts=true` in `.npmrc` to avoid errors with `rollup`'s postinstall script. This is not a problem for normal development.

## Development

### Build Component Library

```bash
pnpm build:library
```

### Start Development Servers

**Start demo application (my-dev):**
```bash
pnpm dev:my-dev
```

**Start main application (my-app):**
```bash
pnpm dev:my-app
```

**Start Electron application:**
```bash
pnpm dev:electron
```

**Start main app with Electron:**
```bash
pnpm app
```

### Build Applications

**Build demo application:**
```bash
pnpm build:my-dev
```

**Build main application:**
```bash
pnpm build:my-app
```

**Build Electron application:**
```bash
pnpm build:electron
```

### Build All

```bash
pnpm build
```

This will build the component library and all applications.

### Other Commands

**Type checking:**
```bash
pnpm type-check          # Check all packages
pnpm type-check:library  # Check library only
pnpm type-check:my-app   # Check my-app only
pnpm type-check:my-dev   # Check my-dev only
pnpm type-check:electron # Check electron only
```

**Linting:**
```bash
pnpm lint                # Lint all packages
pnpm lint:fix           # Fix linting issues
```

**Preview builds:**
```bash
pnpm preview:my-dev      # Preview my-dev build
pnpm preview:my-app      # Preview my-app build
```

**Clean:**
```bash
pnpm clean               # Clean all packages
pnpm clean:library       # Clean library only
pnpm clean:my-dev       # Clean my-dev only
pnpm clean:my-app       # Clean my-app only
pnpm clean:electron      # Clean electron only
```

## Features

- **CSS Variables & Design Tokens**: All styling uses CSS custom properties for easy theming
- **Dark Mode Support**: Built-in light/dark theme switching with `ThemeProvider`
- **TypeScript**: Full type safety with TypeScript definitions
- **Spacing System**: Consistent spacing tokens (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
- **Typography System**: Comprehensive typography tokens (font sizes, weights, line heights)
- **Allman Style**: Code follows Allman brace style for consistency

## Components

### Button (AxButton)

Button component with multiple variants and sizes. All styles use CSS variables.

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger'` - Button style variant
- `size`: `'small' | 'medium' | 'large'` - Button size
- `fullWidth`: `boolean` - Make button full width

**Example:**
```tsx
<AxButton variant="primary" size="large" fullWidth>
  Click Me
</AxButton>
```

### Card (AxCard)

Card component with elevation and padding options.

**Props:**
- `elevation`: `0 | 1 | 2 | 3 | 4` - Shadow elevation level
- `padding`: `'none' | 'small' | 'medium' | 'large'` - Internal padding

**Example:**
```tsx
<AxCard elevation={2} padding="large">
  Card content
</AxCard>
```

### Input (AxInput)

Input field component with error state support.

**Props:**
- `error`: `boolean` - Show error state styling
- `fullWidth`: `boolean` - Make input full width

**Example:**
```tsx
<AxInput 
  placeholder="Enter text" 
  error={hasError} 
  fullWidth 
/>
```

### Table (AxTable)

Table component with multiple variants and styling options.

**Props:**
- `variant`: `'default' | 'bordered' | 'striped'` - Table style variant
- `size`: `'small' | 'medium' | 'large'` - Table font size
- `fullWidth`: `boolean` - Make table full width

**Sub-components:**
- `AxTableHead` - Table header section
- `AxTableBody` - Table body section
- `AxTableRow` - Table row
- `AxTableHeader` - Table header cell
- `AxTableCell` - Table data cell

**Example:**
```tsx
<AxTable fullWidth variant="striped">
  <AxTableHead>
    <AxTableRow>
      <AxTableHeader>Name</AxTableHeader>
      <AxTableHeader>Email</AxTableHeader>
    </AxTableRow>
  </AxTableHead>
  <AxTableBody>
    <AxTableRow>
      <AxTableCell>John Doe</AxTableCell>
      <AxTableCell>john@example.com</AxTableCell>
    </AxTableRow>
  </AxTableBody>
</AxTable>
```

### Chart (AxChart)

Chart component built on Recharts with support for multiple chart types.

**Props:**
- `type`: `'line' | 'bar' | 'pie' | 'area'` - Chart type
- `data`: `Array<Record<string, any>>` - Chart data
- `dataKey`: `string` - Key for X-axis or category
- `dataKeys`: `string[]` - Keys for multiple data series (optional)
- `width`: `number | string` - Chart width (optional)
- `height`: `number` - Chart height (default: 400)
- `colors`: `string[]` - Custom color array (optional)
- `showLegend`: `boolean` - Show legend (default: true)
- `showGrid`: `boolean` - Show grid (default: true)
- `showTooltip`: `boolean` - Show tooltip (default: true)
- `title`: `string` - Chart title (optional)

**Dependencies:**
- Requires `recharts` as a peer dependency

**Example:**
```tsx
const data = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
];

<AxChart
  type="line"
  data={data}
  dataKey="month"
  dataKeys={['sales']}
  height={400}
  title="Monthly Sales"
/>
```

### Dialog (AxDialog)

Modal dialog component with customizable options.

**Props:**
- `open`: `boolean` - Dialog open state
- `onClose`: `() => void` - Close handler function
- `title`: `string` - Dialog title (optional)
- `size`: `'small' | 'medium' | 'large' | 'fullscreen'` - Dialog size (default: 'medium')
- `closeOnOverlayClick`: `boolean` - Close on overlay click (default: true)
- `closeOnEscape`: `boolean` - Close on ESC key (default: true)
- `showCloseButton`: `boolean` - Show close button (default: true)
- `footer`: `React.ReactNode` - Custom footer content (optional)

**Example:**
```tsx
const [open, setOpen] = useState(false);

<AxDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="medium"
  footer={
    <>
      <AxButton variant="secondary" onClick={() => setOpen(false)}>
        Cancel
      </AxButton>
      <AxButton variant="primary" onClick={() => setOpen(false)}>
        Confirm
      </AxButton>
    </>
  }
>
  <AxParagraph>Are you sure you want to proceed?</AxParagraph>
</AxDialog>
```

### Checkbox (AxCheckbox)

Checkbox input component with label and error state support.

**Props:**
- `label`: `string` - Checkbox label (optional)
- `error`: `boolean` - Show error state styling
- All standard HTML input attributes (except `type`)

**Example:**
```tsx
<AxCheckbox 
  label="Accept terms and conditions" 
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>
```

### Radio (AxRadio)

Radio button component with label and error state support.

**Props:**
- `label`: `string` - Radio button label (optional)
- `error`: `boolean` - Show error state styling
- All standard HTML input attributes (except `type`)

**Example:**
```tsx
<AxRadio 
  name="option" 
  value="option1" 
  label="Option 1" 
  checked={selected === 'option1'}
  onChange={(e) => setSelected(e.target.value)}
/>
```

### DateRangePicker (AxDateRangePicker)

Date range picker component for selecting start and end dates.

**Props:**
- `startDate`: `Date | null` - Start date value
- `endDate`: `Date | null` - End date value
- `onStartDateChange`: `(date: Date | null) => void` - Start date change handler
- `onEndDateChange`: `(date: Date | null) => void` - End date change handler
- `error`: `boolean` - Show error state styling
- `fullWidth`: `boolean` - Make picker full width
- `disabled`: `boolean` - Disable the picker
- `placeholder`: `string` - Placeholder text (optional)

**Example:**
```tsx
const [startDate, setStartDate] = useState<Date | null>(null);
const [endDate, setEndDate] = useState<Date | null>(null);

<AxDateRangePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  fullWidth
/>
```

### Progress (AxProgress)

Progress bar component for displaying completion status.

**Props:**
- `value`: `number` - Progress value (0-100)
- `size`: `'small' | 'medium' | 'large'` - Progress bar size (default: 'medium')
- `variant`: `'default' | 'success' | 'warning' | 'danger'` - Progress variant (default: 'default')
- `showLabel`: `boolean` - Show percentage label (default: false)
- All standard HTML div attributes

**Example:**
```tsx
<AxProgress 
  value={75} 
  variant="success" 
  showLabel 
  size="large"
/>
```

### Listbox (AxListbox)

Dropdown listbox component with single or multiple selection support.

**Props:**
- `options`: `ListboxOption[]` - Array of options (`{ value: string, label: string, disabled?: boolean }`)
- `value`: `string | string[]` - Selected value(s)
- `onChange`: `(value: string | string[]) => void` - Change handler
- `multiple`: `boolean` - Enable multiple selection (default: false)
- `disabled`: `boolean` - Disable the listbox
- `error`: `boolean` - Show error state styling
- `fullWidth`: `boolean` - Make listbox full width
- `placeholder`: `string` - Placeholder text (optional)
- `size`: `'small' | 'medium' | 'large'` - Listbox size (default: 'medium')
- `searchable`: `boolean` - Enable search functionality (default: false)
- `searchPlaceholder`: `string` - Search input placeholder (optional)
- `noResultsText`: `string` - Text shown when no results found (optional)

**Example:**
```tsx
const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

<AxListbox
  options={options}
  value={selected}
  onChange={setSelected}
  placeholder="Select an option"
  searchable
  fullWidth
/>
```

### Form Components

#### AxFormGroup

Form group wrapper for organizing form fields.

**Example:**
```tsx
<AxFormGroup>
  <AxLabel>Email</AxLabel>
  <AxInput type="email" placeholder="Enter email" />
</AxFormGroup>
```

### Typography Components

Typography components for consistent text styling:

- `AxLabel` - Label text
- `AxTitle` - Main title
- `AxSubtitle` - Subtitle text
- `AxHeading3` - Heading level 3
- `AxParagraph` - Paragraph text
- `AxTypographyExample`, `AxTypographyRow`, `AxTypographyLabel` - Typography showcase components

**Example:**
```tsx
<AxTitle>Main Title</AxTitle>
<AxSubtitle>Subtitle Text</AxSubtitle>
<AxHeading3>Section Heading</AxHeading3>
<AxParagraph>Regular paragraph text.</AxParagraph>
```

### Layout Components

Layout components for page structure:

- `AxContainer` - Main container wrapper
- `AxHeader` - Header section
- `AxGrid` - Grid layout
- `AxSection` - Section wrapper
- `AxSectionTitle` - Section title

**Example:**
```tsx
<AxContainer>
  <AxHeader>
    <AxTitle>Page Title</AxTitle>
  </AxHeader>
  <AxSection>
    <AxSectionTitle>Section Title</AxSectionTitle>
    <AxGrid>
      {/* Grid content */}
    </AxGrid>
  </AxSection>
</AxContainer>
```

### Spacing Components

Spacing showcase components for design token visualization:

- `AxSpacingExample` - Spacing token examples
- `AxSpacingRow`, `AxSpacingVisual`, `AxSpacingBox`, `AxSpacingInfo`, `AxSpacingItem`, `AxSpacingLabel`, `AxSpacingValue` - Spacing display components

### Button Group (AxButtonGroup)

Button group component for grouping related buttons.

**Example:**
```tsx
<AxButtonGroup>
  <AxButton variant="primary">Save</AxButton>
  <AxButton variant="secondary">Cancel</AxButton>
</AxButtonGroup>
```

### ThemeProvider

Theme provider component for managing light/dark mode.

**Props:**
- `defaultTheme`: `'light' | 'dark'` - Default theme (defaults to 'light')
- `storageKey`: `string` - LocalStorage key for theme persistence (defaults to 'ui-theme')

**Hook:**
- `useTheme()` - Returns `{ theme, toggleTheme, setTheme }`

## Usage

### Basic Setup

1. Import the CSS tokens in your application entry point:

```tsx
import '@ui/components/tokens.css';
```

2. Wrap your app with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@ui/components';

function App()
{
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Components

```tsx
import { 
  AxButton, 
  AxButtonGroup,
  AxCard, 
  AxInput,
  AxCheckbox,
  AxRadio,
  AxTable,
  AxChart,
  AxDialog,
  AxDateRangePicker,
  AxProgress,
  AxListbox,
  AxFormGroup,
  AxLabel,
  AxTitle,
  AxSubtitle,
  AxHeading3,
  AxParagraph,
  AxContainer,
  AxHeader,
  AxGrid,
  AxSection,
  AxSectionTitle,
  ThemeProvider, 
  useTheme 
} from '@ui/components';

function MyComponent()
{
  const { theme, toggleTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <AxCard padding="large" elevation={2}>
      <AxButton onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </AxButton>
      <AxInput placeholder="Enter text here" fullWidth />
      <AxButton variant="primary" onClick={() => setDialogOpen(true)}>
        Open Dialog
      </AxButton>
      <AxDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        title="Example Dialog"
      >
        <p>Dialog content here</p>
      </AxDialog>
    </AxCard>
  );
}
```

### Using Design Tokens

All components use CSS variables that you can override or use directly:

```css
.my-custom-component
{
  padding: var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  background-color: var(--color-background-default);
  border-radius: var(--radius-md);
}
```

### Available CSS Variables

**Colors:**
- `--color-primary`, `--color-secondary`, `--color-danger`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- `--color-background-default`, `--color-background-page`
- `--color-border-default`, `--color-border-error`, `--color-border-focus`

**Spacing:**
- `--spacing-xs` (4px) through `--spacing-5xl` (48px)

**Typography:**
- Font sizes: `--font-size-xs` through `--font-size-3xl`
- Font weights: `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`
- Line heights: `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

**Other:**
- Border radius: `--radius-sm` through `--radius-full`
- Shadows: `--shadow-sm` through `--shadow-2xl`
- Transitions: `--transition-fast`, `--transition-base`, `--transition-slow`

## Tech Stack

- **React** 18.2.0
- **TypeScript** 5.0.0
- **Styled Components** 6.1.0
- **Vite** 5.0.0
- **Recharts** 3.3.0 (for Chart component)
- **Electron** 32.3.3 (for desktop application)
- **Nx** 22.0.3 (monorepo tooling)
- **pnpm** (workspace package manager)

## Applications

### Demo Application (my-dev)

The demo application (`apps/my-dev`) showcases all available components:

- **Button Page**: Button variants, sizes, and states
- **Card Page**: Card elevation examples
- **Input Page**: Input field examples
- **Table Page**: Table variants and styling options
- **Chart Page**: Line, bar, area, and pie chart examples
- **Dialog Page**: Dialog sizes and configuration options
- **Checkbox Page**: Checkbox examples and states
- **Radio Page**: Radio button examples
- **DateRangePicker Page**: Date range picker examples
- **Progress Page**: Progress bar examples
- **Listbox Page**: Listbox/dropdown examples
- **Combination Page**: Component combination examples

Run `pnpm dev:my-dev` to start the development server and explore the components.

### Main Application (my-app)

The main application (`apps/my-app`) is a production-ready ERP application that uses the component library. It includes:

- **Authentication**: Login, logout, and initial setup for first user
- **Master Data Management**:
  - User management (CRUD operations)
  - Customer management
  - Product catalog management
  - Address management
- **Order Management**:
  - Order listing and search
  - Order entry with multi-step workflow
  - Order status tracking (Draft → Approval → Confirmation → Shipping → Invoicing → Payment → History)
  - Order item management
- **Integration**: Full integration with Spring Boot backend APIs
- **Internationalization**: English and Japanese language support
- **WebSocket**: Real-time updates and notifications
- **Theme Support**: Light/dark mode switching

Run `pnpm dev:my-app` to start the development server.

### Electron Application (my-electron)

The Electron application (`apps/my-electron`) provides a desktop version of the application.

Run `pnpm dev:electron` to start the Electron development environment, or use `pnpm app` to run the main app with Electron.

