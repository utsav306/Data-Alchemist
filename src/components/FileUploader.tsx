"use client";
import React from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

interface Props {
  onUpload: (files: FileList) => void;
  uploading: boolean;
  uploadedFile: string | null;
  error?: string | null;
  onRemove?: () => void;
}

const FileUploader: React.FC<Props> = ({
  onUpload,
  uploading,
  uploadedFile,
  error,
  onRemove,
}) => {
  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200 dark:border-gray-700">
        {!uploadedFile && (
          <label className="flex flex-col items-center w-full cursor-pointer">
            <CloudArrowUpIcon className="h-10 w-10 text-blue-500 mb-2" />
            <span className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              Upload CSV or Excel Files
            </span>
            <input
              type="file"
              accept=".csv,.xlsx"
              multiple
              onChange={(e) => e.target.files && onUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            <div className="w-full border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-4 mt-2 bg-blue-50 dark:bg-blue-950 text-center text-blue-700 dark:text-blue-200 transition hover:bg-blue-100 dark:hover:bg-blue-900">
              Drag & drop files here, or click to select
            </div>
          </label>
        )}
        {uploading && (
          <div className="flex flex-col items-center mt-4">
            <div className="loader mb-2" />
            <span className="text-blue-600 dark:text-blue-300 font-medium">
              Uploading{uploadedFile ? `: ${uploadedFile}` : "..."}
            </span>
          </div>
        )}
        {uploadedFile && !uploading && (
          <div className="flex flex-col items-center mt-4 gap-2">
            <span className="text-green-600 dark:text-green-300 font-medium">
              File uploaded: {uploadedFile}
            </span>
            {onRemove && (
              <button
                onClick={onRemove}
                className="mt-2 px-4 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                type="button"
              >
                Remove File
              </button>
            )}
          </div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400 mt-4 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
