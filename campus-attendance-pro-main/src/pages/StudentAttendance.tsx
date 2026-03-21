import { useEffect, useState } from "react";
import api from "@/services/api";
import { CollegeHeader } from "@/components/CollegeHeader";

export default function StudentAttendance() {

  const [attendance, setAttendance] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [subjectFilter, setSubjectFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/student-attendance");

        const data = res.data?.attendance || [];
        setAttendance(data);
        setFiltered(data);

        calculateStats(data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchAttendance();
  }, []);

  // ✅ CALCULATE STATS
  const calculateStats = (data: any[]) => {

    const total = data.length;
    const present = data.filter(a => a.status === "Present").length;
    const absent = total - present;

    setStats({
      total,
      present,
      absent,
      percentage: total ? Math.round((present / total) * 100) : 0
    });

  };

  // ✅ FILTER
  useEffect(() => {

    let data = [...attendance];

    if (subjectFilter) {
      data = data.filter(a => a.subject?._id === subjectFilter);
    }

    if (dateFilter) {
      data = data.filter(a =>
        new Date(a.createdAt).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFiltered(data);
    calculateStats(data);

  }, [subjectFilter, dateFilter, attendance]);

  // ✅ UNIQUE SUBJECTS
  const subjects = [
    ...new Map(
      attendance.map(a => [a.subject?._id, a.subject])
    ).values()
  ];

  // ✅ EXPORT CSV
  const exportCSV = () => {

    const rows = [
      ["Subject", "Class", "Status", "Date"],
      ...filtered.map(a => [
        a.subject?.name,
        a.class?.name,
        a.status,
        new Date(a.createdAt).toLocaleString()
      ])
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "attendance.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">

      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold mb-6">
          📊 My Attendance History
        </h1>

        {/* ✅ STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <Stat title="Total" value={stats.total} />
          <Stat title="Present" value={stats.present} />
          <Stat title="Absent" value={stats.absent} />
          <Stat title="%" value={stats.percentage + "%"} />

        </div>

        {/* ✅ FILTERS */}
        <div className="flex flex-wrap gap-4 mb-6">

          {/* SUBJECT FILTER */}
          <select
            className="border p-2 rounded"
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((s: any) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* DATE FILTER */}
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => setDateFilter(e.target.value)}
          />

          {/* EXPORT */}
          <button
            onClick={exportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>

        </div>

        {/* ✅ TABLE */}
        {filtered.length === 0 ? (
          <p className="text-gray-500">No attendance found</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-xl">

            <table className="min-w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>

                {filtered.map((a, i) => (
                  <tr key={i} className="border-t">

                    <td className="p-3">
                      {a.subject?.name}
                    </td>

                    <td className="p-3">
                      {a.class?.name}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-white text-sm 
                        ${a.status === "Present" ? "bg-green-500" : "bg-red-500"}`}>
                        {a.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


// ✅ STAT CARD
function Stat({ title, value }: any) {
  return (
    <div className="bg-white shadow p-4 rounded text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}