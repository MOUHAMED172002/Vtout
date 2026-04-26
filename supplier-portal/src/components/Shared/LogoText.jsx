import React from 'react';

const LogoText = ({ className = "text-2xl" }) => {
  return (
    <span className={`brand-vtout ${className}`}>
      <span className="brand-v">v</span>
      <span className="brand-tout">tout</span>
    </span>
  );
};

export default LogoText;
