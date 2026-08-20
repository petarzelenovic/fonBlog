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
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";
import { useState, useEffect } from "react";
import Logo from "./Logo";

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
          <Logo className="h-10 w-auto" />
        </Link>

        <form
          onSubmit={handleSearch}
          className="relative min-w-0 flex-1 md:max-w-xs lg:max-w-sm"
        >
          <AiOutlineSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Pretraga..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Pretraga"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-amber-500/15 dark:hover:text-amber-400"
            onClick={() => dispatch(toggleTheme())}
            aria-label={theme === "dark" ? "Svetli režim" : "Tamni režim"}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          {currentUser?.isAdmin && (
            <Link
              to="/create-post"
              className="hidden rounded-lg bg-fon-navy px-3 py-2 text-sm font-medium text-white hover:bg-fon-navy-hover sm:inline-flex"
            >
              Nova objava
            </Link>
          )}

          {currentUser ? (
            <Dropdown
              inline
              arrowIcon={false}
              placement="bottom-end"
              theme={{
                floating: {
                  base: "z-40 w-64 rounded-xl shadow-lg",
                  style: {
                    auto: "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
                  },
                },
              }}
              label={
                <Avatar
                  img={currentUser.profilePicture}
                  alt="Profilna slika"
                  rounded
                  size="sm"
                  className="cursor-pointer rounded-full hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-500"
                />
              }
            >
              <DropdownHeader className="flex items-center gap-3">
                <Avatar
                  img={currentUser.profilePicture}
                  alt=""
                  rounded
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {currentUser.username}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownHeader>
              <DropdownItem
                icon={HiOutlineUser}
                onClick={() => navigate("/dashboard?tab=profile")}
              >
                Profil
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                icon={HiOutlineLogout}
                onClick={handleSignOut}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 dark:focus:bg-red-950/40"
              >
                Odjavi se
              </DropdownItem>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/sign-in"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Prijavi se
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg bg-fon-navy px-3 py-2 text-sm font-medium text-white hover:bg-fon-navy-hover"
              >
                Registruj se
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
