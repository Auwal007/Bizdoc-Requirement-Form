"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label: string
  accept?: string
  multiple?: boolean
  onFilesChange: (files: File[]) => void
  className?: string
  disabled?: boolean
  value?: File[]
}

export function FileUpload({ label, accept = "*/*", multiple = false, onFilesChange, className, disabled = false, value }: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFiles = value !== undefined ? value : internalFiles

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || disabled) return

      const fileArray = Array.from(newFiles)
      const updatedFiles = multiple ? [...currentFiles, ...fileArray] : fileArray
      if (value === undefined) {
        setInternalFiles(updatedFiles)
      }
      onFilesChange(updatedFiles)
    },
    [currentFiles, multiple, onFilesChange, disabled, value],
  )

  const removeFile = (index: number) => {
    if (disabled) return
    const updatedFiles = currentFiles.filter((_, i) => i !== index)
    if (value === undefined) {
      setInternalFiles(updatedFiles)
    }
    onFilesChange(updatedFiles)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles, disabled],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragOver(false)
  }, [disabled])

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          disabled ? "border-border bg-muted/40 cursor-not-allowed opacity-70" : "cursor-pointer border-border hover:border-primary/50",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {disabled ? "Upload disabled (synced)" : "Drag and drop files here, or click to select"}
        </p>
        {!disabled && (
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        )}
      </div>

      {currentFiles.length > 0 && (
        <div className="space-y-2">
          {currentFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              {!disabled && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

