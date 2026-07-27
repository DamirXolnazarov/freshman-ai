const variants = {
  primary:
    'bg-navy-900 text-parchment-50 hover:bg-navy-800 active:bg-navy-950 shadow-panel',
  gold:
    'bg-gold-500 text-navy-950 hover:bg-gold-400 shadow-gold font-medium',
  ghost:
    'bg-transparent text-navy-800 border border-navy-900/12 hover:bg-navy-900/[0.04]',
  quiet:
    'bg-parchment-100 text-ink-700 hover:bg-parchment-200 border border-navy-900/8',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizes = {
    sm: 'text-[13px] px-3 py-1.5',
    md: 'text-[14px] px-4 py-2.5',
  }
  return (
    <button
      className={`rounded-control transition-colors duration-150 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
