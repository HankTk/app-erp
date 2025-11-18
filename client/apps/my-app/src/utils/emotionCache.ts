/**
 * DOMエレメントからソースコードの位置を特定するためのデバッグヘルパー
 * 
 * Emotionのstyledコンポーネントは自動生成されたクラス名を使用するため、
 * DOMエレメントからソースコードの位置を特定するのが困難です。
 * このヘルパー関数を使用することで、data属性を通じてデバッグ情報を追加できます。
 * 
 * 使用方法:
 * 1. ブラウザの開発者ツールで要素を選択
 * 2. data-component属性とdata-element属性を確認
 * 3. ソースコード内で該当するコンポーネント名と要素名を検索
 * 
 * 例: <PageContainer {...debugProps('AccountPayableDetailPage', 'PageContainer')}>
 *     → DOM上では data-component="AccountPayableDetailPage" data-element="PageContainer" が追加される
 */

/**
 * デバッグ用のdata属性を追加するヘルパー関数
 * 
 * @param componentName - コンポーネント名（例: 'AccountPayableDetailPage'）
 * @param elementName - 要素名（例: 'PageContainer'）
 * @returns data属性を含むオブジェクト（開発環境のみ）
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
    // 呼び出し元のファイルパスを取得（スタックトレースから）
    let filePath = '';
    try {
      const stack = new Error().stack;
      if (stack) {
        // スタックトレースからファイルパスを抽出
        const stackLines = stack.split('\n');
        // 通常、3行目が呼び出し元のファイル情報を含む
        const callerLine = stackLines[3] || stackLines[2] || '';
        // ファイルパスを抽出（例: "at Object.<anonymous> (http://localhost:5173/src/pages/auth/WelcomePage.tsx:142:5)"）
        const match = callerLine.match(/\(([^)]+\.tsx?):\d+:\d+\)/) || callerLine.match(/([^\/]+\.tsx?):\d+:\d+/);
        if (match && match[1]) {
          // 相対パスに変換
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
      // エラーが発生した場合は無視
    }

    const testId = `${componentName}-${elementName}`;
    return {
      'id': testId, // id属性を追加（開発者ツールで見つけやすい）
      'data-component': componentName,
      'data-element': elementName,
      'data-testid': testId,
      ...(filePath && { 'data-file': filePath }), // ファイルパスを追加
      'data-debug': `${componentName}.${elementName}`, // 検索しやすい形式
    };
  }
  return {};
};

/**
 * より詳細なデバッグ情報を含むヘルパー
 * 
 * @param componentName - コンポーネント名
 * @param elementName - 要素名
 * @param additionalInfo - 追加のデバッグ情報（オプション）
 * @returns data属性を含むオブジェクト（開発環境のみ）
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
    // 呼び出し元のファイルパスを取得
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
      // エラーが発生した場合は無視
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

