import { useState } from 'react';
import {
  AxButton,
  AxCard,
  AxButtonGroup,
  AxHeading3,
  AxTypographyExample,
  AxTypographyRow,
  AxTypographyLabel,
  AxSpacingExample,
  AxSpacingRow,
  AxSpacingVisual,
  AxSpacingBox,
  AxSpacingInfo,
  AxSpacingItem,
  AxSpacingLabel,
  AxSpacingValue,
  AxDialog,
  AxParagraph,
} from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function ButtonPage()
{
  const { l10n } = useI18n();
  const [primaryDialogOpen, setPrimaryDialogOpen] = useState(false);
  const [secondaryDialogOpen, setSecondaryDialogOpen] = useState(false);
  const [dangerDialogOpen, setDangerDialogOpen] = useState(false);

  return (
    <AxCard padding="large">
      <AxHeading3><I18N l10n="button.variants" /></AxHeading3>
      <AxButtonGroup>
        <AxButton variant="primary" onClick={() => setPrimaryDialogOpen(true)}>
          <I18N l10n="button.primary" />
        </AxButton>
        <AxButton variant="secondary" onClick={() => setSecondaryDialogOpen(true)}>
          <I18N l10n="button.secondary" />
        </AxButton>
        <AxButton variant="danger" onClick={() => setDangerDialogOpen(true)}>
          <I18N l10n="button.danger" />
        </AxButton>
      </AxButtonGroup>

      <AxDialog
        open={primaryDialogOpen}
        onClose={() => setPrimaryDialogOpen(false)}
        title={l10n('button.primaryClicked')}
        okButtonText={l10n('dialog.ok')}
      >
        <AxParagraph>
          <I18N l10n="button.primaryClickedMessage" />
        </AxParagraph>
      </AxDialog>

      <AxDialog
        open={secondaryDialogOpen}
        onClose={() => setSecondaryDialogOpen(false)}
        title={l10n('button.secondaryClicked')}
        okButtonText={l10n('dialog.ok')}
      >
        <AxParagraph>
          <I18N l10n="button.secondaryClickedMessage" />
        </AxParagraph>
      </AxDialog>

      <AxDialog
        open={dangerDialogOpen}
        onClose={() => setDangerDialogOpen(false)}
        title={l10n('button.dangerClicked')}
        okButtonText={l10n('dialog.ok')}
      >
        <AxParagraph>
          <I18N l10n="button.dangerClickedMessage" />
        </AxParagraph>
      </AxDialog>

      <AxHeading3><I18N l10n="button.sizes" /></AxHeading3>
      <AxButtonGroup>
        <AxButton size="small"><I18N l10n="button.small" /></AxButton>
        <AxButton size="medium"><I18N l10n="button.medium" /></AxButton>
        <AxButton size="large"><I18N l10n="button.large" /></AxButton>
      </AxButtonGroup>

      <AxHeading3><I18N l10n="button.states" /></AxHeading3>
      <AxButtonGroup>
        <AxButton><I18N l10n="button.normal" /></AxButton>
        <AxButton disabled><I18N l10n="button.disabled" /></AxButton>
        <AxButton fullWidth><I18N l10n="button.fullWidth" /></AxButton>
      </AxButtonGroup>

      <AxHeading3><I18N l10n="button.typographyExamples" /></AxHeading3>
      <AxTypographyExample>
        <AxTypographyRow>
          <AxTypographyLabel><I18N l10n="button.fontSizes" /></AxTypographyLabel>
          <AxButton fontSize="var(--font-size-xs)" size="small">
            XS (12px)
          </AxButton>
          <AxButton fontSize="var(--font-size-sm)" size="small">
            SM (14px)
          </AxButton>
          <AxButton fontSize="var(--font-size-base)">
            Base (15px)
          </AxButton>
          <AxButton fontSize="var(--font-size-md)">
            MD (16px)
          </AxButton>
          <AxButton fontSize="var(--font-size-lg)">
            LG (18px)
          </AxButton>
        </AxTypographyRow>
        <AxTypographyRow>
          <AxTypographyLabel><I18N l10n="button.fontWeights" /></AxTypographyLabel>
          <AxButton fontWeight="var(--font-weight-normal)">
            <I18N l10n="button.normal" />
          </AxButton>
          <AxButton fontWeight="var(--font-weight-medium)">
            <I18N l10n="button.medium" />
          </AxButton>
          <AxButton fontWeight="var(--font-weight-semibold)">
            <I18N l10n="button.semibold" />
          </AxButton>
          <AxButton fontWeight="var(--font-weight-bold)">
            <I18N l10n="button.bold" />
          </AxButton>
        </AxTypographyRow>
        <AxTypographyRow>
          <AxTypographyLabel><I18N l10n="button.combinations" /></AxTypographyLabel>
          <AxButton
            fontSize="var(--font-size-lg)"
            fontWeight="var(--font-weight-bold)"
          >
            <I18N l10n="button.largeBold" />
          </AxButton>
          <AxButton
            fontSize="var(--font-size-sm)"
            fontWeight="var(--font-weight-semibold)"
            size="small"
          >
            <I18N l10n="button.smallSemibold" />
          </AxButton>
          <AxButton
            fontSize="var(--font-size-xl)"
            fontWeight="var(--font-weight-medium)"
          >
            <I18N l10n="button.xlMedium" />
          </AxButton>
        </AxTypographyRow>
      </AxTypographyExample>

      <AxHeading3><I18N l10n="button.spacingExamples" /></AxHeading3>
      <AxSpacingExample>
        <AxSpacingRow>
          <AxTypographyLabel><I18N l10n="button.spacingTokens" /></AxTypographyLabel>
          <AxSpacingInfo>
            <AxSpacingItem>
              <AxSpacingLabel>XS</AxSpacingLabel>
              <AxSpacingValue>--spacing-xs: 4px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-xs)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>SM</AxSpacingLabel>
              <AxSpacingValue>--spacing-sm: 8px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-sm)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>MD</AxSpacingLabel>
              <AxSpacingValue>--spacing-md: 12px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-md)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>LG</AxSpacingLabel>
              <AxSpacingValue>--spacing-lg: 16px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-lg)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>XL</AxSpacingLabel>
              <AxSpacingValue>--spacing-xl: 20px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-xl)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>2XL</AxSpacingLabel>
              <AxSpacingValue>--spacing-2xl: 24px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-2xl)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>3XL</AxSpacingLabel>
              <AxSpacingValue>--spacing-3xl: 32px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-3xl)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>4XL</AxSpacingLabel>
              <AxSpacingValue>--spacing-4xl: 40px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-4xl)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>5XL</AxSpacingLabel>
              <AxSpacingValue>--spacing-5xl: 48px</AxSpacingValue>
              <AxSpacingVisual spacing="var(--spacing-5xl)">
                <AxSpacingBox>1</AxSpacingBox>
                <AxSpacingBox>2</AxSpacingBox>
              </AxSpacingVisual>
            </AxSpacingItem>
          </AxSpacingInfo>
        </AxSpacingRow>
        <AxSpacingRow>
          <AxTypographyLabel><I18N l10n="button.buttonSpacingExamples" /></AxTypographyLabel>
          <AxSpacingInfo>
            <AxSpacingItem>
              <AxSpacingLabel>Gap: XS (4px)</AxSpacingLabel>
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                <AxButton size="small">Button 1</AxButton>
                <AxButton size="small">Button 2</AxButton>
                <AxButton size="small">Button 3</AxButton>
              </div>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>Gap: MD (12px)</AxSpacingLabel>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <AxButton>Button 1</AxButton>
                <AxButton>Button 2</AxButton>
                <AxButton>Button 3</AxButton>
              </div>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>Gap: XL (20px)</AxSpacingLabel>
              <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
                <AxButton>Button 1</AxButton>
                <AxButton>Button 2</AxButton>
                <AxButton>Button 3</AxButton>
              </div>
            </AxSpacingItem>
            <AxSpacingItem>
              <AxSpacingLabel>Gap: 2XL (24px)</AxSpacingLabel>
              <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', flexWrap: 'wrap' }}>
                <AxButton size="large">Button 1</AxButton>
                <AxButton size="large">Button 2</AxButton>
                <AxButton size="large">Button 3</AxButton>
              </div>
            </AxSpacingItem>
          </AxSpacingInfo>
        </AxSpacingRow>
      </AxSpacingExample>
    </AxCard>
  );
}

