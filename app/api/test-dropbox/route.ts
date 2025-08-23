import { NextResponse } from "next/server"
import { validateDropboxToken } from "@/lib/dropbox-services"

export async function GET() {
  try {
    console.log("[v0] Testing Dropbox connection...")

    // Test the Dropbox token validation
    const tokenValidation = await validateDropboxToken()

    if (!tokenValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Dropbox authentication failed",
          error: tokenValidation.error,
          suggestions: [
            "Check if DROPBOX_ACCESS_TOKEN environment variable is set",
            "Verify the token is not expired",
            'Ensure the app has "Full Dropbox" access permissions',
            "Try regenerating the access token in Dropbox App Console",
          ],
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Dropbox connection successful",
      accountInfo: tokenValidation.accountInfo,
    })
  } catch (error) {
    console.error("[v0] Dropbox test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to test Dropbox connection",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
