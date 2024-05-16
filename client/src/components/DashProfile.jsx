import React from "react";

import { useSelector } from "react-redux";
import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";

export default function DashProfile() {
    const { currentUser } = useSelector((state) => state.user);
    return (
        <div className="max-w-lg mx-auto p-3 w-full">
            <h1 className="my-7 text-center font-semibold text-3xl">
                My Profile
            </h1>
            <form className="flex flex-col gap-4">
                <div>
                    <Avatar
                        alt="user"
                        rounded
                        className="w-full h-full mb-8"
                    ></Avatar>
                </div>
                <TextInput
                    type="text"
                    id="username"
                    placeholder="username"
                    defaultValue={currentUser.username}
                />
                <TextInput
                    type="email"
                    id="email"
                    placeholder="email"
                    defaultValue={currentUser.email}
                />
                <TextInput
                    type="password"
                    id="password"
                    placeholder="password"
                />
                <Button type="submit" gradientDuoTone="greenToBlue" outline>
                    Update
                </Button>

                {/* ili img ubaci */}
            </form>
            <div className="text-red-500 flex justify-between mt-5 font-bold">
                <span className="cursor-pointer">Delete Account</span>
                <span className="cursor-pointer">Sign Out</span>
            </div>
        </div>
    );
}
