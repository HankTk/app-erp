/**
 * DOMエレメントからソースコードを特定するための追加ヘルパー
 * 
 * このファイルには、ブラウザの開発者ツールで使用できる便利な関数が含まれています。
 * コンソールにコピー＆ペーストして使用できます。
 */

/**
 * 要素をクリックしたときに、その要素のデバッグ情報をコンソールに表示する
 * 使用方法: ブラウザのコンソールに貼り付けて実行
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
 * 特定のコンポーネント名で要素を検索
 */
export const findElementsByComponent = (componentName: string) => {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll(`[data-component="${componentName}"]`));
};

/**
 * 特定の要素名で要素を検索
 */
export const findElementsByElement = (elementName: string) => {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll(`[data-element="${elementName}"]`));
};

/**
 * すべてのデバッグ要素を一覧表示
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


