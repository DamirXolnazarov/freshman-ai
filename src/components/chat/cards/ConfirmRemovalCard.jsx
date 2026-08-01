import { AlertTriangle } from 'lucide-react'
import Card from '../../ui/Card.jsx'
import Button from '../../ui/Button.jsx'

export default function ConfirmRemovalCard({ label, itemName, confidence, onConfirm, onCancel }) {
  const isGuess = confidence != null && confidence < 0.7

  return (
    <Card className="p-4 shadow-panel max-w-sm border-dusty/40">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[#8B5A5A]">
        <AlertTriangle size={14} strokeWidth={2} /> {isGuess ? 'Did you mean this?' : 'Confirm removal'}
      </div>
      <p className="mt-1.5 text-[13px] text-ink-700">
        {isGuess ? (
          <>Closest match: <span className="font-medium text-navy-900">"{itemName}"</span> — remove this {label}?</>
        ) : (
          <>Remove <span className="font-medium text-navy-900">"{itemName}"</span> {label}?</>
        )}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button variant="quiet" size="sm" onClick={onConfirm}>Yes, remove it</Button>
        <button onClick={onCancel} className="text-[12px] text-ink-500 hover:text-navy-900">Cancel</button>
      </div>
    </Card>
  )
}