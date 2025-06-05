import React from 'react';
import { useTheme } from '../context/ThemeContext';
import type { Country } from '../services/configService';

interface CountrySelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  id,
  label,
  value,
  onChange,
  countries,
  error,
  autoComplete = "country",
  placeholder = "Select a country"
}) => {
  const { styles } = useTheme();

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
        <option value="">{placeholder}</option>
        {countries.map(country => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};