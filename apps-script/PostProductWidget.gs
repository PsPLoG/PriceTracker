const CONFIG = {
  POSTS_SHEET: 'Posts',
  PRODUCTS_SHEET: 'PostProducts',
  DEFAULT_CURRENCY: 'USD',
  MAX_PRODUCTS_PER_POST: 50,
};

/**
 * 최초 1회 실행.
 * 바인드된 스프레드시트에 필요한 시트를 생성합니다.
 */
function setupPostProductWidget() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(spreadsheet, CONFIG.POSTS_SHEET, [
    'post_key',
    'title',
    'description',
    'updated_at',
  ]);
  ensureSheet_(spreadsheet, CONFIG.PRODUCTS_SHEET, [
    'post_key',
    'sort_order',
    'name',
    'url',
    'image',
    'original_price',
    'sale_price',
    'currency',
    'coupon_code',
    'badge