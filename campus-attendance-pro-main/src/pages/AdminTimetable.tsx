import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";


export default function AdminTimetable() {

  const [timetable, setTimetable] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH DATA (ROBUST)
  const fetchData = async () => {
    try {
      setLoading(true);

      const [ttRes, subRes, facRes] = await Promise.all([
        api.get("/admin/gettimetable"),
        api.get("/admin/subjects"),
        api.get("/admin/faculty"),
      ]);

      // 🔥 HANDLE ALL RESPONSE TYPES
      const timetableData = ttRes.data?.data || ttRes.data || [];
      const subjectsData = subRes.data?.data || subRes.data || [];
      const facultyData = facRes.data?.data || facRes.data || [];

      setTimetable(Array.isArray(timetableData) ? timetableData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setFacultyList(Array.isArray(facultyData) ? facultyData : []);

    } catch (err) {
      console.error("Fetch Error:", err);
      setTimetable([]);
      setSubjects([]);
      setFacultyList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ HANDLE EDIT (IMPORTANT)
  const handleEdit = (item: any) => {
    setSelected({
      ...item,
      subject: item.subject?._id || "",
      teacher: item.teacher?._id || "",
    });
  };

  // ✅ UPDATE
  const updateTimetable = async () => {
    try {
      await api.put(`/admin/${selected._id}`, {
        subject: selected.subject,
        teacher: selected.teacher || null,
      });

      alert("Updated successfully");
      setSelected(null);
      fetchData();

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <DashboardLayout  role="admin">
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-2xl font-bold text-center mb-6">
        Admin Timetable Dashboard
      </h1>

      {/* TABLE */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">

          <table className="w-full">

            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3">Day</th>
                <th className="p-3">Time</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Faculty</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>

              {timetable.length > 0 ? (
                timetable.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">

                    <td className="p-3">{item.day}</td>

                    <td className="p-3">
                      {item.startTime} - {item.endTime}
                    </td>

                    <td className="p-3 font-semibold text-blue-600">
                      {item.subject?.code || "N/A"}
                    </td>

                    <td className="p-3">
                      {item.teacher?.user?.fullName || "All Staff"}
                    </td>

                    <td className="p-3">
                      <Button onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No timetable data found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ================= MODAL ================= */}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-xl shadow-xl w-96"
          >

            <h2 className="text-lg font-bold mb-4 text-center">
              Edit Timetable
            </h2>

            {/* SUBJECT DROPDOWN */}
            <div className="mb-4">
              <label className="block mb-1">Subject</label>

              <select
                value={selected.subject}
                onChange={(e) =>
                  setSelected({ ...selected, subject: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                {subjects.length > 0 ? (
                  subjects.map((sub: any) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))
                ) : (
                  <option>No subjects found</option>
                )}
              </select>
            </div>

            {/* FACULTY DROPDOWN */}
            <div className="mb-4">
              <label className="block mb-1">Faculty</label>

              <select
                value={selected.teacher}
                onChange={(e) =>
                  setSelected({ ...selected, teacher: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">All Staff</option>

                {facultyList.length > 0 ? (
                  facultyList.map((fac: any) => (
                    <option key={fac._id} value={fac._id}>
                      {fac.user?.fullName}
                    </option>
                  ))
                ) : (
                  <option>No faculty found</option>
                )}
              </select>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between">

              <Button
                onClick={() => setSelected(null)}
                className="bg-gray-400"
              >
                Cancel
              </Button>

              <Button
                onClick={updateTimetable}
                className="bg-green-500"
              >
                Save
              </Button>

            </div>

          </motion.div>
        </div>
      )}

    </div>
    </DashboardLayout>
  );
}