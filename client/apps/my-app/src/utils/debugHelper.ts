/**
 * Additional helper to identify source code from DOM elements
 * 
 * This file contains convenient functions that can be used in browser developer tools.
 * You can copy and paste them into the console to use.
 */

/**
 * Display debug information in the console when an element is clicked
 * Usage: Copy and paste into the browser console to execute
 */
export const enableClickDebug = () => {
  if (typeof window === 'undefined') return;
  
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const closest = target.closest('[data-component]');
    
    if (closest) {
      const component = closest.getAttribute('data-component');
      const element = closest.getAttribute('data-element');
      const file = closest.getAttribute('data-file');
      const testId = closest.getAttribute('data-testid');
      
      console.group('🔍 Debug Info');
      console.log('Component:', component);
      console.log('Element:', element);
      console.log('File:', file);
      console.log('Test ID:', testId);
      if (file) {
        console.log('📁 Open file:', `src/${file}`);
      }
      console.log('Element:', closest);
      console.groupEnd();
    }
  }, true);
  
  console.log('✅ Click debug enabled. Click any element to see debug info.');
};

/**
 * Find elements by specific component name
 */
export const findElementsByComponent = (componentName: string) => {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll(`[data-component="${componentName}"]`));
};

/**
 * Find elements by specific element name
 */
export const findElementsByElement = (elementName: string) => {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll(`[data-element="${elementName}"]`));
};

/**
 * List all debug elements
 */
export const listAllDebugElements = () => {
  if (typeof document === 'undefined') return [];
  const elements = Array.from(document.querySelectorAll('[data-debug]'));
  const info = elements.map(el => ({
    component: el.getAttribute('data-component'),
    element: el.getAttribute('data-element'),
    file: el.getAttribute('data-file'),
    testId: el.getAttribute('data-testid'),
    element: el,
  }));
  console.table(info);
  return info;
};


