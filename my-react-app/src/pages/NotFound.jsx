import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="notfound">
    <h1>404</h1>
    <p>Game over. This page doesn't exist.</p>
    <Link to="/browse" className="btn btn-outline-light">
      Browse games
    </Link>
  </div>
);

export default NotFound;
