#!/bin/bash
# AppWrite Template Data Backup Script
# Backs up non-user-specific template tables from AppWrite
# These tables are used as templates or reference data

PROJECT_ID="694fe9f0002e1fe0d659"
DATABASE_ID="694ff4a4002301945ae6"
BACKUP_DIR="backups/appwrite-templates"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Create backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

echo "📦 AppWrite Template Backup Starting..."
echo "Backup directory: $BACKUP_DIR/$TIMESTAMP"
echo ""

# Template collections to backup
declare -A COLLECTIONS=(
    ["SupportDirectory"]="supportdirectory|Support resources (shelters, legal, medical, etc.)"
    ["MasterSecurityTasks"]="mastersecuritytasks|Security audit checklist templates"
    ["PredefinedPlans"]="predefinedplans|Safety plan templates"
    ["PredefinedSteps"]="predefinedsteps|Steps for each safety plan template"
)

for name in "${!COLLECTIONS[@]}"; do
    IFS='|' read -r id description <<< "${COLLECTIONS[$name]}"
    
    echo "⬇️  Exporting: $name"
    echo "   $description"
    
    output_file="$BACKUP_DIR/$TIMESTAMP/${name}.json"
    
    # Export collection data using AppWrite CLI
    appwrite databases list-documents \
        --database-id "$DATABASE_ID" \
        --collection-id "$id" \
        --output json > "$output_file"
    
    if [ $? -eq 0 ]; then
        file_size=$(wc -c < "$output_file")
        echo "   ✅ Exported to ${name}.json ($file_size bytes)"
    else
        echo "   ❌ Failed to export $name"
    fi
    
    echo ""
done

echo "✨ Backup complete!"
echo "Location: $BACKUP_DIR/$TIMESTAMP"
echo ""
echo "📝 Next steps:"
echo "   1. Review the backup files"
echo "   2. Import to Supabase using migration scripts"
echo "   3. Verify data integrity"
