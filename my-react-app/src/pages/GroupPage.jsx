import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import api, { getErrorMessage } from "../api";
import { DEV_API_AUTH, DEV_API_GROUPSURL } from "../consts-data";
import BackButton from "../components/BackButton";
import { ThumbDown, ThumbUp } from "../components/Icons";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";

const Avatar = ({ src, name }) =>
  src ? (
    <img className="avatar" src={src} alt="" />
  ) : (
    <span className="avatar avatar-fallback" aria-hidden="true">
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("token");

  const [group, setGroup] = useState(null);
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [chat, setChat] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "" });
  const chatBoxRef = useRef(null);

  const showError = (err) => setError(getErrorMessage(err));

  // Re-read the group after every action so the page always shows server state.
  const fetchGroup = useCallback(async () => {
    const res = await api.get(`${DEV_API_GROUPSURL}/${groupId}/`);
    setGroup(res.data);
  }, [groupId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        await fetchGroup();
      } catch (err) {
        console.log(err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [fetchGroup]);

  useEffect(() => {
    if (!loggedIn) return;
    api
      .get(`${DEV_API_AUTH}/user/`)
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }, [loggedIn]);

  // Keep the chat scrolled to the newest message.
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [group]);

  if (isLoading) {
    return (
      <div className="groupPage">
        <Spinner />
      </div>
    );
  }
  if (notFound || !group) {
    return (
      <div className="groupPage">
        <StatusMessage>We couldn't find that group.</StatusMessage>
      </div>
    );
  }

  const members = group.members || [];
  const isOwner = !!user.id && group.owner?.id === user.id;
  const myMembership = members.find((m) => m.user === user.id);
  const isMember = !!myMembership;
  const canChat = loggedIn && (isOwner || isMember);
  const canRate = loggedIn && isMember;
  const rateHint = !loggedIn
    ? "Log in to rate this group"
    : isOwner
    ? "You can't rate your own group"
    : !isMember
    ? "Join the group to rate it"
    : undefined;

  const run = async (action) => {
    try {
      await action();
    } catch (err) {
      showError(err);
    }
  };

  const join = () =>
    run(async () => {
      await api.post(`${DEV_API_GROUPSURL}/${groupId}/join/`);
      await fetchGroup();
    });

  const leave = () =>
    run(async () => {
      await api.delete(`${DEV_API_GROUPSURL}/${groupId}/leavegroup/`);
      await fetchGroup();
    });

  const removeMember = (member) => {
    if (!window.confirm(`Remove ${member.username} from the group?`)) return;
    run(async () => {
      await api.delete(`${DEV_API_GROUPSURL}/${groupId}/${member.id}/remove/`);
      await fetchGroup();
    });
  };

  const rate = (action) =>
    run(async () => {
      const res = await api.post(`${DEV_API_GROUPSURL}/${groupId}/${action}/`);
      setGroup((g) => ({
        ...g,
        likes: res.data.likes,
        dislikes: res.data.dislikes,
        user_rating: res.data.user_rating,
      }));
    });

  const sendMessage = (e) => {
    e.preventDefault();
    run(async () => {
      await api.post(`${DEV_API_GROUPSURL}/${groupId}/groupchat/`, {
        message_text: chat,
      });
      setChat("");
      await fetchGroup();
    });
  };

  const startEditing = () => {
    setDraft({ name: group.name, description: group.description });
    setEditing(true);
  };

  const saveEdits = (e) => {
    e.preventDefault();
    run(async () => {
      await api.put(`${DEV_API_GROUPSURL}/${groupId}/`, draft);
      await fetchGroup();
      setEditing(false);
    });
  };

  const deleteGroup = () => {
    if (!window.confirm("Delete this group? This cannot be undone.")) return;
    run(async () => {
      await api.delete(`${DEV_API_GROUPSURL}/${groupId}/`);
      navigate(group.game_id ? `/games/${group.game_id}` : "/browse");
    });
  };

  const messages = group.groupchat_messages || [];

  return (
    <div className="groupPage">
      <div className="page-inner">
        <BackButton fallback={group.game_id ? `/games/${group.game_id}` : "/browse"}>
          Back
        </BackButton>

        <header className="surface group-header">
          {editing ? (
            <form className="inline-form" onSubmit={saveEdits}>
              <label>
                Group name
                <input
                  className="form-control"
                  value={draft.name}
                  maxLength={150}
                  required
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  className="form-control"
                  rows={3}
                  value={draft.description}
                  maxLength={500}
                  required
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </label>
              <div className="button-row">
                <button className="primary-btn" type="submit">
                  Save
                </button>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="group-title-row">
                <div>
                  {group.game_id ? (
                    <Link className="game-pill" to={`/games/${group.game_id}`}>
                      {group.game}
                    </Link>
                  ) : (
                    <span className="game-pill">{group.game}</span>
                  )}
                  <h1>{group.name}</h1>
                </div>
                {isOwner && (
                  <div className="button-row">
                    <button className="ghost-btn" onClick={startEditing}>
                      Edit
                    </button>
                    <button className="danger-btn" onClick={deleteGroup}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="group-description">{group.description}</p>
            </>
          )}

          <div className="group-meta">
            <div className="owner-line">
              <Avatar src={group.owner?.profile_image} name={group.owner?.username} />
              <span>
                Created by{" "}
                {loggedIn ? (
                  <Link to={`/users/${group.owner.id}`}>
                    {group.owner.username}
                  </Link>
                ) : (
                  <strong>{group.owner.username}</strong>
                )}
              </span>
            </div>

            <div className="group-actions">
              <div className="rating" title={rateHint}>
                <button
                  type="button"
                  className={`rate-btn like ${
                    group.user_rating === "like" ? "active" : ""
                  }`}
                  disabled={!canRate}
                  aria-pressed={group.user_rating === "like"}
                  aria-label={`Like this group (${group.likes})`}
                  onClick={() => rate("like")}
                >
                  <ThumbUp /> {group.likes}
                </button>
                <button
                  type="button"
                  className={`rate-btn dislike ${
                    group.user_rating === "dislike" ? "active" : ""
                  }`}
                  disabled={!canRate}
                  aria-pressed={group.user_rating === "dislike"}
                  aria-label={`Dislike this group (${group.dislikes})`}
                  onClick={() => rate("dislike")}
                >
                  <ThumbDown /> {group.dislikes}
                </button>
              </div>
              {loggedIn && !isOwner && !isMember && (
                <button className="primary-btn" onClick={join}>
                  Join group
                </button>
              )}
              {loggedIn && isMember && (
                <button className="ghost-btn" onClick={leave}>
                  Leave group
                </button>
              )}
              {!loggedIn && (
                <Link className="ghost-btn" to="/login">
                  Log in to join
                </Link>
              )}
            </div>
          </div>
          {rateHint && <p className="hint">{rateHint}.</p>}
        </header>

        <div className="group-columns">
          <section className="surface members-card">
            <h2>
              Members <span className="count-badge">{members.length + 1}</span>
            </h2>
            <ul className="member-list">
              <li>
                <Avatar
                  src={group.owner.profile_image}
                  name={group.owner.username}
                />
                {loggedIn ? (
                  <Link to={`/users/${group.owner.id}`}>
                    {group.owner.username}
                  </Link>
                ) : (
                  <span>{group.owner.username}</span>
                )}
                <span className="role-badge">Owner</span>
              </li>
              {members.map((m) => (
                <li key={m.id}>
                  <Avatar src={m.profile_image} name={m.username} />
                  {loggedIn ? (
                    <Link to={`/users/${m.user}`}>{m.username}</Link>
                  ) : (
                    <span>{m.username}</span>
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      className="remove-btn"
                      aria-label={`Remove ${m.username}`}
                      onClick={() => removeMember(m)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {members.length === 0 && (
              <p className="empty-note">No one has joined yet.</p>
            )}
          </section>

          <section className="surface chat-card">
            <h2>Group chat</h2>
            <div className="chatbox" ref={chatBoxRef} aria-live="polite">
              {messages.length === 0 ? (
                <p className="empty-note">No messages yet. Say hello!</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-message ${
                      m.created_by === user.username ? "mine" : ""
                    }`}
                  >
                    <div className="chat-meta">
                      <strong>{m.created_by}</strong>
                      <time>{m.created_at}</time>
                    </div>
                    <p>{m.message_text}</p>
                  </div>
                ))
              )}
            </div>
            {canChat ? (
              <form className="chat-form" onSubmit={sendMessage}>
                <input
                  className="form-control"
                  placeholder="Write a message"
                  aria-label="Message"
                  maxLength={200}
                  value={chat}
                  onChange={(e) => setChat(e.target.value)}
                />
                <button
                  className="primary-btn"
                  type="submit"
                  disabled={!chat.trim()}
                >
                  Send
                </button>
              </form>
            ) : (
              <p className="hint">
                {loggedIn
                  ? "Join the group to chat with its members."
                  : "Log in and join the group to chat."}
              </p>
            )}
          </section>
        </div>
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

export default GroupPage;
