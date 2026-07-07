// Generates a small test .xlsx for exercising the bulk import flow.
// Usage: npm run gen:test-xlsx
// Produces scripts/test-import.xlsx with 3 rows: 2 valid-shaped, 1 with a
// deliberately bad category_slug to exercise the error-highlighting UI.
const path = require('path');
const ExcelJS = require('exceljs');

const COLUMNS = [
  'title', 'category_slug', 'brand', 'model', 'year_manufactured', 'condition',
  'description', 'price_amount', 'currency', 'origin_country', 'new_price_estimate',
  'quantity', 'seller_email',
];

async function main() {
  const sellerEmail = process.argv[2] || 'seller@example.com';
  const categorySlug = process.argv[3] || 'cameras';

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Listings');
  sheet.addRow(COLUMNS);

  sheet.addRow([
    'Sony PXW-Z750 Camcorder', categorySlug, 'Sony', 'PXW-Z750', 2021, 'excellent',
    'Broadcast camcorder in excellent condition, lightly used.', 8500, 'USD', 'Japan', 12000, 2, sellerEmail,
  ]);

  sheet.addRow([
    'Blackmagic ATEM Mini Pro', categorySlug, 'Blackmagic Design', 'ATEM Mini Pro', 2022, 'good',
    'Compact live production switcher.', 650, 'USD', 'Australia', 900, 5, sellerEmail,
  ]);

  // Intentionally invalid row: bad category_slug
  sheet.addRow([
    'Broken Row Test Item', 'this-slug-does-not-exist', 'Canon', 'XF605', 2020, 'fair',
    'This row should error out due to an invalid category_slug.', 1200, 'USD', 'USA', 1800, 1, sellerEmail,
  ]);

  const outPath = path.join(__dirname, 'test-import.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Wrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
