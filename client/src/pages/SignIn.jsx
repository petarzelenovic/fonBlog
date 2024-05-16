import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import Logo from "../images/fon-logo2.png";

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // da se ne refresuje stranica

        if (!formData.email || !formData.password) {
            return setErrorMessage("Please fill all fields.");
        }
        try {
            setLoading(true);
            setErrorMessage(null); //mozda ima od pre greska
            const res = await fetch("/api/auth/signin", {
                // mozemo dodati ovde localhost 3000 ili pravimo proxy
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success === false) {
                return setErrorMessage(data.message);
            }
            setLoading(false);
            if (res.ok) {
                navigate("/");
            }
        } catch (error) {
            setErrorMessage(error.message);
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen mt-60 ">
            <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-10">
                <div className="flex-1">
                    <Link
                        to="/"
                        className="self-center  text-sm sm:text-xl font-bold"
                    >
                        <img src={Logo} alt="" />
                    </Link>
                    <p className="text-sm mt-5">
                        Sve informacije za Vaše studiranje, sakupljene na jednom
                        mestu!
                    </p>
                </div>
                <div className="flex-1">
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <Label value="Your email" />
                            <TextInput
                                type="email"
                                placeholder="name@fon.bg.ac.rs"
                                id="email"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label value="Your password" />
                            <TextInput
                                type="password"
                                placeholder="************"
                                id="password"
                                onChange={handleChange}
                            />
                        </div>
                        <Button
                            gradientDuoTone="cyanToBlue"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" />
                                    <span className="pl-3">Loading...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                    <div className="flex gap-2 text-sm mt-5">
                        <span>Don't have an account?</span>
                        <Link to="/sign-up" className="text-blue-500 ">
                            Sign up
                        </Link>
                    </div>
                    {errorMessage && (
                        <Alert className="mt-5" color="failure">
                            {errorMessage}
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
}
