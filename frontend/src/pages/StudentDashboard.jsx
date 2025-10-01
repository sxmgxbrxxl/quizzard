import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-one to-five font-Quizzard">
            <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
                <h1 className="text-2xl font-bold text-accent">Student Dashboard</h1>
                <button
                    className="bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-two transition-colors duration-200"
                    onClick={() => navigate("/")}
                >
                    Logout
                </button>
            </nav>

            <main className="p-8">
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-2">Welcome back, Student!</h2>
                    <p className="text-dark">Here’s a summary of your quiz activity and progress.</p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-accent">18</span>
                        <span className="text-dark mt-2">Quizzes Taken</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-accent">87%</span>
                        <span className="text-dark mt-2">Average Score</span>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                        <span className="text-4xl font-bold text-accent">3</span>
                        <span className="text-dark mt-2">Badges Earned</span>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-bold mb-4">Recent Quiz Results</h3>
                    <div className="bg-white rounded-xl shadow p-4">
                        <ul>
                            <li className="py-2 border-b last:border-b-0 flex justify-between">
                                <span>Math Basics</span>
                                <span className="text-accent">92%</span>
                            </li>
                            <li className="py-2 border-b last:border-b-0 flex justify-between">
                                <span>Science Trivia</span>
                                <span className="text-accent">85%</span>
                            </li>
                            <li className="py-2 flex justify-between">
                                <span>History Challenge</span>
                                <span className="text-accent">78%</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
}