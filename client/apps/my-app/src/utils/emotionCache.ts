/**
 * Debug helper to identify source code location from DOM elements
 * 
 * Emotion styled components use auto-generated class names, making it difficult
 * to identify the source code location from DOM elements. This helper function
 * allows adding debug information through data attributes.
 * 
 * Usage:
 * 1. Select an element in the browser developer tools
 * 2. Check the data-component and data-element attributes
 * 3. Search for the corresponding component name and element name in the source code
 * 
 * Example: <PageContainer {...debugProps('AccountPayableDetailPage', 'PageContainer')}>
 *          → Adds data-component="AccountPayableDetailPage" data-element="PageContainer" to the DOM
 */

/**
 * Helper function to add debug data attributes
 * 
 * @param componentName - Component name (e.g., 'AccountPayableDetailPage')
 * @param elementName - Element name (e.g., 'PageContainer')
 * @returns Object containing data attributes (development environment only)
 * 
 * @example
 * ```tsx
 * <PageContainer {...debugProps('AccountPayableDetailPage', 'PageContainer')}>
 *   ...
 * </PageContainer>
 * ```
 */
export const debugProps = (componentName: string, elementName: string) => {
  // In Vite, use import.meta.env.DEV for development mode detection
  // This is more reliable than process.env.NODE_ENV in Vite projects
  // @ts-ignore - import.meta.env is available in Vite
  const isDev = import.meta.env?.DEV === true || (typeof import.meta.env?.DEV === 'undefined' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV));
  
  if (isDev) {
    // Get caller file path from stack trace
    let filePath = '';
    try {
      const stack = new Error().stack;
      if (stack) {
        // Extract file path from stack trace
        const stackLines = stack.split('\n');
        // Usually, line 3 contains the caller file information
        const callerLine = stackLines[3] || stackLines[2] || '';
        // Extract file path (e.g., "at Object.<anonymous> (http://localhost:5173/src/pages/auth/WelcomePage.tsx:142:5)")
        const match = callerLine.match(/\(([^)]+\.tsx?):\d+:\d+\)/) || callerLine.match(/([^\/]+\.tsx?):\d+:\d+/);
        if (match && match[1]) {
          // Convert to relative path
          const fullPath = match[1];
          const srcIndex = fullPath.indexOf('/src/');
          if (srcIndex !== -1) {
            filePath = fullPath.substring(srcIndex + 1);
          } else {
            filePath = fullPath;
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }

    const testId = `${componentName}-${elementName}`;
    return {
      'id': testId, // Add id attribute (easy to find in developer tools)
      'data-component': componentName,
      'data-element': elementName,
      'data-testid': testId,
      ...(filePath && { 'data-file': filePath }), // Add file path
      'data-debug': `${componentName}.${elementName}`, // Search-friendly format
    };
  }
  return {};
};

/**
 * Helper with more detailed debug information
 * 
 * @param componentName - Component name
 * @param elementName - Element name
 * @param additionalInfo - Additional debug information (optional)
 * @returns Object containing data attributes (development environment only)
 * 
 * @example
 * ```tsx
 * <Step 
 *   {...debugPropsWithLocation('AccountPayableDetailPage', 'Step', { 
 *     'data-step': 'invoice' 
 *   })}
 * >
 *   ...
 * </Step>
 * ```
 */
export const debugPropsWithLocation = (
  componentName: string,
  elementName: string,
  additionalInfo?: Record<string, string>
) => {
  // In Vite, use import.meta.env.DEV for development mode detection
  // @ts-ignore - import.meta.env is available in Vite
  const isDev = import.meta.env?.DEV === true || (typeof import.meta.env?.DEV === 'undefined' && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV));
  
  if (isDev) {
    // Get caller file path
    let filePath = '';
    try {
      const stack = new Error().stack;
      if (stack) {
        const stackLines = stack.split('\n');
        const callerLine = stackLines[3] || stackLines[2] || '';
        const match = callerLine.match(/\(([^)]+\.tsx?):\d+:\d+\)/) || callerLine.match(/([^\/]+\.tsx?):\d+:\d+/);
        if (match && match[1]) {
          const fullPath = match[1];
          const srcIndex = fullPath.indexOf('/src/');
          if (srcIndex !== -1) {
            filePath = fullPath.substring(srcIndex + 1);
          } else {
            filePath = fullPath;
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }

    const testId = `${componentName}-${elementName}`;
    return {
      'id': testId,
      'data-component': componentName,
      'data-element': elementName,
      'data-testid': testId,
      ...(filePath && { 'data-file': filePath }),
      'data-debug': `${componentName}.${elementName}`,
      ...additionalInfo,
    };
  }
  return {};
};

