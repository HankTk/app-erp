import { useState } from 'react';
import styled from 'styled-components';
import { ThemeProvider, useTheme, AxContainer, AxHeader, AxTitle, AxSubtitle, AxSection, AxSectionTitle } from '@ui/components';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { Sidebar } from './components/Sidebar';
import { Drawer } from './components/Drawer';
import { ButtonPage } from './pages/ButtonPage';
import { CardPage } from './pages/CardPage';
import { InputPage } from './pages/InputPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { RadioPage } from './pages/RadioPage';
import { CombinationPage } from './pages/CombinationPage';
import { TablePage } from './pages/TablePage';
import { ChartPage } from './pages/ChartPage';
import { DialogPage } from './pages/DialogPage';
import { DateRangePickerPage } from './pages/DateRangePickerPage';
import { ProgressPage } from './pages/ProgressPage';
import { ListboxPage } from './pages/ListboxPage';

const AxMainContent = styled.div`
  padding: var(--spacing-4xl) var(--spacing-xl);
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  margin-left: calc(280px / 2);
`;

const pages: Record<string, { component: React.ComponentType; titleKey: string }> = {
  button: { component: ButtonPage, titleKey: 'page.button' },
  card: { component: CardPage, titleKey: 'page.card' },
  input: { component: InputPage, titleKey: 'page.input' },
  checkbox: { component: CheckboxPage, titleKey: 'page.checkbox' },
  radio: { component: RadioPage, titleKey: 'page.radio' },
  table: { component: TablePage, titleKey: 'page.table' },
  chart: { component: ChartPage, titleKey: 'page.chart' },
  dialog: { component: DialogPage, titleKey: 'page.dialog' },
  combination: { component: CombinationPage, titleKey: 'page.combination' },
  dateRangePicker: { component: DateRangePickerPage, titleKey: 'page.dateRangePicker' },
  progress: { component: ProgressPage, titleKey: 'page.progress' },
  listbox: { component: ListboxPage, titleKey: 'page.listbox' },
};

function AppContent()
{
  const [currentPage, setCurrentPage] = useState('button');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const CurrentPageComponent = pages[currentPage]?.component || ButtonPage;
  const pageTitle = pages[currentPage] ? t(pages[currentPage].titleKey) : t('page.button');

  return (
    <AxContainer>
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <Drawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen(!drawerOpen)}
        theme={theme}
        onThemeChange={toggleTheme}
      />
      <AxMainContent>
        <AxHeader>
          <div>
            <AxTitle>{t('app.title')}</AxTitle>
            <AxSubtitle>{t('app.subtitle')}</AxSubtitle>
          </div>
        </AxHeader>
        <AxSection>
          <AxSectionTitle>{pageTitle}</AxSectionTitle>
          <CurrentPageComponent />
        </AxSection>
      </AxMainContent>
    </AxContainer>
  );
}

function App()
{
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
