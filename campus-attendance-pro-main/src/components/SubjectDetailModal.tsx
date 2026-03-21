import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/services/api";

interface SubjectStat {
    id: string;
    name: string;
    teacher: string;
}

interface AttendanceRecord {
    _id: string;
    date: string;
    status: 'Present' | 'Absent';
    subject: { _id: string; name: string };
    createdAt: string;
}

interface SubjectDetailModalProps {
    subject: SubjectStat;
    isOpen: boolean;
    onClose: () => void;
}

export function SubjectDetailModal({ subject, isOpen, onClose }: SubjectDetailModalProps) {
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get('/attendance/history')
                .then(res => {
                    if (res.data.success) {
                        // Filter for this subject
                        const subjectHistory = res.data.data.filter((record: AttendanceRecord) =>
                            record.subject._id === subject.id
                        );
                        setHistory(subjectHistory);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, subject.id]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {subject.name}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                            with {subject.teacher}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Attendance History
                    </h3>

                    {loading ? (
                        <p>Loading history...</p>
                    ) : history.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((record) => {
                                        const date = new Date(record.date);
                                        return (
                                            <TableRow key={record._id}>
                                                <TableCell>{date.toLocaleDateString()}</TableCell>
                                                <TableCell>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                <TableCell>
                                                    <span className={`flex items-center gap-2 ${record.status === 'Present' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {record.status === 'Present' ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4" />
                                                        )}
                                                        {record.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-4 text-center border rounded-lg bg-muted/20">
                            No attendance records found for this subject.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
