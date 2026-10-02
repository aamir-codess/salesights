# Salesights — Testing & Findings Report

**Project:** CSV sales dashboard for small businesses — upload a sales file, see instant revenue insights
**Live app:** https://salesights.lovable.app
**Tested by:** Aamir
**Method:** Manual functional testing with both clean and intentionally broken data, built with AI-assisted development (Lovable)

---

## Summary

This app was built using AI-assisted development, then manually tested with a known, hand-calculated dataset to verify accuracy, followed by a deliberately broken dataset to test error handling. Two real issues were found and fixed; the core calculations and crash-handling were confirmed correct on the first pass.

---

## 1. Calculation accuracy (clean data)

- **Found by:** Uploading a 35-row test CSV spanning 10 products and 3 months, with all totals pre-calculated by hand beforehand.
- **Result:** Total Revenue, Number of Sales, Average Sale Value, monthly revenue breakdown, and the Top 5 / Lowest 5 product rankings all matched the hand-calculated expected values exactly.
- **Status:** No fix needed. Confirmed working as expected.

## 2. Invalid rows silently dropped with no notice

- **Found by:** Uploading a CSV containing a blank amount, a negative amount, a non-numeric amount, and a missing date.
- **Issue:** All four invalid rows were correctly excluded from the totals (not counted as zero-value sales, confirmed by checking that "Number of Sales" only counted valid rows) — but the app gave no indication that any rows had been skipped. A real user uploading their own sales file would have no way of knowing part of their data was ignored.
- **Fix:** Added a summary message shown after upload: "X rows were skipped due to invalid or missing data."
- **Verified:** Re-uploaded the same broken file — the skipped-rows message now appears correctly.

## 3. Extreme outlier value broke chart readability

- **Found by:** Including one unrealistically large sale (Rs. 99,999,999) alongside normal-range values in the same test file.
- **Issue:** The Top Selling Products chart scaled to fit the one huge value, making all other products' bars flatten to nearly invisible.
- **Fix:** Adjusted chart scaling so smaller values remain visibly readable even alongside a dominant outlier.
- **Verified:** Re-uploaded the same file — all products' bars are now visible and distinguishable.

## 4. Empty file upload (headers only, no data rows)

- **Found by:** Uploading a CSV containing only the header row, no actual sales data.
- **Issue:** None — tested to confirm the app handles this case gracefully.
- **Result:** A clear "No data" message is shown instead of a blank page, crash, or confusing zero values.
- **Status:** No fix needed. Confirmed working as expected.

---

## Testing approach notes

- A hand-calculated dataset was used first to validate accuracy before testing failure cases, so correct totals could be confirmed independently of the app's own math.
- Edge cases tested: blank values, negative values, non-numeric values, missing dates, duplicate rows, decimal amounts, extreme outliers, and empty uploads.
- No real business sales data was used at any stage — all test data was fabricated.
