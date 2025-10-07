import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, Eye, X } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

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
  
  // ✅ Prevent multiple simultaneous fetches
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
    // ✅ Prevent multiple simultaneous fetch calls
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

      students.sort((a, b) => a.lastName.localeCompare(b.lastName));
      
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

  const normalizeHeaders = (data) => {
    return data.map(row => {
      const normalized = {};
      Object.keys(row).forEach(key => {
        const trimmedKey = key.trim();
        if (trimmedKey === "Student No." || trimmedKey === "Student No" || trimmedKey === "Student Number") {
          normalized["Student Number"] = row[key];
        } else if (trimmedKey === "Last Name") {
          normalized["Last Name"] = row[key];
        } else if (trimmedKey === "First Name") {
          normalized["First Name"] = row[key];
        } else if (trimmedKey === "M.I." || trimmedKey === "MI" || trimmedKey === "Middle Initial") {
          normalized["M.I."] = row[key];
        } else if (trimmedKey === "Email") {
          normalized["Email"] = row[key];
        } else if (trimmedKey === "Birthday") {
          normalized["Birthday"] = row[key];
        } else if (trimmedKey === "Section") {
          normalized["Section"] = row[key];
        } else {
          normalized[trimmedKey] = row[key];
        }
      });
      return normalized;
    });
  };

  const createAuthAccount = async (email, password) => {
    try {
      const currentUser = auth.currentUser;
      
      // Create the student account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Re-authenticate the teacher immediately
      if (currentUser) {
        await auth.updateCurrentUser(currentUser);
      }
      
      return { success: true, uid: userCredential.user.uid };
    } catch (error) {
      console.error("Auth creation error:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Email already exists' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, error: 'Invalid email format' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Password too weak' };
      }
      
      return { success: false, error: error.message };
    }
  };

  const processStudentData = async (students, headers, file) => {
    console.log("Parsed data:", students);
    console.log("Total rows:", students.length);
    console.log("First row:", students[0]);
    console.log("Headers:", headers);
    
    setUploading(true);
    setUploadProgress("Starting upload...");

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("❌ Please log in first!");
        setUploading(false);
        return;
      }

      const normalizedStudents = normalizeHeaders(students);
      console.log("Normalized first row:", normalizedStudents[0]);

      const requiredHeaders = ["Student Number", "First Name", "Last Name", "Section"];
      const firstRow = normalizedStudents[0] || {};
      const availableHeaders = Object.keys(firstRow);
      const missingHeaders = requiredHeaders.filter(h => !availableHeaders.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
      }

      const validStudents = normalizedStudents.filter(s => 
        s["Student Number"] && s["First Name"] && s["Last Name"] && s["Section"]
      );

      if (validStudents.length === 0) {
        throw new Error("No valid student data found in file");
      }

      console.log("Valid students:", validStudents.length);

      const sections = [...new Set(validStudents.map(s => s.Section?.toString().trim()))].filter(Boolean);
      
      console.log("Sections found:", sections);

      let totalCount = 0;
      let errorCount = 0;
      let authCreatedCount = 0;
      let authFailedCount = 0;

      for (const section of sections) {
        try {
          const sectionStudents = validStudents.filter(s => s.Section?.toString().trim() === section);
          
          setUploadProgress(`Processing section: ${section} (${sectionStudents.length} students)`);
          console.log(`Processing section: ${section} with ${sectionStudents.length} students`);

          const teacherName = user.displayName || user.email?.split('@')[0] || "Teacher";
          
          const classDoc = await addDoc(collection(db, "classes"), {
            name: section,
            subject: "",
            studentCount: sectionStudents.length,
            teacherId: user.uid,
            teacherEmail: user.email,
            teacherName: teacherName,
            uploadedAt: new Date(),
            fileName: file.name
          });

          console.log(`Created class document: ${classDoc.id}`);

          let studentIndex = 0;
          for (const student of sectionStudents) {
            try {
              studentIndex++;
              setUploadProgress(`Section ${section}: Adding student ${studentIndex}/${sectionStudents.length}`);

              const {
                "Student Number": studentNumber,
                "First Name": firstName,
                "Last Name": lastName,
                "M.I.": middleInitial,
                Email,
                Birthday,
                Section
              } = student;

              if (!studentNumber || !firstName || !lastName) {
                console.error("Missing required fields:", student);
                errorCount++;
                continue;
              }

              const email = Email?.toString().trim() || "";
              const birthday = Birthday?.toString().trim() || "";
              const defaultPassword = birthday || "student123";

              let authUid = null;

              // Create Firebase Auth account if email is provided
              if (email && email.includes('@')) {
                const authResult = await createAuthAccount(email, defaultPassword);
                
                if (authResult.success) {
                  authUid = authResult.uid;
                  authCreatedCount++;
                  console.log(`✅ Auth account created for: ${email}`);
                } else {
                  authFailedCount++;
                  console.warn(`⚠️ Failed to create auth for ${email}: ${authResult.error}`);
                }
              }

              // Add student to Firestore
              await addDoc(collection(db, "students"), {
                studentNumber: studentNumber.toString().trim(),
                firstName: firstName.toString().trim(),
                lastName: lastName.toString().trim(),
                middleInitial: middleInitial?.toString().trim() || "",
                email: email,
                birthday: birthday,
                section: Section?.toString().trim(),
                classId: classDoc.id,
                teacherId: user.uid,
                teacherName: teacherName,
                defaultPassword: defaultPassword,
                authUid: authUid,
                createdAt: new Date()
              });

              totalCount++;
            } catch (studentError) {
              console.error("Error adding student:", student, studentError);
              errorCount++;
            }
          }
        } catch (sectionError) {
          console.error(`Error processing section ${section}:`, sectionError);
          errorCount++;
        }
      }

      setUploadCount(totalCount);
      
      if (totalCount > 0) {
        let message = `✅ Successfully uploaded ${totalCount} student(s) in ${sections.length} class(es)!\n`;
        
        if (authCreatedCount > 0) {
          message += `🔐 Created ${authCreatedCount} authentication account(s).\n`;
        }
        
        if (authFailedCount > 0) {
          message += `⚠️ ${authFailedCount} authentication account(s) failed (may already exist).\n`;
        }
        
        if (errorCount > 0) {
          message += `⚠️ ${errorCount} student(s) failed to upload.`;
        }
        
        alert(message);
      } else {
        throw new Error("No students were uploaded successfully");
      }
      
      // ✅ Fetch classes after upload completes
      await fetchClasses();
      
      setFileName("");
      setUploadProgress("");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setErrorMessage(error.message);
      alert("❌ Failed to upload data: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
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
          setUploading(false);
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
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            defval: ""
          });
          
          const headers = Object.keys(jsonData[0] || {});
          
          await processStudentData(jsonData, headers, file);
          e.target.value = "";
        } catch (error) {
          console.error("XLSX parsing error:", error);
          setErrorMessage("Failed to parse Excel file: " + error.message);
          alert("❌ Failed to parse Excel file. Please check the file format.");
          setUploading(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        setErrorMessage("Failed to read file");
        alert("❌ Failed to read file");
        setUploading(false);
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
            Required columns: Student No., First Name, Last Name, Section, Email
          </p>
          <p className="text-xs text-gray-400 mb-3">
            🔐 Authentication accounts will be created automatically for students with valid emails
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

          {fileName && !uploading && (
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

      {viewingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                          #
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Student Number
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Name
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Birthday
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                          Auth Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.studentNumber}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.lastName}, {student.firstName} {student.middleInitial}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.email || "—"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.birthday || "—"}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {student.authUid ? (
                              <span className="text-green-600 font-semibold">✅ Created</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}