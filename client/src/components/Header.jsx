import {
  Avatar,
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";
import { useState, useEffect } from "react";
import logo from "../assets/logo.svg";

const iconBtnClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";

export default function Header() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setSearchTerm(urlParams.get("searchTerm") || "");
  }, [location.search]);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }
      dispatch(signOutSuccess());
      navigate("/sign-in");
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      urlParams.set("searchTerm", trimmedSearchTerm);
    } else {
      urlParams.delete("searchTerm");
    }
    const searchQuery = urlParams.toString();
    navigate(searchQuery ? `/search?${searchQuery}` : "/search");
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex shrink-0 items-center">
          <img src={logo} alt="Fon Blog" className="h-10 w-auto" />
        </Link>

        <form
          onSubmit={handleSearch}
          className="relative min-w-0 flex-1 md:max-w-xs lg:max-w-sm"
        >
          <AiOutlineSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Pretraga..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Pretraga"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className={iconBtnClass}
            onClick={() => dispatch(toggleTheme())}
            aria-label={theme === "dark" ? "Svetli režim" : "Tamni režim"}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          {currentUser?.isAdmin && (
            <Link
              to="/create-post"
              className="hidden rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:inline-flex"
            >
              Nova objava
            </Link>
          )}

          {currentUser ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  src={currentUser.profilePicture}
                  size="sm"
                  alt="User avatar"
                  rounded
                  className="cursor-pointer"
                />
              }
            >
                <DropdownHeader>
                  <span className="block text-sm">@{currentUser.username}</span>
                  <span className="block truncate text-sm font-medium">
                    {currentUser.email}
                  </span>
                </DropdownHeader>
                <DropdownItem>
                  <Link to="/dashboard?tab=profile">Profil</Link>
                </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleSignOut} className="cursor-pointer">
                Odjavi se
              </DropdownItem>
            </Dropdown>
          ) : (
            <Link
              to="/sign-in"
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Prijavi se
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
