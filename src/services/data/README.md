## Data Service

> Accepts a bank statement or transaction export and returns a normalized ledger object.

### Endpoint

```
POST /data
```

### Request formats

#### Multipart file upload

Send a CSV file as `multipart/form-data`. The middleware in [app.ts](../../app.ts) extracts the file and injects `dataType: "File"` automatically.

| Field          | Type   | Description                          |
| -------------- | ------ | ------------------------------------ |
| `file`         | File   | CSV export from the data provider    |
| `dataProvider` | string | Provider name (see supported list)   |

#### JSON body

```json
{
  "dataProvider": "CapitalOne",
  "dataType": "JSON",
  "data": { }
}
```

> **Note:** JSON conversion is not yet implemented — `convertFromJSON` throws `"Not Implemented"`.

### Supported providers

| Provider     | File (CSV) | JSON |
| ------------ | :--------: | :--: |
| `CapitalOne` | ✓          | ✗    |

### Response

```ts
{
  isSuccess: boolean,
  convertedLedger: {
    earnings: EarningInput[],  // Credit transactions
    expenses: ExpenseInput[]   // Debit transactions
  }
}
```

`EarningInput` and `ExpenseInput` omit `id`, `created_at`, and `user_id` from the full Supabase row types — those are assigned on insert.

```ts
type ExpenseInput = {
  name: string
  amount: number
  date: string          // YYYY-MM-DD
  category: string | null
  sub_category: string | null
}

type EarningInput = ExpenseInput & {
  category: string      // defaults to "Income" for CapitalOne credits
}
```

### Error responses

| Scenario                            | HTTP status | Detail                          |
| ----------------------------------- | :---------: | ------------------------------- |
| Missing / invalid `dataProvider`    | 400         | Zod validation message          |
| Missing / invalid `dataType`        | 400         | Zod validation message          |
| Unsupported provider in converter   | 400         | Converter error message         |

### CapitalOne CSV format

The converter expects the following columns (standard 360 export):

| Column                    | Used as        |
| ------------------------- | -------------- |
| `Transaction Date`        | `date` (MM/DD/YY → YYYY-MM-DD) |
| `Transaction Description` | `name`         |
| `Transaction Amount`      | `amount`       |
| `Transaction Type`        | `Debit` → expense, `Credit` → earning |

Rows missing any of these three fields are skipped with an error appended to the errors object found in the response.

---

### Running the service

**Prerequisites:** Node >= 24.5

```sh
# Install dependencies
npm install

# Development — restarts on file changes
npm run dev

# Production
npm run compile
npm start
```

The server listens on `http://localhost:3030` by default. Override with `PORT` / `HOST` environment variables or by editing [config/default.json](../../../config/default.json).

---

### Calling from code

#### Fetch — file upload

```ts
async function uploadStatement(file: File, dataProvider = 'CapitalOne') {
  const form = new FormData()
  form.append('dataProvider', dataProvider)
  form.append('file', file)

  const res = await fetch('http://localhost:3030/data', {
    method: 'POST',
    body: form
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json() // { isSuccess, convertedLedger, errors }
}
```

### Testing

#### PowerShell (Windows)

```powershell
$filePath = "C:\Users\chris\Downloads\2026-04-10_360PerformanceSavings...5040.csv"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName  = [System.IO.Path]::GetFileName($filePath)

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"dataProvider`"$LF",
    "CapitalOne",
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
    "Content-Type: text/csv$LF",
    [System.Text.Encoding]::UTF8.GetString($fileBytes),
    "--$boundary--$LF"
) -join $LF

Invoke-RestMethod -Method POST -Uri "http://localhost:3030/data" `
  -ContentType "multipart/form-data; boundary=$boundary" `
  -Body $bodyLines
```

#### curl

```sh
curl -X POST http://localhost:3030/data \
  -F "dataProvider=CapitalOne" \
  -F "file=@/path/to/export.csv"
```
