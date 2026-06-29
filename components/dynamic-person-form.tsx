"use client"
import { Plus, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./file-upload"

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
]

export interface PersonData {
  id: string
  fullName: string
  email: string
  phone: string
  
  // Residential Address Fields
  residentialAddress_building: string
  residentialAddress_street: string
  residentialAddress_lga: string
  residentialAddress_state: string
  

  dateOfBirth?: string
  shareAllocation?: number
  nin?: string
  position?: string
  isShareholder?: boolean
  copiedFromDirectorId?: string
  files: {
    idCard: File[]
    passport: File[]
    signature: File[]
  }
}

interface DynamicPersonFormProps {
  title: string
  type: "director" | "shareholder" | "trustee" | "proprietor"
  persons: PersonData[]
  onPersonsChange: (persons: PersonData[]) => void
  totalShares?: number
  hidePassport?: boolean
  directors?: any[]
}

export function DynamicPersonForm({ title, type, persons, onPersonsChange, totalShares, hidePassport, directors }: DynamicPersonFormProps) {
  
  const addPerson = () => {
    const newPerson: PersonData = {
      id: Date.now().toString(),
      fullName: "",
      email: "",
      phone: "",
      residentialAddress_building: "",
      residentialAddress_street: "",
      residentialAddress_lga: "",
      residentialAddress_state: "",
      nin: "",
      files: {
        idCard: [],
        passport: [],
        signature: [],
      },
    }

    if (type === "director") {
      newPerson.dateOfBirth = ""
      newPerson.isShareholder = false
    }

    if (type === "trustee") {
      newPerson.dateOfBirth = ""
      newPerson.position = ""
    }

    if (type === "proprietor") {
      newPerson.dateOfBirth = ""
    }

    if (type === "shareholder") {
      newPerson.shareAllocation = 0
    }

    onPersonsChange([...persons, newPerson])
  }

  const removePerson = (id: string) => {
    onPersonsChange(persons.filter((person) => person.id !== id))
  }

  const updatePerson = (id: string, field: keyof PersonData, value: any) => {
    onPersonsChange(persons.map((person) => (person.id === id ? { ...person, [field]: value } : person)))
  }

  const updatePersonFiles = (id: string, fileType: keyof PersonData["files"], files: File[]) => {
    onPersonsChange(
      persons.map((person) =>
        person.id === id ? { ...person, files: { ...person.files, [fileType]: files } } : person,
      ),
    )
  }

  const getPersonTypeLabel = () => {
    switch (type) {
      case "director":
        return "Director"
      case "shareholder":
        return "Shareholder"
      case "trustee":
        return "Trustee"
      case "proprietor":
        return "Proprietor / Partner"
      default:
        return "Person"
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="section-title">{title}</h3>
        <Button type="button" onClick={addPerson} variant="outline" size="sm" className="px-4 py-2 bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add {getPersonTypeLabel()}
        </Button>
      </div>

      {persons.map((person, index) => {
        const isSyncedShareholder = type === "shareholder" && !!person.copiedFromDirectorId

        return (
          <Card key={person.id} className="card-enhanced">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg sm:text-xl font-bold" style={{ color: 'var(--bizdoc-green)' }}>
                    {getPersonTypeLabel()} {index + 1}
                  </CardTitle>
                  {isSyncedShareholder && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Synced from Director
                    </span>
                  )}
                </div>
                {persons.length > 1 && !isSyncedShareholder && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerson(person.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              
              {/* Optional manual selection/overwrite dropdown for shareholders */}
              {type === "shareholder" && directors && directors.length > 0 && !isSyncedShareholder && (
                <div className="bg-secondary/50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm border border-border">
                  <span className="text-muted-foreground font-medium">Is this shareholder also a director?</span>
                  <select
                    onChange={(e) => {
                      const dirIndex = parseInt(e.target.value, 10);
                      if (!isNaN(dirIndex) && directors[dirIndex]) {
                        const dir = directors[dirIndex];
                        updatePerson(person.id, "fullName", dir.fullName);
                        updatePerson(person.id, "email", dir.email);
                        updatePerson(person.id, "phone", dir.phone);
                        updatePerson(person.id, "nin", dir.nin);
                        
                        // Copy split addresses
                        updatePerson(person.id, "residentialAddress_building", dir.residentialAddress_building || "");
                        updatePerson(person.id, "residentialAddress_street", dir.residentialAddress_street || "");
                        updatePerson(person.id, "residentialAddress_lga", dir.residentialAddress_lga || "");
                        updatePerson(person.id, "residentialAddress_state", dir.residentialAddress_state || "");
                        
                        if (dir.files) {
                          updatePerson(person.id, "files", {
                            idCard: dir.files.idCard ? [...dir.files.idCard] : [],
                            passport: dir.files.passport ? [...dir.files.passport] : [],
                            signature: dir.files.signature ? [...dir.files.signature] : []
                          });
                        }
                      }
                      e.target.value = ""; // Reset dropdown
                    }}
                    className="bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary font-medium cursor-pointer max-w-full"
                    defaultValue=""
                  >
                    <option value="" disabled>Select director to copy details...</option>
                    {directors.map((dir, i) => (
                      <option key={dir.id || i} value={i}>
                        {dir.fullName || `Director ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show friendly hint if fields are locked because of director-sync */}
              {isSyncedShareholder && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <Info className="h-4.5 w-4.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    This shareholder is linked to a Director. Basic contact, address, and files are synced and managed under the Director's card above.
                  </div>
                </div>
              )}

              {/* isShareholder Toggle on Director card */}
              {type === "director" && (
                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200/60 max-w-max">
                  <input
                    type="checkbox"
                    id={`isShareholder_${person.id}`}
                    checked={person.isShareholder || false}
                    onChange={(e) => updatePerson(person.id, "isShareholder", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor={`isShareholder_${person.id}`} className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Is this director also a shareholder?
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <Input
                    className="form-input"
                    value={person.fullName}
                    onChange={(e) => updatePerson(person.id, "fullName", e.target.value)}
                    placeholder="Enter full name"
                    disabled={isSyncedShareholder}
                  />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <Input
                    type="email"
                    className="form-input"
                    value={person.email}
                    onChange={(e) => updatePerson(person.id, "email", e.target.value)}
                    placeholder="Enter email address"
                    disabled={isSyncedShareholder}
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <Input
                    className="form-input"
                    value={person.phone}
                    onChange={(e) => updatePerson(person.id, "phone", e.target.value)}
                    placeholder="Enter phone number"
                    disabled={isSyncedShareholder}
                  />
                </div>
                <div>
                  <label className="form-label">NIN Number *</label>
                  <Input
                    className="form-input"
                    value={person.nin || ""}
                    onChange={(e) => updatePerson(person.id, "nin", e.target.value)}
                    placeholder="Enter 11-digit NIN"
                    disabled={isSyncedShareholder}
                  />
                </div>
                {type === "trustee" && (
                  <div>
                    <label className="form-label">Trustee Position *</label>
                    <Input
                      className="form-input"
                      value={person.position}
                      onChange={(e) => updatePerson(person.id, "position", e.target.value)}
                      placeholder="e.g., Chairman, Secretary"
                    />
                  </div>
                )}
                {(type === "director" || type === "trustee" || type === "proprietor") && (
                  <div>
                    <label className="form-label">Date of Birth *</label>
                    <Input
                      type="date"
                      className="form-input"
                      value={person.dateOfBirth}
                      onChange={(e) => updatePerson(person.id, "dateOfBirth", e.target.value)}
                    />
                  </div>
                )}
                {type === "shareholder" && (
                  <div>
                    <label className="form-label">Share Allocation * {totalShares && `(out of ${totalShares})`}</label>
                    <Input
                      type="number"
                      className="form-input"
                      value={person.shareAllocation}
                      onChange={(e) => updatePerson(person.id, "shareAllocation", Number.parseInt(e.target.value) || 0)}
                      placeholder="Enter number of shares"
                      max={totalShares}
                    />
                  </div>
                )}
              </div>

              {/* Split Residential Address Details */}
              <div className="space-y-4 pt-2">
                <label className="form-label font-bold text-sm" style={{ color: 'var(--bizdoc-green)' }}>
                  Residential Address *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label text-xs">Building No. / House Name *</label>
                    <Input
                      className="form-input"
                      value={person.residentialAddress_building}
                      onChange={(e) => updatePerson(person.id, "residentialAddress_building", e.target.value)}
                      placeholder="e.g., Plot 12"
                      disabled={isSyncedShareholder}
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Street Name *</label>
                    <Input
                      className="form-input"
                      value={person.residentialAddress_street}
                      onChange={(e) => updatePerson(person.id, "residentialAddress_street", e.target.value)}
                      placeholder="e.g., Adeniran Street"
                      disabled={isSyncedShareholder}
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Local Government (LGA) *</label>
                    <Input
                      className="form-input"
                      value={person.residentialAddress_lga}
                      onChange={(e) => updatePerson(person.id, "residentialAddress_lga", e.target.value)}
                      placeholder="e.g., Ikeja LGA"
                      disabled={isSyncedShareholder}
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">State *</label>
                    <select
                      className="form-input h-10 py-2 border rounded-md"
                      value={person.residentialAddress_state}
                      onChange={(e) => updatePerson(person.id, "residentialAddress_state", e.target.value)}
                      disabled={isSyncedShareholder}
                    >
                      <option value="" disabled>Select State</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              {/* File Upload zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
                <FileUpload
                  label="ID Card *"
                  accept="image/*,.pdf"
                  onFilesChange={(files) => updatePersonFiles(person.id, "idCard", files)}
                  disabled={isSyncedShareholder}
                  value={person.files.idCard}
                />
                {!hidePassport && (
                  <FileUpload
                    label="Passport Photograph *"
                    accept="image/*"
                    onFilesChange={(files) => updatePersonFiles(person.id, "passport", files)}
                    disabled={isSyncedShareholder}
                    value={person.files.passport}
                  />
                )}
                <FileUpload
                  label="Sample Signature *"
                  accept="image/*,.pdf"
                  onFilesChange={(files) => updatePersonFiles(person.id, "signature", files)}
                  disabled={isSyncedShareholder}
                  value={person.files.signature}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}

      {persons.length === 0 && (
        <Card className="card-enhanced">
          <CardContent className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-base sm:text-lg">
              No {type}s added yet. Click "Add {getPersonTypeLabel()}" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
