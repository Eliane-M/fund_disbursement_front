import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-3 flex items-center gap-1.5 text-sm text-navy-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-navy-400">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-navy-700 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-navy-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
