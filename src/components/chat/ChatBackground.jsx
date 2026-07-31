export default function ChatBackground({ image = '/picture1.png' }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.03] blur-[1px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-parchment-50/40 via-transparent to-parchment-50/60" />
    </div>
  )
}