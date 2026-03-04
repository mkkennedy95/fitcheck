# Manual Database Changes

This file documents database schema changes made directly in Supabase SQL Editor.
These changes should be preserved if the database needs to be rebuilt.

---

## 2026-03-04: Add 'pieces' category to clothing_items

**Purpose:** Enable support for multi-piece outfits (e.g., matching sets, two-piece suits)

**SQL executed in Supabase:**
```sql
-- Remove existing constraint
ALTER TABLE clothing_items
  DROP CONSTRAINT IF EXISTS clothing_items_category_check;

-- Add new constraint including 'pieces' category
ALTER TABLE clothing_items
  ADD CONSTRAINT clothing_items_category_check
  CHECK (category IN ('tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'pieces'));
```

**Impact:** Allows clothing items to be categorized as 'pieces' for items that don't fit standard categories or are part of a matching set.

---

## 2026-03-04: Add fit_rating column to clothing_items

**Purpose:** Track how well each clothing item fits the user for better outfit recommendations

**SQL executed in Supabase:**
```sql
-- Add fit_rating column with default value
ALTER TABLE clothing_items
  ADD COLUMN fit_rating INTEGER DEFAULT 3 CHECK (fit_rating >= 1 AND fit_rating <= 5);
```

**Details:**
- Column type: INTEGER
- Default value: 3 (neutral fit)
- Constraint: Must be between 1 and 5
- 1 = Too small
- 2 = Slightly small
- 3 = Perfect fit
- 4 = Slightly large
- 5 = Too large

**Impact:** Enables users to rate how clothing items fit, which can be used to filter or prioritize better-fitting items in outfit generation.

---

## Future Changes

Add new entries above this line with the date and description of changes.
