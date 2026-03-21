import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

interface StudentStat {
    id: string;
    name: string;
    rollNo: string;
    present: number;
    absent: number;
    total: number;
    percentage: number;
}

interface FacultyClassDetailModalProps {
    subjectId: string;
    classId: string;
    subjectName: string;
    className: string;
    isOpen: boolean;
    onClose: () => void;
}

export function FacultyClassDetailModal({
    subjectId, classId, subjectName, className, isOpen, onClose
}: FacultyClassDetailModalProps) {
    const [students, setStudents] = useState<StudentStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get(`/attendance/faculty/subject/${subjectId}/class/${classId}`)
                .then(res => {
                    if (res.data.success) {
                        setStudents(res.data.data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, subjectId, classId]);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(filter.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-card max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <span className="text-primary">{subjectName}</span> - {className}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search student..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {loading ? (
                        <p className="text-center py-4">Loading stats...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-center">Present</TableHead>
                                    <TableHead className="text-center">Absent</TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead>Attendance %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono text-xs">{student.rollNo}</TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-center text-green-600 font-medium">{student.present}</TableCell>
                                        <TableCell className="text-center text-red-500 font-medium">{student.absent}</TableCell>
                                        <TableCell className="text-center">{student.total}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${student.percentage >= 75 ? 'bg-green-500' :
                                                            student.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${student.percentage}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-bold ${student.percentage >= 75 ? 'text-green-600' :
                                                        student.percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
                                                    }`}>{student.percentage}%</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
