import React from 'react';

const colorMap = {
  purple: 'tag-purple',
  green: 'tag-green',
  blue: 'tag-blue',
  orange: 'tag-orange',
  red: 'tag-red',
  default: 'tag-purple',
};

function Badge({ children, color = 'purple', size = 'sm', dot = false, className = '', style = {} }) {
  const cls = colorMap[color] || colorMap.default;
  const fontSize = size === 'xs' ? '10px' : '11px';
  const padding = size === 'xs' ? '1px 7px' : '2px 10px';

  return (
    <span
      className={`${cls} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize,
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        padding,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'currentColor',
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}

export default Badge;
