import { useState } from "react";
import { FileUp, Edit3, Settings, Send, PlusCircle } from "lucide-react";

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Midterm Quiz", mode: "Synchronous", code: "QZ1234" },
    { id: 2, title: "Pre-Final Assessment", mode: "Asynchronous", code: "QZ5678" },
  ]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📝 Manage Quizzes
      </h2>

      {/* Create Quiz Options */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-8">
        <h3 className="text-lg font-semibold mb-3">Create New Quiz</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <FileUp className="w-5 h-5" /> Upload PDF (AI Generate)
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            <PlusCircle className="w-5 h-5" /> Manual Quiz Creation
          </button>
        </div>
      </div>

      {/* Quiz Library */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quiz Library</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-yellow-50"
            >
              <h4 className="text-lg font-bold text-gray-800">{quiz.title}</h4>
              <p className="text-gray-600 text-sm">Mode: {quiz.mode}</p>
              <p className="text-gray-500 text-sm">Code: {quiz.code}</p>

              <div className="flex justify-between items-center mt-4">
                <button className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button className="text-gray-700 font-semibold hover:underline flex items-center gap-1">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button className="text-green-600 font-semibold hover:underline flex items-center gap-1">
                  <Send className="w-4 h-4" /> Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
