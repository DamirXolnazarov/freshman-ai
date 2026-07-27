export default function Card({ as: Tag = 'div', glass = false, className = '', children, ...props }) {
  return (
    <Tag
      className={`rounded-card border border-navy-900/[0.06] ${
        glass
          ? 'bg-parchment-50/70 backdrop-blur-md'
          : 'bg-parchment-50'
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
