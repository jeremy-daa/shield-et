# AppWrite Template Data Backup Script
# Backs up non-user-specific template tables from AppWrite
# These tables are used as templates or reference data

$PROJECT_ID = "694fe9f0002e1fe0d659"
$DATABASE_ID = "694ff4a4002301945ae6"
$BACKUP_DIR = "backups/appwrite-templates"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"

# Create backup directory
New-Item -ItemType Directory -Force -Path "$BACKUP_DIR/$TIMESTAMP" | Out-Null

Write-Host "📦 AppWrite Template Backup Starting..." -ForegroundColor Cyan
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

foreach ($collection in $COLLECTIONS) {
    Write-Host "⬇️  Exporting: $($collection.Name)" -ForegroundColor Yellow
    Write-Host "   $($collection.Description)" -ForegroundColor Gray
    
    $outputFile = "$BACKUP_DIR/$TIMESTAMP/$($collection.Name).json"
    
    
    
    try {
        # Export collection data using AppWrite CLI
        Write-Host "   Exporting..." -ForegroundColor DarkGray
        
        # Run command directly to file
        & appwrite databases list-documents --database-id $DATABASE_ID --collection-id $collection.Id 2>&1 | Out-File -FilePath $outputFile -Encoding UTF8
        
        $fileSize = (Get-Item $outputFile).Length
        
        if ($fileSize -gt 100) {
            Write-Host "   ✅ Exported to $($collection.Name).json ($fileSize bytes)" -ForegroundColor Green
        } else {
            # Show what was written
            $content = Get-Content $outputFile -Raw
            Write-Host "   ❌ Export may have failed - only $fileSize bytes" -ForegroundColor Red
            Write-Host "   Content: $content" -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "✨ Backup complete!" -ForegroundColor Green
Write-Host "Location: $BACKUP_DIR/$TIMESTAMP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review the backup files"
Write-Host "   2. Import to Supabase using migration scripts"
Write-Host "   3. Verify data integrity"
