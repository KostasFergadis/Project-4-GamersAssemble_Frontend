import { Link } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";

export const navigationLinks = [
  { title: "Homepage", slug: "/" },
  { title: "Browse", slug: "/browse" },
];

// The links shared by the NavBar and the Footer.
const AuthLinks = ({ showSecondary = true }) => {
  const { user, loggedIn, logout } = useCurrentUser();

  return (
    <>
      <ul className="primary-nav">
        {navigationLinks.map((link) => (
          <li className="navbar" key={link.slug}>
            <Link to={link.slug}>{link.title}</Link>
          </li>
        ))}
      </ul>
      {showSecondary && (
        <ul className="secondary-nav">
          {loggedIn ? (
            <div className="userlogout">
              <li>
                <div className="user-info-wrapper">
                  {user.profile_image && (
                    <img
                      className="user-avatar"
                      src={user.profile_image}
                      alt=""
                    />
                  )}
                  <span>
                    {" "}
                    <Link to={`/users/${user.id}`}>{user.username}</Link>
                  </span>
                </div>
              </li>
              <li className="nav-item-logout">
                <a
                  className="linksnavbar"
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  Logout
                </a>
              </li>
            </div>
          ) : (
            <>
              <li className="nav-item">
                <Link className="registertext" to="/register">
                  Register
                </Link>
              </li>
              <li className="nav-item">
                <Link className="logintext" to="/login">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      )}
    </>
  );
};

export default AuthLinks;
