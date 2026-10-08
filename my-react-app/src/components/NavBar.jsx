import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";
import { getNavLinks } from "./navLinks";

const NavBar = () => {
  const { user, loggedIn, logout } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const headerRef = useRef(null);

  // Close the menu after navigating, on Escape, and on a click outside.
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const links = getNavLinks({ loggedIn, user }).filter((l) => !l.hidden);

  return (
    <header className="site-header" ref={headerRef}>
      <button
        type="button"
        className="burger"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </button>
      <Link to="/" className="brand">
        Gamers <span>Assemble</span>
      </Link>
      {loggedIn && user.username && (
        <Link to={`/users/${user.id}`} className="header-user">
          {user.profile_image && <img src={user.profile_image} alt="" />}
          <span>{user.username}</span>
        </Link>
      )}
      <nav
        id="site-menu"
        className={`site-menu ${open ? "open" : ""}`}
        aria-label="Main"
      >
        <ul>
          {links.map((link) => (
            <li key={link.title}>
              {link.action === "logout" ? (
                <button type="button" className="menu-link" onClick={logout}>
                  {link.title}
                </button>
              ) : (
                <NavLink to={link.to} end={link.end} className="menu-link">
                  {link.title}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
