import { Footer } from "flowbite-react";
import Logo from "../images/fon-logo2.png";
import { Link } from "react-router-dom";

export default function FooterCom() {
    return (
        // <Footer
        //     container
        //     className=" flex md:justify-center border border-t-8 border-teal-500 "
        // >
        //     <div className="w-2/3 flex justify-between ">
        //         <div className=" ">
        //             <div className="">
        //                 <Link
        //                     to="/"
        //                     className="self-center  text-sm sm:text-xl font-bold"
        //                 >
        //                     <img src={Logo} alt="" style={{ width: "200px" }} />
        //                 </Link>
        //             </div>
        //         </div>
        //         <div className=" ">
        //             <h2 className="text-3xl font-semibold ">Kontakt</h2>
        //             <p className="font-normal mt-4">
        //                 Jove Ilića 154, Beograd 11000
        //             </p>
        //             <p className="font-normal mt-1">fonboard@fon.bg.ac.rs</p>
        //         </div>
        //     </div>
        // </Footer>
        <footer className="bg-gray-50 w-full ">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <Link
                        to="/"
                        className="self-center  text-sm sm:text-xl font-bold"
                    >
                        <img src={Logo} alt="" style={{ width: "150px" }} />
                    </Link>
                    <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                        <li>
                            <a
                                href="#"
                                className="hover:underline me-4 md:me-6"
                            >
                                About
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="hover:underline me-4 md:me-6"
                            >
                                Contact
                            </a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
                <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
                    © 2024{" "}
                    <a
                        href="https://https://fon.bg.ac.rs/"
                        className="hover:underline"
                    >
                        Fakultet Organizacionih Nauka
                    </a>
                </span>
            </div>
        </footer>
    );
}
