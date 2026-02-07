#!/bin/bash
# AppWrite REST API Backup Script
# Backs up template collections using the AppWrite REST API
# Produces clean JSON output

PROJECT_ID="694fe9f0002e1fe0d659"
DATABASE_ID="694ff4a4002301945ae6"
ENDPOINT="https://fra.cloud.appwrite.io/v1"
BACKUP_DIR="backups/appwrite-api"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Check for API key
if [ -z "$APPWRITE_API_KEY" ]; then
    if [ -z "$1" ]; then
        echo "❌ Error: API Key not found!"
        echo ""
        echo "Please provide your AppWrite API key in one of these ways:"
        echo "  1. Set APPWRITE_API_KEY environment variable"
        echo "  2. Pass as first argument: ./backup-appwrite-api.sh 'your-key'"
        echo ""
        echo "You can get your API key from: https://cloud.appwrite.io/console/project-$PROJECT_ID/settings"
        exit 1
    fi
    API_KEY="$1"
else
    API_KEY="$APPWRITE_API_KEY"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

echo "📦 AppWrite REST API Backup Starting..."
echo "Endpoint: $ENDPOINT"
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
    
    # Build API URL
    url="$ENDPOINT/databases/$DATABASE_ID/collections/$id/documents"
    
    echo "   Fetching from API..."
    
    # Make API request with curl
    response=$(curl -s -X GET "$url" \
        -H "X-Appwrite-Project: $PROJECT_ID" \
        -H "X-Appwrite-Key: $API_KEY" \
        -H "Content-Type: application/json")
    
    # Check if request was successful
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        # Save formatted JSON
        echo "$response" | jq '.' > "$output_file" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            file_size=$(wc -c < "$output_file")
            doc_count=$(echo "$response" | jq '.documents | length' 2>/dev/null || echo "?")
            echo "   ✅ Exported $doc_count documents to ${name}.json ($file_size bytes)"
        else
            # jq not available, save raw response
            echo "$response" > "$output_file"
            file_size=$(wc -c < "$output_file")
            echo "   ✅ Exported to ${name}.json ($file_size bytes)"
            echo "   ⚠️  Note: Install jq for formatted JSON output"
        fi
    else
        echo "   ❌ Failed to export $name"
        echo "   Error: API request failed"
    fi
    
    echo ""
done

echo "✨ Backup complete!"
echo "Location: $BACKUP_DIR/$TIMESTAMP"
echo ""
echo "📝 Backed up files:"

# List created files
ls -lh "$BACKUP_DIR/$TIMESTAMP" | tail -n +2 | awk '{print "   - " $9 " (" $5 ")"}'

echo ""
echo "🎯 Next steps:"
echo "   1. Review the JSON files to verify data integrity"
echo "   2. Use these files to import into Supabase if needed"
echo "   3. Compare with Supabase data to ensure migration completeness"
