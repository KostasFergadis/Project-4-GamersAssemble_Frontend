import { CircleMenu, CircleMenuItem } from "react-circular-menu";
import AuthLinks from "./AuthLinks";

const NavBar = () => (
  <CircleMenu className="donut" startAngle={0} totalAngle={150} radius={25}>
    <CircleMenuItem>
      <nav className="navitem" aria-label="Main">
        <AuthLinks />
      </nav>
    </CircleMenuItem>
  </CircleMenu>
);

export default NavBar;
