"use client"

import { useState } from "react"
import { Building2, Shield, ChevronRight, ChevronLeft, HelpCircle, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProgressTracker } from "@/components/progress-tracker"
import { FileUpload } from "@/components/file-upload"
import { DynamicPersonForm } from "@/components/dynamic-person-form"
import { toast } from "sonner"

interface FormData {
  registrationType: "bn" | "company" | "trustees" | ""
  proposedName1: string
  proposedName2: string
  businessAddress: string
  email: string
  phone: string
  natureOfBusiness: string
  // BN specific
  directorName: string
  directorNIN: string
  directorPhone: string
  passportPhoto: File[]
  sampleSignature: File[]
  // Company specific
  directors: any[]
  shareholders: any[]
  totalShares: number
  allotmentDetails: string
  organizationName: string
  organizationEmail: string
  organizationPhone: string
  officeAddress: string
  keyObjectives: string
  trusteeTenure: string
  sealCustodian: string
  fundingSources: string
  trustees: any[]
}

const steps = ["Registration Type", "Business Details", "Directors & Shareholders", "Review & Submit"]

export default function BusinessRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    registrationType: "",
    proposedName1: "",
    proposedName2: "",
    businessAddress: "",
    email: "",
    phone: "",
    natureOfBusiness: "",
    directorName: "",
    directorNIN: "",
    directorPhone: "",
    passportPhoto: [],
    sampleSignature: [],
    directors: [],
    shareholders: [],
    totalShares: 0,
    allotmentDetails: "",
    organizationName: "",
    organizationEmail: "",
    organizationPhone: "",
    officeAddress: "",
    keyObjectives: "",
    trusteeTenure: "",
    sealCustodian: "",
    fundingSources: "",
    trustees: [],
  })

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    console.log("[v0] === FORM SUBMISSION DEBUG START ===")
    console.log("[v0] Current step:", currentStep)
    console.log("[v0] Registration type:", formData.registrationType)

    if (!formData.registrationType) {
      console.log("[v0] ERROR: No registration type selected")
      toast.error("Please select a registration type")
      return
    }

    // Validate required fields based on registration type
    if (formData.registrationType === "trustees") {
      if (!formData.organizationName || !formData.organizationEmail) {
        console.log("[v0] ERROR: Missing required trustees fields")
        toast.error("Please fill in all required organization details")
        return
      }
    } else {
      if (!formData.proposedName1 || !formData.email) {
        console.log("[v0] ERROR: Missing required business fields")
        toast.error("Please fill in all required business details")
        return
      }
    }

    console.log("[v0] Validation passed, proceeding with submission...")
    setIsSubmitting(true)

    try {
      console.log("[v0] Starting form submission...")
      console.log("[v0] Form data:", JSON.stringify(formData, null, 2))

      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.")
      }

      // Create FormData for file uploads
      const submitFormData = new FormData()

      // Add basic form data
      submitFormData.append("registrationType", formData.registrationType)
      submitFormData.append("businessName", formData.proposedName1 || formData.organizationName)
      submitFormData.append("email", formData.email || formData.organizationEmail)
      submitFormData.append("phoneNumber", formData.phone || formData.organizationPhone)
      submitFormData.append("officeAddress", formData.businessAddress || formData.officeAddress)

      console.log("[v0] Basic form data added to FormData")

      if (formData.totalShares) {
        submitFormData.append("totalShares", formData.totalShares.toString())
      }

      // Add trustees-specific data
      if (formData.registrationType === "trustees") {
        submitFormData.append("organizationName", formData.organizationName)
        submitFormData.append("keyObjectives", formData.keyObjectives)
        submitFormData.append("trusteeTenure", formData.trusteeTenure)
        submitFormData.append("sealCustodian", formData.sealCustodian)
        submitFormData.append("fundingSources", formData.fundingSources)
        console.log("[v0] Trustees-specific data added")
      }

      // Add directors, shareholders, trustees as JSON
      if (formData.directors.length > 0) {
        submitFormData.append("directors", JSON.stringify(formData.directors))
        console.log("[v0] Directors data added:", formData.directors.length, "directors")
      }
      if (formData.shareholders.length > 0) {
        submitFormData.append("shareholders", JSON.stringify(formData.shareholders))
        console.log("[v0] Shareholders data added:", formData.shareholders.length, "shareholders")
      }
      if (formData.trustees.length > 0) {
        submitFormData.append("trustees", JSON.stringify(formData.trustees))
        console.log("[v0] Trustees data added:", formData.trustees.length, "trustees")
      }

      // Add files
      let totalFiles = 0
      formData.passportPhoto.forEach((file) => {
        submitFormData.append("passportPhotograph", file)
        totalFiles++
        console.log("[v0] Added passport photo:", file.name, file.size, "bytes")
      })
      formData.sampleSignature.forEach((file) => {
        submitFormData.append("sampleSignature", file)
        totalFiles++
        console.log("[v0] Added sample signature:", file.name, file.size, "bytes")
      })

      // Add files from directors/shareholders/trustees
      const persons = [...formData.directors, ...formData.shareholders, ...formData.trustees]
      persons.forEach((person, index) => {
        console.log(`[v0] Processing person ${index + 1}:`, person.fullName || person.name)

        if (person.idCard && person.idCard.length > 0) {
          person.idCard.forEach((file: File) => {
            submitFormData.append("idCard", file)
            totalFiles++
            console.log("[v0] Added ID card:", file.name, file.size, "bytes")
          })
        }
        if (person.passportPhotograph && person.passportPhotograph.length > 0) {
          person.passportPhotograph.forEach((file: File) => {
            submitFormData.append("passportPhotograph", file)
            totalFiles++
            console.log("[v0] Added passport photo:", file.name, file.size, "bytes")
          })
        }
        if (person.sampleSignature && person.sampleSignature.length > 0) {
          person.sampleSignature.forEach((file: File) => {
            submitFormData.append("sampleSignature", file)
            totalFiles++
            console.log("[v0] Added sample signature:", file.name, file.size, "bytes")
          })
        }
      })

      console.log("[v0] Total files added:", totalFiles)

      console.log("[v0] FormData entries:")
      for (const [key, value] of submitFormData.entries()) {
        if (value instanceof File) {
          console.log(`[v0] ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
        } else {
          console.log(`[v0] ${key}:`, value)
        }
      }

      console.log("[v0] Submitting form data to API...")
      console.log("[v0] API endpoint: /api/submit-form")

      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: submitFormData,
      })

      console.log("[v0] API response received")
      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response status text:", response.statusText)
      console.log("[v0] Response ok:", response.ok)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      let result
      try {
        const responseText = await response.text()
        console.log("[v0] Raw response text:", responseText)
        result = JSON.parse(responseText)
        console.log("[v0] Parsed response data:", result)
      } catch (parseError) {
        console.error("[v0] Failed to parse response as JSON:", parseError)
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`)
      }

      if (result.success) {
        console.log("[v0] SUCCESS: Form submitted successfully")
        toast.success("Form submitted successfully!", {
          description: "Your documents have been uploaded to Google Drive and a summary document has been created.",
          duration: 5000,
        })

        // Show success message with links
        const successMessage = `
          Your application has been submitted successfully!
          
          📁 Documents Folder: ${result.data.folderLink}
          📄 Summary Document: ${result.data.docLink}
          
          We will contact you shortly to proceed with your registration.
        `

        alert(successMessage)
        console.log("[v0] Form submitted successfully:", result.data)
      } else {
        console.error("[v0] API returned error:", result.message, result.error)
        throw new Error(result.message || "Failed to submit form")
      }
    } catch (error) {
      console.error("[v0] === FORM SUBMISSION ERROR ===")
      console.error("[v0] Error type:", typeof error)
      console.error("[v0] Error:", error)

      if (error instanceof Error) {
        console.error("[v0] Error name:", error.name)
        console.error("[v0] Error message:", error.message)
        console.error("[v0] Error stack:", error.stack)
      }

      let errorMessage = "An unexpected error occurred. Please try again."

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error("Failed to submit form", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
      console.log("[v0] === FORM SUBMISSION DEBUG END ===")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground">BIZDOC CONSULT</h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                Professional Business Registration Services
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {currentStep === 0 && (
          <Card className="card-enhanced">
            <CardHeader className="text-center pb-6 sm:pb-8">
              <CardTitle className="text-2xl sm:text-4xl font-serif font-bold text-primary mb-4 sm:mb-6">
                Business Registration Requirements Form
              </CardTitle>
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 text-muted-foreground">
                <p className="text-base sm:text-lg leading-relaxed">
                  Welcome! This form is designed to help us collect the necessary information and documents required for
                  your business registration with BIZDOC CONSULT. Please select the type of registration you want to
                  apply for, then provide the requested details.
                </p>
                <p className="font-bold text-base sm:text-lg text-foreground">
                  Choose your registration type below to get started.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowHelp(true)}
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg border border-primary/30"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Not sure which one to choose? Click to see which one suits you
                  </span>
                </button>
              </div>

              <RadioGroup
                value={formData.registrationType}
                onValueChange={(value) => updateFormData("registrationType", value as "bn" | "company" | "trustees")}
                className="space-y-3 sm:space-y-4"
              >
                <div
                  className={`cursor-pointer p-4 sm:p-6 border-2 rounded-lg transition-all duration-200 shadow-sm ${
                    formData.registrationType === "bn"
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                  onClick={() => updateFormData("registrationType", "bn")}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <RadioGroupItem value="bn" id="bn" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="bn" className="text-lg sm:text-xl font-bold cursor-pointer text-foreground block">
                        Business Name (BN)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                        Register a business name for sole proprietorship or partnership
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`cursor-pointer p-4 sm:p-6 border-2 rounded-lg transition-all duration-200 shadow-sm ${
                    formData.registrationType === "company"
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                  onClick={() => updateFormData("registrationType", "company")}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <RadioGroupItem value="company" id="company" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor="company"
                        className="text-lg sm:text-xl font-bold cursor-pointer text-foreground block"
                      >
                        Company Limited
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                        Incorporate a limited liability company with shareholders and directors
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`cursor-pointer p-4 sm:p-6 border-2 rounded-lg transition-all duration-200 shadow-sm ${
                    formData.registrationType === "trustees"
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                  onClick={() => updateFormData("registrationType", "trustees")}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <RadioGroupItem value="trustees" id="trustees" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor="trustees"
                        className="text-lg sm:text-xl font-bold cursor-pointer text-foreground block"
                      >
                        Incorporated Trustees
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                        Register a non-profit organization, NGO, or charitable organization
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              <div className="flex justify-end pt-4 sm:pt-6">
                <Button
                  onClick={nextStep}
                  disabled={!formData.registrationType}
                  className="submit-button w-full sm:w-auto"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showHelp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-primary">
                  Which Registration Type Should You Choose?
                </CardTitle>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <h3 className="font-bold text-lg text-primary mb-3">Business Name (BN)</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Best for:</strong> Small businesses, sole proprietors, partnerships
                      </p>
                      <p>
                        <strong>Liability:</strong> Unlimited personal liability
                      </p>
                      <p>
                        <strong>Ownership:</strong> Individual or partnership ownership
                      </p>
                      <p>
                        <strong>Cost:</strong> Lower registration and maintenance costs
                      </p>
                      <p>
                        <strong>Requirements:</strong> Simpler documentation and fewer compliance requirements
                      </p>
                      <p>
                        <strong>Examples:</strong> Small retail shops, consultancy services, freelance businesses
                      </p>
                    </div>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <h3 className="font-bold text-lg text-primary mb-3">Company Limited</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Best for:</strong> Larger businesses, multiple investors, growth-oriented ventures
                      </p>
                      <p>
                        <strong>Liability:</strong> Limited liability protection for shareholders
                      </p>
                      <p>
                        <strong>Ownership:</strong> Shareholders with transferable shares
                      </p>
                      <p>
                        <strong>Cost:</strong> Higher registration and ongoing compliance costs
                      </p>
                      <p>
                        <strong>Requirements:</strong> More complex documentation, annual filings, board meetings
                      </p>
                      <p>
                        <strong>Examples:</strong> Tech startups, manufacturing companies, businesses seeking investment
                      </p>
                    </div>
                  </div>

                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <h3 className="font-bold text-lg text-primary mb-3">Incorporated Trustees</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Best for:</strong> Non-profit organizations, NGOs, charitable organizations, religious
                        bodies
                      </p>
                      <p>
                        <strong>Purpose:</strong> Social, charitable, educational, or religious objectives
                      </p>
                      <p>
                        <strong>Structure:</strong> Governed by trustees with defined tenure
                      </p>
                      <p>
                        <strong>Funding:</strong> Donations, grants, membership fees, fundraising activities
                      </p>
                      <p>
                        <strong>Requirements:</strong> Constitution, trustees details, objectives, funding sources
                      </p>
                      <p>
                        <strong>Examples:</strong> Foundations, community organizations, religious groups, educational
                        trusts
                      </p>
                    </div>
                  </div>

                  <div className="bg-secondary border border-primary/30 p-4 rounded-lg">
                    <h4 className="font-bold text-primary mb-2">Quick Decision Guide:</h4>
                    <ul className="text-sm space-y-1 text-secondary-foreground">
                      <li>
                        • Choose <strong>Business Name</strong> if you're starting small and want simplicity
                      </li>
                      <li>
                        • Choose <strong>Company Limited</strong> if you want liability protection and plan to grow
                      </li>
                      <li>
                        • Choose <strong>Incorporated Trustees</strong> if you're establishing a non-profit organization
                      </li>
                      <li>
                        • Choose <strong>Company Limited</strong> if you have multiple partners/investors
                      </li>
                      <li>
                        • Choose <strong>Business Name</strong> if you're a freelancer or consultant
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button onClick={() => setShowHelp(false)} className="submit-button">
                    Got it! Let me choose
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep > 0 && (
          <>
            <ProgressTracker currentStep={currentStep} totalSteps={steps.length} steps={steps} />

            {currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                {formData.registrationType === "trustees" ? (
                  <>
                    {/* Organization Details Section */}
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="section-title">Organization Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="form-label">Organization Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.organizationName}
                            onChange={(e) => updateFormData("organizationName", e.target.value)}
                            placeholder="Enter organization name"
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="form-label">Email Address</label>
                            <input
                              type="email"
                              className="form-input"
                              value={formData.organizationEmail}
                              onChange={(e) => updateFormData("organizationEmail", e.target.value)}
                              placeholder="Enter organization email"
                            />
                          </div>
                          <div>
                            <label className="form-label">Phone Number</label>
                            <input
                              type="tel"
                              className="form-input"
                              value={formData.organizationPhone}
                              onChange={(e) => updateFormData("organizationPhone", e.target.value)}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="form-label">Office Address</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.officeAddress}
                            onChange={(e) => updateFormData("officeAddress", e.target.value)}
                            placeholder="Enter complete office address"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Information Section */}
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="section-title">Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="form-label">Five (5) Key Objectives of the Organization</label>
                          <textarea
                            className="form-input resize-none"
                            rows={5}
                            value={formData.keyObjectives}
                            onChange={(e) => updateFormData("keyObjectives", e.target.value)}
                            placeholder="List the five main objectives of your organization"
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="form-label">Trustee Tenure</label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.trusteeTenure}
                              onChange={(e) => updateFormData("trusteeTenure", e.target.value)}
                              placeholder="e.g., 1 year, 2 years, etc."
                            />
                          </div>
                          <div>
                            <label className="form-label">Custodian of Organization's Seal</label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.sealCustodian}
                              onChange={(e) => updateFormData("sealCustodian", e.target.value)}
                              placeholder="e.g., Secretary"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="form-label">Source(s) of Funding</label>
                          <textarea
                            className="form-input resize-none"
                            rows={3}
                            value={formData.fundingSources}
                            onChange={(e) => updateFormData("fundingSources", e.target.value)}
                            placeholder="Describe the sources of funding for the organization"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    {/* Proposed Business Names Section */}
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="section-title">Proposed Business Names</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="form-label">Proposed Name 1</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.proposedName1}
                            onChange={(e) => updateFormData("proposedName1", e.target.value)}
                            placeholder="Enter first choice name"
                          />
                        </div>
                        <div>
                          <label className="form-label">Proposed Name 2</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.proposedName2}
                            onChange={(e) => updateFormData("proposedName2", e.target.value)}
                            placeholder="Enter alternative name"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Business Contact Information Section */}
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="section-title">Business Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="form-label">Business Address</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.businessAddress}
                            onChange={(e) => updateFormData("businessAddress", e.target.value)}
                            placeholder="Enter complete business address"
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="form-label">Email Address</label>
                            <input
                              type="email"
                              className="form-input"
                              value={formData.email}
                              onChange={(e) => updateFormData("email", e.target.value)}
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="form-label">Phone Number</label>
                            <input
                              type="tel"
                              className="form-input"
                              value={formData.phone}
                              onChange={(e) => updateFormData("phone", e.target.value)}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Shares & Allotment Section (Company only) */}
                {formData.registrationType === "company" && (
                  <Card className="card-enhanced">
                    <CardHeader>
                      <CardTitle className="section-title">Shares & Allotment</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="form-label">Total Shares</label>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          value={formData.totalShares || ""}
                          onChange={(e) =>
                            updateFormData("totalShares", Math.max(1, Number.parseInt(e.target.value) || 0))
                          }
                          placeholder="Enter total number of shares"
                        />
                      </div>
                      <div>
                        <label className="form-label">Allotment Details</label>
                        <textarea
                          className="form-input resize-none"
                          rows={3}
                          value={formData.allotmentDetails}
                          onChange={(e) => updateFormData("allotmentDetails", e.target.value)}
                          placeholder="Describe share allotment details"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* BN Specific Sections */}
                {formData.registrationType === "bn" && (
                  <>
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="section-title">Director Information</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                          <label className="form-label">Director Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.directorName}
                            onChange={(e) => updateFormData("directorName", e.target.value)}
                            placeholder="Enter director's full name"
                          />
                        </div>
                        <div>
                          <label className="form-label">NIN</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.directorNIN}
                            onChange={(e) => updateFormData("directorNIN", e.target.value)}
                            placeholder="Enter NIN"
                          />
                        </div>
                        <div>
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className="form-input"
                            value={formData.directorPhone}
                            onChange={(e) => updateFormData("directorPhone", e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="section-title">Required Documents</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <FileUpload
                          label="Passport Photograph"
                          accept="image/*"
                          onFilesChange={(files) => updateFormData("passportPhoto", files)}
                        />
                        <FileUpload
                          label="Sample Signature"
                          accept="image/*,.pdf"
                          onFilesChange={(files) => updateFormData("sampleSignature", files)}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Nature of Business Section */}
                {formData.registrationType !== "trustees" && (
                  <Card className="card-enhanced">
                    <CardHeader>
                      <CardTitle className="section-title">Nature of Business</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <label className="form-label">Business Description</label>
                        <textarea
                          className="form-input resize-none"
                          rows={4}
                          value={formData.natureOfBusiness}
                          onChange={(e) => updateFormData("natureOfBusiness", e.target.value)}
                          placeholder="Describe the nature and activities of your business"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <Card className="card-enhanced">
                  <CardContent className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-2">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="px-6 py-3 bg-transparent order-2 sm:order-1"
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="submit-button order-1 sm:order-2" disabled={isSubmitting}>
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 2 && formData.registrationType === "company" && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="section-title">Directors & Shareholders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  <DynamicPersonForm
                    title="Particulars of Directors"
                    type="director"
                    persons={formData.directors}
                    onPersonsChange={(directors) => updateFormData("directors", directors)}
                  />

                  <DynamicPersonForm
                    title="Particulars of Shareholders"
                    type="shareholder"
                    persons={formData.shareholders}
                    onPersonsChange={(shareholders) => updateFormData("shareholders", shareholders)}
                    totalShares={formData.totalShares}
                  />

                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="px-6 py-3 bg-transparent order-2 sm:order-1"
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="submit-button order-1 sm:order-2">
                      Review Application
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && formData.registrationType === "trustees" && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="section-title">Trustee Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  <DynamicPersonForm
                    title="Particulars of Trustees"
                    type="trustee"
                    persons={formData.trustees}
                    onPersonsChange={(trustees) => updateFormData("trustees", trustees)}
                  />

                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="px-6 py-3 bg-transparent order-2 sm:order-1"
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="submit-button order-1 sm:order-2">
                      Review Application
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {((currentStep === 2 && formData.registrationType === "bn") ||
              (currentStep === 3 &&
                (formData.registrationType === "company" || formData.registrationType === "trustees"))) && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="section-title">Review & Submit</CardTitle>
                  <p className="text-muted-foreground">
                    Please review your information before submitting your application.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  <div className="form-section">
                    <h3 className="section-title">Application Summary</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Registration Type:</span>
                        <p className="text-muted-foreground mt-1">
                          {formData.registrationType === "bn"
                            ? "Business Name (BN)"
                            : formData.registrationType === "company"
                              ? "Company Limited"
                              : "Incorporated Trustees"}
                        </p>
                      </div>
                      {formData.registrationType === "trustees" ? (
                        <>
                          <div>
                            <span className="font-medium text-foreground">Organization Name:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationName}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Office Address:</span>
                            <p className="text-muted-foreground mt-1">{formData.officeAddress}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact Email:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationEmail}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium text-foreground">Proposed Name 1:</span>
                            <p className="text-muted-foreground mt-1">{formData.proposedName1}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Business Address:</span>
                            <p className="text-muted-foreground mt-1">{formData.businessAddress}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact Email:</span>
                            <p className="text-muted-foreground mt-1">{formData.email}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-secondary border border-primary/30 p-4 sm:p-6 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-base sm:text-lg text-primary mb-2">Data Security & Privacy</p>
                        <p className="text-secondary-foreground leading-relaxed">
                          Your information is encrypted and stored securely. We comply with all data protection
                          regulations and will only use your information for business registration purposes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3 text-sm bg-secondary border border-primary/20 p-3 sm:p-4 rounded-lg">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-secondary-foreground">
                      All information you share is kept strictly confidential and used only for your registration
                      process.
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="px-6 py-3 bg-transparent order-2 sm:order-1"
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleSubmit} className="submit-button order-1 sm:order-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
