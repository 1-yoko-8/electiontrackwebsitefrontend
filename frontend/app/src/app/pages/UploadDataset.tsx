import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import axios from "axios";
import { toast } from 'sonner';

import api from "../../api/axios"

type UploadResponse = {
  message: string;
  rows_inserted: number;
  duplicates_skipped: number;
};

export default function UploadDataset() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.xlsx')) {
      setFile(droppedFile);
      setUploadSuccess(false);
    } else {
      toast.error('Please upload a valid Excel file (.xlsx)');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      setUploadSuccess(false);
    } else {
      toast.error('Please upload a valid Excel file (.xlsx)');
    }
  };

  const handleUpload = async () => {
  if (!file) {
    toast.error("Please select a file first");
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<UploadResponse>("/admin/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Backend response:", res.data);

    toast.success(
      `Uploaded! ${res.data.rows_inserted} rows added, ${res.data.duplicates_skipped} duplicates skipped`
    );

    setUploadSuccess(true);
    setFile(null)
  } catch (error: unknown) {
  console.error(error);

  if (axios.isAxiosError(error)) {
    toast.error(
      error.response?.data?.detail || "Failed to upload dataset"
    );
  } else {
    toast.error("Unexpected error occurred");
  }
} finally {
    setIsUploading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Dataset</h1>
        <p className="text-gray-600">
          Upload an Excel file containing field worker assignments and location data
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`p-4 rounded-full ${
                isDragging ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              {uploadSuccess ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <Upload
                  className={`w-12 h-12 ${
                    isDragging ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
              )}
            </div>

            {file ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {file.name}
                </span>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    Drag and drop your Excel file here
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              </>
            )}

            <input
              type="file"
              id="file-upload"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="file-upload"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Browse Files
            </label>

            <p className="text-xs text-gray-500">
              Supported format: .xlsx (Excel files only)
            </p>
          </div>
        </div>

        {/* Upload Button */}
        {file && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Dataset
                </>
              )}
            </button>

            <button
              onClick={() => {
                setFile(null);
                setUploadSuccess(false);
              }}
              disabled={isUploading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Dataset uploaded successfully!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  The data has been processed and saved to the database.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-3">
          Excel File Requirements:
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>File must be in .xlsx format (Excel 2007 or later)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Include columns for: username, location_name
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>First row should contain column headers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Ensure all required fields are filled in</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
