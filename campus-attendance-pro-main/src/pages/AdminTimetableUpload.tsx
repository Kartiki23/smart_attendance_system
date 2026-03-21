import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import api from "@/services/api";
import { toast } from "sonner";

interface UploadResult {
  message: string;
  results: {
    entriesAdded: number;
    errors: string[];
  };
}

const AdminTimetableUpload = () => {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      setFile(e.target.files[0]);
      setError(null);
      setUploadResult(null);

    }

  };

  const handleUpload = async () => {

    if (!file) {

      setError("Please select a file first.");
      return;

    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {

  const response = await api.post("/admin/timetable/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setUploadResult(response.data);

  toast.success(response.data.message || "Timetable uploaded successfully");

  setFile(null);

} catch (err: any) {

  console.error(err);

  const message =
    err.response?.data?.message || "Failed to upload timetable.";

  const errorList = err.response?.data?.results?.errors || [];

  // 🔥 Combine message + errors
  const fullErrorMessage =
    errorList.length > 0
      ? `${message}\n\n${errorList.join("\n")}`
      : message;

  setError(fullErrorMessage);

  // ✅ Show all errors in toast (multi-line)
  toast.error(fullErrorMessage, {
    duration: 6000,
  });

} finally {

  setLoading(false);

}
  }
  return (

    <DashboardLayout role="admin">

      <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Timetable Management
          </h1>
          <p className="text-muted-foreground">
            Upload Excel files to update class schedules.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Upload Card */}

          <Card>

            <CardHeader>

              <CardTitle>Upload Timetable</CardTitle>

              <CardDescription>
                Select an Excel file (.xlsx) containing the schedule.
              </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

              <div className="grid w-full max-w-sm items-center gap-1.5">

                <Label htmlFor="timetable">Excel File</Label>

                <Input
                  id="timetable"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />

              </div>

              {file && (

                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">

                  <FileSpreadsheet className="h-4 w-4" />

                  <span>{file.name}</span>

                </div>

              )}

              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full"
              >

                {loading ? (

                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>

                ) : (

                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Timetable
                  </>

                )}

              </Button>

              <div className="text-xs text-muted-foreground mt-4">

                <p className="font-semibold mb-1">Expected Format:</p>

                <ul className="list-disc pl-4 space-y-1">

                  <li>Columns: Day → Timeslots</li>

                  <li>Example Theory: <b>SFT(PSU)</b></li>

                  <li>Example Lab: <b>C1-MAD-PSU-LAB</b></li>

                  <li>Time format: <b>09:00-10:00</b></li>

                </ul>

              </div>

            </CardContent>

          </Card>


          {/* Success Result */}

          {uploadResult && (

            <Card>

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <CheckCircle className="h-5 w-5 text-green-500" />

                  Upload Result

                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="space-y-3">

                  <p>{uploadResult.message}</p>

                  <div className="bg-slate-50 p-4 rounded-md text-sm">

                    <div className="flex justify-between mb-2">

                      <span>Total Entries Added:</span>

                      <span className="font-bold text-green-600">

                        {uploadResult.results.entriesAdded}

                      </span>

                    </div>

                    {uploadResult.results.errors.length > 0 && (

                      <div>

                        <span className="font-semibold text-red-500 block mb-1">

                          Errors ({uploadResult.results.errors.length}):

                        </span>

                        <ul className="list-disc pl-4 text-red-600 max-h-40 overflow-y-auto">

                          {uploadResult.results.errors.map(
                            (err: string, i: number) => (
                              <li key={i}>{err}</li>
                            )
                          )}

                        </ul>

                      </div>

                    )}

                  </div>

                </div>

              </CardContent>

            </Card>

          )}


          {/* Error Alert */}

          {error && (

            <Alert variant="destructive">

              <AlertCircle className="h-4 w-4" />

              <AlertTitle>Error</AlertTitle>

              <AlertDescription>

                {error}

              </AlertDescription>

            </Alert>

          )}

        </div>

      </div>

    </DashboardLayout>

  );

};

export default AdminTimetableUpload;