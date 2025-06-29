"use client";
import React from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

/**
 * Props interface for the FileUploader component
 *
 * Defines the properties required for the file upload functionality,
 * including callbacks for upload events and state management.
 */
interface Props {
  /** Callback function triggered when files are selected for upload */
  onUpload: (files: FileList) => void;
  /** Boolean indicating if a file upload is currently in progress */
  uploading: boolean;
  /** Name of the currently uploaded file, or null if no file is uploaded */
  uploadedFile: string | null;
  /** Error message to display if upload failed, or null if no error */
  error?: string | null;
  /** Optional callback function to remove the uploaded file */
  onRemove?: () => void;
}

/**
 * FileUploader component for handling file uploads with drag-and-drop support
 *
 * This component provides a user-friendly interface for uploading CSV and Excel files.
 * It supports both drag-and-drop and click-to-select functionality, with visual
 * feedback for upload states and error handling.
 *
 * Features:
 * - Drag and drop file upload
 * - Click to select file upload
 * - Visual upload progress indication
 * - Error message display
 * - File removal functionality
 * - Responsive design with dark mode support
 *
 * @param {Props} props - Component properties
 * @returns {JSX.Element} File upload interface
 *
 * @example
 * <FileUploader
 *   onUpload={handleFileUpload}
 *   uploading={false}
 *   uploadedFile="data.xlsx"
 *   error={null}
 *   onRemove={handleRemoveFile}
 * />
 */
const FileUploader: React.FC<Props> = ({
  onUpload,
  uploading,
  uploadedFile,
  error,
  onRemove,
}) => {
  return (
    <div className="mb-8">
      {/* Main upload container with styling */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200 dark:border-gray-700">
        {/* File upload interface - shown when no file is uploaded */}
        {!uploadedFile && (
          <label className="flex flex-col items-center w-full cursor-pointer">
            {/* Upload icon */}
            <CloudArrowUpIcon className="h-10 w-10 text-blue-500 mb-2" />

            {/* Upload title */}
            <span className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              Upload CSV or Excel Files
            </span>

            {/* Hidden file input that triggers onUpload callback */}
            <input
              type="file"
              accept=".csv,.xlsx"
              multiple
              onChange={(e) => e.target.files && onUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />

            {/* Drag and drop area with hover effects */}
            <div className="w-full border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-4 mt-2 bg-blue-50 dark:bg-blue-950 text-center text-blue-700 dark:text-blue-200 transition hover:bg-blue-100 dark:hover:bg-blue-900">
              Drag & drop files here, or click to select
            </div>
          </label>
        )}

        {/* Upload progress indicator */}
        {uploading && (
          <div className="flex flex-col items-center mt-4">
            <div className="loader mb-2" />
            <span className="text-blue-600 dark:text-blue-300 font-medium">
              Uploading{uploadedFile ? `: ${uploadedFile}` : "..."}
            </span>
          </div>
        )}

        {/* Success state with uploaded file information */}
        {uploadedFile && !uploading && (
          <div className="flex flex-col items-center mt-4 gap-2">
            <span className="text-green-600 dark:text-green-300 font-medium">
              File uploaded: {uploadedFile}
            </span>

            {/* Remove file button - only shown if onRemove callback is provided */}
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

        {/* Error message display */}
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
