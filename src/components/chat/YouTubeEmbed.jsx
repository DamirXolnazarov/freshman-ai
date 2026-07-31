const YT_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/

export function extractYouTubeId(text) {
  const match = text.match(YT_REGEX)
  return match ? match[1] : null
}

export default function YouTubeEmbed({ videoId, title = 'Freshman Academy video' }) {
  return (
    <div className="mt-2 overflow-hidden rounded-card border border-navy-900/[0.06] shadow-panel">
      <div className="relative aspect-video w-full bg-navy-950">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}