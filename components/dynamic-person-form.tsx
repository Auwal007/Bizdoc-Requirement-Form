"use client"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./file-upload"

interface PersonData {
  id: string
  fullName: string
  email: string
  phone: string
  serviceAddress?: string
  residentialAddress: string
  dateOfBirth?: string
  shareAllocation?: number
  nin?: string
  position?: string
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
}

export function DynamicPersonForm({ title, type, persons, onPersonsChange, totalShares }: DynamicPersonFormProps) {
  const addPerson = () => {
    const newPerson: PersonData = {
      id: Date.now().toString(),
      fullName: "",
      email: "",
      phone: "",
      serviceAddress: type === "director" ? "" : undefined,
      residentialAddress: "",
      dateOfBirth: type === "director" || type === "trustee" || type === "proprietor" ? "" : undefined,
      shareAllocation: type === "shareholder" ? 0 : undefined,
      nin: "",
      position: type === "trustee" ? "" : undefined,
      files: {
        idCard: [],
        passport: [],
        signature: [],
      },
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

      {persons.map((person, index) => (
        <Card key={person.id} className="card-enhanced">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl font-serif font-bold text-primary">
                {getPersonTypeLabel()} {index + 1}
              </CardTitle>
              {persons.length > 1 && (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="form-label">Full Name</label>
                <Input
                  className="form-input"
                  value={person.fullName}
                  onChange={(e) => updatePerson(person.id, "fullName", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <Input
                  type="email"
                  className="form-input"
                  value={person.email}
                  onChange={(e) => updatePerson(person.id, "email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <Input
                  className="form-input"
                  value={person.phone}
                  onChange={(e) => updatePerson(person.id, "phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="form-label">NIN Number</label>
                <Input
                  className="form-input"
                  value={person.nin || ""}
                  onChange={(e) => updatePerson(person.id, "nin", e.target.value)}
                  placeholder="Enter NIN number"
                />
              </div>
              {type === "trustee" && (
                <div>
                  <label className="form-label">Trustee Position</label>
                  <Input
                    className="form-input"
                    value={person.position}
                    onChange={(e) => updatePerson(person.id, "position", e.target.value)}
                    placeholder="e.g., Chairman, Secretary"
                  />
                </div>
              )}
              {type === "director" && (
                <div>
                  <label className="form-label">Service Address</label>
                  <Input
                    className="form-input"
                    value={person.serviceAddress}
                    onChange={(e) => updatePerson(person.id, "serviceAddress", e.target.value)}
                    placeholder="Enter service address"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="form-label">Residential Address</label>
                <Input
                  className="form-input"
                  value={person.residentialAddress}
                  onChange={(e) => updatePerson(person.id, "residentialAddress", e.target.value)}
                  placeholder="Enter residential address"
                />
              </div>
              {(type === "director" || type === "trustee") && (
                <div>
                  <label className="form-label">Date of Birth</label>
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
                  <label className="form-label">Share Allocation {totalShares && `(out of ${totalShares})`}</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <FileUpload
                label="ID Card"
                accept="image/*,.pdf"
                onFilesChange={(files) => updatePersonFiles(person.id, "idCard", files)}
              />
              <FileUpload
                label="Passport Photograph"
                accept="image/*"
                onFilesChange={(files) => updatePersonFiles(person.id, "passport", files)}
              />
              <FileUpload
                label="Sample Signature"
                accept="image/*,.pdf"
                onFilesChange={(files) => updatePersonFiles(person.id, "signature", files)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

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
