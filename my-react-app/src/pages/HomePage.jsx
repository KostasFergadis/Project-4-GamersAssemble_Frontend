import { Link } from "react-router-dom";

const HomePage = () => (
  <div className="home">
    <section className="home-header">
      <h1 className="headline">
        "Video games foster the mindset that allows creativity to grow."
      </h1>
      <h2 className="head-author">- NOLAN BUSHNELL</h2>
      <Link to="/browse" className="btn btn-outline-light">
        Browse Games
      </Link>
    </section>
  </div>
);
export default HomePage;
