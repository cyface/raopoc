import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepNames = [
  'Product Selection',
  'Personal Information',
  'Identification',
  'Document Review',
  'Confirmation'
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const { styles } = useTheme();
  const visibleSteps = stepNames.slice(1, 4);

  return (
    <div className={styles.stepIndicator}>
      {visibleSteps.map((name, index) => {
        const stepNumber = index + 2;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className={styles.stepItem}>
              <div className={`${styles.stepDot} ${isActive ? styles.activeStep : ''} ${isCompleted ? styles.completedStep : ''}`}>
                {stepNumber}
              </div>
              <div className={styles.stepLabel}>
                {name}
              </div>
            </div>
            {index < visibleSteps.length - 1 && (
              <div className={`${styles.stepConnector} ${stepNumber < currentStep ? styles.completedStep : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};