export default function Container({ as: Tag = 'div', className = '', children }) {
  return <Tag className={`mx-auto max-w-[1160px] px-5 sm:px-8 ${className}`}>{children}</Tag>;
}
