# Generate Supabase Migration from AppWrite Backup
# Reads JSON backup files and creates SQL INSERT statements

param(
    [string]$BackupDir = "backups/appwrite-api/20260207-050419",
    [string]$OutputFile = "supabase/migrations/20260207000003_import_appwrite_templates.sql"
)

Write-Host "📝 Generating Supabase Migration from AppWrite Backup..." -ForegroundColor Cyan
Write-Host "Reading from: $BackupDir" -ForegroundColor Gray
Write-Host ""

# Helper function to escape SQL strings
function Escape-SqlString {
    param([string]$str)
    if ($null -eq $str) { return "NULL" }
    return "'" + $str.Replace("'", "''") + "'"
}

# Helper function to format boolean
function Format-SqlBoolean {
    param($value)
    if ($value -eq $true) { return "true" }
    if ($value -eq $false) { return "false" }
    return "NULL"
}

# Helper function to format number
function Format-SqlNumber {
    param($value)
    if ($null -eq $value) { return "NULL" }
    return $value.ToString()
}

# Start building SQL
$sql = @"
-- Migration: Import AppWrite Template Data
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Source: AppWrite Backup

-- Disable triggers during import
SET session_replication_role = replica;

"@

# Process Support Directory
Write-Host "📋 Processing SupportDirectory..." -ForegroundColor Yellow
$supportData = Get-Content "$BackupDir/SupportDirectory.json" -Raw | ConvertFrom-Json

$sql += @"

-- ============================================================================
-- Support Directory (10 organizations)
-- ============================================================================

TRUNCATE TABLE support_directory CASCADE;

INSERT INTO support_directory (name, category, phone, location, address, description_am, description_en, description_or, verified, lat, lng)
VALUES

"@

$supportValues = @()
foreach ($doc in $supportData.documents) {
    $values = @(
        (Escape-SqlString $doc.name),
        (Escape-SqlString $doc.category),
        (Escape-SqlString $doc.phone),
        (Escape-SqlString $doc.location),
        (Escape-SqlString $doc.address),
        (Escape-SqlString $doc.description_am),
        (Escape-SqlString $doc.description_en),
        (Escape-SqlString $doc.description_or),
        (Format-SqlBoolean $doc.verified),
        (Format-SqlNumber $doc.lat),
        (Format-SqlNumber $doc.lng)
    )
    $supportValues += "  (" + ($values -join ", ") + ")"
}
$sql += $supportValues -join ",`n"
$sql += ";`n"

Write-Host "   ✅ $($supportData.documents.Count) support organizations" -ForegroundColor Green

# Process Master Security Tasks
Write-Host "📋 Processing MasterSecurityTasks..." -ForegroundColor Yellow
$securityData = Get-Content "$BackupDir/MasterSecurityTasks.json" -Raw | ConvertFrom-Json

$sql += @"

-- ============================================================================
-- Master Security Tasks (5 templates)
-- ============================================================================

TRUNCATE TABLE master_security_tasks CASCADE;

INSERT INTO master_security_tasks (task_name_en, task_name_am, task_name_or, risk_level, platform, instructions)
VALUES

"@

$securityValues = @()
foreach ($doc in $securityData.documents) {
    $values = @(
        (Escape-SqlString $doc.taskName_en),
        (Escape-SqlString $doc.taskName_am),
        (Escape-SqlString $doc.taskName_or),
        (Escape-SqlString $doc.riskLevel),
        (Escape-SqlString $doc.platform),
        (Escape-SqlString $doc.instr_en)
    )
    $securityValues += "  (" + ($values -join ", ") + ")"
}
$sql += $securityValues -join ",`n"
$sql += ";`n"

Write-Host "   ✅ $($securityData.documents.Count) security tasks" -ForegroundColor Green

# Process Predefined Plans
Write-Host "📋 Processing PredefinedPlans..." -ForegroundColor Yellow
$plansData = Get-Content "$BackupDir/PredefinedPlans.json" -Raw | ConvertFrom-Json

$sql += @"

-- ============================================================================
-- Predefined Safety Plans (5 templates)
-- ============================================================================

TRUNCATE TABLE predefined_plans CASCADE;

INSERT INTO predefined_plans (title_en, description_en, category, difficulty, duration, icon)
VALUES

"@

$plansValues = @()
foreach ($doc in $plansData.documents) {
    $values = @(
        (Escape-SqlString $doc.title_en),
        (Escape-SqlString $doc.description_en),
        (Escape-SqlString $doc.category),
        (Escape-SqlString $doc.difficulty),
        (Escape-SqlString $doc.duration),
        (Escape-SqlString $doc.icon)
    )
    $plansValues += "  (" + ($values -join ", ") + ")"
}
$sql += $plansValues -join ",`n"
$sql += ";`n"

Write-Host "   ✅ $($plansData.documents.Count) safety plans" -ForegroundColor Green

# Process Predefined Steps
Write-Host "📋 Processing PredefinedSteps..." -ForegroundColor Yellow
$stepsData = Get-Content "$BackupDir/PredefinedSteps.json" -Raw | ConvertFrom-Json

$sql += @"

-- ============================================================================
-- Predefined Safety Steps (16 steps)
-- ============================================================================

TRUNCATE TABLE predefined_steps CASCADE;

INSERT INTO predefined_steps (plan_id, label_en, label_am, label_or, priority, module)
VALUES

"@

$stepsValues = @()
foreach ($doc in $stepsData.documents) {
    $values = @(
        (Escape-SqlString $doc.planId),
        (Escape-SqlString $doc.label_en),
        (Escape-SqlString $doc.label_am),
        (Escape-SqlString $doc.label_or),
        (Format-SqlNumber $doc.priority),
        (Escape-SqlString $doc.module)
    )
    $stepsValues += "  (" + ($values -join ", ") + ")"
}
$sql += $stepsValues -join ",`n"
$sql += ";`n"

Write-Host "   ✅ $($stepsData.documents.Count) safety steps" -ForegroundColor Green

# Re-enable triggers
$sql += @"

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Refresh sequences
SELECT setval('support_directory_id_seq', (SELECT MAX(id) FROM support_directory));
SELECT setval('master_security_tasks_id_seq', (SELECT MAX(id) FROM master_security_tasks));
SELECT setval('predefined_plans_id_seq', (SELECT MAX(id) FROM predefined_plans));
SELECT setval('predefined_steps_id_seq', (SELECT MAX(id) FROM predefined_steps));
"@

# Save to file
$sql | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host ""
Write-Host "✨ Migration file created!" -ForegroundColor Green
Write-Host "Location: $OutputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   - $($supportData.documents.Count) Support Organizations" -ForegroundColor Gray
Write-Host "   - $($securityData.documents.Count) Security Task Templates" -ForegroundColor Gray
Write-Host "   - $($plansData.documents.Count) Safety Plan Templates" -ForegroundColor Gray
Write-Host "   - $($stepsData.documents.Count) Safety Step Templates" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review the SQL file: $OutputFile"
Write-Host "   2. Run: npx supabase db reset --linked" -ForegroundColor Cyan
Write-Host "   3. Verify data was imported correctly"
