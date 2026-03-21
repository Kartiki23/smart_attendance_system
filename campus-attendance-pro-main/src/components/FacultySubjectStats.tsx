import { useEffect, useState } from "react";
import api from "@/services/api";

export default function FacultySubjects() {

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const facultyId = localStorage.getItem("facultyId"); // ✅ important

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/attendance/faculty-subjects/${facultyId}`);

      setData(res.data.data || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 text-center">
        My Subjects
      </h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500">
          No subjects assigned
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">

          {data.map((item) => (
            <div
              key={item._id}
              className="bg-white shadow-md rounded-lg p-4 border"
            >

              <h2 className="text-lg font-semibold text-blue-600">
                {item.subject?.name}
              </h2>

              <p className="text-sm text-gray-500">
                Code: {item.subject?.code}
              </p>

              <div className="mt-2 text-sm">
                <p><b>Day:</b> {item.day}</p>
                <p><b>Time:</b> {item.startTime} - {item.endTime}</p>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}