import { Dropbox } from "dropbox"

export interface FormData {
  registrationType: string
  businessName?: string
  organizationName?: string
  email: string
  phoneNumber: string
  officeAddress: string
  totalShares?: number
  keyObjectives?: string
  trusteeTenure?: string
  sealCustodian?: string
  fundingSources?: string
  // Business Name specific fields
  proposedName1?: string
  proposedName2?: string
  proposedName3?: string
  natureOfBusiness?: string
  directorName?: string
  directorNIN?: string
  directorPhone?: string
  directors?: Array<{
    fullName: string
    email: string
    phoneNumber: string
    residentialAddress: string
    dateOfBirth: string
    idCard?: File
    passportPhotograph?: File
    sampleSignature?: File
  }>
  shareholders?: Array<{
    fullName: string
    email: string
    phoneNumber: string
    residentialAddress: string
    dateOfBirth: string
    shares: number
    idCard?: File
    passportPhotograph?: File
    sampleSignature?: File
  }>
  trustees?: Array<{
    fullName: string
    email: string
    phoneNumber: string
    ninNumber: string
    position: string
    residentialAddress: string
    dateOfBirth: string
    idCard?: File
    passportPhotograph?: File
    sampleSignature?: File
  }>
}

export interface UploadedFile {
  fieldName: string
  fileName: string
  buffer: Buffer
  mimeType: string
}

// Helper function to convert technical field names to readable document types
function getReadableFileType(fileType: string): string {
  const typeMap: { [key: string]: string } = {
    idCard: "ID_Card",
    passportPhotograph: "Passport_Photo",
    sampleSignature: "Sample_Signature",
    memart: "Memorandum_Articles",
    boardResolution: "Board_Resolution",
    constitutionDocument: "Constitution_Document",
    birthCertificate: "Birth_Certificate",
    utilityBill: "Utility_Bill",
    bankStatement: "Bank_Statement",
    proofOfAddress: "Proof_of_Address",
  }
  return typeMap[fileType] || fileType.toUpperCase()
}

// Initialize Dropbox with access token
if (!process.env.DROPBOX_ACCESS_TOKEN) {
  throw new Error("DROPBOX_ACCESS_TOKEN environment variable is required")
}

const accessToken = process.env.DROPBOX_ACCESS_TOKEN.trim()

// Validate token format
if (!accessToken.startsWith("sl.") && !accessToken.startsWith("aal_") && !accessToken.startsWith("aap_")) {
  console.error("[DROPBOX] Warning: Token format may be invalid. Expected format: sl.*, aal_*, or aap_*")
}

const dbx = new Dropbox({
  accessToken: accessToken,
  fetch: fetch,
})

export async function validateDropboxToken(): Promise<{ isValid: boolean; error?: string; accountInfo?: any }> {
  try {
    console.log("[DROPBOX] Validating access token...")
    const response = await dbx.usersGetCurrentAccount()
    console.log("[DROPBOX] Token validation successful. Account:", response.result.name.display_name)
    return {
      isValid: true,
      accountInfo: {
        name: response.result.name.display_name,
        email: response.result.email,
        accountId: response.result.account_id,
      },
    }
  } catch (error: any) {
    console.error("[DROPBOX] Token validation failed:", error.message)
    let errorMessage = "Token validation failed"

    if (error.status === 401) {
      errorMessage = "Token is invalid, expired, or lacks permissions"
      console.error("[DROPBOX] 401 Error - Token is invalid, expired, or lacks permissions")
      console.error("[DROPBOX] Please check:")
      console.error("  1. Token is not expired")
      console.error("  2. App has 'Full Dropbox' access (not 'App folder')")
      console.error("  3. User hasn't revoked app permissions")
      console.error("  4. Token format is correct (should start with sl., aal_, or aap_)")
    }

    return {
      isValid: false,
      error: errorMessage,
    }
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_.]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 100) // Limit length
}

function safeParseInt(value: string, fallback = 0): number {
  const parsed = Number.parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

export async function createDropboxFolder(name: string, parentPath = ""): Promise<string> {
  try {
    const tokenValidation = await validateDropboxToken()
    if (!tokenValidation.isValid) {
      throw new Error(`Dropbox authentication failed: ${tokenValidation.error}`)
    }

    const sanitizedName = sanitizeFileName(name)
    const folderPath = parentPath ? `${parentPath}/${sanitizedName}` : `/${sanitizedName}`

    console.log("[DROPBOX] Creating folder:", folderPath)

    await dbx.filesCreateFolderV2({
      path: folderPath,
      autorename: true,
    })

    console.log("[DROPBOX] Folder created successfully:", folderPath)
    return folderPath
  } catch (error: any) {
    console.error("[DROPBOX] Error creating folder:", error.message)

    if (error.status === 401) {
      throw new Error(
        "Dropbox authentication failed. The access token is invalid, expired, or lacks sufficient permissions. Please regenerate your Dropbox access token with 'Full Dropbox' access.",
      )
    } else if (error.status === 403) {
      throw new Error("Dropbox access forbidden. Your app may not have permission to create folders in this location.")
    } else if (error.error && error.error[".tag"] === "path") {
      throw new Error(`Dropbox path error: ${error.error.path[".tag"]}. The folder path may be invalid.`)
    }

    throw error
  }
}

export async function uploadFilesToDropbox(
  files: UploadedFile[],
  folderPath: string,
  formData?: FormData,
): Promise<Array<{ fileName: string; filePath: string; shareUrl?: string }>> {
  try {
    console.log(`[v0] Uploading ${files.length} files to Dropbox folder: ${folderPath}`)

    const uploadedFiles = []

    for (const file of files) {
      let targetPath = folderPath
      let fileName = sanitizeFileName(file.fileName)

      // Create organized folder structure with person names
      if (file.fieldName.startsWith("director_")) {
        const parts = file.fieldName.split("_")
        if (parts.length < 3) continue
        const directorIndex = safeParseInt(parts[1])
        const fileType = parts[2]
        const directorName = formData?.directors?.[directorIndex]?.fullName || `Director_${directorIndex + 1}`
        // Clean name for filename (remove special characters)
        const cleanName = sanitizeFileName(directorName)
        // Convert fileType to readable format
        const readableFileType = getReadableFileType(fileType)
        targetPath = `${folderPath}/Directors/Director_${directorIndex + 1}_${cleanName}`
        fileName = `${readableFileType}_${cleanName}_${sanitizeFileName(file.fileName)}`
        console.log(`[v0] Director file: ${directorName} (${readableFileType}) -> ${fileName}`)
      } else if (file.fieldName.startsWith("shareholder_")) {
        const parts = file.fieldName.split("_")
        if (parts.length < 3) continue
        const shareholderIndex = safeParseInt(parts[1])
        const fileType = parts[2]
        const shareholderName =
          formData?.shareholders?.[shareholderIndex]?.fullName || `Shareholder_${shareholderIndex + 1}`
        // Clean name for filename (remove special characters)
        const cleanName = sanitizeFileName(shareholderName)
        // Convert fileType to readable format
        const readableFileType = getReadableFileType(fileType)
        targetPath = `${folderPath}/Shareholders/Shareholder_${shareholderIndex + 1}_${cleanName}`
        fileName = `${readableFileType}_${cleanName}_${sanitizeFileName(file.fileName)}`
        console.log(`[v0] Shareholder file: ${shareholderName} (${readableFileType}) -> ${fileName}`)
      } else if (file.fieldName.startsWith("trustee_")) {
        const parts = file.fieldName.split("_")
        if (parts.length < 3) continue
        const trusteeIndex = safeParseInt(parts[1])
        const fileType = parts[2]
        const trusteeName = formData?.trustees?.[trusteeIndex]?.fullName || `Trustee_${trusteeIndex + 1}`
        // Clean name for filename (remove special characters)
        const cleanName = sanitizeFileName(trusteeName)
        // Convert fileType to readable format
        const readableFileType = getReadableFileType(fileType)
        targetPath = `${folderPath}/Trustees/Trustee_${trusteeIndex + 1}_${cleanName}`
        fileName = `${readableFileType}_${cleanName}_${sanitizeFileName(file.fileName)}`
        console.log(`[v0] Trustee file: ${trusteeName} (${readableFileType}) -> ${fileName}`)
      } else {
        // Regular files go into a general Documents folder
        const readableFileType = getReadableFileType(file.fieldName)
        targetPath = `${folderPath}/Documents`
        fileName = `${readableFileType}_${sanitizeFileName(file.fileName)}`
      }

      const filePath = `${targetPath}/${fileName}`

      try {
        // Create the subfolder if it doesn't exist
        if (targetPath !== folderPath) {
          try {
            await dbx.filesCreateFolderV2({
              path: targetPath,
              autorename: false,
            })
          } catch (folderError: any) {
            // Folder might already exist, ignore error
            console.log(`[v0] Note: Folder ${targetPath} creation attempted`)
          }
        }

        // Upload file to Dropbox
        await dbx.filesUpload({
          path: filePath,
          contents: file.buffer,
          mode: { ".tag": "add" } as any,
          autorename: true,
        })

        console.log(`[v0] File uploaded to Dropbox: ${fileName} -> ${filePath}`)

        // Try to create a shared link
        let shareUrl = undefined
        try {
          const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
            path: filePath,
            settings: {
              requested_visibility: { ".tag": "public" },
            },
          })
          shareUrl = shareResponse.result.url
        } catch (shareError) {
          console.log(`[v0] Could not create share link for ${file.fileName}:`, shareError)
        }

        uploadedFiles.push({
          fileName: file.fileName,
          filePath: filePath,
          shareUrl: shareUrl,
        })

        console.log(`[v0] File uploaded to Dropbox: ${file.fileName}`)
      } catch (fileError) {
        console.error(`[v0] Error uploading file ${file.fileName}:`, fileError)
        // Continue with other files
      }
    }

    return uploadedFiles
  } catch (error) {
    console.error("[v0] Error uploading files to Dropbox:", error)
    throw error
  }
}

export async function createDropboxDocument(
  formData: FormData,
  folderPath: string,
): Promise<{ filePath: string; shareUrl?: string }> {
  try {
    const businessName = formData.businessName || formData.organizationName || "Unknown Business"
    const fileName = `${sanitizeFileName(businessName)} - Registration Form Data.txt`
    const filePath = `${folderPath}/${fileName}`

    console.log(`[v0] Creating Dropbox document: ${filePath}`)

    let content = `BIZDOC CONSULT - BUSINESS REGISTRATION FORM\n`
    content += `================================================\n\n`
    content += `Submission Date: ${new Date().toLocaleString()}\n`
    content += `Registration Type: ${formData.registrationType?.toUpperCase()}\n\n`

    // Business Information Section
    content += `BUSINESS INFORMATION:\n`
    content += `---------------------\n`

    if (formData.registrationType === "trustees") {
      if (formData.organizationName) {
        content += `Organization Name: ${formData.organizationName}\n`
      }
    } else {
      if (formData.proposedName1) {
        content += `Proposed Name 1: ${formData.proposedName1}\n`
      }
      if (formData.proposedName2) {
        content += `Proposed Name 2: ${formData.proposedName2}\n`
      }
      if (formData.proposedName3) {
        content += `Proposed Name 3: ${formData.proposedName3}\n`
      }
      if (formData.natureOfBusiness) {
        content += `Nature of Business: ${formData.natureOfBusiness}\n`
      }
    }

    content += `Email: ${formData.email}\n`
    content += `Phone Number: ${formData.phoneNumber}\n`
    content += `Office Address: ${formData.officeAddress}\n\n`

    // Registration Type Specific Information
    if (formData.registrationType === "company") {
      content += `COMPANY INFORMATION:\n`
      content += `--------------------\n`
      if (formData.totalShares) {
        content += `Total Shares: ${formData.totalShares}\n`
      }
      content += `\n`
    } else if (formData.registrationType === "trustees") {
      content += `ORGANIZATION INFORMATION:\n`
      content += `-------------------------\n`
      if (formData.keyObjectives) {
        content += `Key Objectives:\n${formData.keyObjectives}\n\n`
      }
      if (formData.trusteeTenure) {
        content += `Trustee Tenure: ${formData.trusteeTenure}\n`
      }
      if (formData.sealCustodian) {
        content += `Seal Custodian: ${formData.sealCustodian}\n`
      }
      if (formData.fundingSources) {
        content += `Funding Sources:\n${formData.fundingSources}\n`
      }
      content += `\n`
    }

    // Business Name Director Information
    if (formData.registrationType === "bn" && formData.directorName) {
      content += `DIRECTOR INFORMATION:\n`
      content += `---------------------\n`
      content += `Director Name: ${formData.directorName}\n`
      if (formData.directorNIN) {
        content += `Director NIN: ${formData.directorNIN}\n`
      }
      if (formData.directorPhone) {
        content += `Director Phone: ${formData.directorPhone}\n`
      }
      content += `\n`
    }

    // Directors Information (Company Limited)
    if (formData.directors && formData.directors.length > 0) {
      content += `DIRECTORS INFORMATION:\n`
      content += `----------------------\n`
      formData.directors.forEach((director, index) => {
        content += `Director ${index + 1}:\n`
        content += `  Full Name: ${director.fullName}\n`
        content += `  Email: ${director.email}\n`
        content += `  Phone Number: ${director.phoneNumber}\n`
        content += `  Residential Address: ${director.residentialAddress}\n`
        content += `  Date of Birth: ${director.dateOfBirth}\n`
        content += `\n`
      })
    }

    // Shareholders Information
    if (formData.shareholders && formData.shareholders.length > 0) {
      content += `SHAREHOLDERS INFORMATION:\n`
      content += `-------------------------\n`
      formData.shareholders.forEach((shareholder, index) => {
        content += `Shareholder ${index + 1}:\n`
        content += `  Full Name: ${shareholder.fullName}\n`
        content += `  Email: ${shareholder.email}\n`
        content += `  Phone Number: ${shareholder.phoneNumber}\n`
        content += `  Residential Address: ${shareholder.residentialAddress}\n`
        content += `  Date of Birth: ${shareholder.dateOfBirth}\n`
        content += `  Number of Shares: ${shareholder.shares}\n`
        content += `\n`
      })
    }

    // Trustees Information
    if (formData.trustees && formData.trustees.length > 0) {
      content += `TRUSTEES INFORMATION:\n`
      content += `---------------------\n`
      formData.trustees.forEach((trustee, index) => {
        content += `Trustee ${index + 1}:\n`
        content += `  Full Name: ${trustee.fullName}\n`
        content += `  Email: ${trustee.email}\n`
        content += `  Phone Number: ${trustee.phoneNumber}\n`
        content += `  NIN Number: ${trustee.ninNumber}\n`
        content += `  Position: ${trustee.position}\n`
        content += `  Residential Address: ${trustee.residentialAddress}\n`
        content += `  Date of Birth: ${trustee.dateOfBirth}\n`
        content += `\n`
      })
    }

    content += `SUBMISSION DETAILS:\n`
    content += `-------------------\n`
    content += `Form System: BIZDOC Online Registration Platform\n`
    content += `Processed by: Comprehensive Backend System\n`
    content += `Status: Successfully Submitted\n`

    // Upload the document to Dropbox
    await dbx.filesUpload({
      path: filePath,
      contents: content,
      mode: { ".tag": "add" } as any,
      autorename: true,
    })

    // Try to create a shared link
    let shareUrl = undefined
    try {
      const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: { ".tag": "public" },
        },
      })
      shareUrl = shareResponse.result.url
    } catch (shareError) {
      console.log(`[v0] Could not create share link for document:`, shareError)
    }

    console.log(`[v0] Document created successfully in Dropbox: ${filePath}`)
    return {
      filePath: filePath,
      shareUrl: shareUrl,
    }
  } catch (error) {
    console.error("[v0] Error creating Dropbox document:", error)
    throw error
  }
}

export async function getDropboxFolderLink(folderPath: string): Promise<string> {
  try {
    const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
      path: folderPath,
      settings: {
        requested_visibility: { ".tag": "public" },
      },
    })
    return shareResponse.result.url
  } catch (error) {
    console.log(`[v0] Could not create share link for folder:`, error)
    // Return a direct Dropbox URL format
    return `https://www.dropbox.com/home${folderPath}`
  }
}
