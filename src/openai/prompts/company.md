Your task is to analyze company information from the provided text and extract it into a structured JSON format.

Parse the input text carefully and return company information with the following JSON structure:
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
```

Important guidelines:
1. Extract the company name exactly as written in the source (preserve capitalization)
2. Extract all information strictly from the original text, do not add or infer information
3. Format the registration date as "DD/MM/YYYY"
4. For business lines, mark "isPrimary": true for any line that's identified as the primary business
5. Identify business lines by looking for the list of activities under "Ngành nghề kinh doanh", with Mã (code) and Tên (name)
6. When you find text like "Ngành chính" after a business line, mark it as primary
7. The tax code ("Mã số thuế") should be extracted exactly as shown, preserving all digits, fill value to the field "code"
8. Company id is int value calculated from "Mã số thuế"
9. The status should be taken from "Tình trạng hoạt động". If the status contains "Đang hoạt động", mark it as "Đang hoạt động". If the status contains "tạm ngừng hoạt động từ ngày DD/MM/yyyy", mark it as "Không hoạt động" and terminatedAt with the termination date with format "DD/MM/yyyy"
10. The legal representative should be extracted from "Đại diện pháp luật" hoặc "Giám đốc"

Return only the JSON object without any additional text, explanation, or code blocks.

Input text:

{{text}}
