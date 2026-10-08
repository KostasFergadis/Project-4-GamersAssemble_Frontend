import { Route, Routes } from "react-router-dom";
import Browse from "./pages/Browse";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import "./styling/main.scss";
import Footer from "./components/Footer";
import GamePage from "./pages/GamePage";
import GroupPage from "./pages/GroupPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse/page/:pageNumber" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/games/:gameId" element={<GamePage />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/users/:userId" element={<UserPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
