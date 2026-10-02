import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  isLoading,
  danger,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  danger?: boolean
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-navy-600">{message}</p>
      <div className="mt-5 flex gap-3">
        <Button variant="ghost" fullWidth={false} className="px-4" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          fullWidth={false}
          className={`px-4 ${danger ? 'bg-danger-text text-white hover:bg-danger-text/90' : ''}`}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
