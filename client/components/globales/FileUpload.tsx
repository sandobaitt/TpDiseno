"use client";
import * as React from "react";

function FileUpload() {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`flex flex-col justify-center items-center px-5 py-8 rounded-xl border-2 border-dashed cursor-pointer bg-app-card ${
        dragActive ? "border-lime-400" : "border-app-border/[0.20]"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <div className="flex justify-center items-center mb-3 w-12 h-12 rounded-xl bg-app-surface">
        <i className="ti ti-file-description text-2xl text-app-muted" />
      </div>

      {uploadedFile ? (
        <div className="text-center">
          <p className="mb-1 text-sm font-medium text-lime-400">
            {uploadedFile.name}
          </p>
          <p className="text-xs text-gray-500">
            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-1 text-sm font-medium text-app-text">
            Arrastrar documento o hacer clic
          </p>
          <p className="text-xs text-app-subtle">
            Formatos: PDF, JPG, PNG (Max 5MB)
          </p>
        </div>
      )}

      <input
        id="file-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

export default FileUpload;
