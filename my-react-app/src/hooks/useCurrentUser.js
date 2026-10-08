import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { DEV_API_AUTH } from "../consts-data";

// Tracks who is logged in. Re-checks on every navigation so the NavBar and
// Footer stay in sync after login, logout or a profile edit.
const useCurrentUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setLoggedIn(false);
      setUser({});
      return;
    }
    setLoggedIn(true);
    try {
      const res = await api.get(`${DEV_API_AUTH}/user/`);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [location, refresh]);

  useEffect(() => {
    window.addEventListener("auth-change", refresh);
    return () => window.removeEventListener("auth-change", refresh);
  }, [refresh]);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUser({});
    navigate("/");
  };

  return { user, loggedIn, logout };
};

export default useCurrentUser;
