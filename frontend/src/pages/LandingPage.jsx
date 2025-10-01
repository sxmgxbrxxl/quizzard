import NavBar from "../components/NavBar"
import { ReactComponent as Brain } from "../assets/ic_brain.svg";
import { ReactComponent as Clock } from "../assets/ic_clock.svg";
import { ReactComponent as Analytics } from "../assets/ic_analytic.svg";
import { ReactComponent as People } from "../assets/ic_multiple.svg";
import { ReactComponent as Flash } from "../assets/ic_flash.svg";
import { ReactComponent as Shield } from "../assets/ic_security.svg";
import  { DotLottieReact } from '@lottiefiles/dotlottie-react';
import examAnimation from '../animations/exam.lottie';

export default function LandingPage () {
    return (
        <div>
            <NavBar />
            <div className="bg-gradient-to-br from-one to-five h-full w-full font-Quizzard ">
                
                <div className="flex flex-row col-2 px-20 p-20 gap-4">
                    <div className=" rounded-xl p-10 flex flex-col flex-1">
                        <h1 className="text-3xl md:text-6xl mb-6 font-bold">Master <span className="text-accent">Knowledge</span> Through Interactive <span className="text-accent">Quizzes</span></h1>
                        <p className="text-dark text-xl">Create, share, and take engaging quizzes with real-time feedback. Perfect for educators, students, and knowledge enthusiasts.</p>

                        <div className="flex flex-row gap-6 mt-8">
                            <button className="bg-one rounded-full py-4 px-8 border-2 border-six text-black font-bold hover:bg-two transition-colors duration-200">
                                Get Started
                            </button>

                            <button className="bg-one rounded-full py-4 px-8 border-2 border-six text-black font-bold hover:bg-two transition-colors duration-200">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1">
                        <DotLottieReact
                            src={examAnimation}
                            autoplay
                            loop
                        />
                    </div>

                </div>

                

                <div className="h-full w-full bg-two p-20">
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="font-bold text-3xl md:text-6xl mb-4">Features</h1>
                        <p className="text-dark text-xl">Everything you need to create engaging quizzes and track learning progress</p>
                    </div>

                    <div className="grid col-span-3 md:grid-cols-3 gap-4 p-10">
                        <div className="bg-white rounded-xl p-10 flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-row gap-4 items-center">
                                <Brain className="bg-two rounded-xl shadow-sm h-10 w-10 mb-4 p-2 fill-six"/>
                                <h1 className="font-bold text-xl mb-4">Smart Quiz Creation</h1>
                            </div>
                            <p className="text-dark text-left">AI-powered question generation and intelligent difficulty adjustment for optimal learning.</p>
                        </div>

                        <div className="bg-white rounded-xl p-10 flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-row gap-4 items-center">
                                <Clock className="bg-two rounded-xl shadow-sm h-10 w-10 mb-4 p-2 fill-six"/>
                                <h1 className="font-bold text-xl mb-4">Real-time Feedback</h1>
                            </div>
                            <p className="text-dark text-left">Instant results and explanations help learners understand concepts immediately.</p>
                        </div>

                        <div className="bg-white rounded-xl p-10 flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-row gap-4 items-center">
                                <Analytics className="bg-two rounded-xl shadow-sm h-10 w-10 mb-4 p-2 fill-six"/>
                                <h1 className="font-bold text-xl mb-4">Advanced Analytics</h1>
                            </div>
                            <p className="text-dark text-left">Detailed performance insights and progress tracking for both students and teachers.</p>
                        </div>

                        <div className="bg-white rounded-xl p-10 flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-row gap-4 items-center">
                                <People className="bg-two rounded-xl shadow-sm h-10 w-10 mb-4 p-2 fill-six"/>
                                <h1 className="font-bold text-xl mb-4">Collaborative Learning</h1>
                            </div>
                            <p className="text-dark text-left">Share quizzes, compete with friends, and learn together in a social environment.</p>
                        </div>

                        <div className="bg-white rounded-xl p-10 flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-row gap-4 items-center">
                                <Flash className="bg-two rounded-xl shadow-sm h-10 w-10 mb-4 p-2 fill-six"/>
                                <h1 className="font-bold text-xl mb-4">Lightning Fast</h1>
                            </div>
                            <p className="text-dark text-left">Optimized performance ensures smooth quiz-taking experience on any device.</p>
                        </div>

                        <div className="bg-white rounded-xl p-10 flex flex-col text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex flex-row gap-4 items-center">
                                <Shield className="bg-two rounded-xl shadow-sm h-10 w-10 mb-4 p-2 fill-six"/>
                                <h1 className="font-bold text-xl mb-4">Secure & Private</h1>
                            </div>
                            <p className="text-dark text-left">Your data is protected with enterprise-grade security and privacy controls.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-background h-full w-full flex flex-col justify-center text-center items-center p-20">
                    <div>
                        <h1 className="font-bold text-3xl md:text-6xl mb-4 ">Join Thousands of Educators Creating Amazing Quizzes</h1>
                        <p className="mb-10">Start creating engaging quizzes today. No credit card required, free forever plan available.</p>
                        <button className="bg-one rounded-full py-4 px-8 border-2 border-six text-black font-bold hover:bg-two transition-colors duration-200">
                            Start Creating Quizzes
                        </button>
                    </div>
                </div>
                

            </div>
        </div>
    )
}
