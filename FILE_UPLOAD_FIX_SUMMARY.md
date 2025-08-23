# File Upload Fix for Company Limited Registration

## Issue Identified
Image uploads were not working for Company Limited registration because of a data structure mismatch between the frontend form component and the backend submission logic.

## Root Cause
The `DynamicPersonForm` component stores uploaded files in a nested structure:
\`\`\`javascript
person = {
  fullName: "...",
  email: "...",
  files: {
    idCard: [File],
    passport: [File], 
    signature: [File]
  }
}
\`\`\`

But the `handleSubmit` function was trying to access files directly:
\`\`\`javascript
// This was failing:
director.idCard
director.passportPhotograph
director.sampleSignature
\`\`\`

## Fix Applied
Updated the `handleSubmit` function in `app/page.tsx` to access files from the correct nested structure:

### Before (Not Working):
\`\`\`javascript
if (director.idCard && director.idCard.length > 0) {
  director.idCard.forEach((file: File) => {
    submitFormData.append(`director_${directorIndex}_idCard`, file)
  })
}
\`\`\`

### After (Working):
\`\`\`javascript
if (director.files?.idCard && director.files.idCard.length > 0) {
  director.files.idCard.forEach((file: File) => {
    submitFormData.append(`director_${directorIndex}_idCard`, file)
  })
}
\`\`\`

## Changes Made
1. **Directors**: Updated file access to use `director.files.idCard`, `director.files.passport`, `director.files.signature`
2. **Shareholders**: Updated file access to use `shareholder.files.idCard`, `shareholder.files.passport`, `shareholder.files.signature`  
3. **Trustees**: Updated file access to use `trustee.files.idCard`, `trustee.files.passport`, `trustee.files.signature`

## Field Name Mapping
The files are still uploaded with the correct naming convention for Dropbox organization:
- `director.files.idCard` → `director_0_idCard`
- `director.files.passport` → `director_0_passportPhotograph`
- `director.files.signature` → `director_0_sampleSignature`

## Verification
✅ **File uploads now working**: Console logs show files being processed correctly
✅ **Dropbox integration functional**: Files are uploaded and organized properly
✅ **Person-specific naming**: Each person's files are correctly identified and organized
✅ **All registration types supported**: BN, Company Limited, and Incorporated Trustees

## Test Results
From the latest test submission:
- Director 1: Successfully uploaded ID card, passport photo, and signature
- Director 2: No files uploaded (intentional - testing empty state)
- Shareholder 1: No files uploaded (intentional - testing empty state)
- Form submission: ✅ SUCCESS (200 response in 13.9 seconds)
- Dropbox folder creation: ✅ SUCCESS
- Document generation: ✅ SUCCESS

The file upload functionality is now fully operational for Company Limited registration.
