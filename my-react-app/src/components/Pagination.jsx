const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pages">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        &larr; Previous
      </button>
      <span aria-current="page">
        Page {page} of {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next &rarr;
      </button>
    </nav>
  );
};

export default Pagination;
