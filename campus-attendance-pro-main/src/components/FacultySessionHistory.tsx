import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import api from "@/services/api";

interface SessionHistory {
    id: string;
    date: string;
    day: string;
    subject: string;
    class: string;
    time: string;
    status: "Conducted" | "Missed";
}

export function FacultySessionHistory() {
    const [history, setHistory] = useState<SessionHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/attendance/faculty/history');
                if (response.data.success) {
                    setHistory(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch session history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading session history...</div>;

    if (history.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No session history found for the last 14 days.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-professional">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Session History (Last 14 Days)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((session) => (
                            <TableRow key={session.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {new Date(session.date).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell>{session.day}</TableCell>
                                <TableCell className="font-medium">{session.subject}</TableCell>
                                <TableCell>{session.class}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{session.time}</TableCell>
                                <TableCell>
                                    {session.status === 'Conducted' ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Conducted
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 gap-1 border-red-200">
                                            <XCircle className="w-3 h-3" /> Missed
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
