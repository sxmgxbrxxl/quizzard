import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo_Plain.svg";

export default function NavBar() {

    const navigate = useNavigate();

    const goToLoginPage = () => {
        navigate("/login");
    };

    const goToSignUpPage = () => {
        navigate("/signup");
    }

    return (
        <div className="h-20 w-full bg-white flex items-center justify-between px-8 shadow-md font-Quizzard">
            {/* Logo / Brand */}
            <div className="text-2xl font-bold items-center text-primary flex flex-row gap-4">
                <img
                    src={Logo}
                    alt="Logo"
                    className="h-9 w-9"
                />
                iQuizU
            </div>

            {/* Links */}
            <div className="flex flex-1 justify-center gap-8 text-gray-600 font-medium">
                <a href="#features" className="hover:text-blue-600">Features</a>
                <a href="#pricing" className="hover:text-blue-600">Pricing</a>
                <a href="#about" className="hover:text-blue-600">About</a>
            </div>

            {/* Button */}
            <div>
                <button
                    onClick={goToLoginPage}
                    className="px-4 py-2 mr-4 bg-white text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 font-bold">
                    Log In
                </button>
                <button 
                    onClick={goToSignUpPage}
                    className="px-4 py-2 bg-buttons text-white rounded-lg hover:bg-secondary transition-colors duration-200 font-bold"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
