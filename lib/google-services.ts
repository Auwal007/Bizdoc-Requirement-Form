import { google } from "googleapis"
import path from "path"

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "lib", "google-credentials.json"),
  scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/documents"],
})

// Initialize Google Drive and Docs APIs
const drive = google.drive({ version: "v3", auth })
const docs = google.docs({ version: "v1", auth })

export interface FormData {
  registrationType: string
  businessName: string
  organizationName?: string
  email: string
  phoneNumber: string
  officeAddress: string
  totalShares?: number
  directors?: Array<{
    fullName: string
    email: string
    phoneNumber: string
    residentialAddress: string
    dateOfBirth: string
    shares: number
  }>
  shareholders?: Array<{
    fullName: string
    email: string
    phoneNumber: string
    residentialAddress: string
    dateOfBirth: string
    shares: number
  }>
  trustees?: Array<{
    fullName: string
    email: string
    phoneNumber: string
    ninNumber: string
    position: string
    residentialAddress: string
    dateOfBirth: string
  }>
  keyObjectives?: string
  trusteeTenure?: string
  sealCustodian?: string
  fundingSources?: string
}

export interface UploadedFile {
  fieldName: string
  fileName: string
  buffer: Buffer
  mimeType: string
}

// Create a folder in Google Drive
export async function createDriveFolder(folderName: string): Promise<string> {
  try {
    // Check if BIZDOC Submissions folder exists
    const parentFolderQuery = await drive.files.list({
      q: "name='BIZDOC Submissions' and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    })

    let parentFolderId: string

    if (parentFolderQuery.data.files && parentFolderQuery.data.files.length > 0) {
      parentFolderId = parentFolderQuery.data.files[0].id!
    } else {
      // Create parent folder
      const parentFolder = await drive.files.create({
        requestBody: {
          name: "BIZDOC Submissions",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      })
      parentFolderId = parentFolder.data.id!
    }

    // Create business-specific folder
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id",
    })

    return folder.data.id!
  } catch (error) {
    console.error("Error creating folder:", error)
    throw error
  }
}

// Upload files to Google Drive
export async function uploadFilesToDrive(
  files: UploadedFile[],
  folderId: string,
): Promise<Array<{ fileName: string; fileId: string; webViewLink: string }>> {
  const uploadedFiles = []

  for (const file of files) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: file.fileName,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimeType,
          body: Buffer.from(file.buffer),
        },
        fields: "id, webViewLink",
      })

      uploadedFiles.push({
        fileName: file.fileName,
        fileId: response.data.id!,
        webViewLink: response.data.webViewLink!,
      })
    } catch (error) {
      console.error(`Error uploading file ${file.fileName}:`, error)
      throw error
    }
  }

  return uploadedFiles
}

// Create Google Doc with form data
export async function createGoogleDoc(
  formData: FormData,
  folderId: string,
): Promise<{ docId: string; webViewLink: string }> {
  try {
    // Create the document
    const doc = await docs.documents.create({
      requestBody: {
        title: `${formData.businessName || formData.organizationName} - Registration Form`,
      },
    })

    const docId = doc.data.documentId!

    // Move document to the business folder
    await drive.files.update({
      fileId: docId,
      addParents: folderId,
      fields: "id, parents",
    })

    // Format the document content
    const content = formatFormDataForDoc(formData)

    // Insert content into the document
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      },
    })

    // Get the web view link
    const fileInfo = await drive.files.get({
      fileId: docId,
      fields: "webViewLink",
    })

    return {
      docId,
      webViewLink: fileInfo.data.webViewLink!,
    }
  } catch (error) {
    console.error("Error creating Google Doc:", error)
    throw error
  }
}

// Format form data for Google Doc
function formatFormDataForDoc(formData: FormData): string {
  const currentDate = new Date().toLocaleDateString()
  let content = `BIZDOC CONSULT - BUSINESS REGISTRATION FORM\n`
  content += `Submission Date: ${currentDate}\n\n`
  content += `REGISTRATION TYPE: ${formData.registrationType.toUpperCase()}\n\n`

  // Basic Information
  content += `BASIC INFORMATION\n`
  content += `Business Name: ${formData.businessName || formData.organizationName}\n`
  content += `Email Address: ${formData.email}\n`
  content += `Phone Number: ${formData.phoneNumber}\n`
  content += `Office Address: ${formData.officeAddress}\n`

  if (formData.totalShares) {
    content += `Total Shares: ${formData.totalShares}\n`
  }
  content += `\n`

  // Directors
  if (formData.directors && formData.directors.length > 0) {
    content += `DIRECTORS\n`
    formData.directors.forEach((director, index) => {
      content += `Director ${index + 1}:\n`
      content += `  Name: ${director.fullName}\n`
      content += `  Email: ${director.email}\n`
      content += `  Phone: ${director.phoneNumber}\n`
      content += `  Address: ${director.residentialAddress}\n`
      content += `  Date of Birth: ${director.dateOfBirth}\n`
      content += `  Shares: ${director.shares}\n\n`
    })
  }

  // Shareholders
  if (formData.shareholders && formData.shareholders.length > 0) {
    content += `SHAREHOLDERS\n`
    formData.shareholders.forEach((shareholder, index) => {
      content += `Shareholder ${index + 1}:\n`
      content += `  Name: ${shareholder.fullName}\n`
      content += `  Email: ${shareholder.email}\n`
      content += `  Phone: ${shareholder.phoneNumber}\n`
      content += `  Address: ${shareholder.residentialAddress}\n`
      content += `  Date of Birth: ${shareholder.dateOfBirth}\n`
      content += `  Shares: ${shareholder.shares}\n\n`
    })
  }

  // Trustees
  if (formData.trustees && formData.trustees.length > 0) {
    content += `TRUSTEES\n`
    formData.trustees.forEach((trustee, index) => {
      content += `Trustee ${index + 1}:\n`
      content += `  Name: ${trustee.fullName}\n`
      content += `  Email: ${trustee.email}\n`
      content += `  Phone: ${trustee.phoneNumber}\n`
      content += `  NIN Number: ${trustee.ninNumber}\n`
      content += `  Position: ${trustee.position}\n`
      content += `  Address: ${trustee.residentialAddress}\n`
      content += `  Date of Birth: ${trustee.dateOfBirth}\n\n`
    })

    // Additional Incorporated Trustees Information
    if (formData.keyObjectives) {
      content += `KEY OBJECTIVES\n${formData.keyObjectives}\n\n`
    }
    if (formData.trusteeTenure) {
      content += `TRUSTEE TENURE\n${formData.trusteeTenure}\n\n`
    }
    if (formData.sealCustodian) {
      content += `SEAL CUSTODIAN\n${formData.sealCustodian}\n\n`
    }
    if (formData.fundingSources) {
      content += `FUNDING SOURCES\n${formData.fundingSources}\n\n`
    }
  }

  content += `\n--- End of Form ---\n`
  content += `This document was automatically generated by BIZDOC CONSULT registration system.`

  return content
}
