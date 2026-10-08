import { useNavigate } from "react-router-dom";

// Goes back one step in the browser history, or to `fallback` when the page
// was opened directly (e.g. from a shared link) and there is nothing to go back to.
const BackButton = ({ fallback = "/browse", children = "Back" }) => {
  const navigate = useNavigate();
  const goBack = () =>
    window.history.state?.idx > 0 ? navigate(-1) : navigate(fallback);

  return (
    <button type="button" className="back-button" onClick={goBack}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </button>
  );
};

export default BackButton;
