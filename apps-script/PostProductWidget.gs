const CONFIG = {
  POSTS_SHEET: 'Posts',
  PRODUCTS_SHEET: 'PostProducts',
  DEFAULT_CURRENCY: 'USD',
  MAX_PRODUCTS_PER_POST: 50,
};

function setupPostProductWidget() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, CONFIG.POSTS_SHEET, [
    'post_key', 'title', 'description', 'updated_at'
  ]);
  ensureSheet_(ss, CONFIG.PRODUCTS_SHEET, [
    'post_key', 'sort_order', 'name', 'url', 'image',
    'original_price', 'sale_price', 'currency',
    'coupon_code', 'badge', 'note', 'updated_at'
  ]);
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const mode = String(params.mode || 'widget').toLowerCase();
  const postKey = sanitizeKey_(params.post || params.post_key || '');

  if (mode === 'health') {
    return json_({ ok: true, service: 'post-product-widget', now: new Date().toISOString() });
  }

  if (!postKey) {
    return mode === 'json'
      ? json_({ ok: false, error: 'post parameter is required' })
      : htmlError_('게시글 키가 필요합니다. 예: ?mode=widget&post=my-post');
  }

  const data = getPostData_(postKey);
  if (!data) {
    return mode === 'json'
      ? json_({ ok: false, error: 'post not found', post_key: postKey })
      : htmlError_('등록된 게시글을 찾을 수 없습니다.');
  }

  if (mode === 'json') return json_({ ok: true, data: data });
  return HtmlService.createHtmlOutput(renderWidget_(data))
    .setTitle(data.title || '상품 리스트')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const saved = savePost_(payload);
    return json_({ ok: true, data: saved });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function savePost_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('JSON body is required');

  const postKey = sanitizeKey_(payload.post_key || payload.post || '');
  if (!postKey) throw new Error('post_key is required');

  const products = Array.isArray(payload.products) ? payload.products : [];
  if (!products.length) throw new Error('products must contain at least one item');
  if (products.length > CONFIG.MAX_PRODUCTS_PER_POST) {
    throw new Error('products can contain at most ' + CONFIG.MAX_PRODUCTS_PER_POST + ' items');
  }

  const normalizedProducts = products.map(function(product, index) {
    if (!product || typeof product !== 'object') throw new Error('invalid product at index ' + index);
    const url = normalizeUrl_(product.url);
    if (!url) throw new Error('valid product url is required at index ' + index);

    return {
      post_key: postKey,
      sort_order: Number(product.sort_order || index + 1),
      name: String(product.name || '상품 ' + (index + 1)).trim(),
      url: url,
      image: normalizeUrl_(product.image) || '',
      original_price: toNumber_(product.original_price),
      sale_price: toNumber_(product.sale_price),
      currency: String(product.currency || CONFIG.DEFAULT_CURRENCY).toUpperCase(),
      coupon_code: String(product.coupon_code || '').trim(),
      badge: String(product.badge || '').trim(),
      note: String(product.note || '').trim(),
      updated_at: new Date(),
    };
  });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupPostProductWidget();
  const postsSheet = ss.getSheetByName(CONFIG.POSTS_SHEET);
  const productsSheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);

  upsertPostRow_(postsSheet, {
    post_key: postKey,
    title: String(payload.title || postKey).trim(),
    description: String(payload.description || '').trim(),
    updated_at: new Date(),
  });

  deleteProductRows_(productsSheet, postKey);
  appendProductRows_(productsSheet, normalizedProducts);

  return getPostData_(postKey);
}

function getPostData_(postKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupPostProductWidget();

  const postRows = sheetObjects_(ss.getSheetByName(CONFIG.POSTS_SHEET));
  const productRows = sheetObjects_(ss.getSheetByName(CONFIG.PRODUCTS_SHEET));
  const post = postRows.find(function(row) { return String(row.post_key) === postKey; });
  if (!post) return null;

  const products = productRows
    .filter(function(row) { return String(row.post_key) === postKey; })
    .sort(function(a, b) { return Number(a.sort_order || 0) - Number(b.sort_order || 0); })
    .map(function(row) {
      return {
        name: String(row.name || ''),
        url: String(row.url || ''),
        image: String(row.image || ''),
        original_price: toNumber_(row.original_price),
        sale_price: toNumber_(row.sale_price),
        currency: String(row.currency || CONFIG.DEFAULT_CURRENCY),
        coupon_code: String(row.coupon_code || ''),
        badge: String(row.badge || ''),
        note: String(row.note || ''),
      };
    });

  return {
    post_key: postKey,
    title: String(post.title || postKey),
    description: String(post.description || ''),
    updated_at: post.updated_at,
    products: products,
  };
}

function renderWidget_(data) {
  const cards = data.products.map(function(product) {
    const original = formatPrice_(product.original_price, product.currency);
    const sale = formatPrice_(product.sale_price, product.currency);
    const discount = discountPercent_(product.original_price, product.sale_price);
    const image = product.image
      ? '<img class="ptw-image" src="' + escapeAttr_(product.image) + '" alt="' + escapeAttr_(product.name) + '" loading="lazy">'
      : '<div class="ptw-image ptw-placeholder">No image</div>';

    return '<article class="ptw-card">' +
      image +
      '<div class="ptw-body">' +
        (product.badge ? '<span class="ptw-badge">' + escapeHtml_(product.badge) + '</span>' : '') +
        '<h3>' + escapeHtml_(product.name) + '</h3>' +
        '<div class="ptw-price">' +
          (original ? '<del>' + original + '</del>' : '') +
          (sale ? '<strong>' + sale + '</strong>' : '') +
          (discount ? '<em>' + discount + '% OFF</em>' : '') +
        '</div>' +
        (product.coupon_code ? '<div class="ptw-coupon">쿠폰 <b>' + escapeHtml_(product.coupon_code) + '</b></div>' : '') +
        (product.note ? '<p>' + escapeHtml_(product.note) + '</p>' : '') +
        '<a class="ptw-button" href="' + escapeAttr_(product.url) + '" target="_blank" rel="noopener noreferrer sponsored">상품 보기</a>' +
      '</div>' +
    '</article>';
  }).join('');

  return '<!doctype html><html lang="ko"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>' +
      '*{box-sizing:border-box}body{margin:0;background:transparent;font-family:Arial,"Noto Sans KR",sans-serif;color:#202124}' +
      '.ptw{max-width:980px;margin:auto;padding:12px}.ptw-head{margin:0 0 14px}.ptw-head h2{margin:0 0 6px;font-size:24px}.ptw-head p{margin:0;color:#666}' +
      '.ptw-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}' +
      '.ptw-card{overflow:hidden;border:1px solid #e5e7eb;border-radius:14px;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.06)}' +
      '.ptw-image{display:block;width:100%;height:180px;object-fit:cover;background:#f3f4f6}.ptw-placeholder{display:flex;align-items:center;justify-content:center;color:#9ca3af}' +
      '.ptw-body{padding:14px}.ptw-body h3{margin:8px 0 10px;font-size:17px;line-height:1.4}.ptw-body p{font-size:13px;color:#666;line-height:1.5}' +
      '.ptw-badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#fff1e8;color:#d9480f;font-size:12px;font-weight:700}' +
      '.ptw-price{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.ptw-price del{color:#9ca3af;font-size:13px}.ptw-price strong{font-size:20px;color:#e03131}.ptw-price em{font-style:normal;color:#2b8a3e;font-size:12px;font-weight:700}' +
      '.ptw-coupon{margin-top:10px;padding:8px;border:1px dashed #f59f00;border-radius:8px;background:#fff9db;font-size:13px}' +
      '.ptw-button{display:block;margin-top:12px;padding:11px;text-align:center;border-radius:9px;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:700}' +
      '@media(max-width:520px){.ptw{padding:8px}.ptw-list{grid-template-columns:1fr}.ptw-card{display:grid;grid-template-columns:112px 1fr}.ptw-image{height:100%;min-height:150px}.ptw-head h2{font-size:20px}}' +
    '</style></head><body><section class="ptw">' +
      '<header class="ptw-head"><h2>' + escapeHtml_(data.title) + '</h2>' +
      (data.description ? '<p>' + escapeHtml_(data.description) + '</p>' : '') + '</header>' +
      '<div class="ptw-list">' + cards + '</div></section>' +
      '<script>function resize(){parent.postMessage({type:"priceTrackerResize",height:document.documentElement.scrollHeight},"*")}addEventListener("load",resize);new ResizeObserver(resize).observe(document.body);</script>' +
    '</body></html>';
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function sheetObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.map(function(row) {
    const object = {};
    headers.forEach(function(header, index) { object[header] = row[index]; });
    return object;
  });
}

function upsertPostRow_(sheet, post) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === post.post_key) {
      sheet.getRange(i + 1, 1, 1, 4).setValues([[
        post.post_key, post.title, post.description, post.updated_at
      ]]);
      return;
    }
  }
  sheet.appendRow([post.post_key, post.title, post.description, post.updated_at]);
}

function deleteProductRows_(sheet, postKey) {
  for (let row = sheet.getLastRow(); row >= 2; row--) {
    if (String(sheet.getRange(row, 1).getValue()) === postKey) sheet.deleteRow(row);
  }
}

function appendProductRows_(sheet, products) {
  if (!products.length) return;
  const rows = products.map(function(p) {
    return [p.post_key, p.sort_order, p.name, p.url, p.image, p.original_price,
      p.sale_price, p.currency, p.coupon_code, p.badge, p.note, p.updated_at];
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function sanitizeKey_(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function normalizeUrl_(value) {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
}

function toNumber_(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function discountPercent_(original, sale) {
  return original > 0 && sale > 0 && sale < original ? Math.round((1 - sale / original) * 100) : 0;
}

function formatPrice_(value, currency) {
  if (!value) return '';
  try {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: currency || CONFIG.DEFAULT_CURRENCY }).format(value);
  } catch (error) {
    return String(value) + ' ' + String(currency || CONFIG.DEFAULT_CURRENCY);
  }
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr_(value) {
  return escapeHtml_(value).replace(/`/g, '&#96;');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlError_(message) {
  return HtmlService.createHtmlOutput('<meta name="viewport" content="width=device-width,initial-scale=1"><div style="padding:16px;font-family:sans-serif;color:#b42318;background:#fff4f2;border:1px solid #fecdca;border-radius:10px">' + escapeHtml_(message) + '</div>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
