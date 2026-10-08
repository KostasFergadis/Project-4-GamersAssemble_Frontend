import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import { DEV_API_URL } from "../consts-data";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";

// Must match GAMES_PER_PAGE in the backend's games/views.py.
const PAGE_SIZE = 9;

const Browse = () => {
  // The page and search term live in the URL (?page=2&search=zelda), so
  // pagination works with the back button and pages can be shared.
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [games, setGames] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const getGames = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await api.get(DEV_API_URL, {
        params: { page: currentPage, search: search || undefined },
      });
      setGames(res.data.results);
      setTotalPages(Math.ceil(res.data.count / PAGE_SIZE));
    } catch (err) {
      console.log(err);
      // Asking for a page past the end is a 404 from the API: go back to page 1.
      if (err.response?.status === 404 && currentPage > 1) {
        setSearchParams(search ? { search } : {});
        return;
      }
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, setSearchParams]);

  useEffect(() => {
    getGames();
  }, [getGames]);

  const goToPage = (page) => {
    const next = {};
    if (search) next.search = search;
    if (page > 1) next.page = page;
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSearch = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    setSearchParams(term ? { search: term } : {});
  };

  return (
    <div className="browsePage">
      <form className="game-search" onSubmit={onSearch} role="search">
        <input
          type="search"
          className="form-control"
          placeholder="Search games"
          aria-label="Search games"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-light">
          Search
        </button>
      </form>
      {totalPages > 1 && (
        <nav aria-label="Pages">
          <ul className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${i + 1 === currentPage ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(i + 1)}
                  aria-current={i + 1 === currentPage ? "page" : undefined}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="games-container">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <StatusMessage onRetry={getGames}>
            Couldn't load the games. The server may be waking up, so give it a
            few seconds.
          </StatusMessage>
        ) : games.length === 0 ? (
          <StatusMessage>
            {search ? `No games match "${search}".` : "No games yet."}
          </StatusMessage>
        ) : (
          <div className="games-grid">
            {games.map((game) => (
              <Link
                key={game.id}
                className="game-link"
                to={`/games/${game.id}`}
              >
                <div className="game-card">
                  <img
                    className="game-image"
                    src={game.image}
                    alt={game.title}
                    loading="lazy"
                  />
                  <h5 className="game-title">{game.title}</h5>
                  <button
                    className="officialLink"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(game.official_site, "_blank", "noopener");
                    }}
                  >
                    Official Site
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
