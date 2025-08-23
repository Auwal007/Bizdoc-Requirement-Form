import { type NextRequest, NextResponse } from "next/server"
import type { FormData, UploadedFile } from "@/lib/dropbox-services"

function safeJsonParse(jsonString: string | null): any {
  if (!jsonString) return null
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error("[API] JSON parse error:", error)
    return null
  }
}

function safeParseInt(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return isNaN(parsed) ? undefined : parsed
}

function sanitizeInput(input: string | null): string {
  if (!input) return ""
  return input.replace(/[<>]/g, "").trim()
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Processing comprehensive form submission with Dropbox storage")

    // Validate environment variables
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      throw new Error("DROPBOX_ACCESS_TOKEN environment variable is required")
    }

    // Import Dropbox services
    const { createDropboxFolder, uploadFilesToDropbox, createDropboxDocument, getDropboxFolderLink } = await import(
      "@/lib/dropbox-services"
    )

    const formData = await request.formData()

    const registrationData: FormData = {
      registrationType: sanitizeInput(formData.get("registrationType") as string),
      businessName: sanitizeInput(formData.get("businessName") as string),
      organizationName: sanitizeInput(formData.get("organizationName") as string),
      email: sanitizeInput(formData.get("email") as string),
      phoneNumber:
        sanitizeInput(formData.get("phone") as string) || sanitizeInput(formData.get("phoneNumber") as string),
      officeAddress:
        sanitizeInput(formData.get("businessAddress") as string) ||
        sanitizeInput(formData.get("officeAddress") as string),
      totalShares: safeParseInt(formData.get("totalShares") as string),
      keyObjectives: sanitizeInput(formData.get("keyObjectives") as string),
      trusteeTenure: sanitizeInput(formData.get("trusteeTenure") as string),
      sealCustodian: sanitizeInput(formData.get("sealCustodian") as string),
      fundingSources: sanitizeInput(formData.get("fundingSources") as string),
      // Business Name specific fields with third proposed name
      proposedName1: sanitizeInput(formData.get("proposedName1") as string),
      proposedName2: sanitizeInput(formData.get("proposedName2") as string),
      proposedName3: sanitizeInput(formData.get("proposedName3") as string),
      natureOfBusiness: sanitizeInput(formData.get("natureOfBusiness") as string),
      directorName: sanitizeInput(formData.get("directorName") as string),
      directorNIN: sanitizeInput(formData.get("directorNIN") as string),
      directorPhone: sanitizeInput(formData.get("directorPhone") as string),
    }

    if (!registrationData.registrationType) {
      return NextResponse.json({ success: false, message: "Registration type is required" }, { status: 400 })
    }

    if (registrationData.registrationType === "trustees") {
      if (!registrationData.organizationName || !registrationData.email) {
        return NextResponse.json(
          { success: false, message: "Organization name and email are required for Incorporated Trustees" },
          { status: 400 },
        )
      }
    } else {
      if (!registrationData.proposedName1 || !registrationData.proposedName2 || !registrationData.proposedName3) {
        return NextResponse.json(
          {
            success: false,
            message: "All three proposed names are required for Business Name and Company Limited registrations",
          },
          { status: 400 },
        )
      }
      if (!registrationData.email) {
        return NextResponse.json({ success: false, message: "Email address is required" }, { status: 400 })
      }
    }

    const directorsData = formData.get("directors")
    if (directorsData) {
      registrationData.directors = safeJsonParse(directorsData as string) || []
      console.log("[API] Directors data parsed:", registrationData.directors?.length || 0, "directors")
    }

    const shareholdersData = formData.get("shareholders")
    if (shareholdersData) {
      registrationData.shareholders = safeJsonParse(shareholdersData as string) || []
      console.log("[API] Shareholders data parsed:", registrationData.shareholders?.length || 0, "shareholders")
    }

    const trusteesData = formData.get("trustees")
    if (trusteesData) {
      registrationData.trustees = safeJsonParse(trusteesData as string) || []
      console.log("[API] Trustees data parsed:", registrationData.trustees?.length || 0, "trustees")
    }

    if (registrationData.registrationType === "bn") {
      if (!registrationData.directorName || !registrationData.directorNIN) {
        return NextResponse.json(
          { success: false, message: "Director name and NIN are required for Business Name registration" },
          { status: 400 },
        )
      }
    } else if (registrationData.registrationType === "company") {
      if (!registrationData.directors || registrationData.directors.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one director is required for Company Limited registration" },
          { status: 400 },
        )
      }
      if (!registrationData.shareholders || registrationData.shareholders.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one shareholder is required for Company Limited registration" },
          { status: 400 },
        )
      }
      if (!registrationData.totalShares || registrationData.totalShares <= 0) {
        return NextResponse.json(
          { success: false, message: "Total shares must be greater than 0 for Company Limited registration" },
          { status: 400 },
        )
      }
    } else if (registrationData.registrationType === "trustees") {
      if (!registrationData.trustees || registrationData.trustees.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one trustee is required for Incorporated Trustees registration" },
          { status: 400 },
        )
      }
    }

    console.log("[API] Validated registration data:", {
      type: registrationData.registrationType,
      proposedNames: [registrationData.proposedName1, registrationData.proposedName2, registrationData.proposedName3],
      organizationName: registrationData.organizationName,
      directorsCount: registrationData.directors?.length || 0,
      shareholdersCount: registrationData.shareholders?.length || 0,
      trusteesCount: registrationData.trustees?.length || 0,
    })

    const files: UploadedFile[] = []
    const fileFields = [
      "cac2",
      "cac1_5",
      "cac7",
      "idCard",
      "passportPhotograph",
      "sampleSignature",
      "memart",
      "boardResolution",
      "constitutionDocument",
      "passportPhoto",
    ]

    // Handle regular files and BN specific files
    for (const fieldName of fileFields) {
      const fileEntries = formData.getAll(fieldName)
      for (const fileEntry of fileEntries) {
        if (fileEntry instanceof File && fileEntry.size > 0) {
          const buffer = Buffer.from(await fileEntry.arrayBuffer())
          files.push({
            fieldName,
            fileName: sanitizeInput(fileEntry.name),
            buffer,
            mimeType: fileEntry.type,
          })
          console.log(`[API] Added regular file: ${fieldName} -> ${fileEntry.name}`)
        }
      }
    }

    // Handle person-specific files (directors, shareholders, trustees)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("director_") || key.startsWith("shareholder_") || key.startsWith("trustee_")) {
        if (value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer())
          files.push({
            fieldName: key,
            fileName: sanitizeInput(value.name),
            buffer,
            mimeType: value.type,
          })
          console.log(`[API] Added person file: ${key} -> ${value.name}`)
        }
      }
    }

    console.log(`[API] Total files processed: ${files.length}`)

    const businessName =
      registrationData.organizationName ||
      registrationData.proposedName1 ||
      registrationData.businessName ||
      "Unknown Business"
    const registrationType = registrationData.registrationType.toUpperCase()
    const timestamp = new Date().toISOString().split("T")[0]
    const folderName = `${businessName} - ${registrationType} - ${timestamp}`

    console.log(`[API] Creating Dropbox folder: ${folderName}`)

    // Create Dropbox folder
    const folderPath = await createDropboxFolder(folderName, "/BIZDOC Applications")
    console.log(`[API] Dropbox folder created: ${folderPath}`)

    // Upload files to Dropbox with enhanced organization
    let uploadedFiles: Array<{ fileName: string; filePath: string; shareUrl?: string }> = []
    if (files.length > 0) {
      console.log(`[API] Uploading ${files.length} files to Dropbox...`)
      uploadedFiles = await uploadFilesToDropbox(files, folderPath, registrationData)
      console.log(`[API] Successfully uploaded ${uploadedFiles.length} files`)
    }

    // Create comprehensive document with form data
    console.log("[API] Creating comprehensive registration document...")
    const { filePath: docPath, shareUrl: docLink } = await createDropboxDocument(registrationData, folderPath)
    console.log(`[API] Document created: ${docPath}`)

    // Get folder link for easy access
    const folderLink = await getDropboxFolderLink(folderPath)
    console.log(`[API] Folder link generated: ${folderLink}`)

    const response = {
      success: true,
      message: `${registrationType} registration submitted successfully to Dropbox!`,
      data: {
        registrationType: registrationData.registrationType,
        businessName: businessName,
        folderPath,
        folderUrl: folderLink,
        documentPath: docPath,
        documentUrl: docLink,
        uploadedFiles: uploadedFiles.map((file) => ({
          fileName: file.fileName,
          filePath: file.filePath,
          shareUrl: file.shareUrl,
        })),
        summary: {
          totalFiles: uploadedFiles.length,
          directorsCount: registrationData.directors?.length || 0,
          shareholdersCount: registrationData.shareholders?.length || 0,
          trusteesCount: registrationData.trustees?.length || 0,
          submissionDate: new Date().toISOString(),
        },
      },
    }

    console.log("[API] Form submission completed successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[API] Form submission error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit form. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
