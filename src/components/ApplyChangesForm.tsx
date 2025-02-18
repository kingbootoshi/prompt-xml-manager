"use client";
/**
 * @file ApplyChangesForm.tsx
 * @description Form to paste XML from the O1 model and apply changes to a codebase. 
 * Allows an optional base directory and/or a full path or project folder name, stored in localStorage.
 */

import React, { useState, useEffect } from "react";
import { applyChangesAction } from "../actions/apply-changes-actions";
import { useLocalStorage } from "../lib/hooks/useLocalStorage";

const ApplyChangesForm: React.FC = () => {
  const [xml, setXml] = useState<string>("");
  // For the base directory (optional)
  const [baseDir, setBaseDir] = useLocalStorage<string>("base_directory", "");
  // For the folder name or full path
  const [projectFolder, setProjectFolder] = useLocalStorage<string>("project_folder", "");

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleApply = async () => {
    setErrorMessage("");
    if (!xml.trim()) {
      setErrorMessage("Please paste XML before applying changes.");
      return;
    }

    let finalDirectory = "";
    const trimmedProjectFolder = projectFolder.trim();
    const trimmedBaseDir = baseDir.trim();

    // If projectFolder is a full path starting with '/', we use it directly
    if (trimmedProjectFolder.startsWith("/")) {
      finalDirectory = trimmedProjectFolder;
    } else {
      // Combine baseDir + projectFolder if baseDir is present; else fallback
      if (trimmedBaseDir && trimmedProjectFolder) {
        // e.g. /Users/saint/Dev + ghost-aio
        if (trimmedBaseDir.endsWith("/")) {
          finalDirectory = trimmedBaseDir + trimmedProjectFolder;
        } else {
          finalDirectory = trimmedBaseDir + "/" + trimmedProjectFolder;
        }
      } else if (trimmedBaseDir && !trimmedProjectFolder) {
        // just use base dir
        finalDirectory = trimmedBaseDir;
      } else if (!trimmedBaseDir && trimmedProjectFolder) {
        // just use project folder
        finalDirectory = trimmedProjectFolder;
      } else {
        setErrorMessage("No directory specified. Provide either a base directory + project folder, or a full path in 'project folder' field.");
        return;
      }
    }

    try {
      await applyChangesAction(xml, finalDirectory);
      setXml("");
      setSuccessMessage("Changes applied successfully!");
    } catch (error: any) {
      setErrorMessage(error?.message || "An error occurred while applying changes.");
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary-foreground">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col">
        <label className="mb-2 font-medium text-foreground">Base Directory (Optional):</label>
        <input
          className="border border-border bg-secondary text-foreground p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          type="text"
          value={baseDir}
          onChange={(e) => setBaseDir(e.target.value)}
          placeholder="e.g. /Users/saint/Dev"
        />
        <p className="text-sm text-muted-foreground mt-2">
          This is optional. If provided, it will combine with your project folder name below.
        </p>
      </div>

      <div className="flex flex-col">
        <label className="mb-2 font-medium text-foreground">Project Folder (Name or Full Path):</label>
        <input
          className="border border-border bg-secondary text-foreground p-3 w-full rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          type="text"
          value={projectFolder}
          onChange={(e) => setProjectFolder(e.target.value)}
          placeholder="e.g. /Users/saint/Dev/ghost-aio or ghost-aio"
        />
        <p className="text-sm text-muted-foreground mt-2">
          If you provide a full path (starting with /), the base directory above will be ignored.
        </p>
      </div>

      <div className="flex flex-col">
        <label className="mb-2 font-medium text-foreground">Paste XML here:</label>
        <textarea
          className="border border-border bg-secondary text-foreground p-3 h-64 w-full rounded-lg resize-none focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          placeholder="Paste the <code_changes>...</code_changes> XML here"
        />
      </div>

      <button
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 font-medium"
        onClick={handleApply}
      >
        Apply Changes
      </button>
    </div>
  );
};

export default ApplyChangesForm;