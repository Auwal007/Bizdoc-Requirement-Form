import { google } from "googleapis"

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

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "bizdoc-469812",
    private_key_id: "301879295c84a630cba6a2645749611e7088ebe1",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCra5Ddgt79TmiD\nISJRw8e90A19bSzzsLzRZcn0lAdQJOA9ldh4hnY1MXqx66cH6OxKBzJtHsYz3Dkj\nUJujRze+MlxVKQ5gHTxK6HCrhhgAtLgHx/gfU8pHIC64rHAhbtS+Dhe8z07esr6p\nDitnXtfuHW2IsnJj/NDVLFeLOhaq12oE+4gZJyUtRmVWcuBle05QTuGpx2pFQ/NS\nTKCHe/EwJjf2uhH2j3Jgb4IxVPnokrdT+bKAxXyOKoMImv20LOPGTh+xGzopj7t8\nPRsgZuruDdbsMSgPcN3zHLqsp3SXXi/CuhFBTTtcsyBpWF5/HBjBXs9nw/VMdQoT\nVxT63Q5hAgMBAAECggEAAKxWmG4bBNTl32z2AurxSf8rDGTtPiRBq5NaIpAhwrhw\nWoGQBPInPPB9rjzyDhuFsQk78xaBugKphUhb4h1lnEU7nFiBzlITEmq9BYlsZvVO\nuzYXdP0J4HNhh5dixdjW9EufH35TbZe3XLfZ5wkl8TETpOupfBfKNKocymbPH7rg\n8YTzAYWVLZ8EuKjAq0EIJRIHUgT0oyPomETMC2+1+NLLCl1yAeFYv4SlhwGVgHPz\nII8431hIcDd5mN5J0TH/Baqyr4DlE/HzvLdfQEqv2FKJZw2cqwcMUQ/FoD6UYtZ8\nsvRdt4+nenM2Vjmz2/vTpA7ZHHf999yYJtHyWZxZCQKBgQDc8VnHsVWtuRK61BOF\nVwYi0xZvawihjQ+ObjbwfbAdQ1yvfqVHKgFzfPKbaurbtSy7VYGNNPTnmtCDgU9j\ne5jwOCwBILdwbpZi0svCgCTFaMToYAn26VX3nySQ3Qzk21Hz+GqOKHF66xPsFUA8\nsyMfJHt+U81iAQM02KzFrcmFWQKBgQDGnp4e7UNHwZbqXRlHZ8b07hDklUEtVVCh\n4tMbWnt539d4Jgk7XmrOaMCeA1nSkfBpJghQf0IQaa18Y7nTLnGrCCIEgKTba57G\nh0RezdNa2ZNOsPDjLZlAe+qMg65TJH0XK5kSBvVTLSyIkDtbrLRYGHwzi3fRuwhi\nzeawuG1ISQKBgQCcVRoVtmDNf3rFP3JgkucAlSP2ymFdDhbHzSyKliSbUCKw+oew\nBwTn1q1DUy/DLjrsguAcLjBsAJsxsbmexsG8l8JrOd8Sau12F3mdslZSaIOLeQkT\n8J6ni6+v4PlSpe0jF88tr2g8dUGvdonxaT+ctY+8H0ff5J+EMRxu8zz4YQKBgCKU\nZw8XW8lYaP/wqYAHD1qBQCur2Kcd3WXx6bMvc6PqVscySBUwAQRitHZOOwswIV0N\nJBFvtn7JB01Kx4V+5odSaSnDg/A3snL6BetDhnKgwsbGg4np3G6fpFxGaMlM5wJr\nssCyuW97w+8avVrenJ9h0+3dcETxfSpGks1drpkRAoGBAMZ5W+SCHoaSptH7Iphi\ncs7ILQfB9nITJysMderikcbnNRr9kG1ZXJYYgDnaHAI2O+FbZ0d+zDtZdjkTksUT\nCDaH9Z0lfPF1e6UN9/0mLCukToEHlTzZt2mbapN2SPj/1llJp0rnx0He0wrtTcOb\nizu/dZCGUOi9MxS4bBs5NmGx\n-----END PRIVATE KEY-----\n",
    client_email: "form-automation-service@bizdoc-469812.iam.gserviceaccount.com",
    client_id: "113520570635993022059",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/form-automation-service%40bizdoc-469812.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  },
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
})

const drive = google.drive({ version: "v3", auth })
const docs = google.docs({ version: "v1", auth })

export async function createDriveFolder(name: string, parentId?: string): Promise<string> {
  try {
    console.log(`[v0] Creating folder: ${name}`)

    const folderMetadata = {
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    }

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id, name, webViewLink",
    })

    console.log(`[v0] Folder created successfully:`, folder.data)
    return folder.data.id!
  } catch (error) {
    console.error("[v0] Error creating folder:", error)
    throw error
  }
}

export async function uploadFilesToDrive(
  files: UploadedFile[],
  folderId: string,
): Promise<Array<{ fileName: string; fileId: string; webViewLink: string }>> {
  try {
    console.log(`[v0] Uploading ${files.length} files to folder: ${folderId}`)

    const uploadedFiles = []

    for (const file of files) {
      const fileMetadata = {
        name: file.fileName,
        parents: [folderId],
      }

      const media = {
        mimeType: file.mimeType,
        body: file.buffer,
      }

      const uploadedFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, webViewLink",
      })

      uploadedFiles.push({
        fileName: file.fileName,
        fileId: uploadedFile.data.id!,
        webViewLink: uploadedFile.data.webViewLink!,
      })

      console.log(`[v0] File uploaded: ${file.fileName}`)
    }

    return uploadedFiles
  } catch (error) {
    console.error("[v0] Error uploading files:", error)
    throw error
  }
}

export async function createGoogleDoc(
  formData: FormData,
  folderId: string,
): Promise<{ docId: string; webViewLink: string }> {
  try {
    const businessName = formData.businessName || formData.organizationName || "Unknown Business"
    const title = `${businessName} - Registration Form Data`

    console.log(`[v0] Creating document: ${title}`)

    // Generate document content
    let content = `BIZDOC CONSULT - BUSINESS REGISTRATION FORM\n\n`
    content += `Business Name: ${businessName}\n`
    content += `Registration Type: ${formData.registrationType}\n`
    content += `Email: ${formData.email}\n`
    content += `Phone Number: ${formData.phoneNumber}\n`
    content += `Office Address: ${formData.officeAddress}\n`

    if (formData.totalShares) {
      content += `Total Shares: ${formData.totalShares}\n`
    }

    if (formData.keyObjectives) {
      content += `Key Objectives: ${formData.keyObjectives}\n`
    }

    if (formData.trusteeTenure) {
      content += `Trustee Tenure: ${formData.trusteeTenure}\n`
    }

    if (formData.sealCustodian) {
      content += `Seal Custodian: ${formData.sealCustodian}\n`
    }

    if (formData.fundingSources) {
      content += `Funding Sources: ${formData.fundingSources}\n`
    }

    // Add directors information
    if (formData.directors && formData.directors.length > 0) {
      content += `\nDIRECTORS:\n`
      formData.directors.forEach((director, index) => {
        content += `${index + 1}. ${director.fullName}\n`
        content += `   Email: ${director.email}\n`
        content += `   Phone: ${director.phoneNumber}\n`
        content += `   Address: ${director.residentialAddress}\n`
        content += `   Date of Birth: ${director.dateOfBirth}\n\n`
      })
    }

    // Add shareholders information
    if (formData.shareholders && formData.shareholders.length > 0) {
      content += `\nSHAREHOLDERS:\n`
      formData.shareholders.forEach((shareholder, index) => {
        content += `${index + 1}. ${shareholder.fullName}\n`
        content += `   Email: ${shareholder.email}\n`
        content += `   Phone: ${shareholder.phoneNumber}\n`
        content += `   Address: ${shareholder.residentialAddress}\n`
        content += `   Date of Birth: ${shareholder.dateOfBirth}\n`
        content += `   Shares: ${shareholder.shares}\n\n`
      })
    }

    // Add trustees information
    if (formData.trustees && formData.trustees.length > 0) {
      content += `\nTRUSTEES:\n`
      formData.trustees.forEach((trustee, index) => {
        content += `${index + 1}. ${trustee.fullName}\n`
        content += `   Email: ${trustee.email}\n`
        content += `   Phone: ${trustee.phoneNumber}\n`
        content += `   NIN: ${trustee.ninNumber}\n`
        content += `   Position: ${trustee.position}\n`
        content += `   Address: ${trustee.residentialAddress}\n`
        content += `   Date of Birth: ${trustee.dateOfBirth}\n\n`
      })
    }

    content += `\nSubmission Date: ${new Date().toLocaleString()}\n`

    // Create the document
    const doc = await docs.documents.create({
      requestBody: {
        title: title,
      },
    })

    if (!doc.data.documentId) {
      throw new Error("Failed to create document")
    }

    // Add content to the document
    await docs.documents.batchUpdate({
      documentId: doc.data.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    })

    // Move to folder
    await drive.files.update({
      fileId: doc.data.documentId,
      addParents: folderId,
      fields: "id, parents",
    })

    // Get the document details
    const docDetails = await drive.files.get({
      fileId: doc.data.documentId,
      fields: "id, name, webViewLink",
    })

    console.log(`[v0] Document created successfully:`, docDetails.data)
    return {
      docId: doc.data.documentId,
      webViewLink: docDetails.data.webViewLink!,
    }
  } catch (error) {
    console.error("[v0] Error creating document:", error)
    throw error
  }
}

// Keep original functions for backward compatibility
export async function createFolder(name: string, parentId?: string) {
  return createDriveFolder(name, parentId)
}

export async function uploadFile(file: File, folderId: string, fileName?: string) {
  try {
    console.log(`[v0] Uploading file: ${fileName || file.name} to folder: ${folderId}`)

    const buffer = await file.arrayBuffer()

    const fileMetadata = {
      name: fileName || file.name,
      parents: [folderId],
    }

    const media = {
      mimeType: file.type,
      body: Buffer.from(buffer),
    }

    const uploadedFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    })

    console.log(`[v0] File uploaded successfully:`, uploadedFile.data)
    return uploadedFile.data
  } catch (error) {
    console.error("[v0] Error uploading file:", error)
    throw error
  }
}

export async function createDocument(title: string, content: string, folderId?: string) {
  try {
    console.log(`[v0] Creating document: ${title}`)

    // Create the document
    const doc = await docs.documents.create({
      requestBody: {
        title: title,
      },
    })

    if (!doc.data.documentId) {
      throw new Error("Failed to create document")
    }

    // Add content to the document
    await docs.documents.batchUpdate({
      documentId: doc.data.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    })

    // Move to folder if specified
    if (folderId) {
      await drive.files.update({
        fileId: doc.data.documentId,
        addParents: folderId,
        fields: "id, parents",
      })
    }

    // Get the document details
    const docDetails = await drive.files.get({
      fileId: doc.data.documentId,
      fields: "id, name, webViewLink",
    })

    console.log(`[v0] Document created successfully:`, docDetails.data)
    return docDetails.data
  } catch (error) {
    console.error("[v0] Error creating document:", error)
    throw error
  }
}
