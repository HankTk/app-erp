# DOMエレメントからソースコードの位置を特定する方法

Emotionのstyledコンポーネントは自動生成されたクラス名を使用するため、DOMエレメントからソースコードの位置を特定するのが困難です。このドキュメントでは、デバッグを容易にするための方法を説明します。

## 方法1: data属性を使用する（推奨）

`debugProps`ヘルパー関数を使用して、DOMエレメントにデバッグ情報を追加できます。

### 基本的な使用方法

```tsx
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountPayableDetailPage';

const PageContainer = styled.div`
  /* ... styles ... */
`;

// コンポーネント内で使用
<PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
  {/* ... */}
</PageContainer>
```

### ブラウザでの確認方法

1. ブラウザの開発者ツールを開く（F12）
2. 要素を選択（またはElementsタブで確認）
3. 選択した要素の属性を確認：
   - `id="AccountPayableDetailPage-PageContainer"` - **ID属性（検索しやすい）**
   - `data-component="AccountPayableDetailPage"` - コンポーネント名
   - `data-element="PageContainer"` - 要素名
   - `data-testid="AccountPayableDetailPage-PageContainer"` - テスト用ID
   - `data-file="src/pages/accountPayable/AccountPayableDetailPage.tsx"` - **ファイルパス（直接開ける）**
   - `data-debug="AccountPayableDetailPage.PageContainer"` - 検索用の短縮形式

4. ソースコード内で検索：
   - **方法1（推奨）**: `id`属性で検索（例: `AccountPayableDetailPage-PageContainer`）
   - **方法2**: `data-file`属性のファイルパスを直接開く
   - **方法3**: `data-component`でコンポーネントファイルを検索
   - **方法4**: `data-element`で該当する要素を検索

### 開発者ツールでの検索方法

**Elementsタブで検索:**
- `Ctrl+F` (Windows) または `Cmd+F` (Mac) で検索バーを開く
- `id="AccountPayableDetailPage-PageContainer"` で検索
- または `data-debug="AccountPayableDetailPage.PageContainer"` で検索

**Consoleタブで検索:**
```javascript
// 特定の要素を検索
document.querySelector('[data-component="AccountPayableDetailPage"]');
document.querySelector('#AccountPayableDetailPage-PageContainer');

// すべてのデバッグ要素を一覧表示
document.querySelectorAll('[data-debug]');
```

### より詳細な情報を追加する場合

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

## 方法2: React DevToolsを使用する

React DevTools拡張機能を使用すると、コンポーネントツリーから直接ソースコードにジャンプできます。

1. React DevToolsをインストール（Chrome/Firefox拡張機能）
2. 開発者ツールで「Components」タブを開く
3. コンポーネントツリーから該当するコンポーネントを選択
4. 右クリック → 「Show source」でソースコードを表示

## 方法3: ソースマップを使用する

Viteは開発環境で自動的にソースマップを有効にしています。

1. 開発者ツールの「Sources」タブを開く
2. 元のソースファイル（`.tsx`ファイル）が表示されます
3. ブレークポイントを設定してデバッグできます

## 方法4: ブラウザの検索機能を使用する

1. 開発者ツールで要素を選択
2. 生成されたクラス名（例: `css-1a2b3c`）をコピー
3. ソースコード内で検索（ただし、これはあまり効果的ではありません）

## ベストプラクティス

1. **主要なコンポーネントに`debugProps`を追加**
   - ページレベルのコンテナ
   - 再利用可能なコンポーネント
   - 複雑なレイアウト要素

2. **コンポーネント名を定数として定義**
   ```tsx
   const COMPONENT_NAME = 'AccountPayableDetailPage';
   ```

3. **開発環境でのみ有効**
   - `debugProps`は開発環境でのみ動作します
   - 本番環境では何も追加されません（パフォーマンスへの影響なし）

## 例: AccountPayableDetailPageでの実装

```tsx
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountPayableDetailPage';

// styledコンポーネントの定義
const PageContainer = styled.div`...`;
const HeaderCard = styled(AxCard)`...`;

// 使用
<PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
  <HeaderCard {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
    {/* ... */}
  </HeaderCard>
</PageContainer>
```

## トラブルシューティング

### data属性が表示されない場合

- `process.env.NODE_ENV === 'development'`であることを確認
- 開発サーバーを再起動
- ブラウザのキャッシュをクリア

### 要素が見つからない場合

- React DevToolsでコンポーネントツリーを確認
- コンソールで `enableClickDebug()` を実行して、クリックした要素の情報を表示

## 方法5: コンソールヘルパー関数を使用する

`debugHelper.ts` に便利な関数が用意されています。ブラウザのコンソールで使用できます。

### クリックデバッグを有効化

```javascript
// コンソールに貼り付けて実行
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

### 要素を検索

```javascript
// 特定のコンポーネントの要素を検索
document.querySelectorAll('[data-component="AccountPayableDetailPage"]');

// 特定の要素名を検索
document.querySelectorAll('[data-element="PageContainer"]');

// IDで検索（最も簡単）
document.getElementById('AccountPayableDetailPage-PageContainer');
```

### すべてのデバッグ要素を一覧表示

```javascript
Array.from(document.querySelectorAll('[data-debug]')).map(el => ({
  component: el.getAttribute('data-component'),
  element: el.getAttribute('data-element'),
  file: el.getAttribute('data-file'),
}));
```

## 参考リンク

- [Emotion公式ドキュメント](https://emotion.sh/docs/introduction)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Viteソースマップ設定](https://vitejs.dev/config/build-options.html#build-sourcemap)

