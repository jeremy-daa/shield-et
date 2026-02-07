# AppWrite REST API Backup Script
# Backs up template collections using the AppWrite REST API
# Produces clean JSON output

$PROJECT_ID = "694fe9f0002e1fe0d659"
$DATABASE_ID = "694ff4a4002301945ae6"
$ENDPOINT = "https://fra.cloud.appwrite.io/v1"
$BACKUP_DIR = "backups/appwrite-api"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$APPWRITE_API_KEY = "standard_1f6691b4d36cd249715f1dfcef52f735de8a4ba62e0f505d0d2d2f14fea6eadee54b173bf4893a85e672d752fda0847a98b71f91a2139638175f4e093d333630592d477533e3f4ffae89a746a1b7e03c96efab13922912a69a4dd1eb38a7c17cecca54ef69aa7352d864ebcbddbda7d1e221eeb9cbbbbbd0028f0c6de5038842"

# Create backup directory
New-Item -ItemType Directory -Force -Path "$BACKUP_DIR/$TIMESTAMP" | Out-Null

Write-Host "📦 AppWrite REST API Backup Starting..." -ForegroundColor Cyan
Write-Host "Endpoint: $ENDPOINT" -ForegroundColor Gray
Write-Host "Backup directory: $BACKUP_DIR/$TIMESTAMP" -ForegroundColor Gray
Write-Host ""

# Template collections to backup
$COLLECTIONS = @(
    @{
        Name = "SupportDirectory"
        Id = "supportdirectory"
        Description = "Support resources (shelters, legal, medical, etc.)"
    },
    @{
        Name = "MasterSecurityTasks"
        Id = "mastersecuritytasks"
        Description = "Security audit checklist templates"
    },
    @{
        Name = "PredefinedPlans"
        Id = "predefinedplans"
        Description = "Safety plan templates"
    },
    @{
        Name = "PredefinedSteps"
        Id = "predefinedsteps"
        Description = "Steps for each safety plan template"
    }
)

# Setup headers
$headers = @{
    "X-Appwrite-Project" = $PROJECT_ID
    "X-Appwrite-Key" = "standard_1f6691b4d36cd249715f1dfcef52f735de8a4ba62e0f505d0d2d2f14fea6eadee54b173bf4893a85e672d752fda0847a98b71f91a2139638175f4e093d333630592d477533e3f4ffae89a746a1b7e03c96efab13922912a69a4dd1eb38a7c17cecca54ef69aa7352d864ebcbddbda7d1e221eeb9cbbbbbd0028f0c6de5038842"
    "Content-Type" = "application/json"
}

foreach ($collection in $COLLECTIONS) {
    Write-Host "⬇️  Exporting: $($collection.Name)" -ForegroundColor Yellow
    Write-Host "   $($collection.Description)" -ForegroundColor Gray
    
    $outputFile = "$BACKUP_DIR/$TIMESTAMP/$($collection.Name).json"
    
    try {
        # Build API URL
        $url = "$ENDPOINT/databases/$DATABASE_ID/collections/$($collection.Id)/documents"
        
        Write-Host "   Fetching from API..." -ForegroundColor DarkGray
        
        # Make API request
        $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ErrorAction Stop
        
        # Save as formatted JSON
        $json = $response | ConvertTo-Json -Depth 100
        $json | Out-File -FilePath $outputFile -Encoding UTF8
        
        $fileSize = (Get-Item $outputFile).Length
        $docCount = $response.documents.Count
        
        Write-Host "   ✅ Exported $docCount documents to $($collection.Name).json ($fileSize bytes)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Failed to export $($collection.Name)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        
        # Check for common errors
        if ($_.Exception.Message -match "401" -or $_.Exception.Message -match "Unauthorized") {
            Write-Host "   💡 Hint: Check your API key permissions" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

Write-Host "✨ Backup complete!" -ForegroundColor Green
Write-Host "Location: $BACKUP_DIR/$TIMESTAMP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Backed up files:" -ForegroundColor Yellow

# List created files
Get-ChildItem "$BACKUP_DIR/$TIMESTAMP" | ForEach-Object {
    Write-Host "   - $($_.Name) ($([math]::Round($_.Length / 1KB, 2)) KB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review the JSON files to verify data integrity"
Write-Host "   2. Use these files to import into Supabase if needed"
Write-Host "   3. Compare with Supabase data to ensure migration completeness"
