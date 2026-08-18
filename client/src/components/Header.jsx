import React from "react";
import {
  Avatar,
  Button,
  Dropdown,
  Navbar,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  TextInput,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
} from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch, AiOutlineUser } from "react-icons/ai";
import { FaMoon } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function Header() {
  const path = useLocation().pathname;
  const { currentUser } = useSelector((state) => state.user);
  return (
    <Navbar className="border-b-2">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="px-2 py-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
          Fon
        </span>
        Blog
      </Link>
      <form>
        <TextInput
          type="search"
          placeholder="Search.."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
        />
      </form>
      <Button className="w-12 h-10 lg:hidden" color="gray" pill>
        <AiOutlineSearch />
      </Button>
      <div className="flex gap-2 md:order-2">
        <Button className="w-12 h-10 hidden sm:inline" color="gray" pill>
          <FaMoon />
        </Button>
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
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </DropdownHeader>
            <DropdownItem>
              <Link to="/dashboard?tab=profile">Profile</Link>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button className="bg-linear-to-r from-purple-500 to-blue-500 text-white">
              Sign In
            </Button>
          </Link>
        )}

        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink as={Link} to="/" active={path === "/"}>
          Home
        </NavbarLink>
        <NavbarLink as={Link} to="/about" active={path === "/about"}>
          About
        </NavbarLink>
        <NavbarLink as={Link} to="/projects" active={path === "/projects"}>
          Projects
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
