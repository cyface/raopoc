import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import type { State } from '../services/configService';

interface StateSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  states: State[];
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

export const StateSelect: React.FC<StateSelectProps> = ({
  id,
  label,
  value,
  onChange,
  states,
  error,
  autoComplete = "address-level1",
  placeholder
}) => {
  const { t } = useTranslation();
  const { styles } = useTheme();
  
  const defaultPlaceholder = placeholder || t('customerInfo.placeholders.selectState');

  return (
    <div className={styles.formField}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      >
        <option value="">{defaultPlaceholder}</option>
        {states.map(state => (
          <option key={state.code} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};