import { Footer } from "flowbite-react";
import Logo from "../images/fon-logo2.png";
import { Link } from "react-router-dom";

export default function FooterCom() {
    return (
        <Footer
            container
            className=" flex md:justify-center border border-t-8 border-teal-500 "
        >
            <div className="w-2/3 flex justify-between ">
                <div className=" ">
                    <div className="">
                        <Link
                            to="/"
                            className="self-center  text-sm sm:text-xl font-bold"
                        >
                            <img src={Logo} alt="" style={{ width: "200px" }} />
                        </Link>
                    </div>
                </div>
                <div className=" ">
                    <h2 className="text-3xl font-semibold ">Kontakt</h2>
                    <p className="font-normal mt-4">
                        Jove Ilića 154, Beograd 11000
                    </p>
                    <p className="font-normal mt-1">fonboard@fon.bg.ac.rs</p>
                </div>
            </div>
        </Footer>
    );
}
