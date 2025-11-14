import { useState, useEffect } from 'react';
import {
  AxCard,
  AxHeading3,
  AxProgress,
  AxParagraph,
} from '@ui/components';
import { I18N } from '../i18n/I18nProvider';
import styled from 'styled-components';

const ProgressGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
`;

const ProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
`;

const ProgressLabel = styled.div`
  min-width: 120px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
`;

export function ProgressPage() {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AxCard padding="large">
      <AxHeading3><I18N l10n="progress.lineVariants" /></AxHeading3>
      <ProgressGroup>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.primary" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={75} variant="primary" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.secondary" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={60} variant="secondary" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.success" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={90} variant="success" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.danger" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={40} variant="danger" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
      </ProgressGroup>

      <AxHeading3><I18N l10n="progress.lineSizes" /></AxHeading3>
      <ProgressGroup>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.small" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={50} size="small" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.medium" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={50} size="medium" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.large" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={50} size="large" showLabel />
            </div>
          </ProgressRow>
        </ProgressItem>
      </ProgressGroup>

      <AxHeading3><I18N l10n="progress.circleVariants" /></AxHeading3>
      <ProgressGroup>
        <ProgressRow>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.primary" /></ProgressLabel>
            <AxProgress value={75} variant="primary" type="circle" size="medium" showLabel />
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.secondary" /></ProgressLabel>
            <AxProgress value={60} variant="secondary" type="circle" size="medium" showLabel />
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.success" /></ProgressLabel>
            <AxProgress value={90} variant="success" type="circle" size="medium" showLabel />
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.danger" /></ProgressLabel>
            <AxProgress value={40} variant="danger" type="circle" size="medium" showLabel />
          </ProgressItem>
        </ProgressRow>
      </ProgressGroup>

      <AxHeading3><I18N l10n="progress.circleSizes" /></AxHeading3>
      <ProgressGroup>
        <ProgressRow>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.small" /></ProgressLabel>
            <AxProgress value={65} type="circle" size="small" showLabel />
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.medium" /></ProgressLabel>
            <AxProgress value={65} type="circle" size="medium" showLabel />
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel><I18N l10n="progress.large" /></ProgressLabel>
            <AxProgress value={65} type="circle" size="large" showLabel />
          </ProgressItem>
        </ProgressRow>
      </ProgressGroup>

      <AxHeading3><I18N l10n="progress.animated" /></AxHeading3>
      <ProgressGroup>
        <ProgressItem>
          <AxParagraph><I18N l10n="progress.animatedDescription" /></AxParagraph>
          <div style={{ maxWidth: '400px' }}>
            <AxProgress value={progressValue} variant="primary" showLabel />
          </div>
        </ProgressItem>
        <ProgressRow>
          <AxProgress value={progressValue} variant="primary" type="circle" size="medium" showLabel />
          <AxProgress value={progressValue} variant="success" type="circle" size="medium" showLabel />
          <AxProgress value={progressValue} variant="secondary" type="circle" size="medium" showLabel />
        </ProgressRow>
      </ProgressGroup>

      <AxHeading3><I18N l10n="progress.customLabels" /></AxHeading3>
      <ProgressGroup>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.customLabel" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={85} variant="success" showLabel label="Almost Complete" />
            </div>
          </ProgressRow>
        </ProgressItem>
        <ProgressItem>
          <ProgressRow>
            <ProgressLabel><I18N l10n="progress.noLabel" /></ProgressLabel>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <AxProgress value={65} variant="primary" />
            </div>
          </ProgressRow>
        </ProgressItem>
      </ProgressGroup>
    </AxCard>
  );
}

