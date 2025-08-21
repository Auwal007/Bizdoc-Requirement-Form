"use client"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  files: {
    idCard: File[]
    passport: File[]
    signature: File[]
  }
}

interface DynamicPersonFormProps {
  title: string
  type: "director" | "shareholder"
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
      dateOfBirth: type === "director" ? "" : undefined,
      shareAllocation: type === "shareholder" ? 0 : undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-foreground">{title}</h3>
        <Button type="button" onClick={addPerson} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {type === "director" ? "Director" : "Shareholder"}
        </Button>
      </div>

      {persons.map((person, index) => (
        <Card key={person.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif">
                {type === "director" ? "Director" : "Shareholder"} {index + 1}
              </CardTitle>
              {persons.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePerson(person.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${person.id}-name`}>Full Name</Label>
                <Input
                  id={`${person.id}-name`}
                  value={person.fullName}
                  onChange={(e) => updatePerson(person.id, "fullName", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor={`${person.id}-email`}>Email</Label>
                <Input
                  id={`${person.id}-email`}
                  type="email"
                  value={person.email}
                  onChange={(e) => updatePerson(person.id, "email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor={`${person.id}-phone`}>Phone Number</Label>
                <Input
                  id={`${person.id}-phone`}
                  value={person.phone}
                  onChange={(e) => updatePerson(person.id, "phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              {type === "director" && (
                <div>
                  <Label htmlFor={`${person.id}-service`}>Service Address</Label>
                  <Input
                    id={`${person.id}-service`}
                    value={person.serviceAddress}
                    onChange={(e) => updatePerson(person.id, "serviceAddress", e.target.value)}
                    placeholder="Enter service address"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${person.id}-residential`}>Residential Address</Label>
                <Input
                  id={`${person.id}-residential`}
                  value={person.residentialAddress}
                  onChange={(e) => updatePerson(person.id, "residentialAddress", e.target.value)}
                  placeholder="Enter residential address"
                />
              </div>
              {type === "director" && (
                <div>
                  <Label htmlFor={`${person.id}-dob`}>Date of Birth</Label>
                  <Input
                    id={`${person.id}-dob`}
                    type="date"
                    value={person.dateOfBirth}
                    onChange={(e) => updatePerson(person.id, "dateOfBirth", e.target.value)}
                  />
                </div>
              )}
              {type === "shareholder" && (
                <div>
                  <Label htmlFor={`${person.id}-shares`}>
                    Share Allocation {totalShares && `(out of ${totalShares})`}
                  </Label>
                  <Input
                    id={`${person.id}-shares`}
                    type="number"
                    value={person.shareAllocation}
                    onChange={(e) => updatePerson(person.id, "shareAllocation", Number.parseInt(e.target.value) || 0)}
                    placeholder="Enter number of shares"
                    max={totalShares}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="text-center py-8 text-muted-foreground">
          <p>
            No {type}s added yet. Click "Add {type === "director" ? "Director" : "Shareholder"}" to get started.
          </p>
        </div>
      )}
    </div>
  )
}
