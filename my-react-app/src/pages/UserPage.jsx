import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import api, { getErrorMessage } from "../api";
import { DEV_API_AUTH, DEV_API_GROUPSURL, DEV_API_URL } from "../consts-data";
import BackButton from "../components/BackButton";
import { ThumbDown, ThumbUp } from "../components/Icons";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";

const EMPTY_GROUP = { title: "", name: "", description: "" };

const UserPage = () => {
  const { userId } = useParams();
  const loggedIn = !!localStorage.getItem("token");

  const [user, setUser] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [games, setGames] = useState([]);
  const [group, setGroup] = useState(EMPTY_GROUP);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const showError = (err) => setError(getErrorMessage(err));

  // /user shows the logged-in user's own page, /users/:userId anyone's.
  const getUser = useCallback(async () => {
    try {
      const url = userId
        ? `${DEV_API_AUTH}/users/${userId}/`
        : `${DEV_API_AUTH}/user/`;
      const res = await api.get(url);
      setUser(res.data);
      setNotFound(false);
    } catch (err) {
      console.log(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (!loggedIn) return;
    api
      .get(`${DEV_API_AUTH}/user/`)
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.log(err));
  }, [loggedIn]);

  const isCurrentUser = !!currentUser.id && user.id === currentUser.id;

  // The game list feeds the "create a group" form, which only the owner sees.
  useEffect(() => {
    if (!isCurrentUser) return;
    api
      .get(`${DEV_API_URL}/`)
      .then((res) => setGames(res.data))
      .catch((err) => console.log(err));
  }, [isCurrentUser]);

  const startEditing = () => {
    setFormData({
      username: user.username || "",
      profile_image: user.profile_image || "",
      description: user.description || "",
      discord_username: user.discord_username || "",
    });
    setIsEditing(true);
  };

  const onFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`${DEV_API_AUTH}/user/`, formData);
      setIsEditing(false);
      const res = await api.get(`${DEV_API_AUTH}/user/`);
      setCurrentUser(res.data);
      setUser(res.data);
    } catch (err) {
      showError(err);
    }
  };

  const onGroupChange = (e) =>
    setGroup({ ...group, [e.target.name]: e.target.value });

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${DEV_API_GROUPSURL}/`, group);
      setGroup(EMPTY_GROUP);
      await getUser();
    } catch (err) {
      showError(err);
    }
  };

  const removeGroup = async (target) => {
    if (!window.confirm(`Delete "${target.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`${DEV_API_GROUPSURL}/${target.id}/`);
      await getUser();
    } catch (err) {
      showError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="userpage">
        <Spinner />
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="userpage">
        <StatusMessage>
          {loggedIn || userId
            ? "We couldn't find that user."
            : "Please log in to see your profile."}
        </StatusMessage>
      </div>
    );
  }

  const groups = user.groups || [];
  const ownedCount = groups.filter((g) => g.owner?.id === user.id).length;

  return (
    <div className="userpage">
      <div className="page-inner">
        <BackButton fallback="/browse">Back</BackButton>

        <section className="surface profile-card">
          <div className="profile-avatar">
            {(isEditing ? formData.profile_image : user.profile_image) ? (
              <img
                src={isEditing ? formData.profile_image : user.profile_image}
                alt={`${user.username}'s avatar`}
              />
            ) : (
              <span aria-hidden="true">
                {(user.username || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {isEditing ? (
            <form className="inline-form profile-form" onSubmit={updateUser}>
              <label>
                Username
                <input
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={onFormChange}
                  minLength={3}
                  maxLength={9}
                  required
                />
              </label>
              <label>
                Profile image URL
                <input
                  className="form-control"
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={onFormChange}
                  placeholder="https://..."
                />
              </label>
              <label>
                Description
                <textarea
                  className="form-control"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={onFormChange}
                  maxLength={500}
                />
              </label>
              <label>
                Discord username
                <input
                  className="form-control"
                  name="discord_username"
                  value={formData.discord_username}
                  onChange={onFormChange}
                  maxLength={50}
                />
              </label>
              <div className="button-row">
                <button className="primary-btn" type="submit">
                  Save changes
                </button>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <h1>{user.username}</h1>
              <p className="bio">{user.description || "No description yet."}</p>
              {user.discord_username && (
                <p className="discord">
                  <span>Discord</span> {user.discord_username}
                </p>
              )}
              <ul className="stats">
                <li>
                  <strong>{groups.length}</strong> groups
                </li>
                <li>
                  <strong>{ownedCount}</strong> created
                </li>
                <li>
                  <strong>{groups.length - ownedCount}</strong> joined
                </li>
              </ul>
              {isCurrentUser && (
                <button className="ghost-btn" onClick={startEditing}>
                  Edit profile
                </button>
              )}
            </div>
          )}
        </section>

        {isCurrentUser && (
          <section className="surface">
            <h2>Create a group</h2>
            <form className="inline-form create-form" onSubmit={createGroup}>
              <label>
                Game
                <select
                  className="form-select"
                  name="title"
                  value={group.title}
                  onChange={onGroupChange}
                  required
                >
                  <option value="" disabled>
                    Select a game
                  </option>
                  {games.map((g) => (
                    <option key={g.id} value={g.title}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Group name
                <input
                  className="form-control"
                  name="name"
                  value={group.name}
                  onChange={onGroupChange}
                  maxLength={150}
                  required
                />
              </label>
              <label className="wide">
                Description
                <input
                  className="form-control"
                  name="description"
                  value={group.description}
                  onChange={onGroupChange}
                  maxLength={500}
                  required
                />
              </label>
              <button className="primary-btn" type="submit">
                Create group
              </button>
            </form>
          </section>
        )}

        <section>
          <h2 className="section-title">
            {isCurrentUser ? "Your groups" : `${user.username}'s groups`}
          </h2>
          {groups.length === 0 ? (
            <div className="surface">
              <p className="empty-note">
                {isCurrentUser
                  ? "You haven't joined any groups yet. Browse games to find one."
                  : "Not in any groups yet."}
              </p>
            </div>
          ) : (
            <ul className="group-cards">
              {groups.map((g) => {
                const owned = g.owner?.id === user.id;
                return (
                  <li key={g.id} className="surface group-card">
                    <Link className="group-card-main" to={`/groups/${g.id}`}>
                      <span className={`role-badge ${owned ? "" : "member"}`}>
                        {owned ? "Owner" : "Member"}
                      </span>
                      <h3>{g.name}</h3>
                      <p className="group-card-game">{g.game}</p>
                      <p className="group-card-desc">{g.description}</p>
                    </Link>
                    <div className="group-card-foot">
                      <span className="good">
                        <ThumbUp size={15} /> {g.likes}
                      </span>
                      <span className="bad">
                        <ThumbDown size={15} /> {g.dislikes}
                      </span>
                      {owned && isCurrentUser && (
                        <button
                          className="danger-btn small"
                          onClick={() => removeGroup(g)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Modal show={!!error} onHide={() => setError("")}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setError("")}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserPage;
