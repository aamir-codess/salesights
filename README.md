# Sales Snap

Build a mobile-friendly web app called "SalesInsight" that lets small business owners upload a sales CSV file and instantly see visual charts and summaries.



Pages:

1. Upload: a simple page to upload a CSV file. Show a short example of the expected format (columns: Date, Product, Amount).

2. Dashboard: after upload, show:

   - Summary cards: Total Revenue, Number of Sales, Average Sale Value

   - A line or bar chart of Revenue by Month

   - A bar chart of Top 5 Selling Products (by total revenue)

   - A list of the 5 lowest-selling products

3. If the uploaded file is missing required columns, has invalid data, or isn't a valid CSV, show a clear error message explaining what's wrong — don't crash or show a blank page.



Design: clean, simple, mobile-friendly, large readable charts, Rs. currency formatting.

Process the uploaded data only for generating the dashboard — do not permanently store the uploaded file.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://salesights.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2ee59803-c469-4264-99d9-0aa9cfec5ad8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
