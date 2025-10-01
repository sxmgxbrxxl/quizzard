import { useNavigate } from "react-router-dom";

export default function LoginPage() {

    const navigate = useNavigate();
    
    const goToLandingPage = () => {
        navigate("/");
    };

    const goToDashboard = () => {
        navigate("/studDashboard");
    }

    return (
        <div className="relative h-screen w-full flex items-center justify-center font-Quizzard bg-gradient-to-br from-secondary to-primary">

            <div className="absolute top-10 left-10 text-white cursor-pointer bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 font-bold" >
                <button 
                onClick={goToLandingPage}
                className="text-black">
                    Back
                </button>
            </div>
            
            <div className="bg-white p-10 rounded-xl shadow-lg w-96">
                <form>
                    <h2 className="text-2xl font-bold mb-6 text-center">Log In to Quizzard</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" type="email" id="email" placeholder="user@email.com"></input>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Password</label>
                        <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" type="email" id="email" placeholder="********"></input>
                    </div>

                    <button 
                        // onClick={submitCredentials}
                        //temporary
                        onClick={goToDashboard}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-bold" type="submit">
                        Log In
                    </button>
                </form>
            </div>

        </div>
    )
}