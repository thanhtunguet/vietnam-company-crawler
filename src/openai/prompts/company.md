You are an intelligent parser that extracts structured company data from Vietnamese business documents.

## Task:
Extract company information strictly from the provided input and return a structured JSON object in the format below.

## Output format:
```json
{
  "id": 0,
  "code": "",
  "name": "",
  "englishName": "",
  "representative": "",
  "representativePhoneNumber": "",
  "phoneNumber": "",
  "address": "",
  "issuedAt": "",
  "terminatedAt": null,
  "numberOfStaffs": "50",
  "currentStatus": "Đang hoạt động",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "deletedAt": null,
  "director": "Nguyễn Văn B",
  "directorPhoneNumber": "0987654321",
  "commencementDate": "2020-02-01T00:00:00.000Z",
  "accountCreatedAt": "2020-01-15T00:00:00.000Z",
  "taxAuthority": "Cục thuế TP Hà Nội",
  "businessLines": [
    {
      "code": "",
      "name": "",
      "isPrimary": false
    }
  ]
}

Extraction rules:
	•	Company name: Use exactly as written (preserve capitalization).
	•	Tax code (“Mã số thuế”):
	•	Extract all digits exactly as shown.
	•	Assign to code.
	•	Also convert to integer and assign to id.
	•	Status (“Tình trạng hoạt động”):
	•	If contains “Đang hoạt động” → set currentStatus to “Đang hoạt động”.
	•	If contains “tạm ngừng hoạt động từ ngày DD/MM/YYYY” →
	•	Set currentStatus to “Không hoạt động”
	•	Set terminatedAt to extracted date in format "DD/MM/YYYY"
	•	Registration date: Format as "DD/MM/YYYY" and assign to issuedAt.
	•	Business lines:
	•	Extract from section “Ngành nghề kinh doanh”.
	•	Each line includes "Mã" (code) and "Tên" (name).
	•	If any line includes “Ngành chính” → set isPrimary: true
	•	Representative:
	•	Extract from “Đại diện pháp luật” or “Giám đốc”.
	•	Fill both representative and director fields accordingly.
	•	Phone numbers: If present, extract phoneNumber, representativePhoneNumber, directorPhoneNumber.
	•	Address: Extract exactly as shown in the text.
	•	Do not infer, guess, or fabricate information. Only extract what is clearly present.
	•	If a field is missing → leave as empty string "" or null as appropriate.
	•	Preserve Vietnamese diacritics.

Input:

{{text}}

Output:

Return only the JSON object, without explanation, markdown, or extra characters.