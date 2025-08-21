"use client"

import { useState } from "react"
import { Building2, Shield, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProgressTracker } from "@/components/progress-tracker"
import { FileUpload } from "@/components/file-upload"
import { DynamicPersonForm } from "@/components/dynamic-person-form"

interface FormData {
  registrationType: "bn" | "company" | ""
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
}

const steps = ["Registration Type", "Business Details", "Directors & Shareholders", "Review & Submit"]

export default function BusinessRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
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

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    // Here you would integrate with your backend/Google Sheets/Airtable
    alert("Form submitted successfully! We will contact you shortly.")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground">BIZDOC CONSULT</h1>
              <p className="text-muted-foreground font-medium">Professional Business Registration Services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentStep === 0 && (
          <Card className="card-enhanced">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl font-serif font-bold text-primary mb-6">
                Business Registration Requirements Form
              </CardTitle>
              <div className="max-w-2xl mx-auto space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Welcome! This form is designed to help us collect the necessary information and documents required for
                  your business registration with BIZDOC CONSULT. Please select the type of registration you want to
                  apply for, then provide the requested details.
                </p>
                <div className="flex items-center justify-center space-x-3 text-sm bg-secondary border border-primary/20 p-4 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium text-secondary-foreground">
                    All information you share is kept strictly confidential and used only for your registration process.
                  </span>
                </div>
                <p className="font-bold text-lg text-foreground">Choose your registration type below to get started.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.registrationType}
                onValueChange={(value) => updateFormData("registrationType", value as "bn" | "company")}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4 p-6 border-2 border-border rounded-lg hover:border-primary/50 hover:bg-secondary/50 transition-all duration-200 shadow-sm">
                  <RadioGroupItem value="bn" id="bn" />
                  <div className="flex-1">
                    <Label htmlFor="bn" className="text-xl font-bold cursor-pointer text-foreground">
                      Business Name (BN)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Register a business name for sole proprietorship or partnership
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-6 border-2 border-border rounded-lg hover:border-primary/50 hover:bg-secondary/50 transition-all duration-200 shadow-sm">
                  <RadioGroupItem value="company" id="company" />
                  <div className="flex-1">
                    <Label htmlFor="company" className="text-xl font-bold cursor-pointer text-foreground">
                      Company Limited
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Incorporate a limited liability company with shareholders and directors
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <div className="flex justify-end pt-6">
                <Button onClick={nextStep} disabled={!formData.registrationType} className="submit-button">
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep > 0 && (
          <>
            <ProgressTracker currentStep={currentStep} totalSteps={steps.length} steps={steps} />

            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Proposed Business Names Section */}
                <div className="form-section">
                  <h3 className="section-title">Proposed Business Names</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                {/* Business Contact Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Business Contact Information</h3>
                  <div className="space-y-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                {/* Shares & Allotment Section (Company only) */}
                {formData.registrationType === "company" && (
                  <div className="form-section">
                    <h3 className="section-title">Shares & Allotment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                  </div>
                )}

                {/* BN Specific Sections */}
                {formData.registrationType === "bn" && (
                  <>
                    <div className="form-section">
                      <h3 className="section-title">Director Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="section-title">Required Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      </div>
                    </div>
                  </>
                )}

                {/* Nature of Business Section */}
                <div className="form-section">
                  <h3 className="section-title">Nature of Business</h3>
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
                </div>

                <div className="flex justify-between pt-6">
                  <Button onClick={prevStep} variant="outline" className="px-6 py-3 bg-transparent">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={nextStep} className="submit-button">
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && formData.registrationType === "company" && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="section-title">Directors & Shareholders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
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

                  <div className="flex justify-between pt-6">
                    <Button onClick={prevStep} variant="outline" className="px-6 py-3 bg-transparent">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={nextStep} className="submit-button">
                      Review Application
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {((currentStep === 2 && formData.registrationType === "bn") ||
              (currentStep === 3 && formData.registrationType === "company")) && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="section-title">Review & Submit</CardTitle>
                  <p className="text-muted-foreground">
                    Please review your information before submitting your application.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="form-section">
                    <h3 className="section-title">Application Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Registration Type:</span>
                        <p className="text-muted-foreground mt-1">
                          {formData.registrationType === "bn" ? "Business Name (BN)" : "Company Limited"}
                        </p>
                      </div>
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
                    </div>
                  </div>

                  <div className="bg-secondary border border-primary/30 p-6 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-6 w-6 text-primary mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-lg text-primary mb-2">Data Security & Privacy</p>
                        <p className="text-secondary-foreground leading-relaxed">
                          Your information is encrypted and stored securely. We comply with all data protection
                          regulations and will only use your information for business registration purposes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button onClick={prevStep} variant="outline" className="px-6 py-3 bg-transparent">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <button onClick={handleSubmit} className="submit-button">
                      Submit Application
                    </button>
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
