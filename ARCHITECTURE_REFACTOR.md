# Problem & Sheet Architecture Refactoring

## Summary of Changes

The problem and sheet management system has been refactored to **eliminate redundancy** by implementing a proper **many-to-many relationship** between problems and sheets.

### Previous Architecture (Redundant)
- Each problem had a `sheetId` field
- Same problem in multiple sheets = **multiple duplicate documents**
- Updating a problem in one sheet didn't update it in others
- Wasteful database storage

### New Architecture (Non-Redundant)
- Problems exist **independently** without sheet references
- **SheetProblem junction table** manages the many-to-many relationship
- Same problem can belong to **multiple sheets** without duplication
- Single source of truth for each problem

---

## Files Modified

### Models
1. **`server/models/problem.model.js`**
   - Removed `sheetId` and `order` fields
   - Added `unique: true` to `title` field
   - Problems now exist independently

2. **`server/models/sheetProblem.model.js`** ✨ NEW
   - Junction table for many-to-many relationship
   - Fields: `sheetId`, `problemId`, `order`
   - Unique compound index on `(sheetId, problemId)`

### Controllers
3. **`server/controllers/problem.controller.js`**
   - `createProblem()` - Creates independent problems
   - `addProblemToSheet()` - Adds existing problem to a sheet
   - `removeProblemFromSheet()` - Removes from sheet (doesn't delete problem)
   - `deleteProblem()` - Deletes problem from all sheets
   - `markProblemComplete()` - Now requires both `problemId` and `sheetId`

4. **`server/controllers/problemSheet.controller.js`**
   - Updated `deleteProblemSheet()` - Deletes SheetProblem relations
   - Updated `getSheetProblems()` - Uses aggregation with SheetProblem junction
   - Updated `getSheetMetrics()` - Works with new architecture

### Middleware
5. **`server/middleware/validateProblem.js`**
   - Removed `order` validation (now in SheetProblem)

### Scripts
6. **`server/scripts/seedBlind75.js`** ✨ NEW
   - Complete Blind 75 problem set (all 75 problems)
   - Creates problems independently
   - Links them to sheet via SheetProblem
   
7. **`server/scripts/migrateProblemArchitecture.js`** ✨ NEW
   - Migrates existing data from old to new architecture
   - Includes rollback functionality

---

## How to Use

### 1. Migrate Existing Data (One-Time)

```bash
cd server
node scripts/migrateProblemArchitecture.js
```

This will:
- Find all problems with `sheetId`
- Create SheetProblem relationships
- Remove `sheetId` and `order` from problems

**Rollback (if needed):**
```bash
node scripts/migrateProblemArchitecture.js --rollback
```

### 2. Seed Blind 75 Problems

```bash
cd server
node scripts/seedBlind75.js
```

This creates all 75 Blind 75 problems and the sheet.

**Clear Blind 75:**
```bash
node scripts/seedBlind75.js -d
```

---

## API Changes

### Creating Problems

**Old Way:**
```javascript
POST /api/sheets/:sheetId/problems
Body: { title, difficulty, platform, platformLink, order, ... }
```

**New Way:**
```javascript
// Step 1: Create problem independently
POST /api/problems
Body: { title, difficulty, platform, platformLink, ... }

// Step 2: Add to sheet(s)
POST /api/sheets/:sheetId/problems/:problemId
Body: { order: 1 } // optional
```

### Marking Complete

**Old Way:**
```javascript
PUT /api/problems/:problemId/complete
```

**New Way:**
```javascript
PUT /api/sheets/:sheetId/problems/:problemId/complete
Body: { completed: true }
```

### Removing from Sheet

```javascript
// New endpoint - removes problem from sheet WITHOUT deleting it
DELETE /api/sheets/:sheetId/problems/:problemId
```

---

## Benefits

✅ **No Duplication** - Each problem stored once  
✅ **Consistency** - Updates propagate to all sheets  
✅ **Flexibility** - Easy to add/remove problems from sheets  
✅ **Better Data Integrity** - Single source of truth  
✅ **Storage Efficiency** - Reduced database size  
✅ **Maintainability** - Easier to manage problems  

---

## Database Schema

### Problems Collection
```javascript
{
  _id: ObjectId,
  title: String (unique),
  description: String,
  difficulty: 'easy' | 'medium' | 'hard',
  platform: String,
  platformLink: String,
  tags: [String],
  hints: [{hintNumber, content}],
  solution: {content: {python, javascript, ...}, explanation},
  createdAt: Date,
  updatedAt: Date
}
```

### SheetProblems Collection (Junction)
```javascript
{
  _id: ObjectId,
  sheetId: ObjectId (ref: ProblemSheet),
  problemId: ObjectId (ref: Problem),
  order: Number,
  notes: String, // Optional sheet-specific notes
  createdAt: Date,
  updatedAt: Date
}
```

### ProblemSheets Collection
```javascript
{
  _id: ObjectId,
  name: String (unique),
  slug: String,
  description: String,
  icon: String,
  totalProblems: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Blind 75 Problem List

The seed script includes all 75 problems categorized as:
- **Array** (10 problems)
- **Binary** (5 problems)
- **Dynamic Programming** (11 problems)
- **Graph** (8 problems)
- **Interval** (6 problems)
- **Linked List** (6 problems)
- **Matrix** (4 problems)
- **String** (9 problems)
- **Tree** (13 problems)
- **Heap** (2 problems)

All problems include:
- Title, difficulty, platform, platform link
- Tags for categorization
- Detailed description

---

## Next Steps

1. **Run Migration** - Convert existing data
2. **Seed Blind 75** - Import the complete problem set
3. **Update Frontend** - Adjust API calls if needed
4. **Test Thoroughly** - Verify all CRUD operations work

For questions or issues, refer to the migration and seed scripts.
