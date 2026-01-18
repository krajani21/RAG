import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, FileText, Check } from "lucide-react";
import { Link } from "react-router-dom";

const ConnectPdfFile = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      toast.error("No file selected or user not logged in.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://clonark.onrender.com/api/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-user-id": user.id,
          },
        }
      );

      toast.success("Upload successful!");
      console.log("Server response:", res.data);
      setUploaded(true);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 space-y-12">
      {/* Back Button */}
      <div className="max-w-3xl mx-auto">
        <Link
          to="/connect"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-wrise-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Upload a PDF</h1>
        <p className="text-gray-600 text-base">
          Add a PDF for the chatbot to get context about your content.
        </p>
      </div>

      {/* Upload Card */}
      <div className="max-w-lg mx-auto bg-white border rounded-2xl shadow-md p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">PDF Upload</h3>
            <p className="text-sm text-gray-500">Upload your file to begin processing.</p>
          </div>
        </div>

        <div className="space-y-2">
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="pdf-upload"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-white font-medium rounded-xl cursor-pointer hover:bg-primary/90 transition-all shadow-sm hover-scale"
          >
            {uploading ? "Uploading..." : "Choose PDF File"}
          </label>
        </div>

        {uploading && (
          <p className="text-sm text-gray-500 animate-pulse text-center">Uploading...</p>
        )}

        {uploaded && (
          <div className="flex items-center text-green-600 font-medium gap-2 justify-center">
            <Check size={20} />
            Uploaded
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectPdfFile;

