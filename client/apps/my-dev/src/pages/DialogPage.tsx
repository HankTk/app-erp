import { useState } from 'react';
import {
  AxDialog,
  AxButton,
  AxButtonGroup,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxInput,
  AxLabel,
} from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function DialogPage() {
  const { l10n } = useI18n();
  const [openBasic, setOpenBasic] = useState(false);
  const [openWithTitle, setOpenWithTitle] = useState(false);
  const [openSmall, setOpenSmall] = useState(false);
  const [openLarge, setOpenLarge] = useState(false);
  const [openFullscreen, setOpenFullscreen] = useState(false);
  const [openWithFooter, setOpenWithFooter] = useState(false);
  const [openNoClose, setOpenNoClose] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  return (
    <>
      <AxCard padding="large" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="dialog.basic" /></AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-xl)' }}>
          <I18N l10n="dialog.basicDescription" />
        </AxParagraph>
        <AxButton onClick={() => setOpenBasic(true)}><I18N l10n="dialog.openBasic" /></AxButton>
        <AxDialog open={openBasic} onClose={() => setOpenBasic(false)} okButtonText={l10n('dialog.ok')}>
          <AxParagraph>
            <I18N l10n="dialog.basicMessage" />
          </AxParagraph>
        </AxDialog>
      </AxCard>

      <AxCard padding="large" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="dialog.withTitle" /></AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-xl)' }}>
          <I18N l10n="dialog.withTitleDescription" />
        </AxParagraph>
        <AxButton onClick={() => setOpenWithTitle(true)}><I18N l10n="dialog.openWithTitle" /></AxButton>
        <AxDialog
          open={openWithTitle}
          onClose={() => setOpenWithTitle(false)}
          title={l10n('dialog.title')}
          okButtonText={l10n('dialog.ok')}
        >
          <AxParagraph>
            <I18N l10n="dialog.withTitleMessage" />
          </AxParagraph>
        </AxDialog>
      </AxCard>

      <AxCard padding="large" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="dialog.sizes" /></AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-xl)' }}>
          <I18N l10n="dialog.sizesDescription" />
        </AxParagraph>
        <AxButtonGroup>
          <AxButton onClick={() => setOpenSmall(true)}><I18N l10n="dialog.small" /></AxButton>
          <AxButton onClick={() => setOpenLarge(true)}><I18N l10n="dialog.large" /></AxButton>
          <AxButton onClick={() => setOpenFullscreen(true)}><I18N l10n="dialog.fullscreen" /></AxButton>
        </AxButtonGroup>

        <AxDialog
          open={openSmall}
          onClose={() => setOpenSmall(false)}
          title={l10n('dialog.smallTitle')}
          size="small"
          okButtonText={l10n('dialog.ok')}
        >
          <AxParagraph><I18N l10n="dialog.smallMessage" /></AxParagraph>
        </AxDialog>

        <AxDialog
          open={openLarge}
          onClose={() => setOpenLarge(false)}
          title={l10n('dialog.largeTitle')}
          size="large"
          okButtonText={l10n('dialog.ok')}
        >
          <AxParagraph><I18N l10n="dialog.largeMessage" /></AxParagraph>
          <AxParagraph style={{ marginTop: 'var(--spacing-md)' }}>
            <I18N l10n="dialog.largeMessage2" />
          </AxParagraph>
        </AxDialog>

        <AxDialog
          open={openFullscreen}
          onClose={() => setOpenFullscreen(false)}
          title={l10n('dialog.fullscreenTitle')}
          size="fullscreen"
          okButtonText={l10n('dialog.ok')}
        >
          <AxParagraph><I18N l10n="dialog.fullscreenMessage" /></AxParagraph>
          <AxParagraph style={{ marginTop: 'var(--spacing-md)' }}>
            <I18N l10n="dialog.fullscreenMessage2" />
          </AxParagraph>
        </AxDialog>
      </AxCard>

      <AxCard padding="large" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="dialog.withFooter" /></AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-xl)' }}>
          <I18N l10n="dialog.withFooterDescription" />
        </AxParagraph>
        <AxButton onClick={() => setOpenWithFooter(true)}><I18N l10n="dialog.openWithFooter" /></AxButton>
        <AxDialog
          open={openWithFooter}
          onClose={() => setOpenWithFooter(false)}
          title={l10n('dialog.confirmAction')}
          footer={
            <>
              <AxButton variant="secondary" onClick={() => setOpenWithFooter(false)}>
                <I18N l10n="dialog.cancel" />
              </AxButton>
              <AxButton variant="primary" onClick={() => setOpenWithFooter(false)}>
                <I18N l10n="dialog.confirm" />
              </AxButton>
            </>
          }
        >
          <AxParagraph><I18N l10n="dialog.confirmMessage" /></AxParagraph>
        </AxDialog>
      </AxCard>

      <AxCard padding="large" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="dialog.options" /></AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-xl)' }}>
          <I18N l10n="dialog.optionsDescription" />
        </AxParagraph>
        <AxButton onClick={() => setOpenNoClose(true)}><I18N l10n="dialog.openNoClose" /></AxButton>
        <AxDialog
          open={openNoClose}
          onClose={() => setOpenNoClose(false)}
          title={l10n('dialog.noCloseTitle')}
          showCloseButton={false}
          okButtonText={l10n('dialog.ok')}
        >
          <AxParagraph>
            <I18N l10n="dialog.noCloseMessage" />
          </AxParagraph>
        </AxDialog>
      </AxCard>

      <AxCard padding="large">
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="dialog.form" /></AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-xl)' }}>
          <I18N l10n="dialog.formDescription" />
        </AxParagraph>
        <AxButton onClick={() => setOpenForm(true)}><I18N l10n="dialog.openForm" /></AxButton>
        <AxDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          title={l10n('dialog.userInformation')}
          size="large"
          footer={
            <>
              <AxButton variant="secondary" onClick={() => setOpenForm(false)}>
                <I18N l10n="dialog.cancel" />
              </AxButton>
              <AxButton variant="primary" onClick={() => setOpenForm(false)}>
                <I18N l10n="dialog.save" />
              </AxButton>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
              <AxLabel><I18N l10n="dialog.name" /></AxLabel>
              <AxInput placeholder={l10n('dialog.enterName')} style={{ marginTop: 'var(--spacing-xs)' }} />
            </div>
            <div>
              <AxLabel><I18N l10n="dialog.email" /></AxLabel>
              <AxInput
                type="email"
                placeholder={l10n('dialog.enterEmail')}
                style={{ marginTop: 'var(--spacing-xs)' }}
              />
            </div>
            <div>
              <AxLabel><I18N l10n="dialog.message" /></AxLabel>
              <AxInput
                placeholder={l10n('dialog.enterMessage')}
                style={{ marginTop: 'var(--spacing-xs)' }}
              />
            </div>
          </div>
        </AxDialog>
      </AxCard>
    </>
  );
}

