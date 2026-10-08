import api from "../api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DEV_API_URL } from "../consts-data";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";

const GamePage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getGame = async () => {
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
    };
    getGame();
  }, [gameId]);

  return (
    <div className="gamePage">
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <StatusMessage>We couldn't find that game.</StatusMessage>
      ) : (
        <div className="card">
          <div className="card-body">
            <h1>{game.title}</h1>
            <ul>
              <li>
                <span>Release date: </span>
                {game.release_date}
              </li>
              <li>
                <span>Developer: </span>
                {game.developer}
              </li>
              <li>
                <span>Platforms: </span>
                {game.platforms}
              </li>
              <li>
                <span>Genre: </span>
                {game.genre && game.genre.map((item) => item.name).join(", ")}
              </li>
              <li>
                <img className="exploreImg" src={game.image} alt={game.title} />
              </li>
              <li>
                <span>Description: </span>
                {game.description}
              </li>
            </ul>
            <h2 className="groupstitle">Groups</h2>
            <h4 className="subtitle">
              Create a new group from your profile page: click your username in
              the navigation bar or the footer.
            </h4>
            <div className="gamepagetext">
              {game.groups && game.groups.length === 0 ? (
                <h2 className="nogroups"> No groups have been created yet</h2>
              ) : (
                game.groups &&
                game.groups.map((item, ind) => (
                  <Link key={ind} to={`/groups/${item.id}`}>
                    <ul>
                      <h3 style={{ display: "inline" }}>{item.name}</h3>
                      <p className="likestext">Likes: {item.likes}</p>
                      <p className="dislikestext">Dislikes: {item.dislikes}</p>
                    </ul>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GamePage;
