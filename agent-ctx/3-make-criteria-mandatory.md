# Task 3: Make ALL Evaluation Criteria Mandatory

## Summary
Removed the special category logic that made "Viabilidad del Negocio" criterion optional for "Emprendimiento Escolar" and "Poster de Emprendimiento" categories. All evaluation criteria are now mandatory regardless of category.

## Files Modified

### 1. src/components/evaluations/evaluation-detail.tsx
- Removed `isSpecialCategory()` function
- Removed `isOptional` prop from CriterionCard component
- Removed "No obligatorio" badge and opacity-60 class
- Removed `isOptionalCriteria` prop from SummaryPanel component
- Removed opacity-50 conditional class on optional criteria breakdown
- Simplified maxPossible and calculatedTotal to include all criteria
- Updated submit validation to check ALL criteria (not just non-optional)

### 2. src/app/api/evaluations/[id]/route.ts
- Removed project category lookup in PUT handler
- Removed isSpecialCategory check
- Simplified totalScore to sum all scores without exclusion

### 3. src/app/api/evaluations/[id]/submit/route.ts
- Removed isSpecialCategory check
- Added server-side validation: all criteria must have score > 0
- Returns 400 with unscored criteria names on validation failure
- Simplified totalScore to sum all scores without exclusion

## Result
- Total score is always out of 100 (sum of all criteria weights)
- All criteria are mandatory - no exceptions for any category
- Lint passes with zero errors
