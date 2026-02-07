Shield-ET Appwrite Database Schema (2025/2026)
Database ID: shield_db Security Standard: Document-level security is ENABLED for all User-Specific collections. Formatting Rule: Property names in code must NOT use string quotes.

1. SafetyPlans (User Settings)
One document per user. Anchors the identity to the vault. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | userId | String | 36 | Yes | - | | vault_pin | String | 128 | Yes | - | | codeWord | String | 100 | No | - | | trustedContact | String | 20 | No | - | | activeTemplateId | String | 36 | No | - | | safeRoomDesc | String | 500 | No | - | | isPlanActive | Boolean | - | Yes | false | | lastUpdated | Datetime | - | No | - | Index: idx_user (Key: userId) unique, idx_template (Key: activeTemplateId)


2. EmergencyBag (Physical Checklist)
Multiple documents per user. Tracks physical readiness. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | userId | String | 36 | Yes | - | | itemName | String | 100 | Yes | - | | isPacked | Boolean | - | Yes | false | | isEssential | Boolean | - | Yes | true | | category | Enum | docs, cash, personal, kids, medical | No | personal | | sortOrder | Integer | - | No | 0 | Index: idx_user_items (Key: userId, isPacked)

3. SafetySteps (User Action Log)
Multiple documents per user. Private instances of expert steps. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | userId | String | 36 | Yes | - | | templateStepId | String | 36 | No | - | | label_en | String | 255 | Yes | - | | label_am | String | 255 | No | - | | label_or | String | 255 | No | - | | status | Enum | todo, done | Yes | todo | | priority | Integer | - | No | 0 | | module | Enum | exit, digital, legal, kids | No | exit | Index: idx_user_roadmap (Key: userId, priority ASC)

4. SecurityAudit (Digital Hygiene)
Multiple documents per user. Hardens device privacy. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | userId | String | 36 | Yes | - | | taskName_en | String | 255 | Yes | - | | taskName_am | String | 255 | No | - | | taskName_or | String | 255 | No | - | | isCompleted | Boolean | - | Yes | false | | riskLevel | Enum | low, medium, high | Yes | medium | | platform | Enum | phone, social, banking, email | No | phone | | instructions | String | 500 | No | - | Index: idx_security_priority (Key: userId, riskLevel, isCompleted)

5. PredefinedPlans (Global Templates)
Public Read-Only. Admin-managed expert roadmaps. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | title_en | String | 100 | Yes | - | | title_am | String | 100 | No | - | | title_or | String | 100 | No | - | | category | Enum | urgent, stealth, stay, kids | Yes | urgent | | difficulty | Enum | easy, moderate, hard | No | moderate | | duration | String | 50 | No | - | | description_en | String | 500 | No | - | | icon | String | 50 | No | shield | Index: idx_plan_category (Key: category)

6. PredefinedSteps (Expert Instructions)
Public Read-Only. Master library of all possible safety steps. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | planId | String | 36 | Yes | - | | label_en | String | 255 | Yes | - | | label_am | String | 255 | No | - | | label_or | String | 255 | No | - | | priority | Integer | - | Yes | 0 | | module | Enum | exit, digital, legal, kids | No | exit | | isEssential | Boolean | - | No | true | Index: idx_steps_by_plan (Key: planId, priority ASC)

7. MasterSecurityTasks (Global Blueprint)
Public Read-Only. Master library of all technical digital audit checks. | Attribute | Type | Size | Required | Default | | :--- | :--- | :--- | :--- | :--- | | taskName_en | String | 255 | Yes | - | | taskName_am | String | 255 | No | - | | taskName_or | String | 255 | No | - | | riskLevel | Enum | low, medium, high | Yes | medium | | platform | Enum | phone, social, banking, email | No | phone | | instructions | String | 500 | No | - | Index: idx_security_priority (Key: userId, riskLevel, isCompleted)

<!-- 7. MasterSecurityTasks (Global Blueprint)Public Read-Only. Master library of all technical digital audit checks.AttributeTypeSizeRequiredDefaulttaskName_enString255Yes-taskName_amString255No-taskName_orString255No-riskLevelEnumlow, medium, highYesmediumplatformEnumphone, social, banking, emailNophoneinstr_enString500Yes-instr_amString500No-instr_orString500No-priorityInteger-Yes0 -->