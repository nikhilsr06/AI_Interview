import React, { useState } from "react";

export interface PdfUploadProps {
  onUpload: (title: string, timeLimit: number, questionsFromBackend: any[], schedule_id: string) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [timeLimit, setTimeLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeLimit(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }
    setLoading(true);

    try {
      // 1. Upload PDF to backend
      const formData = new FormData();
      formData.append("jd", selectedFile);

      const jdRes = await fetch("http://localhost:9000/api/upload-jd", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const jdData = await jdRes.json();
      if (!jdRes.ok) throw new Error(jdData.error || "Failed to parse PDF");

      // 2. Send extracted text to /upload-q
      const qRes = await fetch("http://localhost:9000/api/upload-q", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jdData.jdText }),
        credentials: "include",
      });

      const qData = await qRes.json();
      if (!qRes.ok) throw new Error(qData.error || "Failed to process JD");

      // 3. Call /select-questions with timeLimit
      const sqRes = await fetch("http://localhost:9000/api/select-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeLimit }),
        credentials: "include",
      });

      const sqData = await sqRes.json();
      console.log("sqData: ", sqData);
      if (!sqRes.ok) throw new Error(sqData.error || "Failed to select questions");

      // Success: call onUpload
      onUpload(qData.title, timeLimit, sqData.questions, sqData.schedule_id);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4">Upload JD</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4"
        />
        <label>
          Time Limit (minutes):
          <input
            type="number"
            min={10}
            max={60}
            value={timeLimit}
            onChange={handleTimeChange}
            className="ml-2 border rounded px-2 py-1"
          />
        </label>
        <button
          type="submit"
          disabled={!selectedFile || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
    </div>
  );
};

export default PdfUpload;