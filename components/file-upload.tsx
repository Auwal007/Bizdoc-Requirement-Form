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

// Helper function for client-side image compression with safety fallbacks
async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file
  }

  return new Promise((resolve) => {
    // Set a safety timeout of 800ms to prevent hanging if browser canvas fails
    const timeoutId = setTimeout(() => {
      console.warn("[FILE-UPLOAD] Image compression timed out, returning original file")
      resolve(file)
    }, 800)

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height)
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            clearTimeout(timeoutId)
            resolve(file)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              clearTimeout(timeoutId)
              if (!blob) {
                resolve(file)
                return
              }
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const FileConstructor = (typeof globalThis !== "undefined" && (globalThis as any).File) || File
                const compressedFile = new FileConstructor([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }) as File
                resolve(compressedFile)
              } catch (fileErr) {
                console.error("[FILE-UPLOAD] File constructor error, fallback to original:", fileErr)
                resolve(file)
              }
            },
            "image/jpeg",
            0.75
          )
        } catch (canvasErr) {
          console.error("[FILE-UPLOAD] Canvas/context error, fallback to original:", canvasErr)
          clearTimeout(timeoutId)
          resolve(file)
        }
      }
      img.onerror = () => {
        clearTimeout(timeoutId)
        resolve(file)
      }
      img.src = event.target?.result as string
    }
    reader.onerror = () => {
      clearTimeout(timeoutId)
      resolve(file)
    }
    reader.readAsDataURL(file)
  })
}

export function FileUpload({ label, accept = "*/*", multiple = false, onFilesChange, className, disabled = false, value }: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFiles = value !== undefined ? value : internalFiles

  const handleFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles || disabled) return

      const fileArray = Array.from(newFiles)
      const compressedFiles = await Promise.all(
        fileArray.map(async (file) => {
          try {
            return await compressImageFile(file)
          } catch (err) {
            console.error("[FILE-UPLOAD] Image compression failed, fallback to original:", err)
            return file
          }
        })
      )

      const updatedFiles = multiple ? [...currentFiles, ...compressedFiles] : compressedFiles
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

