import { useParams } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { InstallmentDetailPanel } from '@/components/fund-disbursement/InstallmentDetailPanel'

export function InstallmentDetailPage() {
  const { installmentId } = useParams<{ installmentId: string }>()

  return (
    <ConsoleLayout title="Installment">
      <div className="mx-auto max-w-3xl rounded-2xl border border-cream-300 bg-white p-6">
        {installmentId && <InstallmentDetailPanel installmentId={installmentId} />}
      </div>
    </ConsoleLayout>
  )
}
