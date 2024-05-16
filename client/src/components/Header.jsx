import React from "react";
import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon } from "react-icons/fa";
import Logo from "../images/fon-logo2.png";
import { useSelector } from "react-redux";

export default function Header() {
    const path = useLocation().pathname;
    const { currentUser } = useSelector((state) => state.user);
    return (
        <Navbar className="border-b-2">
            <Link
                to="/"
                className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold"
            >
                <img src={Logo} alt="" style={{ height: "60px" }} />
            </Link>
            <form>
                <TextInput
                    type="text"
                    placeholder="Search..."
                    rightIcon={AiOutlineSearch}
                    className="hidden lg:inline"
                />
            </form>
            <Button className="w-12 h-10 lg:hidden" color="gray" pill>
                <AiOutlineSearch />
            </Button>
            <div className="flex gap-2 md:order-2">
                {currentUser ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={<Avatar alt="user" rounded></Avatar>}
                    >
                        <Dropdown.Header>
                            <div>
                                <span className="font-semibold mr-1">
                                    {" "}
                                    Username:
                                </span>
                                <span className=" text-sm ">
                                    {currentUser.username}
                                </span>
                            </div>
                            <div className="mt-1">
                                <span className="font-semibold mr-1">
                                    Email:
                                </span>
                                <span className="text-sm  truncate">
                                    {currentUser.email}
                                </span>
                            </div>
                        </Dropdown.Header>
                        <Link to="/dashboard?tab=profile">
                            <Dropdown.Item>Profile</Dropdown.Item>
                        </Link>
                        <Dropdown.Divider></Dropdown.Divider>
                        <Dropdown.Item>Sign out</Dropdown.Item>
                    </Dropdown>
                ) : (
                    <Link to="/sign-in">
                        <Button outline pill gradientDuoTone="cyanToBlue">
                            Sign In
                        </Button>
                    </Link>
                )}

                {/* <Navbar.Toggle /> */}
            </div>

            {/* <Navbar.Collapse>
                <Navbar.Link active={path === "/"} as={"div"}>
                    <Link to="/">Home</Link>
                </Navbar.Link>
                <Navbar.Link active={path === "/about"} as={"div"}>
                    <Link to="/about">About</Link>
                </Navbar.Link>
                <Navbar.Link active={path === "/projects"} as={"div"}>
                    <Link to="/projects">Projects</Link>
                </Navbar.Link>
            </Navbar.Collapse> */}
        </Navbar>
    );
}
