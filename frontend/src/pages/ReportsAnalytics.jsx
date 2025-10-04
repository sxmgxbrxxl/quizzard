import { BarChart2, TrendingUp, AlertTriangle } from "lucide-react";

export default function ReportsAnalytics() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📊 Reports & Analytics
      </h2>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="font-bold text-gray-700">Average Score</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">82%</p>
          <p className="text-sm text-gray-500">Across all quizzes</p>
        </div>
        <div className="p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm">
          <h3 className="font-bold text-gray-700">Top Performing Class</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">BSCS 3A</p>
          <p className="text-sm text-gray-500">Average 89%</p>
        </div>
        <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm">
          <h3 className="font-bold text-gray-700">Most Missed Topic</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">Recursion</p>
          <p className="text-sm text-gray-500">Low accuracy rate</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-600 mb-8">
        <BarChart2 className="mx-auto mb-3 text-gray-400" size={40} />
        <p>Performance Graph (HOTS vs LOTS, per class) — coming soon</p>
      </div>

      {/* Feedback & Suggestions */}
      <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-sm">
        <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
          <AlertTriangle /> Suggested Improvements
        </h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Focus review on recursion and sorting algorithms.</li>
          <li>Improve time management during synchronous quizzes.</li>
          <li>Provide more HOTS-level practice questions.</li>
        </ul>
      </div>
    </div>
  );
}
