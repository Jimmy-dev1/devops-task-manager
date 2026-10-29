import { useState } from 'react';

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  maxLength,
  required = false,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrap">
        <input
          id={id}
          className="auth-password-input"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={id}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {visible ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.3 4.2 9 7-.3 1.1-1 2.3-2 3.4" />
                <path d="M6.2 6.2C3.8 7.7 2.4 10 2 12c.7 2.8 4 7 10 7 1.1 0 2.1-.2 3-.5" />
              </>
            ) : (
              <>
                <path d="M2 12s3.3-7 10-7 10 7 10 7-3.3 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
    </>
  );
};

export default PasswordInput;
