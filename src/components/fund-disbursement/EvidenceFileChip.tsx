import { useState } from 'react'

import { FileIcon, LinkIcon } from '@/components/ui/icons'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import type { EvidenceFile } from '@/types/fund-disbursement'

const chipClass =
  'flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-3 py-2 text-xs text-navy-700 hover:border-amber-400'

function formatSize(bytes: number | null) {
  if (bytes === null) return ''
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** A submitted evidence item: an external link, or an uploaded file fetched with auth. */
export function EvidenceFileChip({ file }: { file: EvidenceFile }) {
  const [busy, setBusy] = useState(false)

  if (file.external_url) {
    return (
      <a href={file.external_url} target="_blank" rel="noreferrer" className={chipClass}>
        <FileIcon /> <span className="max-w-[12rem] truncate">{file.external_url}</span>
        <LinkIcon className="text-navy-400" />
      </a>
    )
  }

  return (
    <button
      type="button"
      disabled={busy}
      className={chipClass}
      onClick={async () => {
        setBusy(true)
        try {
          await fundDisbursementApi.downloadEvidenceFile(file.id, file.file_name)
        } finally {
          setBusy(false)
        }
      }}
    >
      <FileIcon /> <span className="max-w-[12rem] truncate">{file.file_name}</span>
      <span className="text-navy-400">{formatSize(file.file_size)}</span>
    </button>
  )
}
