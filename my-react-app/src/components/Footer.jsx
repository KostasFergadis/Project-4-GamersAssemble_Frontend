import { Link, NavLink } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";
import { getNavLinks } from "./navLinks";

const Footer = () => {
  const { user, loggedIn, logout } = useCurrentUser();
  const links = getNavLinks({ loggedIn, user }).filter((l) => !l.hidden);

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link to="/" className="brand">
          Gamers <span>Assemble</span>
        </Link>
        <nav aria-label="Footer">
          <ul>
            {links.map((link) => (
              <li key={link.title}>
                {link.action === "logout" ? (
                  <button type="button" onClick={logout}>
                    {link.title}
                  </button>
                ) : (
                  <NavLink to={link.to} end={link.end}>
                    {link.title}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer-note">
          Find your squad. Play together. &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
