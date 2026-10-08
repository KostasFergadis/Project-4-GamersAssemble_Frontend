import api, { getErrorMessage } from "../api";
import { useCallback, useEffect, useState } from "react";
import { DEV_API_AUTH, DEV_API_GROUPSURL, DEV_API_URL } from "../consts-data";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { Modal } from "react-bootstrap";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";

const UserPage = () => {
  const [user, setUser] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const { userId } = useParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!loggedIn) return;
    const getCurrentUser = async () => {
      try {
        const res = await api.get(`${DEV_API_AUTH}/user/`);
        setCurrentUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getCurrentUser();
  }, [loggedIn]);

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

  const [group, setGroup] = useState({
    game: "",
    name: "",
    description: "",
  });

  const [games, setGames] = useState([]);
  useEffect(() => {
    const getGames = async () => {
      try {
        const res = await api.get(`${DEV_API_URL}/`);
        setGames(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getGames();
  }, []);

  const [showAlert, setShowAlert] = useState(false);
  const [toggleText, setToggleText] = useState("Select a game");
  const isCurrentUser = !!currentUser.id && user.id === currentUser.id;

  const showError = (err) => {
    setError(getErrorMessage(err));
    setShowAlert(true);
  };

  const onChangeHandler = (e) => {
    setGroup({
      ...group,
      [e.target.name]: e.target.value,
    });
    // console.log(group);
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!group.title) {
      setError("Please select a game for the group.");
      setShowAlert(true);
      return;
    }
    try {
      await api.post(`${DEV_API_GROUPSURL}/`, group);
      setGroup({ game: "", name: "", description: "" });
      setToggleText("Select a game");
      await getUser();
    } catch (err) {
      showError(err);
    }
  };

  const onSelectGame = (title) => {
    setGroup({ ...group, title });
    setToggleText(title);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [formData, setFormData] = useState({
    username: currentUser.username,
    profile_image: currentUser.profile_image,
    description: currentUser.description,
    discord_username: currentUser.discord_username,
  });

  const onChange = (e) => {
    if (e.target.name === "profile_image") {
      setPreviewImage(e.target.value);
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setFormData({
      username: currentUser.username,
      profile_image: currentUser.profile_image,
      description: currentUser.description,
      discord_username: currentUser.discord_username,
    });
  }, [currentUser]);

  const handleEdit = () => {
    setFormData({
      username: currentUser.username,
      profile_image: currentUser.profile_image,
      description: currentUser.description,
      discord_username: currentUser.discord_username,
    });
    setPreviewImage(currentUser.profile_image || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateUser(e);
    }
  };

  const removeGroup = async (groupId) => {
    if (!window.confirm("Delete this group? This cannot be undone.")) return;
    try {
      await api.delete(`${DEV_API_GROUPSURL}/${groupId}/`);
      await getUser();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="userpage">
      {isLoading ? (
        <Spinner />
      ) : notFound ? (
        <StatusMessage>
          {loggedIn || userId
            ? "We couldn't find that user."
            : "Please log in to see your profile."}
        </StatusMessage>
      ) : (
        <div>
          <div className="usercontainer">
            <div className="popupuser">
              <OverlayTrigger
                trigger="click"
                placement="top"
                overlay={
                  <Popover>
                    <Popover.Body>
                      Edit your profile details. Create or delete a group. Click
                      on the group cards to navigate to the group's page.
                    </Popover.Body>
                  </Popover>
                }
              >
                <button type="button" className="btn btn-secondary">
                  Click here!
                </button>
              </OverlayTrigger>
            </div>
            <div className="profile-details">
              <strong>Username:</strong>{" "}
              {isEditing ? (
                <input
                  name="username"
                  className="input-group-text"
                  id="addon-wrapping"
                  value={formData.username}
                  onChange={onChange}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                user.username
              )}
            </div>
            <div className=" profile-details ">
              <strong>Profile image:</strong>{" "}
              {isEditing ? (
                <>
                  <input
                    name="profile_image"
                    className="input-group-text"
                    id="addon-wrapping"
                    value={formData.profile_image}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                  />
                  {previewImage && (
                    <img
                      className="preview-img"
                      src={previewImage}
                      alt="Preview"
                    />
                  )}
                </>
              ) : user.profile_image ? (
                <img
                  className="normal-img"
                  src={user.profile_image}
                  alt={`${user.username}'s avatar`}
                />
              ) : (
                <span style={{ visibility: "hidden" }}></span>
              )}
            </div>
            <li>
              <div className="profile-details ">
                <strong>Description:</strong>{" "}
                {isEditing ? (
                  <input
                    name="description"
                    className="input-group-text"
                    id="addon-wrapping"
                    value={formData.description}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  user.description
                )}
              </div>
              <div className="profile-details ">
                <strong>Discord Username:</strong>{" "}
                {isEditing ? (
                  <input
                    name="discord_username"
                    className="input-group-text"
                    id="addon-wrapping"
                    value={formData.discord_username}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  user.discord_username
                )}
              </div>
            </li>
            <div className="editButtons">
              {isCurrentUser && loggedIn && (
                <>
                  {isEditing ? (
                    <li>
                      <button onClick={updateUser}>Save Changes</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </li>
                  ) : (
                    <li>
                      <button onClick={handleEdit}>Edit Profile</button>
                    </li>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="creategroupcontainer">
            {isCurrentUser && loggedIn && (
              <Card>
                <Card.Body>
                  <form className="list-form" onSubmit={createGroup}>
                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" id="dropdown-games">
                        {toggleText}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="gameselectbutton">
                        <div className="scrollable-menu">
                          {games &&
                            games.map((game) => (
                              <Dropdown.Item
                                key={game.id}
                                onClick={() => onSelectGame(game.title)}
                              >
                                {game.title}
                              </Dropdown.Item>
                            ))}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                    <div className="form-group">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="group name"
                        name="name"
                        value={group.name}
                        onChange={onChangeHandler}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="group description"
                        name="description"
                        value={group.description}
                        onChange={onChangeHandler}
                        required
                      />
                    </div>
                    <Button className="listBtn" variant="light" type="submit">
                      <p>Create a group</p>
                    </Button>
                  </form>
                </Card.Body>
              </Card>
            )}
            <Modal show={showAlert} onHide={() => setShowAlert(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
              </Modal.Header>
              <Modal.Body>{error && <p>{error}</p>}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAlert(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
          <div className="groups-container">
            {user.groups &&
              user.groups.map((group) => (
                <Link
                  key={group.id}
                  className="group-box"
                  to={`/groups/${group.id}`}
                >
                  <ul className="group-details">
                    <li>
                      {group.owner.id === user.id ? (
                        <span>Group's owner</span>
                      ) : (
                        <div>
                          <span>Created by </span>
                          <div>
                            <button
                              className="owner-username"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/users/${group.owner.id}`);
                              }}
                            >
                              {group.owner.username}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                    <li>
                      <span>Game:</span> {group.game}
                    </li>
                    <li>
                      <span>Group title:</span> {group.name}
                    </li>
                    <li>
                      <span className="descriptionText">Description:</span>{" "}
                      {group.description}
                    </li>
                    <li className="likescolor">
                      <span>Likes:</span> {group.likes}
                    </li>
                    <li className="dislikescolor">
                      <span>Dislikes:</span> {group.dislikes}
                    </li>
                  </ul>
                  <div className="group-delete">
                    {isCurrentUser && group.owner.id === currentUser.id && (
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeGroup(group.id);
                        }}
                      >
                        Delete group
                      </button>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
