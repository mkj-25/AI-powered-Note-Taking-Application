import React, { forwardRef, useState } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    iconRight: IconRight,
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled,
    className = '',
    style = {},
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }} className={className}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--accent)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: focused && !error ? '0 0 0 3px var(--accent-light)' : 'none',
        }}
      >
        {Icon && (
          <Icon
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              color: focused ? 'var(--accent)' : 'var(--text-muted)',
              flexShrink: 0,
            }}
          />
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            padding: `10px ${IconRight ? '36px' : '14px'} 10px ${Icon ? '36px' : '14px'}`,
            width: '100%',
            fontFamily: 'inherit',
          }}
          {...props}
        />
        {IconRight && (
          <div style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <IconRight size={15} />
          </div>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
});

export default Input;
