// An inline message for failed loads and empty results, with an optional retry.
const StatusMessage = ({ children, onRetry }) => (
  <div className="status-message" role="status">
    <p>{children}</p>
    {onRetry && (
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export default StatusMessage;
