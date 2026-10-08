// The links shared by the header menu and the footer.
export const getNavLinks = ({ loggedIn, user }) => [
  { title: "Homepage", to: "/", end: true },
  { title: "Browse", to: "/browse" },
  ...(loggedIn
    ? [
        { title: "My profile", to: `/users/${user.id}`, hidden: !user.id },
        { title: "Logout", action: "logout" },
      ]
    : [
        { title: "Register", to: "/register" },
        { title: "Login", to: "/login" },
      ]),
];
