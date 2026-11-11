/** Opens the browser's print dialog ("Save as PDF"), naming the file after the report. */
export function printReport(title: string) {
  const previous = document.title
  document.title = title
  const restore = () => {
    document.title = previous
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}
