import React from "react";
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiUserGroup,
  HiAnnotation,
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
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
  return (
    <Sidebar className="w-full md:w-56">
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem
            as={Link}
            to="/dashboard?tab=profile"
            active={tab === "profile"}
            icon={HiUser}
            label={currentUser.isAdmin ? "Admin" : "User"}
            labelColor="dark"
          >
            Profile
          </SidebarItem>
          {currentUser.isAdmin && (
            <>
              <SidebarItem
                as={Link}
                to="/dashboard?tab=posts"
                active={tab === "posts"}
                icon={HiDocumentText}
              >
                Posts
              </SidebarItem>
              <SidebarItem
                as={Link}
                to="/dashboard?tab=users"
                active={tab === "users"}
                icon={HiUserGroup}
              >
                Users
              </SidebarItem>
              <SidebarItem
                as={Link}
                to="/dashboard?tab=comments"
                active={tab === "comments"}
                icon={HiAnnotation}
              >
                Comments
              </SidebarItem>
            </>
          )}

          <SidebarItem
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            Sign Out
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
