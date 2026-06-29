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
  businessNameType?: "sole" | "partnership"
  proposedName1: string
  proposedName2: string
  proposedName3: string
  businessAddress: string
  email: string
  phone: string
  natureOfBusiness: string
  // BN specific
  proprietors: any[]
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

export default function BusinessRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    registrationType: "",
    businessNameType: "sole",
    proposedName1: "",
    proposedName2: "",
    proposedName3: "",
    businessAddress: "",
    email: "",
    phone: "",
    natureOfBusiness: "",
    proprietors: [],
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
  const [submissionResult, setSubmissionResult] = useState<any>(null)

  const getSteps = () => {
    switch (formData.registrationType) {
      case "bn":
        return ["Registration Type", "Business Details", "Proprietor Details", "Review & Submit"]
      case "company":
        return ["Registration Type", "Business Details", "Directors & Shareholders", "Review & Submit"]
      case "trustees":
        return ["Registration Type", "Business Details", "Trustee Details", "Review & Submit"]
      default:
        return ["Registration Type", "Business Details", "Details", "Review & Submit"]
    }
  }
  const steps = getSteps()

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

  const testDropboxConnection = async () => {
    try {
      setIsSubmitting(true)
      console.log("[v0] Testing Dropbox connection...")

      const response = await fetch("/api/test-dropbox")
      const result = await response.json()

      if (result.success) {
        toast.success(`Dropbox connection successful! Account: ${result.accountInfo?.name || "Connected"}`)
      } else {
        toast.error(`Dropbox connection failed: ${result.message}`)
        console.error("[v0] Dropbox test failed:", result)
      }
    } catch (error) {
      console.error("[v0] Dropbox test error:", error)
      toast.error("Failed to test Dropbox connection. Please check your network.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.registrationType) {
      toast.error("Please select a registration type")
      return
    }

    if (formData.registrationType === "trustees") {
      if (!formData.organizationName || !formData.organizationEmail || !formData.organizationPhone) {
        toast.error("Please fill in all required organization details")
        return
      }
      if (formData.trustees.length < 2) {
        toast.error("Please add at least two (2) trustees")
        return
      }
    } else {
      if (
        !formData.proposedName1 ||
        !formData.proposedName2 ||
        !formData.proposedName3 ||
        !formData.email ||
        !formData.phone
      ) {
        toast.error("Please fill in all required business details including all three proposed names")
        return
      }

      if (formData.registrationType === "bn") {
        if (formData.proprietors.length === 0) {
          toast.error("Please add at least one proprietor")
          return
        }
        if (formData.businessNameType === "sole" && formData.proprietors.length !== 1) {
          toast.error("A Sole Proprietorship must have exactly one (1) proprietor. Please add/remove proprietors.")
          return
        }
        if (formData.businessNameType === "partnership" && formData.proprietors.length < 2) {
          toast.error("A Partnership must have at least two (2) partners/proprietors. Please add more.")
          return
        }
      } else if (formData.registrationType === "company") {
        if (formData.directors.length === 0) {
          toast.error("Please add at least one director for Company Limited registration")
          return
        }
        if (formData.shareholders.length === 0) {
          toast.error("Please add at least one shareholder for Company Limited registration")
          return
        }
        }
    }

    setIsSubmitting(true)

    try {
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.")
      }

      console.log("[v0] Starting form submission...")
      console.log("[v0] Registration type:", formData.registrationType)
      console.log("[v0] Form data:", {
        registrationType: formData.registrationType,
        proposedNames: [formData.proposedName1, formData.proposedName2, formData.proposedName3],
        directorsCount: formData.directors.length,
        shareholdersCount: formData.shareholders.length,
        trusteesCount: formData.trustees.length,
        proprietorsCount: formData.proprietors.length,
      })

      const submitFormData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "directors" || key === "shareholders" || key === "trustees" || key === "proprietors") {
          submitFormData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          value.forEach((file, index) => {
            if (file instanceof File) {
              submitFormData.append(`${key}_${index}`, file)
            }
          })
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString())
        }
      })

      const fileTypeMap: { [key: string]: string } = {
        idCard: "idCard",
        passport: "passportPhotograph",
        signature: "sampleSignature"
      }

      // Add files from directors
      formData.directors.forEach((person, index) => {
        if (person.files) {
          Object.entries(person.files).forEach(([fileType, fileList]) => {
            if (Array.isArray(fileList)) {
              fileList.forEach((file) => {
                if (file instanceof File) {
                  const backendType = fileTypeMap[fileType] || fileType
                  submitFormData.append(`director_${index}_${backendType}`, file)
                }
              })
            }
          })
        }
      })

      // Add files from shareholders
      formData.shareholders.forEach((person, index) => {
        if (person.files) {
          Object.entries(person.files).forEach(([fileType, fileList]) => {
            if (Array.isArray(fileList)) {
              fileList.forEach((file) => {
                if (file instanceof File) {
                  const backendType = fileTypeMap[fileType] || fileType
                  submitFormData.append(`shareholder_${index}_${backendType}`, file)
                }
              })
            }
          })
        }
      })

      // Add files from trustees
      formData.trustees.forEach((person, index) => {
        if (person.files) {
          Object.entries(person.files).forEach(([fileType, fileList]) => {
            if (Array.isArray(fileList)) {
              fileList.forEach((file) => {
                if (file instanceof File) {
                  const backendType = fileTypeMap[fileType] || fileType
                  submitFormData.append(`trustee_${index}_${backendType}`, file)
                }
              })
            }
          })
        }
      })

      // Add files from proprietors
      formData.proprietors.forEach((person, index) => {
        if (person.files) {
          Object.entries(person.files).forEach(([fileType, fileList]) => {
            if (Array.isArray(fileList)) {
              fileList.forEach((file) => {
                if (file instanceof File) {
                  const backendType = fileTypeMap[fileType] || fileType
                  submitFormData.append(`proprietor_${index}_${backendType}`, file)
                }
              })
            }
          })
        }
      })

      console.log("[v0] Submitting to API...")

      const response = await fetch("/api/submit-form", {
        method: "POST",
        body: submitFormData,
      })

      console.log("[v0] API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API Error response:", errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] API Success response:", result)

      setSubmissionResult(result)
      setShowSuccessModal(true)
      toast.success("Form submitted successfully!")

    } catch (error) {
      console.error("[v0] Form submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bizdoc-milk)' }}>
      {/* ── Bizdoc Header ─────────────────────── */}
      <header className="bizdoc-header">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/bizdoc-logo.jpeg"
              alt="Bizdoc Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div>
              <div className="bizdoc-wordmark">Biz<span>doc</span></div>
              <div className="bizdoc-tagline">We handle CAC so you can handle business.</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--bizdoc-gold)', display: 'inline-block' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,251,235,0.6)', letterSpacing: '0.06em' }}>HAMZURY DIVISION</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {currentStep === 0 && (
          <Card className="card-enhanced overflow-hidden">
            {/* Hero accent bar */}
            <div style={{ height: 4, background: 'linear-gradient(90deg, var(--bizdoc-green) 0%, var(--bizdoc-gold) 100%)' }} />
            <CardHeader className="text-center pb-6 sm:pb-8 pt-8">
              <div className="gold-divider" />
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--bizdoc-green)', letterSpacing: '-0.03em' }}>
                Business Registration
              </CardTitle>
              <div className="max-w-xl mx-auto space-y-3 sm:space-y-4" style={{ color: 'var(--bizdoc-muted)' }}>
                <p className="text-sm sm:text-base leading-relaxed">
                  Fill in your details below. We will handle the rest with the Corporate Affairs Commission.
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--bizdoc-charcoal)' }}>
                  Choose your registration type to get started.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowHelp(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-150"
                  style={{ color: 'var(--bizdoc-green)', backgroundColor: 'var(--bizdoc-green-10)', borderColor: 'rgba(27,77,62,0.2)' }}
                >
                  <HelpCircle className="h-4 w-4" />
                  Not sure which one to choose? Click to see which one suits you
                </button>
              </div>

              <RadioGroup
                value={formData.registrationType}
                onValueChange={(value) => updateFormData("registrationType", value as "bn" | "company" | "trustees")}
                className="space-y-3 sm:space-y-4"
              >
                <div
                  className={`cursor-pointer p-4 sm:p-5 border-2 rounded-lg transition-all duration-200 ${
                    formData.registrationType === "bn"
                      ? "shadow-sm"
                      : "hover:border-opacity-60"
                  }`}
                  style={formData.registrationType === "bn"
                    ? { borderColor: 'var(--bizdoc-green)', backgroundColor: 'var(--bizdoc-green-10)' }
                    : { borderColor: 'var(--bizdoc-hairline)', backgroundColor: '#fff' }}
                  onClick={() => updateFormData("registrationType", "bn")}>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <RadioGroupItem value="bn" id="bn" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="bn" className="text-base sm:text-lg font-semibold cursor-pointer block" style={{ color: 'var(--bizdoc-green)' }}>
                        Business Name
                      </Label>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--bizdoc-muted)' }}>
                        Sole proprietorship or partnership — simple, fast, affordable.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`cursor-pointer p-4 sm:p-5 border-2 rounded-lg transition-all duration-200 ${
                    formData.registrationType === "company" ? "shadow-sm" : ""
                  }`}
                  style={formData.registrationType === "company"
                    ? { borderColor: 'var(--bizdoc-green)', backgroundColor: 'var(--bizdoc-green-10)' }
                    : { borderColor: 'var(--bizdoc-hairline)', backgroundColor: '#fff' }}
                  onClick={() => updateFormData("registrationType", "company")}>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <RadioGroupItem value="company" id="company" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="company" className="text-base sm:text-lg font-semibold cursor-pointer block" style={{ color: 'var(--bizdoc-green)' }}>
                        Company Limited
                      </Label>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--bizdoc-muted)' }}>
                        Limited liability company with shareholders and directors.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`cursor-pointer p-4 sm:p-5 border-2 rounded-lg transition-all duration-200 ${
                    formData.registrationType === "trustees" ? "shadow-sm" : ""
                  }`}
                  style={formData.registrationType === "trustees"
                    ? { borderColor: 'var(--bizdoc-green)', backgroundColor: 'var(--bizdoc-green-10)' }
                    : { borderColor: 'var(--bizdoc-hairline)', backgroundColor: '#fff' }}
                  onClick={() => updateFormData("registrationType", "trustees")}>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <RadioGroupItem value="trustees" id="trustees" className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="trustees" className="text-base sm:text-lg font-semibold cursor-pointer block" style={{ color: 'var(--bizdoc-green)' }}>
                        Incorporated Trustees
                      </Label>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--bizdoc-muted)' }}>
                        Non-profit, NGO, or charitable organization.
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
                      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                          <label className="form-label">Proposed Name 1 *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.proposedName1}
                            onChange={(e) => updateFormData("proposedName1", e.target.value)}
                            placeholder="Enter first choice name"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Proposed Name 2 *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.proposedName2}
                            onChange={(e) => updateFormData("proposedName2", e.target.value)}
                            placeholder="Enter second choice name"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Proposed Name 3 *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.proposedName3}
                            onChange={(e) => updateFormData("proposedName3", e.target.value)}
                            placeholder="Enter third choice name"
                            required
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


                {/* BN Specific Sections */}
                {formData.registrationType === "bn" && (
                  <Card className="card-enhanced">
                    <CardHeader>
                      <CardTitle className="section-title">Business Name Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select whether this is a sole proprietorship (single owner) or partnership (multiple owners).
                      </p>
                      <RadioGroup
                        value={formData.businessNameType || "sole"}
                        onValueChange={(value) => updateFormData("businessNameType", value as "sole" | "partnership")}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div
                          className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 ${
                            (formData.businessNameType || "sole") === "sole"
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50 hover:bg-secondary/50"
                          }`}
                          onClick={() => updateFormData("businessNameType", "sole")}
                        >
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value="sole" id="sole" className="mt-1" />
                            <div>
                              <Label htmlFor="sole" className="font-bold cursor-pointer block text-sm sm:text-base">
                                Sole Proprietorship
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">Single owner / proprietor</p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 ${
                            formData.businessNameType === "partnership"
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:border-primary/50 hover:bg-secondary/50"
                          }`}
                          onClick={() => updateFormData("businessNameType", "partnership")}
                        >
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value="partnership" id="partnership" className="mt-1" />
                            <div>
                              <Label htmlFor="partnership" className="font-bold cursor-pointer block text-sm sm:text-base">
                                Partnership
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">Two or more partners / proprietors</p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
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
                    hidePassport={formData.registrationType === "company"}
                  />

                  <DynamicPersonForm
                    title="Particulars of Shareholders"
                    type="shareholder"
                    persons={formData.shareholders}
                    onPersonsChange={(shareholders) => updateFormData("shareholders", shareholders)}
                    totalShares={formData.totalShares}
                    hidePassport={formData.registrationType === "company"}
                    directors={formData.directors}
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

            {currentStep === 2 && formData.registrationType === "bn" && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="section-title">Proprietor Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  <DynamicPersonForm
                    title="Particulars of Proprietors"
                    type="proprietor"
                    persons={formData.proprietors}
                    onPersonsChange={(proprietors) => updateFormData("proprietors", proprietors)}
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

            {currentStep === 3 && (
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
                            <p className="text-muted-foreground mt-1">{formData.organizationName || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Office Address:</span>
                            <p className="text-muted-foreground mt-1">{formData.officeAddress || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact Email:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationEmail || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact Phone:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationPhone || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Key Objectives:</span>
                            <p className="text-muted-foreground mt-1">{formData.keyObjectives || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Trustee Tenure:</span>
                            <p className="text-muted-foreground mt-1">{formData.trusteeTenure || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Seal Custodian:</span>
                            <p className="text-muted-foreground mt-1">{formData.sealCustodian || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Funding Sources:</span>
                            <p className="text-muted-foreground mt-1">{formData.fundingSources || "Not provided"}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium text-foreground">Proposed Name 1:</span>
                            <p className="text-muted-foreground mt-1">{formData.proposedName1 || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Proposed Name 2:</span>
                            <p className="text-muted-foreground mt-1">{formData.proposedName2 || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Proposed Name 3:</span>
                            <p className="text-muted-foreground mt-1">{formData.proposedName3 || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Business Address:</span>
                            <p className="text-muted-foreground mt-1">{formData.businessAddress || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact Email:</span>
                            <p className="text-muted-foreground mt-1">{formData.email || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact Phone:</span>
                            <p className="text-muted-foreground mt-1">{formData.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Nature of Business:</span>
                            <p className="text-muted-foreground mt-1">{formData.natureOfBusiness || "Not provided"}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Organization Details for Trustees */}
                  {formData.registrationType === "trustees" && (
                    <div className="form-section">
                      <h3 className="section-title">Organization Details</h3>
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm">
                          <div>
                            <span className="font-medium text-foreground">Organization Name:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationName || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Office Address:</span>
                            <p className="text-muted-foreground mt-1">{formData.officeAddress || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Organization Email:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationEmail || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Organization Phone:</span>
                            <p className="text-muted-foreground mt-1">{formData.organizationPhone || "Not provided"}</p>
                          </div>
                          <div className="lg:col-span-2">
                            <span className="font-medium text-foreground">Key Objectives:</span>
                            <p className="text-muted-foreground mt-1">{formData.keyObjectives || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Trustee Tenure Period:</span>
                            <p className="text-muted-foreground mt-1">{formData.trusteeTenure || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Seal Custodian:</span>
                            <p className="text-muted-foreground mt-1">{formData.sealCustodian || "Not provided"}</p>
                          </div>
                          <div className="lg:col-span-2">
                            <span className="font-medium text-foreground">Funding Sources:</span>
                            <p className="text-muted-foreground mt-1">{formData.fundingSources || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BN Specific Information */}
                  {formData.registrationType === "bn" && (
                    <div className="form-section">
                      <h3 className="section-title">Proprietors / Partners ({formData.proprietors?.length || 0})</h3>
                      {formData.proprietors && formData.proprietors.length > 0 ? (
                        <div className="space-y-4">
                          {formData.proprietors.map((proprietor: any, index: number) => (
                            <div key={index} className="bg-secondary/50 p-4 rounded-lg">
                              <h4 className="font-medium text-foreground mb-2">Proprietor {index + 1}</h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium">Full Name:</span>
                                  <p className="text-muted-foreground">{proprietor.fullName || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>
                                  <p className="text-muted-foreground">{proprietor.email || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Phone Number:</span>
                                  <p className="text-muted-foreground">{proprietor.phone || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">NIN:</span>
                                  <p className="text-muted-foreground">{proprietor.nin || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Date of Birth:</span>
                                  <p className="text-muted-foreground">{proprietor.dateOfBirth || "Not provided"}</p>
                                </div>
                                <div className="lg:col-span-2">
                                  <span className="font-medium">Residential Address:</span>
                                  <p className="text-muted-foreground">
                                    {proprietor.residentialAddress || "Not provided"}
                                  </p>
                                </div>
                              </div>
                              {/* File uploads */}
                              <div className="mt-4 pt-3 border-t border-muted">
                                <h5 className="font-medium text-foreground mb-2">Uploaded Documents</h5>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium">ID Card:</span>
                                    <p className="text-muted-foreground">
                                      {proprietor.files?.idCard && proprietor.files.idCard.length > 0
                                        ? `${proprietor.files.idCard.length} file(s) uploaded - ${proprietor.files.idCard.map((f: any) => f.name).join(", ")}`
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Passport Photograph:</span>
                                    <p className="text-muted-foreground">
                                      {proprietor.files?.passport && proprietor.files.passport.length > 0
                                        ? `${proprietor.files.passport.length} file(s) uploaded - ${proprietor.files.passport.map((f: any) => f.name).join(", ")}`
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Sample Signature:</span>
                                    <p className="text-muted-foreground">
                                      {proprietor.files?.signature && proprietor.files.signature.length > 0
                                        ? `${proprietor.files.signature.length} file(s) uploaded - ${proprietor.files.signature.map((f: any) => f.name).join(", ")}`
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No proprietors added</p>
                      )}
                    </div>
                  )}

                  {/* Company Specific Information */}
                  {formData.registrationType === "company" && (
                    <>
                      {/* Directors Section */}
                      <div className="form-section">
                        <h3 className="section-title">Directors ({formData.directors?.length || 0})</h3>
                        {formData.directors && formData.directors.length > 0 ? (
                          <div className="space-y-4">
                            {formData.directors.map((director: any, index: number) => (
                              <div key={index} className="bg-secondary/50 p-4 rounded-lg">
                                <h4 className="font-medium text-foreground mb-2">Director {index + 1}</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium">Full Name:</span>
                                    <p className="text-muted-foreground">{director.fullName || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span>
                                    <p className="text-muted-foreground">{director.email || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Phone:</span>
                                    <p className="text-muted-foreground">{director.phoneNumber || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Date of Birth:</span>
                                    <p className="text-muted-foreground">{director.dateOfBirth || "Not provided"}</p>
                                  </div>
                                  <div className="lg:col-span-2">
                                    <span className="font-medium">Residential Address:</span>
                                    <p className="text-muted-foreground">
                                      {director.residentialAddress || "Not provided"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No directors added</p>
                        )}
                      </div>

                      {/* Shareholders Section */}
                      <div className="form-section">
                        <h3 className="section-title">Shareholders ({formData.shareholders?.length || 0})</h3>
                        {formData.shareholders && formData.shareholders.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-foreground">Total Shares:</span>
                                <p className="text-muted-foreground mt-1">{formData.totalShares || "Not specified"}</p>
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Allotment Details:</span>
                                <p className="text-muted-foreground mt-1">
                                  {formData.allotmentDetails || "Not provided"}
                                </p>
                              </div>
                            </div>
                            {formData.shareholders.map((shareholder: any, index: number) => (
                              <div key={index} className="bg-secondary/50 p-4 rounded-lg">
                                <h4 className="font-medium text-foreground mb-2">Shareholder {index + 1}</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium">Full Name:</span>
                                    <p className="text-muted-foreground">{shareholder.fullName || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span>
                                    <p className="text-muted-foreground">{shareholder.email || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Phone:</span>
                                    <p className="text-muted-foreground">{shareholder.phoneNumber || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Date of Birth:</span>
                                    <p className="text-muted-foreground">{shareholder.dateOfBirth || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Shares:</span>
                                    <p className="text-muted-foreground">{shareholder.shares || "Not specified"}</p>
                                  </div>
                                  <div className="lg:col-span-2">
                                    <span className="font-medium">Residential Address:</span>
                                    <p className="text-muted-foreground">
                                      {shareholder.residentialAddress || "Not provided"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No shareholders added</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Trustees Specific Information */}
                  {formData.registrationType === "trustees" && (
                    <div className="form-section">
                      <h3 className="section-title">Trustees ({formData.trustees?.length || 0})</h3>
                      {formData.trustees && formData.trustees.length > 0 ? (
                        <div className="space-y-4">
                          {formData.trustees.map((trustee: any, index: number) => (
                            <div key={index} className="bg-secondary/50 p-4 rounded-lg">
                              <h4 className="font-medium text-foreground mb-2">Trustee {index + 1}</h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium">Full Name:</span>
                                  <p className="text-muted-foreground">{trustee.fullName || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>
                                  <p className="text-muted-foreground">{trustee.email || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Phone Number:</span>
                                  <p className="text-muted-foreground">
                                    {trustee.phoneNumber || trustee.phone || "Not provided"}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Date of Birth:</span>
                                  <p className="text-muted-foreground">{trustee.dateOfBirth || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">NIN Number:</span>
                                  <p className="text-muted-foreground">{trustee.nin || "Not provided"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Trustee Position:</span>
                                  <p className="text-muted-foreground">{trustee.position || "Not provided"}</p>
                                </div>
                                <div className="lg:col-span-2">
                                  <span className="font-medium">Residential Address:</span>
                                  <p className="text-muted-foreground">
                                    {trustee.residentialAddress || "Not provided"}
                                  </p>
                                </div>
                              </div>

                              {/* File Upload Information for Trustees */}
                              <div className="mt-4 pt-3 border-t border-muted">
                                <h5 className="font-medium text-foreground mb-2">Uploaded Documents</h5>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium">ID Card:</span>
                                    <p className="text-muted-foreground">
                                      {trustee.files?.idCard && trustee.files.idCard.length > 0
                                        ? `${trustee.files.idCard.length} file(s) uploaded - ${trustee.files.idCard.map((f: File) => f.name).join(", ")}`
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Passport Photograph:</span>
                                    <p className="text-muted-foreground">
                                      {trustee.files?.passport && trustee.files.passport.length > 0
                                        ? `${trustee.files.passport.length} file(s) uploaded - ${trustee.files.passport.map((f: File) => f.name).join(", ")}`
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Sample Signature:</span>
                                    <p className="text-muted-foreground">
                                      {trustee.files?.signature && trustee.files.signature.length > 0
                                        ? `${trustee.files.signature.length} file(s) uploaded - ${trustee.files.signature.map((f: File) => f.name).join(", ")}`
                                        : "Not uploaded"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No trustees added</p>
                      )}
                    </div>
                  )}

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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Header with success icon */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-green-100">Your application has been submitted</p>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">✅ Application Received</p>
                  <p className="text-green-700 text-sm">
                    We have successfully received your business registration application and all required documents.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium mb-2">⏰ What's Next?</p>
                  <p className="text-blue-700 text-sm">
                    Our team will review your submission and contact you within 2-3 business days to proceed with your
                    registration.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium mb-2">📞 Need Help?</p>
                  <p className="text-amber-700 text-sm">
                    If you have any questions, feel free to contact our support team.
                  </p>
                </div>

                {submissionResult?.folderUrl && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800 font-bold text-sm mb-2">📂 Your Google Drive Folder</p>
                    <p className="text-blue-700 text-xs mb-3">
                      Your requirements have been successfully captured! You can view and manage your uploaded files here:
                    </p>
                    <a
                      href={submissionResult.folderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Open Google Drive Folder
                    </a>
                  </div>
                )}
              </div>

              {/* Close button */}
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false)
                    setCurrentStep(0)
                    setFormData({
                      registrationType: "",
                      businessNameType: "sole",
                      proposedName1: "",
                      proposedName2: "",
                      proposedName3: "",
                      businessAddress: "",
                      email: "",
                      phone: "",
                      natureOfBusiness: "",
                      proprietors: [],
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
                    setSubmissionResult(null)
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">Thank you for choosing our services!</p>
            </div>
          </div>
        </div>
      )}
      {/* ── Brand Footer ──────────────────────── */}
      <footer className="bizdoc-footer-tag">
        <span style={{ color: 'var(--bizdoc-gold)', marginRight: 6 }}>◆</span>
        Bizdoc by Hamzury · Tax &amp; Compliance
        <span style={{ margin: '0 8px', opacity: 0.35 }}>·</span>
        Built to Last.
      </footer>
    </div>
  )
}
