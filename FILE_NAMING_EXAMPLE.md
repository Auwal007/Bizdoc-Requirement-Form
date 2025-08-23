# File Naming Convention - Enhanced for Person Identification

## Overview
Each uploaded file is now renamed with clear identification of the person and document type for easier management in Dropbox.

## Naming Structure

### Directors
**Original field**: `director_0_idCard`  
**Person**: John Doe Smith  
**Final filename**: `ID_Card_John_Doe_Smith_original_filename.pdf`  
**Folder**: `/BIZDOC Applications/Business_Name_YYYY-MM-DD/Directors/Director_1_John_Doe_Smith/`

### Shareholders  
**Original field**: `shareholder_1_passportPhotograph`  
**Person**: Jane Mary Johnson  
**Final filename**: `Passport_Photo_Jane_Mary_Johnson_original_filename.jpg`  
**Folder**: `/BIZDOC Applications/Business_Name_YYYY-MM-DD/Shareholders/Shareholder_2_Jane_Mary_Johnson/`

### Trustees
**Original field**: `trustee_0_sampleSignature`  
**Person**: Robert Wilson Lee  
**Final filename**: `Sample_Signature_Robert_Wilson_Lee_original_filename.png`  
**Folder**: `/BIZDOC Applications/Business_Name_YYYY-MM-DD/Trustees/Trustee_1_Robert_Wilson_Lee/`

### General Documents
**Original field**: `memart`  
**Final filename**: `Memorandum_Articles_original_filename.pdf`  
**Folder**: `/BIZDOC Applications/Business_Name_YYYY-MM-DD/Documents/`

## Document Type Mappings
- `idCard` → `ID_Card`
- `passportPhotograph` → `Passport_Photo`
- `sampleSignature` → `Sample_Signature`
- `memart` → `Memorandum_Articles`
- `boardResolution` → `Board_Resolution`
- `constitutionDocument` → `Constitution_Document`
- `birthCertificate` → `Birth_Certificate`
- `utilityBill` → `Utility_Bill`
- `bankStatement` → `Bank_Statement`
- `proofOfAddress` → `Proof_of_Address`

## Benefits
1. **Clear Identification**: Each file name includes the person's full name
2. **Document Type**: Human-readable document type (ID_Card vs idCard)
3. **Organized Structure**: Each person has their own folder
4. **Easy Sorting**: Files are naturally grouped by person and type
5. **Professional Naming**: Clean, consistent naming convention

## Example Complete Structure
\`\`\`
/BIZDOC Applications/
  └── ABC_Company_Ltd_2025-08-23/
      ├── Directors/
      │   ├── Director_1_John_Doe_Smith/
      │   │   ├── ID_Card_John_Doe_Smith_scan001.pdf
      │   │   ├── Passport_Photo_John_Doe_Smith_photo.jpg
      │   │   └── Sample_Signature_John_Doe_Smith_signature.png
      │   └── Director_2_Mary_Jane_Brown/
      │       ├── ID_Card_Mary_Jane_Brown_license.pdf
      │       └── Passport_Photo_Mary_Jane_Brown_headshot.jpg
      ├── Shareholders/
      │   └── Shareholder_1_Robert_Wilson_Lee/
      │       ├── ID_Card_Robert_Wilson_Lee_drivers_license.pdf
      │       └── Bank_Statement_Robert_Wilson_Lee_statement.pdf
      ├── Documents/
      │   ├── Memorandum_Articles_company_docs.pdf
      │   ├── Board_Resolution_resolution.pdf
      │   └── Constitution_Document_constitution.pdf
      └── Business_Registration_Form_ABC_Company_Ltd.txt
\`\`\`
