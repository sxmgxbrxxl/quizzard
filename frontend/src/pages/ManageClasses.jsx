import { useState } from "react";
import { Upload } from "lucide-react";

export default function ManageClasses() {
  const [fileName, setFileName] = useState("");
  const [classes, setClasses] = useState([
    { id: 1, name: "BSCS 3A", subject: "Data Structures", students: 25 },
    { id: 2, name: "BSIT 2B", subject: "Programming 2", students: 30 },
  ]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🏫 Manage Classes
      </h2>

      {/* Upload Classlist */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
        <Upload className="mx-auto text-gray-400 w-10 h-10 mb-3" />
        <p className="text-gray-600 mb-3">
          Upload your classlist (.csv or .xlsx)
        </p>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFileName(e.target.files[0]?.name || "")}
          className="mb-3 text-sm"
        />
        {fileName && (
          <p className="text-sm text-gray-500 italic">Selected: {fileName}</p>
        )}
        <button className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          Upload File
        </button>
      </div>

      {/* Class List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Classes</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-blue-50"
            >
              <h4 className="text-lg font-bold text-gray-800">{cls.name}</h4>
              <p className="text-gray-600">{cls.subject}</p>
              <p className="text-sm text-gray-500">{cls.students} students</p>
              <div className="mt-3 flex justify-between">
                <button className="text-blue-600 font-semibold hover:underline">
                  View
                </button>
                <button className="text-red-500 hover:underline font-semibold">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
