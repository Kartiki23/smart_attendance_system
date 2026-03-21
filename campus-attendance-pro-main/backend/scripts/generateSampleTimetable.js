const xlsx = require('xlsx');

const wb = xlsx.utils.book_new();
const wsData = [
    ['Day', 'Time', 'Class', 'Subject', 'Teacher'],
    ['Monday', '09:00-10:00', 'CS-3A', 'Data Structures', 'Dr. Sharma'],
    ['Monday', '10:00-11:00', 'CS-3A', 'DBMS', 'Prof. Patil'],
    ['Tuesday', '09:00-10:00', 'CS-3B', 'Data Structures', 'Dr. Sharma'],
    ['Wednesday', '11:00-12:00', 'IT-4A', 'Web Development', 'Dr. Kumar']
];
const ws = xlsx.utils.aoa_to_sheet(wsData);
xlsx.utils.book_append_sheet(wb, ws, "Timetable");
xlsx.writeFile(wb, "sample.xlsx"); // Using simple name
console.log("Sample timetable created: sample.xlsx");
