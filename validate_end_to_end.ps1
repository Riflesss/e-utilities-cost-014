$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -ContentType 'application/json' -WebSession $session -Body '{"username":"admin","password":"admin1234"}'
$token = $login.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Output '--- login ---'
$login.user | ConvertTo-Json -Compress

$expenseCatsBefore = Invoke-RestMethod -Uri 'http://localhost:3000/api/expense-categories' -Headers $headers -WebSession $session
Write-Output '--- expense categories count ---'
$expenseCatsBefore.Count

$budgetCatsBefore = Invoke-RestMethod -Uri 'http://localhost:3000/api/budget-categories' -Headers $headers -WebSession $session
Write-Output '--- budget categories count ---'
$budgetCatsBefore.Count

$ec = Invoke-RestMethod -Uri 'http://localhost:3000/api/expense-categories' -Method Post -Headers $headers -WebSession $session -ContentType 'application/json' -Body '{"name":"ค่าทดสอบ","code":"TEST","unit":"บาท"}'
$bc = Invoke-RestMethod -Uri 'http://localhost:3000/api/budget-categories' -Method Post -Headers $headers -WebSession $session -ContentType 'application/json' -Body '{"name":"งบทดสอบ","code":"BUDGET_TEST"}'
Write-Output '--- created ids ---'
$ec.id, $bc.id

$exp = Invoke-RestMethod -Uri 'http://localhost:3000/api/expenses' -Method Post -Headers $headers -WebSession $session -ContentType 'application/json' -Body (@{
    expense_category_id = $ec.id
    budget_category_id = $bc.id
    amount = 1234.56
    billing_month = '2026-08-01'
    paid_date = '2026-08-05'
    invoice_no = 'INV-TEST-001'
    note = 'ทดสอบ CRUD'
    attachment_path = ''
} | ConvertTo-Json)
Write-Output '--- created expense ---'
$exp | ConvertTo-Json -Compress

$expenses = Invoke-RestMethod -Uri 'http://localhost:3000/api/expenses?year=2026&limit=10' -Headers $headers -WebSession $session
Write-Output '--- expenses count ---'
$expenses.data.Count

$updated = Invoke-RestMethod -Uri "http://localhost:3000/api/expenses/$($exp.id)" -Method Put -Headers $headers -WebSession $session -ContentType 'application/json' -Body (@{
    expense_category_id = $ec.id
    budget_category_id = $bc.id
    amount = 2000.00
    billing_month = '2026-08-01'
    paid_date = '2026-08-06'
    invoice_no = 'INV-TEST-002'
    note = 'อัปเดตทดสอบ'
    attachment_path = ''
} | ConvertTo-Json)
Write-Output '--- updated expense amount ---'
$updated.amount

$summary = Invoke-RestMethod -Uri 'http://localhost:3000/api/dashboard/summary?year=2026' -Headers $headers -WebSession $session
$byCat = Invoke-RestMethod -Uri 'http://localhost:3000/api/dashboard/by-category?year=2026' -Headers $headers -WebSession $session
$byBudget = Invoke-RestMethod -Uri 'http://localhost:3000/api/dashboard/by-budget?year=2026' -Headers $headers -WebSession $session
$compare = Invoke-RestMethod -Uri 'http://localhost:3000/api/dashboard/compare?year1=2025&year2=2026' -Headers $headers -WebSession $session
Write-Output '--- dashboard summary keys ---'
$summary | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
Write-Output '--- byCategory records ---'
$byCat.Count
Write-Output '--- byBudget records ---'
$byBudget.Count
Write-Output '--- compare years ---'
$compare.year1.year, $compare.year2.year

$deleteExpense = Invoke-RestMethod -Uri "http://localhost:3000/api/expenses/$($exp.id)" -Method Delete -Headers $headers -WebSession $session
$deleteEC = Invoke-RestMethod -Uri "http://localhost:3000/api/expense-categories/$($ec.id)" -Method Delete -Headers $headers -WebSession $session
$deleteBC = Invoke-RestMethod -Uri "http://localhost:3000/api/budget-categories/$($bc.id)" -Method Delete -Headers $headers -WebSession $session
Write-Output '--- delete statuses ---'
$deleteExpense.message, $deleteEC.message, $deleteBC.message

Invoke-WebRequest -Uri 'http://localhost:8080' | Out-Null
Write-Output '--- frontend check --- OK'
