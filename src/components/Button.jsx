function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) {
  return (
    <button
      type={type}
      className={`custom-button ${variant} ${className}`.trim()}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;