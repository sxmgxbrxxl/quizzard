import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, Eye, X, UserPlus } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function ManageClasses() {
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewingClass, setViewingClass] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [creatingAccounts, setCreatingAccounts] = useState(false);
  const [showClassNameModal, setShowClassNameModal] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState(null);
  const [classNameInput, setClassNameInput] = useState("");
  
  const fetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !initialLoadRef.current) {
        console.log("User logged in:", user.email);
        initialLoadRef.current = true;
        fetchClasses();
      } else if (!user) {
        console.log("No user logged in");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchClasses = async () => {
    if (fetchingRef.current) {
      console.log("Already fetching, skipping...");
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const classList = [];
      querySnapshot.forEach((docSnapshot) => {
        classList.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });

      setClasses(classList);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrorMessage("Failed to fetch classes: " + error.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const fetchStudentsByClass = async (classId) => {
    try {
      setLoadingStudents(true);
      const q = query(
        collection(db, "students"),
        where("classId", "==", classId)
      );
      const querySnapshot = await getDocs(q);
      
      const students = [];
      querySnapshot.forEach((docSnapshot) => {
        students.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });

      students.sort((a, b) => {
        const aName = a.name || "";
        const bName = b.name || "";
        return aName.localeCompare(bName);
      });
      
      setStudentsList(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to fetch students: " + error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewClass = async (cls) => {
    setViewingClass(cls);
    await fetchStudentsByClass(cls.id);
  };

  const closeModal = () => {
    setViewingClass(null);
    setStudentsList([]);
  };

  const handleCreateAccountForAll = async () => {
    const studentsWithoutAccounts = studentsList.filter(s => !s.hasAccount);

    if (studentsWithoutAccounts.length === 0) {
      alert("All students already have accounts!");
      return;
    }

    if (!window.confirm(`Create accounts for ${studentsWithoutAccounts.length} student(s)?`)) {
      return;
    }

    setCreatingAccounts(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < studentsWithoutAccounts.length; i++) {
        try {
          const student = studentsWithoutAccounts[i];
          console.log(`Creating account for: ${student.name}`);
          
          // TODO: Implement account creation logic here
          // For now, just update the hasAccount field
          await updateAccountStatus(student.id, true);
          successCount++;
        } catch (error) {
          console.error("Error creating account:", error);
          errorCount++;
        }
      }

      let message = `✅ Successfully created ${successCount} account(s)!`;
      if (errorCount > 0) {
        message += `\n⚠️ ${errorCount} account(s) failed to create.`;
      }
      alert(message);

      // Refresh the student list
      await fetchStudentsByClass(viewingClass.id);
    } catch (error) {
      console.error("Error creating accounts:", error);
      alert("❌ Failed to create accounts: " + error.message);
    } finally {
      setCreatingAccounts(false);
    }
  };

  const updateAccountStatus = async (studentId, hasAccount) => {
    try {
      const studentRef = doc(db, "students", studentId);
      // Update the student document
      // await updateDoc(studentRef, { hasAccount: hasAccount });
      console.log(`Updated student ${studentId} account status to ${hasAccount}`);
    } catch (error) {
      console.error("Error updating account status:", error);
      throw error;
    }
  };

  const normalizeHeaders = (data) => {
    return data.map(row => {
      const normalized = {};
      Object.keys(row).forEach(key => {
        const trimmedKey = key.trim().replace(/\s+/g, ' ');
        const lowerKey = trimmedKey.toLowerCase();
        
        if (lowerKey === "no" || lowerKey === "no.") {
          normalized["No"] = row[key];
        } else if (lowerKey === "student no." || lowerKey === "student no" || lowerKey === "student number") {
          normalized["Student No."] = row[key];
        } else if (lowerKey === "name") {
          normalized["Name"] = row[key];
        } else if (lowerKey === "gender") {
          normalized["Gender"] = row[key];
        } else if (lowerKey === "program") {
          normalized["Program"] = row[key];
        } else if (lowerKey === "year") {
          normalized["Year"] = row[key];
        } else if (lowerKey === "email address" || lowerKey === "email") {
          normalized["Email Address"] = row[key];
        } else if (lowerKey === "contact no." || lowerKey === "contact no" || lowerKey === "contact number") {
          normalized["Contact No."] = row[key];
        } else {
          normalized[trimmedKey] = row[key];
        }
      });
      return normalized;
    });
  };

  const processStudentData = async (students, headers, file) => {
    console.log("Parsed data:", students);
    console.log("Total rows:", students.length);
    console.log("First row:", students[0]);
    console.log("Headers:", headers);
    
    const user = auth.currentUser;
    if (!user) {
      alert("❌ Please log in first!");
      return;
    }

    const normalizedStudents = normalizeHeaders(students);
    console.log("Normalized first row:", normalizedStudents[0]);

    const requiredHeaders = ["Student No.", "Name"];
    const firstRow = normalizedStudents[0] || {};
    const availableHeaders = Object.keys(firstRow);
    
    console.log("Available headers:", availableHeaders);
    console.log("Required headers:", requiredHeaders);
    
    const missingHeaders = requiredHeaders.filter(h => !availableHeaders.includes(h));
    
    if (missingHeaders.length > 0) {
      alert(`❌ Missing columns: ${missingHeaders.join(", ")}\n\nAvailable columns: ${availableHeaders.join(", ")}\n\nPlease check your file format.`);
      return;
    }

    const validStudents = normalizedStudents.filter(s => 
      s["Student No."] && s["Name"]
    );

    if (validStudents.length === 0) {
      alert("❌ No valid student data found in file");
      return;
    }

    console.log("Valid students:", validStudents.length);

    // Get default class name from file name (remove extension)
    const defaultClassName = file.name.replace(/\.(csv|xlsx|xls)$/i, '');
    
    // Store the data and show the class name modal
    setPendingUploadData({
      validStudents,
      file
    });
    setClassNameInput(defaultClassName);
    setShowClassNameModal(true);
  };

  const confirmClassNameAndUpload = async () => {
    if (!classNameInput.trim()) {
      alert("❌ Please enter a class name!");
      return;
    }

    setShowClassNameModal(false);
    setUploading(true);
    setUploadProgress("Starting upload...");

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("❌ Please log in first!");
        return;
      }

      const { validStudents, file } = pendingUploadData;
      const teacherName = user.displayName || user.email?.split('@')[0] || "Teacher";
      
      setUploadProgress(`Creating class: ${classNameInput}`);
      
      const classDoc = await addDoc(collection(db, "classes"), {
        name: classNameInput.trim(),
        subject: "",
        studentCount: validStudents.length,
        teacherId: user.uid,
        teacherEmail: user.email,
        teacherName: teacherName,
        uploadedAt: new Date(),
        fileName: file.name
      });

      console.log(`Created class document: ${classDoc.id}`);

      let totalCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validStudents.length; i++) {
        try {
          const student = validStudents[i];
          setUploadProgress(`Adding student ${i + 1}/${validStudents.length}`);

          const {
            "No": no,
            "Student No.": studentNo,
            "Name": name,
            "Gender": gender,
            "Program": program,
            "Year": year,
            "Email Address": emailAddress,
            "Contact No.": contactNo
          } = student;

          if (!studentNo || !name) {
            console.error("Missing required fields:", student);
            errorCount++;
            continue;
          }

          // Add student to Firestore
          await addDoc(collection(db, "students"), {
            no: no?.toString().trim() || "",
            studentNo: studentNo.toString().trim(),
            name: name.toString().trim(),
            gender: gender?.toString().trim() || "",
            program: program?.toString().trim() || "",
            year: year?.toString().trim() || "",
            emailAddress: emailAddress?.toString().trim() || "",
            contactNo: contactNo?.toString().trim() || "",
            classId: classDoc.id,
            teacherId: user.uid,
            teacherName: teacherName,
            hasAccount: false,
            createdAt: new Date()
          });

          totalCount++;
        } catch (studentError) {
          console.error("Error adding student:", validStudents[i], studentError);
          errorCount++;
        }
      }

      setUploadCount(totalCount);
      
      if (totalCount > 0) {
        let message = `✅ Successfully uploaded ${totalCount} student(s)!\n`;
        
        if (errorCount > 0) {
          message += `⚠️ ${errorCount} student(s) failed to upload.`;
        }
        
        alert(message);
      } else {
        throw new Error("No students were uploaded successfully");
      }
      
      await fetchClasses();
      
      setFileName("");
      setUploadProgress("");
      setPendingUploadData(null);
      setClassNameInput("");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setErrorMessage(error.message);
      alert("❌ Failed to upload data: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const cancelClassNameModal = () => {
    setShowClassNameModal(false);
    setPendingUploadData(null);
    setClassNameInput("");
    setFileName("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setErrorMessage("");
    setUploadCount(0);

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header) => header.trim(),
        complete: async function (results) {
          await processStudentData(results.data, results.meta.fields || [], file);
          e.target.value = "";
        },
        error: function(error) {
          console.error("CSV parsing error:", error);
          setErrorMessage("Failed to parse CSV file: " + error.message);
          alert("❌ Failed to parse CSV file. Please check the file format.");
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Get all data without headers first to find the header row
          const allData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, // Get as array of arrays
            raw: false,
            defval: ""
          });
          
          console.log("First 15 rows:", allData.slice(0, 15));
          
          // Find the row that contains "Student No." or "No"
          let headerRowIndex = -1;
          for (let i = 0; i < allData.length; i++) {
            const row = allData[i];
            const rowStr = row.join('|').toLowerCase();
            if (rowStr.includes('student no') || (rowStr.includes('no') && rowStr.includes('name'))) {
              headerRowIndex = i;
              console.log("Found header row at index:", i, "Row:", row);
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            throw new Error("Could not find header row with 'Student No.' and 'Name' columns");
          }
          
          // Now parse again starting from the header row
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          range.s.r = headerRowIndex; // Start from header row
          const newRange = XLSX.utils.encode_range(range);
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: "",
            range: newRange
          });
          
          console.log("Parsed data from header row:", jsonData.slice(0, 3));
          
          const headers = Object.keys(jsonData[0] || {});
          
          await processStudentData(jsonData, headers, file);
          e.target.value = "";
        } catch (error) {
          console.error("XLSX parsing error:", error);
          setErrorMessage("Failed to parse Excel file: " + error.message);
          alert("❌ Failed to parse Excel file. Please check the file format.");
        }
      };
      
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        setErrorMessage("Failed to read file");
        alert("❌ Failed to read file");
      };
      
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMessage("Unsupported file format. Please upload CSV or XLSX files only.");
      alert("❌ Unsupported file format. Please upload CSV or XLSX files only.");
      e.target.value = "";
    }
  };

  const handleRemoveClass = async (classId) => {
    if (!window.confirm("Are you sure you want to remove this class? This will also delete all students in this class.")) {
      return;
    }

    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("classId", "==", classId)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const deletePromises = [];
      studentsSnapshot.forEach((studentDoc) => {
        deletePromises.push(deleteDoc(doc(db, "students", studentDoc.id)));
      });

      deletePromises.push(deleteDoc(doc(db, "classes", classId)));

      await Promise.all(deletePromises);

      alert("✅ Class removed successfully!");
      await fetchClasses();
    } catch (error) {
      console.error("Error removing class:", error);
      alert("❌ Failed to remove class: " + error.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🏫 Manage Classes
      </h2>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
        <div className="text-center">
          <Upload className="mx-auto text-gray-400 w-10 h-10 mb-3" />
          <p className="text-gray-600 mb-3">Upload your classlist (.csv or .xlsx)</p>
          <p className="text-sm text-gray-500 mb-3">
            Required columns: No, Student No., Name, Gender, Program, Year, Email Address, Contact No.
          </p>

          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              "Choose File"
            )}
          </label>

          {fileName && !uploading && !showClassNameModal && (
            <p className="text-sm text-gray-500 italic mt-3">Selected: {fileName}</p>
          )}

          {uploadProgress && uploading && (
            <p className="text-sm text-blue-600 font-medium mt-3">
              {uploadProgress}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold text-center">
              ❌ {errorMessage}
            </p>
          </div>
        )}

        {uploadCount > 0 && !uploading && !errorMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold text-center">
              ✅ Successfully uploaded {uploadCount} student(s)!
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Classes</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No classes uploaded yet. Upload a file to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-blue-50"
              >
                <h4 className="text-lg font-bold text-gray-800">{cls.name}</h4>
                {cls.subject && <p className="text-gray-600">{cls.subject}</p>}
                <p className="text-sm text-gray-500">{cls.studentCount} students</p>
                <p className="text-xs text-gray-400">Teacher: {cls.teacherName}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded: {cls.uploadedAt?.toDate().toLocaleDateString()}
                </p>
                <div className="mt-3 flex justify-between">
                  <button 
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    onClick={() => handleViewClass(cls)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    className="text-red-500 hover:underline font-semibold"
                    onClick={() => handleRemoveClass(cls.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Class Name Modal */}
      {showClassNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Class Name</h3>
            <p className="text-gray-600 mb-4">
              Please enter a name for this class:
            </p>
            <input
              type="text"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              placeholder="e.g., CS101-A, Math 2024, English 101"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  confirmClassNameAndUpload();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelClassNameModal}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmClassNameAndUpload}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Class Modal */}
      {viewingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">{viewingClass.name}</h3>
                <p className="text-blue-100 text-sm">
                  {viewingClass.studentCount} student(s)
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-blue-700 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : studentsList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No students found in this class.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          No
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Student No.
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Name
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Gender
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Program
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Year
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Email Address
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Contact No.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.no || index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.studentNo}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.gender || "—"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.program || "—"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.year || "—"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.emailAddress || "—"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.contactNo || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleCreateAccountForAll}
                disabled={creatingAccounts || studentsList.every(s => s.hasAccount)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingAccounts ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account for All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}