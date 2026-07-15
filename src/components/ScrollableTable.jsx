/**
 * Limited-height scrollable table wrapper (vertical + horizontal).
 * Pair with sticky thead on the table for best UX.
 */
export default function ScrollableTable({ children, className = '' }) {
  return (
    <div
      className={`max-h-[min(60vh,520px)] overflow-auto ${className}`.trim()}
    >
      {children}
    </div>
  )
}

/** Sticky header classes for tables inside ScrollableTable */
export const stickyTheadClass =
  'sticky top-0 z-10 bg-[#f7f5f2] text-xs text-[#5c6570]'
