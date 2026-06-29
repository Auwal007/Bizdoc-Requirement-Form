import { type NextRequest, NextResponse } from "next/server"
import { submitToGoogleAppsScript, type GoogleFilePayload, type GoogleRegistrationPayload } from "@/lib/google-services"

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

function sanitizeInput(value: string | null): string {
  if (!value) return ""
  return value.replace(/[<>]/g, "").trim()
}

function getReadableFileType(fileType: string): string {
  const typeMap: { [key: string]: string } = {
    idCard: "ID Card",
    passportPhotograph: "Passport Photograph",
    sampleSignature: "Sample Signature",
    memart: "Memorandum Articles",
    boardResolution: "Board Resolution",
    constitutionDocument: "Constitution Document",
  }
  return typeMap[fileType] || fileType;
}

function getCleanFileName(fieldName: string, originalName: string, registrationData: any): string {
  const parts = fieldName.split("_");
  const extension = originalName.substring(originalName.lastIndexOf("."));
  if (parts.length >= 3) {
    const personType = parts[0]; // director, shareholder, trustee, proprietor
    const index = parseInt(parts[1], 10);
    const fileType = parts[2];
    
    let personName = "";
    if (personType === "director") {
      personName = registrationData.directors?.[index]?.fullName;
    } else if (personType === "shareholder") {
      personName = registrationData.shareholders?.[index]?.fullName;
    } else if (personType === "trustee") {
      personName = registrationData.trustees?.[index]?.fullName;
    } else if (personType === "proprietor") {
      personName = registrationData.proprietors?.[index]?.fullName;
    }
    
    const cleanName = personName ? personName.trim() : `${personType}_${index + 1}`;
    const readableFileType = getReadableFileType(fileType);
    
    return `${readableFileType} - ${cleanName}${extension}`;
  }
  
  const readableFileType = getReadableFileType(fieldName);
  const companyName = registrationData.organizationName || registrationData.proposedName1 || "Business";
  return `${readableFileType} - ${companyName}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Processing form submission with Google Drive & Sheets storage")

    if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
      console.error("[API] GOOGLE_APPS_SCRIPT_URL environment variable is missing")
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error: Google Apps Script Web App URL not configured",
          error: "GOOGLE_APPS_SCRIPT_URL environment variable is required",
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()

    const registrationData: GoogleRegistrationPayload = {
      registrationType: sanitizeInput(formData.get("registrationType") as string) as any,
      proposedName1: sanitizeInput(formData.get("proposedName1") as string),
      proposedName2: sanitizeInput(formData.get("proposedName2") as string),
      proposedName3: sanitizeInput(formData.get("proposedName3") as string),
      businessAddress: sanitizeInput(formData.get("businessAddress") as string) || sanitizeInput(formData.get("officeAddress") as string),
      email: sanitizeInput(formData.get("email") as string) || sanitizeInput(formData.get("organizationEmail") as string),
      phoneNumber: sanitizeInput(formData.get("phone") as string) || sanitizeInput(formData.get("phoneNumber") as string) || sanitizeInput(formData.get("organizationPhone") as string),
      natureOfBusiness: sanitizeInput(formData.get("natureOfBusiness") as string),
      
      // Company specific
      totalShares: safeParseInt(formData.get("totalShares") as string),
      allotmentDetails: sanitizeInput(formData.get("allotmentDetails") as string),
      
      // Additional notes from client
      additionalNotes: sanitizeInput(formData.get("additionalNotes") as string),
      
      // Trustees specific
      organizationName: sanitizeInput(formData.get("organizationName") as string),
      organizationEmail: sanitizeInput(formData.get("organizationEmail") as string),
      organizationPhone: sanitizeInput(formData.get("organizationPhone") as string),
      officeAddress: sanitizeInput(formData.get("officeAddress") as string),
      keyObjectives: sanitizeInput(formData.get("keyObjectives") as string),
      trusteeTenure: sanitizeInput(formData.get("trusteeTenure") as string),
      sealCustodian: sanitizeInput(formData.get("sealCustodian") as string),
      fundingSources: sanitizeInput(formData.get("fundingSources") as string),
      
      files: [] // Initialize flat files list
    }

    if (!registrationData.registrationType) {
      return NextResponse.json({ success: false, message: "Registration type is required" }, { status: 400 })
    }

    // Parse dynamic arrays
    const directorsData = formData.get("directors")
    if (directorsData) {
      registrationData.directors = safeJsonParse(directorsData as string) || []
    }

    const shareholdersData = formData.get("shareholders")
    if (shareholdersData) {
      registrationData.shareholders = safeJsonParse(shareholdersData as string) || []
    }
    if (registrationData.registrationType === "company") {
      let sumShares = 0
      if (Array.isArray(registrationData.shareholders)) {
        sumShares = registrationData.shareholders.reduce(
          (sum: number, sh: any) => sum + (safeParseInt(sh.shareAllocation) || 0),
          0
        )
      }
      registrationData.totalShares = sumShares > 0 ? sumShares : 1000000
      if (!registrationData.allotmentDetails) {
        registrationData.allotmentDetails = `${registrationData.totalShares.toLocaleString()} Ordinary Shares of N1.00 each`
      }
    }

    const trusteesData = formData.get("trustees")
    if (trusteesData) {
      registrationData.trustees = safeJsonParse(trusteesData as string) || []
    }

    const proprietorsData = formData.get("proprietors")
    if (proprietorsData) {
      registrationData.proprietors = safeJsonParse(proprietorsData as string) || []
    }

    // Determine the Client Name (first person listed)
    let clientName = ""
    if (registrationData.registrationType === "bn" && registrationData.proprietors && registrationData.proprietors.length > 0) {
      clientName = registrationData.proprietors[0].fullName
    } else if (registrationData.registrationType === "company" && registrationData.directors && registrationData.directors.length > 0) {
      clientName = registrationData.directors[0].fullName
    } else if (registrationData.registrationType === "trustees" && registrationData.trustees && registrationData.trustees.length > 0) {
      clientName = registrationData.trustees[0].fullName
    }
    registrationData.clientName = clientName

    // Validate based on Registration Type
    if (registrationData.registrationType === "trustees") {
      if (!registrationData.organizationName || !registrationData.email) {
        return NextResponse.json(
          { success: false, message: "Organization name and email are required for Incorporated Trustees" },
          { status: 400 },
        )
      }
      if (!registrationData.trustees || registrationData.trustees.length < 2) {
        return NextResponse.json(
          { success: false, message: "At least two (2) trustees are required for Incorporated Trustees" },
          { status: 400 },
        )
      }
    } else if (registrationData.registrationType === "company") {
      if (!registrationData.proposedName1 || !registrationData.proposedName2 || !registrationData.proposedName3) {
        return NextResponse.json(
          { success: false, message: "All three proposed names are required for Company Limited" },
          { status: 400 },
        )
      }
      if (!registrationData.directors || registrationData.directors.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one director is required for Company Limited" },
          { status: 400 },
        )
      }
      if (!registrationData.shareholders || registrationData.shareholders.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one shareholder is required for Company Limited" },
          { status: 400 },
        )
      }

    } else if (registrationData.registrationType === "bn") {
      if (!registrationData.proposedName1 || !registrationData.proposedName2 || !registrationData.proposedName3) {
        return NextResponse.json(
          { success: false, message: "All three proposed names are required for Business Name" },
          { status: 400 },
        )
      }
      if (!registrationData.proprietors || registrationData.proprietors.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one proprietor is required for Business Name" },
          { status: 400 },
        )
      }
    }

    // Process and encode files to Base64, skipping duplicates (same name and size)
    const fileList: GoogleFilePayload[] = []
    const processedFiles = new Set<string>()

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const fileFingerprint = `${value.name}-${value.size}`
        if (processedFiles.has(fileFingerprint)) {
          console.log(`[API] Skipping duplicate file upload for key ${key}: ${value.name}`)
          continue
        }
        processedFiles.add(fileFingerprint)

        const buffer = Buffer.from(await value.arrayBuffer())
        const base64 = buffer.toString("base64")
        
        const cleanName = getCleanFileName(key, value.name, registrationData)
        fileList.push({
          fileName: cleanName,
          mimeType: value.type,
          base64: base64
        })
        console.log(`[API] Encoded and renamed file: ${key} -> ${cleanName}`)
      }
    }

    registrationData.files = fileList
    console.log(`[API] Total encoded files for submission: ${fileList.length}`)

    // Submit payload to Google Apps Script
    console.log("[API] Calling Google Apps Script...")
    const result = await submitToGoogleAppsScript(registrationData)
    console.log("[API] Google Apps Script Response:", result)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Apps Script Web App failed to process submission",
          error: result.error || "Unknown Apps Script error"
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Registration requirements submitted successfully to Google Drive & Sheets!",
      folderUrl: result.folderUrl
    })

  } catch (error: any) {
    console.error("[API] Comprehensive submission error:", error.message)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit form. Please check configuration and try again.",
        error: error.message || "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}
