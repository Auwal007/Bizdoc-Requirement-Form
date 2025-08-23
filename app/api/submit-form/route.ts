import { type NextRequest, NextResponse } from "next/server"
import type { FormData, UploadedFile } from "@/lib/dropbox-services"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Processing form submission with Dropbox storage")

    // Import Dropbox services
    const {
      createDropboxFolder,
      uploadFilesToDropbox,
      createDropboxDocument,
      getDropboxFolderLink,
    } = await import("@/lib/dropbox-services")

    const formData = await request.formData()

    // Extract form data
    const registrationData: FormData = {
      registrationType: formData.get("registrationType") as string,
      businessName: formData.get("businessName") as string,
      organizationName: formData.get("organizationName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      officeAddress: formData.get("officeAddress") as string,
      totalShares: formData.get("totalShares") ? Number.parseInt(formData.get("totalShares") as string) : undefined,
      keyObjectives: formData.get("keyObjectives") as string,
      trusteeTenure: formData.get("trusteeTenure") as string,
      sealCustodian: formData.get("sealCustodian") as string,
      fundingSources: formData.get("fundingSources") as string,
      // Business Name specific fields
      proposedName1: formData.get("proposedName1") as string,
      proposedName2: formData.get("proposedName2") as string,
      natureOfBusiness: formData.get("natureOfBusiness") as string,
      directorName: formData.get("directorName") as string,
      directorNIN: formData.get("directorNIN") as string,
      directorPhone: formData.get("directorPhone") as string,
    }

    // Parse directors, shareholders, trustees
    const directorsData = formData.get("directors")
    if (directorsData) {
      registrationData.directors = JSON.parse(directorsData as string)
      console.log("[v0] Directors data:", registrationData.directors)
    }

    const shareholdersData = formData.get("shareholders")
    if (shareholdersData) {
      registrationData.shareholders = JSON.parse(shareholdersData as string)
      console.log("[v0] Shareholders data:", registrationData.shareholders)
    }

    const trusteesData = formData.get("trustees")
    if (trusteesData) {
      registrationData.trustees = JSON.parse(trusteesData as string)
      console.log("[v0] Trustees data:", registrationData.trustees)
    }

    console.log("[v0] Complete registration data:", registrationData)

    // Extract files with better organization
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
    ]

    // Handle regular files
    for (const fieldName of fileFields) {
      const fileEntries = formData.getAll(fieldName)
      for (const fileEntry of fileEntries) {
        if (fileEntry instanceof File && fileEntry.size > 0) {
          const buffer = Buffer.from(await fileEntry.arrayBuffer())
          files.push({
            fieldName,
            fileName: fileEntry.name,
            buffer,
            mimeType: fileEntry.type,
          })
        }
      }
    }

    // Handle director files with specific naming
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('director_') || key.startsWith('shareholder_') || key.startsWith('trustee_')) {
        if (value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer())
          files.push({
            fieldName: key,
            fileName: value.name,
            buffer,
            mimeType: value.type,
          })
          console.log(`[v0] Added file: ${key} -> ${value.name}`)
        }
      }
    }

    // Create folder name
    const businessName = registrationData.businessName || registrationData.organizationName || "Unknown Business"
    const timestamp = new Date().toISOString().split("T")[0]
    const folderName = `${businessName} - ${timestamp}`

    // Create Dropbox folder
    const folderPath = await createDropboxFolder(folderName, "/BIZDOC Applications")

    // Upload files to Dropbox
    let uploadedFiles: Array<{ fileName: string; filePath: string; shareUrl?: string }> = []
    if (files.length > 0) {
      uploadedFiles = await uploadFilesToDropbox(files, folderPath, registrationData)
    }

    // Create document with form data
    const { filePath: docPath, shareUrl: docLink } = await createDropboxDocument(registrationData, folderPath)

    // Get folder link
    const folderLink = await getDropboxFolderLink(folderPath)

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully to Dropbox!",
      data: {
        folderPath,
        folderLink,
        docPath,
        docLink,
        uploadedFiles,
      },
    })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit form. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
