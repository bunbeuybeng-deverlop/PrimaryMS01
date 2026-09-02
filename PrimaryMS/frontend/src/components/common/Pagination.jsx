import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import './Pagination.css'

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.totalItems Total number of records
 * @param {number} props.currentPage Current active page (1-based)
 * @param {number} props.pageSize Number of items per page
 * @param {Function} props.onPageChange Callback when page changes
 * @param {Function} [props.onPageSizeChange] Callback when page size changes
 * @param {Array<number>} [props.pageSizeOptions] Available page size options
 */
export default function Pagination({
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalItems <= 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(totalItems, currentPage * pageSize)

  const getPageNumbers = () => {
    const pages = []
    const delta = 2

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i)
    }

    if (currentPage - delta > 2) {
      pages.unshift('ellipsis-start')
    }
    pages.unshift(1)

    if (currentPage + delta < totalPages - 1) {
      pages.push('ellipsis-end')
    }
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="pagination-page-size">
            <span style={{ color: 'var(--text-muted)' }}>| Per page:</span>
            <select
              className="pagination-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
        >
          <FiChevronsLeft />
        </button>

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <FiChevronLeft />
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              className={`pagination-btn ${page === currentPage ? 'pagination-btn--active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        })}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <FiChevronRight />
        </button>

        <button
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
        >
          <FiChevronsRight />
        </button>
      </div>
    </div>
  )
}
