import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { DEV_API_GROUPSURL, DEV_API_URL } from "../consts-data";
import { splitPlatforms } from "../utils/platforms";
import BackButton from "../components/BackButton";
import { ThumbDown, ThumbUp } from "../components/Icons";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";

const memberLabel = (n) => `${n} ${n === 1 ? "member" : "members"}`;

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const loggedIn = !!localStorage.getItem("token");

  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getGame = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await api.get(`${DEV_API_URL}/${gameId}/`);
      setGame(res.data);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    getGame();
  }, [getGame]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createGroup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      // The API identifies the game by its title.
      const res = await api.post(`${DEV_API_GROUPSURL}/`, {
        title: game.title,
        name: form.name.trim(),
        description: form.description.trim(),
      });
      navigate(`/groups/${res.data.id}`);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="gamePage">
        <Spinner />
      </div>
    );
  }
  if (error || !game) {
    return (
      <div className="gamePage">
        <StatusMessage onRetry={getGame}>
          We couldn't load that game.
        </StatusMessage>
      </div>
    );
  }

  const platforms = splitPlatforms(game.platforms);
  const groups = game.groups || [];

  return (
    <div className="gamePage">
      <div className="page-inner">
        <BackButton fallback="/browse">Back to games</BackButton>

        <article className="surface game-hero">
          <img
            className="game-hero-img"
            src={game.image}
            alt={game.title}
            referrerPolicy="no-referrer"
          />
          <div className="game-hero-info">
            <h1>{game.title}</h1>
            <ul className="chips" aria-label="Genres">
              {(game.genre || []).map((g) => (
                <li key={g.id ?? g.name} className="chip chip-accent">
                  {g.name}
                </li>
              ))}
            </ul>
            <dl className="facts">
              <div>
                <dt>Developer</dt>
                <dd>{game.developer}</dd>
              </div>
              <div>
                <dt>Released</dt>
                <dd>{game.release_date}</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>
                  <ul className="chips">
                    {platforms.map((p) => (
                      <li key={p} className="chip">
                        {p}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            {game.official_site && (
              <a
                className="primary-btn"
                href={game.official_site}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official site &#8599;
              </a>
            )}
          </div>
        </article>

        <section className="surface">
          <h2>About</h2>
          <p className="about-text">{game.description}</p>
        </section>

        <section className="surface">
          <div className="section-head">
            <h2>
              Groups <span className="count-badge">{groups.length}</span>
            </h2>
            {loggedIn ? (
              <button
                type="button"
                className={showForm ? "ghost-btn" : "primary-btn"}
                aria-expanded={showForm}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "+ Create a group"}
              </button>
            ) : (
              <Link className="ghost-btn" to="/login">
                Log in to create a group
              </Link>
            )}
          </div>

          {showForm && (
            <form className="inline-form" onSubmit={createGroup}>
              <label>
                Group name
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  maxLength={150}
                  required
                  autoFocus
                />
              </label>
              <label>
                Description
                <textarea
                  className="form-control"
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={onChange}
                  maxLength={500}
                  required
                />
              </label>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <button className="primary-btn" type="submit" disabled={submitting}>
                {submitting ? "Creating..." : `Create group for ${game.title}`}
              </button>
            </form>
          )}

          {groups.length === 0 ? (
            <p className="empty-note">
              No groups yet. Be the first to create one!
            </p>
          ) : (
            <ul className="group-list">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link className="group-row" to={`/groups/${g.id}`}>
                    <div className="group-row-main">
                      <h3>{g.name}</h3>
                      <p>{g.description}</p>
                    </div>
                    <div className="group-row-stats">
                      <span>{memberLabel((g.members || []).length + 1)}</span>
                      <span className="good">
                        <ThumbUp size={15} /> {g.likes}
                      </span>
                      <span className="bad">
                        <ThumbDown size={15} /> {g.dislikes}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default GamePage;
