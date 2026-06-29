export interface GoogleFilePayload {
  fileName: string;
  mimeType: string;
  base64: string;
}

export interface GoogleRegistrationPayload {
  registrationType: "bn" | "company" | "trustees" | "";
  proposedName1?: string;
  proposedName2?: string;
  proposedName3?: string;
  businessAddress?: string;
  email?: string;
  phoneNumber?: string;
  natureOfBusiness?: string;
  
  // Company specific
  totalShares?: number;
  allotmentDetails?: string;
  directors?: any[];
  shareholders?: any[];
  
  // Trustees specific
  organizationName?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  officeAddress?: string;
  keyObjectives?: string;
  trusteeTenure?: string;
  sealCustodian?: string;
  fundingSources?: string;
  trustees?: any[];

  // Business Name proprietors (dynamic for Sole Proprietor / Partnership)
  proprietors?: any[];
  
  // Client Name (first director, partner, or trustee)
  clientName?: string;
  
  // Flattened renamed files list
  files: GoogleFilePayload[];
  
  // Optional client notes
  additionalNotes?: string;
}

export async function submitToGoogleAppsScript(payload: GoogleRegistrationPayload): Promise<{ success: boolean; folderUrl?: string; message?: string; error?: string }> {
  let endpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
  
  if (!endpoint) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL environment variable is missing on the server");
  }

  // Gracefully handle raw Deployment ID instead of full URL
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    endpoint = `https://script.google.com/macros/s/${endpoint.trim()}/exec`;
  }

  console.log("[GOOGLE-SERVICE] Sending payload to Google Apps Script Web App...");
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    redirect: "follow" // Essential for Google Apps Script redirects
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Apps Script returned status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  return result;
}
