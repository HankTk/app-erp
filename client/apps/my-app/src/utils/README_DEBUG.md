# How to Identify Source Code Location from DOM Elements

Since Emotion's styled components use auto-generated class names, it's difficult to identify the source code location from DOM elements. This document explains methods to make debugging easier.

## Method 1: Using data attributes (Recommended)

You can add debug information to DOM elements using the `debugProps` helper function.

### Basic Usage

```tsx
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountPayableDetailPage';

const PageContainer = styled.div`
  /* ... styles ... */
`;

// Use in component
<PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
  {/* ... */}
</PageContainer>
```

### How to Check in Browser

1. Open browser developer tools (F12)
2. Select element (or check in Elements tab)
3. Check attributes of selected element:
   - `id="AccountPayableDetailPage-PageContainer"` - **ID attribute (easy to search)**
   - `data-component="AccountPayableDetailPage"` - Component name
   - `data-element="PageContainer"` - Element name
   - `data-testid="AccountPayableDetailPage-PageContainer"` - Test ID
   - `data-file="src/pages/accountPayable/AccountPayableDetailPage.tsx"` - **File path (can open directly)**
   - `data-debug="AccountPayableDetailPage.PageContainer"` - Short form for searching

4. Search in source code:
   - **Method 1 (Recommended)**: Search by `id` attribute (e.g., `AccountPayableDetailPage-PageContainer`)
   - **Method 2**: Open file path from `data-file` attribute directly
   - **Method 3**: Search component file by `data-component`
   - **Method 4**: Search corresponding element by `data-element`

### How to Search in Developer Tools

**Search in Elements tab:**
- Press `Ctrl+F` (Windows) or `Cmd+F` (Mac) to open search bar
- Search for `id="AccountPayableDetailPage-PageContainer"`
- Or search for `data-debug="AccountPayableDetailPage.PageContainer"`

**Search in Console tab:**
```javascript
// Search for specific element
document.querySelector('[data-component="AccountPayableDetailPage"]');
document.querySelector('#AccountPayableDetailPage-PageContainer');

// List all debug elements
document.querySelectorAll('[data-debug]');
```

### Adding More Detailed Information

```tsx
import { debugPropsWithLocation } from '../../utils/emotionCache';

<Step 
  {...debugPropsWithLocation('AccountPayableDetailPage', 'Step', { 
    'data-step': 'invoice' 
  })}
>
  {/* ... */}
</Step>
```

## Method 2: Using React DevTools

Using the React DevTools extension, you can jump directly to source code from the component tree.

1. Install React DevTools (Chrome/Firefox extension)
2. Open "Components" tab in developer tools
3. Select corresponding component from component tree
4. Right-click → "Show source" to display source code

## Method 3: Using Source Maps

Vite automatically enables source maps in development environment.

1. Open "Sources" tab in developer tools
2. Original source files (`.tsx` files) will be displayed
3. You can set breakpoints and debug

## Method 4: Using Browser Search Function

1. Select element in developer tools
2. Copy generated class name (e.g., `css-1a2b3c`)
3. Search in source code (however, this is not very effective)

## Best Practices

1. **Add `debugProps` to major components**
   - Page-level containers
   - Reusable components
   - Complex layout elements

2. **Define component name as constant**
   ```tsx
   const COMPONENT_NAME = 'AccountPayableDetailPage';
   ```

3. **Enable only in development environment**
   - `debugProps` only works in development environment
   - Nothing is added in production (no performance impact)

## Example: Implementation in AccountPayableDetailPage

```tsx
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountPayableDetailPage';

// Define styled components
const PageContainer = styled.div`...`;
const HeaderCard = styled(AxCard)`...`;

// Usage
<PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
  <HeaderCard {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
    {/* ... */}
  </HeaderCard>
</PageContainer>
```

## Troubleshooting

### When data attributes are not displayed

- Verify that `process.env.NODE_ENV === 'development'`
- Restart development server
- Clear browser cache

### When element is not found

- Check component tree in React DevTools
- Execute `enableClickDebug()` in console to display information about clicked element

## Method 5: Using Console Helper Functions

Convenient functions are available in `debugHelper.ts`. You can use them in the browser console.

### Enable Click Debugging

```javascript
// Paste and execute in console
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-component]');
  if (target) {
    console.group('🔍 Debug Info');
    console.log('Component:', target.getAttribute('data-component'));
    console.log('Element:', target.getAttribute('data-element'));
    console.log('File:', target.getAttribute('data-file'));
    console.log('Test ID:', target.getAttribute('data-testid'));
    console.log('Element:', target);
    console.groupEnd();
  }
}, true);
```

### Search for Elements

```javascript
// Search for elements of specific component
document.querySelectorAll('[data-component="AccountPayableDetailPage"]');

// Search for specific element name
document.querySelectorAll('[data-element="PageContainer"]');

// Search by ID (easiest)
document.getElementById('AccountPayableDetailPage-PageContainer');
```

### List All Debug Elements

```javascript
Array.from(document.querySelectorAll('[data-debug]')).map(el => ({
  component: el.getAttribute('data-component'),
  element: el.getAttribute('data-element'),
  file: el.getAttribute('data-file'),
}));
```

## Reference Links

- [Emotion Official Documentation](https://emotion.sh/docs/introduction)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Source Map Configuration](https://vitejs.dev/config/build-options.html#build-sourcemap)
