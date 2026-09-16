const APP = {
  name: "SARKSH Foods Production API",
  version: "8.2",
  adminEmail: "amoghchowdaryamaraneni@gmail.com",
};

const SHEETS = {
  booking: "Bookings",
  enquiry: "Enquiries",
  products: "Products",
  websites: "Websites",
  audit: "Audit Log",
};

const HEADERS = {
  booking: ["Reference", "Created At", "Product Slug", "Product Name", "Pack Size", "Customer", "Phone", "Email", "Buyer Type", "Quantity", "PIN Code", "Address", "Notes", "Status", "Updated At"],
  enquiry: ["Reference", "Created At", "Name", "Phone", "Email", "Requirement Type", "Requirement Details", "Status", "Updated At"],
  products: ["ID", "Slug", "Name", "Category", "Pack Size", "Status", "Featured", "Stock Label", "Short Description", "Image URL", "Drive File ID", "Created At", "Updated At"],
  websites: ["ID", "Name", "URL", "Environment", "Status", "HTTP Status", "Response ms", "Last Checked", "Notes", "Updated At"],
  audit: ["Timestamp", "Admin Email", "Action", "Entity", "Entity ID", "Details"],
};

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "health").toLowerCase();
  if (action !== "health") return json_({ ok: false, message: "Not found" });
  const props = PropertiesService.getScriptProperties();
  return json_({
    ok: true,
    service: "sarksh-foods-production-api",
    version: APP.version,
    databaseConfigured: Boolean(props.getProperty("SPREADSHEET_ID")),
    driveConfigured: Boolean(props.getProperty("DRIVE_ROOT_FOLDER_ID")),
    timestamp: new Date().toISOString(),
  });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "").toLowerCase();

    if (action === "booking") return saveBooking_(body);
    if (action === "enquiry") return saveEnquiry_(body);

    if (action.indexOf("admin.") === 0) {
      const admin = requireAdmin_(body.idToken);
      return handleAdmin_(action, body, admin);
    }

    return json_({ ok: false, message: "Unsupported action" });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    const message = error && error.message ? String(error.message) : "Request could not be processed";
    return json_({ ok: false, message: message });
  }
}

/**
 * Run this once from the Apps Script editor before the production web-app deployment.
 * It creates the Google Drive folders, Google Sheets database, required sheets,
 * seed product, and sarkshfoods.in website-monitor record.
 */
function setupProductionBackend() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("ADMIN_EMAIL")) props.setProperty("ADMIN_EMAIL", APP.adminEmail);

  let rootFolder;
  const existingRoot = props.getProperty("DRIVE_ROOT_FOLDER_ID");
  if (existingRoot) {
    rootFolder = DriveApp.getFolderById(existingRoot);
  } else {
    rootFolder = DriveApp.createFolder("SARKSH Foods Production");
    props.setProperty("DRIVE_ROOT_FOLDER_ID", rootFolder.getId());
  }

  const productMedia = ensureChildFolder_(rootFolder, "Product Media", "PRODUCT_MEDIA_FOLDER_ID");
  ensureChildFolder_(rootFolder, "Documents", "DOCUMENTS_FOLDER_ID");
  ensureChildFolder_(rootFolder, "Exports", "EXPORTS_FOLDER_ID");

  let spreadsheet;
  const existingSpreadsheet = props.getProperty("SPREADSHEET_ID");
  if (existingSpreadsheet) {
    spreadsheet = SpreadsheetApp.openById(existingSpreadsheet);
  } else {
    spreadsheet = SpreadsheetApp.create("SARKSH Foods Production Database");
    DriveApp.getFileById(spreadsheet.getId()).moveTo(rootFolder);
    props.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  }

  ensureSheet_(spreadsheet, SHEETS.booking, HEADERS.booking);
  ensureSheet_(spreadsheet, SHEETS.enquiry, HEADERS.enquiry);
  ensureSheet_(spreadsheet, SHEETS.products, HEADERS.products);
  ensureSheet_(spreadsheet, SHEETS.websites, HEADERS.websites);
  ensureSheet_(spreadsheet, SHEETS.audit, HEADERS.audit);

  seedProduct_(spreadsheet);
  seedWebsite_(spreadsheet);

  const result = {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    driveRootFolderId: rootFolder.getId(),
    driveRootFolderUrl: rootFolder.getUrl(),
    productMediaFolderId: productMedia.getId(),
    adminEmail: props.getProperty("ADMIN_EMAIL"),
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function handleAdmin_(action, body, admin) {
  switch (action) {
    case "admin.bootstrap":
      return json_(adminBootstrap_(admin));
    case "admin.product.upsert":
      return json_(adminProductUpsert_(body, admin));
    case "admin.order.status":
      return json_(adminStatusUpdate_(SHEETS.booking, "Reference", body.reference, body.status, admin, "order"));
    case "admin.enquiry.status":
      return json_(adminStatusUpdate_(SHEETS.enquiry, "Reference", body.reference, body.status, admin, "enquiry"));
    case "admin.website.upsert":
      return json_(adminWebsiteUpsert_(body, admin));
    case "admin.website.check":
      return json_(adminWebsiteCheck_(body.id, admin));
    case "admin.website.checkall":
      return json_(adminWebsiteCheckAll_(admin));
    default:
      return json_({ ok: false, message: "Unsupported admin action" });
  }
}

function saveBooking_(body) {
  const name = clean_(body.name, 80);
  const phone = clean_(body.phone, 24);
  const email = clean_(body.email, 120);
  const buyerType = clean_(body.buyerType, 60);
  const quantity = Math.max(1, Math.floor(Number(body.quantity) || 0));
  const pincode = clean_(body.pincode, 12);
  const address = clean_(body.address, 500);
  const notes = clean_(body.notes, 600);
  const productSlug = clean_(body.productSlug, 100);
  const productName = clean_(body.productName, 120);
  const packSize = clean_(body.packSize, 40);

  if (!productSlug || !productName || name.length < 2 || phone.length < 8 || !buyerType || quantity < 1 || pincode.length < 4 || address.length < 6) {
    return json_({ ok: false, message: "Please complete the required order details." });
  }

  const id = "SF-B-" + Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase();
  const now = new Date();
  append_(SHEETS.booking, HEADERS.booking,
    [id, now, productSlug, productName, packSize, name, phone, email, buyerType, quantity, pincode, address, notes, "New", now]
  );

  sendAdminNotification_(
    "New SARKSH Foods order request · " + id,
    "A new order request was received.",
    [
      ["Reference", id], ["Product", productName + " " + packSize], ["Customer", name], ["Phone", phone],
      ["Buyer type", buyerType], ["Quantity", String(quantity)], ["PIN code", pincode], ["Address", address], ["Notes", notes || "—"]
    ]
  );
  return json_({ ok: true, id: id });
}

function saveEnquiry_(body) {
  const name = clean_(body.name, 80);
  const phone = clean_(body.phone, 24);
  const email = clean_(body.email, 120);
  const interest = clean_(body.interest, 120);
  const message = clean_(body.message, 1200);

  if (name.length < 2 || phone.length < 7 || message.length < 4) {
    return json_({ ok: false, message: "Name, contact number and requirement details are required." });
  }

  const id = "SF-E-" + Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase();
  const now = new Date();
  append_(SHEETS.enquiry, HEADERS.enquiry,
    [id, now, name, phone, email, interest, message, "New", now]
  );

  sendAdminNotification_(
    "New SARKSH Foods enquiry · " + id,
    "A new website enquiry was received.",
    [["Reference", id], ["Name", name], ["Phone", phone], ["Email", email || "—"], ["Requirement", interest || "General enquiry"], ["Details", message]]
  );
  return json_({ ok: true, id: id });
}

function adminBootstrap_(admin) {
  const spreadsheet = getSpreadsheet_();
  const products = readProducts_(spreadsheet);
  const orders = readBookings_(spreadsheet, 250);
  const enquiries = readEnquiries_(spreadsheet, 250);
  const websites = readWebsites_(spreadsheet);
  const props = PropertiesService.getScriptProperties();
  return {
    ok: true,
    admin: { email: admin.email, name: admin.name || "Administrator" },
    stats: {
      products: products.length,
      activeProducts: products.filter(function (item) { return item.status.toLowerCase() === "active"; }).length,
      newOrders: orders.filter(function (item) { return item.status === "New"; }).length,
      newEnquiries: enquiries.filter(function (item) { return item.status === "New"; }).length,
      websitesOnline: websites.filter(function (item) { return item.status === "Online"; }).length,
      websites: websites.length,
    },
    products: products,
    orders: orders,
    enquiries: enquiries,
    websites: websites,
    resources: {
      spreadsheetUrl: spreadsheet.getUrl(),
      driveFolderUrl: DriveApp.getFolderById(props.getProperty("DRIVE_ROOT_FOLDER_ID")).getUrl(),
    },
  };
}

function adminProductUpsert_(body, admin) {
  const spreadsheet = getSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SHEETS.products, HEADERS.products);
  const incoming = body.product || {};
  const id = clean_(incoming.id, 80) || ("SF-P-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase());
  const slug = slug_(incoming.slug || incoming.name);
  const name = clean_(incoming.name, 120);
  const category = clean_(incoming.category, 80) || "Spices";
  const packSize = clean_(incoming.packSize, 40);
  const status = allow_(clean_(incoming.status, 30), ["Active", "Draft", "Archived"], "Draft");
  const featured = Boolean(incoming.featured);
  const stockLabel = clean_(incoming.stockLabel, 60) || "Enquiries open";
  const description = clean_(incoming.shortDescription, 500);

  if (!name || !slug || !packSize) throw new Error("Product name, slug and pack size are required.");

  const existing = findRowByValue_(sheet, "ID", id);
  let imageUrl = existing ? String(existing.values[9] || "") : "";
  let driveFileId = existing ? String(existing.values[10] || "") : "";

  if (incoming.image && incoming.image.base64) {
    const upload = saveProductImage_(incoming.image, slug, driveFileId);
    imageUrl = upload.url;
    driveFileId = upload.id;
  } else if (clean_(incoming.imageUrl, 500)) {
    imageUrl = clean_(incoming.imageUrl, 500);
  }

  const now = new Date();
  const createdAt = existing ? existing.values[11] : now;
  const row = [id, slug, name, category, packSize, status, featured, stockLabel, description, imageUrl, driveFileId, createdAt, now];
  upsertRow_(sheet, "ID", id, row);
  logAudit_(admin, "product.upsert", "Product", id, name + " · " + status);
  return { ok: true, id: id, message: "Product saved." };
}

function adminStatusUpdate_(sheetName, keyHeader, keyValue, statusValue, admin, entity) {
  const allowed = entity === "order"
    ? ["New", "Contacted", "Confirmed", "Closed", "Cancelled"]
    : ["New", "Contacted", "Resolved", "Closed"];
  const status = allow_(clean_(statusValue, 30), allowed, "");
  if (!status) throw new Error("Invalid status.");

  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error("Database sheet not found.");
  const found = findRowByValue_(sheet, keyHeader, clean_(keyValue, 100));
  if (!found) throw new Error("Record not found.");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusIndex = headers.indexOf("Status");
  const updatedIndex = headers.indexOf("Updated At");
  sheet.getRange(found.rowNumber, statusIndex + 1).setValue(status);
  if (updatedIndex >= 0) sheet.getRange(found.rowNumber, updatedIndex + 1).setValue(new Date());
  logAudit_(admin, entity + ".status", entity, keyValue, status);
  return { ok: true, message: "Status updated." };
}

function adminWebsiteUpsert_(body, admin) {
  const incoming = body.website || {};
  const name = clean_(incoming.name, 120);
  const url = normalizeUrl_(incoming.url);
  const environment = clean_(incoming.environment, 40) || "Production";
  const notes = clean_(incoming.notes, 500);
  const id = clean_(incoming.id, 80) || ("SF-W-" + Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase());
  if (!name || !url) throw new Error("Website name and HTTPS URL are required.");

  const spreadsheet = getSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SHEETS.websites, HEADERS.websites);
  const existing = findRowByValue_(sheet, "ID", id);
  const now = new Date();
  const row = [
    id, name, url, environment,
    existing ? existing.values[4] : "Not checked",
    existing ? existing.values[5] : "",
    existing ? existing.values[6] : "",
    existing ? existing.values[7] : "",
    notes,
    now,
  ];
  upsertRow_(sheet, "ID", id, row);
  logAudit_(admin, "website.upsert", "Website", id, name + " · " + url);
  return { ok: true, id: id, message: "Website saved." };
}

function adminWebsiteCheck_(id, admin) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(SHEETS.websites);
  if (!sheet) throw new Error("Websites sheet not found.");
  const found = findRowByValue_(sheet, "ID", clean_(id, 80));
  if (!found) throw new Error("Website not found.");
  const result = checkWebsite_(String(found.values[2] || ""));
  sheet.getRange(found.rowNumber, 5, 1, 4).setValues([[result.status, result.httpStatus, result.responseMs, new Date()]]);
  sheet.getRange(found.rowNumber, 10).setValue(new Date());
  logAudit_(admin, "website.check", "Website", id, result.status + " · " + result.httpStatus + " · " + result.responseMs + "ms");
  return { ok: true, website: readWebsites_(spreadsheet).filter(function (item) { return item.id === id; })[0] };
}

function adminWebsiteCheckAll_(admin) {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(SHEETS.websites);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, message: "No websites configured." };
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  values.forEach(function (row, index) {
    const url = String(row[2] || "");
    if (!url) return;
    const result = checkWebsite_(url);
    sheet.getRange(index + 2, 5, 1, 4).setValues([[result.status, result.httpStatus, result.responseMs, new Date()]]);
    sheet.getRange(index + 2, 10).setValue(new Date());
  });
  logAudit_(admin, "website.checkall", "Website", "all", String(values.length) + " website(s)");
  return { ok: true, websites: readWebsites_(spreadsheet) };
}

function checkWebsite_(url) {
  const start = Date.now();
  try {
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      followRedirects: true,
      muteHttpExceptions: true,
      headers: { "User-Agent": "SARKSH-Foods-Site-Monitor/8.2" },
    });
    const responseMs = Date.now() - start;
    const code = response.getResponseCode();
    return { status: code >= 200 && code < 400 ? "Online" : "Issue", httpStatus: code, responseMs: responseMs };
  } catch (error) {
    return { status: "Offline", httpStatus: 0, responseMs: Date.now() - start };
  }
}

function readProducts_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.products, HEADERS.products);
  return readRows_(sheet).map(function (row) {
    return {
      id: row[0], slug: row[1], name: row[2], category: row[3], packSize: row[4], status: row[5],
      featured: Boolean(row[6]), stockLabel: row[7], shortDescription: row[8], imageUrl: row[9], driveFileId: row[10],
      createdAt: dateString_(row[11]), updatedAt: dateString_(row[12]),
    };
  });
}

function readBookings_(spreadsheet, limit) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.booking, HEADERS.booking);
  return readRows_(sheet).slice(-limit).reverse().map(function (row) {
    return {
      reference: row[0], createdAt: dateString_(row[1]), productSlug: row[2], productName: row[3], packSize: row[4],
      customer: row[5], phone: row[6], email: row[7], buyerType: row[8], quantity: Number(row[9] || 0), pincode: row[10],
      address: row[11], notes: row[12], status: row[13] || "New", updatedAt: dateString_(row[14]),
    };
  });
}

function readEnquiries_(spreadsheet, limit) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.enquiry, HEADERS.enquiry);
  return readRows_(sheet).slice(-limit).reverse().map(function (row) {
    return {
      reference: row[0], createdAt: dateString_(row[1]), name: row[2], phone: row[3], email: row[4], requirementType: row[5],
      requirementDetails: row[6], status: row[7] || "New", updatedAt: dateString_(row[8]),
    };
  });
}

function readWebsites_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.websites, HEADERS.websites);
  return readRows_(sheet).map(function (row) {
    return {
      id: row[0], name: row[1], url: row[2], environment: row[3], status: row[4] || "Not checked",
      httpStatus: row[5] === "" ? null : Number(row[5]), responseMs: row[6] === "" ? null : Number(row[6]),
      lastChecked: dateString_(row[7]), notes: row[8], updatedAt: dateString_(row[9]),
    };
  });
}

function requireAdmin_(idToken) {
  const token = clean_(idToken, 5000);
  if (!token) throw new Error("Admin sign-in is required.");

  const cache = CacheService.getScriptCache();
  const cacheKey = "admin-token-" + digest_(token);
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const props = PropertiesService.getScriptProperties();
  const clientId = props.getProperty("GOOGLE_CLIENT_ID");
  const adminEmail = (props.getProperty("ADMIN_EMAIL") || APP.adminEmail).toLowerCase();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured in Apps Script properties.");

  const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token), {
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) throw new Error("Google admin session is invalid or expired.");
  const profile = JSON.parse(response.getContentText());
  const email = String(profile.email || "").toLowerCase();
  const verified = String(profile.email_verified || "").toLowerCase() === "true";
  const audience = String(profile.aud || "");
  const subject = String(profile.sub || "");

  if (!verified || audience !== clientId || email !== adminEmail || !subject) throw new Error("This Google account is not authorized for the SARKSH Foods admin portal.");

  const lockedSub = props.getProperty("ADMIN_GOOGLE_SUB");
  if (lockedSub && lockedSub !== subject) throw new Error("This Google account is not authorized for the SARKSH Foods admin portal.");
  if (!lockedSub) props.setProperty("ADMIN_GOOGLE_SUB", subject);

  const admin = { email: email, sub: subject, name: String(profile.name || "") };
  cache.put(cacheKey, JSON.stringify(admin), 300);
  return admin;
}

function saveProductImage_(image, slug, existingFileId) {
  const mimeType = clean_(image.mimeType, 100).toLowerCase();
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.indexOf(mimeType) < 0) throw new Error("Product image must be JPG, PNG or WebP.");
  const base64 = String(image.base64 || "").replace(/^data:[^;]+;base64,/, "");
  if (!base64) throw new Error("Product image is empty.");
  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > 4500000) throw new Error("Product image must be smaller than 4.5 MB.");

  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const fileName = "sarksh-foods-" + slug + "-" + Date.now() + "." + extension;
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const folderId = PropertiesService.getScriptProperties().getProperty("PRODUCT_MEDIA_FOLDER_ID");
  if (!folderId) throw new Error("Product Media Drive folder is not configured. Run setupProductionBackend().");
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);
  file.setDescription("SARKSH Foods product media uploaded from the admin portal");
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  if (existingFileId) {
    try { DriveApp.getFileById(existingFileId).setTrashed(true); } catch (error) { console.warn(error); }
  }
  return { id: file.getId(), url: "https://drive.google.com/uc?export=view&id=" + file.getId() };
}

function sendAdminNotification_(subject, heading, rows) {
  try {
    const adminEmail = PropertiesService.getScriptProperties().getProperty("ADMIN_EMAIL") || APP.adminEmail;
    const bodyRows = rows.map(function (item) {
      return '<tr><td style="padding:6px 12px 6px 0;color:#765">' + html_(item[0]) + '</td><td style="padding:6px 0;font-weight:600">' + html_(item[1]) + '</td></tr>';
    }).join("");
    const plainBody = heading + "\n\n" + rows.map(function (item) { return item[0] + ": " + item[1]; }).join("\n") + "\n\nOpen the SARKSH Foods admin portal for status management.";
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      body: plainBody,
      name: "SARKSH Foods Website",
      htmlBody: '<div style="font-family:Arial,sans-serif;color:#3b0908"><h2>' + html_(heading) + '</h2><table>' + bodyRows + '</table><p style="margin-top:20px;color:#765">Open the SARKSH Foods admin portal for status management.</p></div>',
    });
  } catch (error) {
    console.warn("Admin notification email was not sent: " + error);
  }
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Production database is not configured. Run setupProductionBackend() once from Apps Script.");
  return SpreadsheetApp.openById(id);
}

function append_(sheetName, headers, row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, sheetName, headers);
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
  } finally {
    lock.releaseLock();
  }
}

function ensureSheet_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#681D17").setFontColor("#FFF7ED");
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function ensureChildFolder_(rootFolder, name, propertyName) {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty(propertyName);
  if (existing) return DriveApp.getFolderById(existing);
  const folder = rootFolder.createFolder(name);
  props.setProperty(propertyName, folder.getId());
  return folder;
}

function seedProduct_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.products, HEADERS.products);
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  sheet.getRange(2, 1, 1, HEADERS.products.length).setValues([[
    "SF-P-CHILLI-1KG", "chilli-powder", "Chilli Powder", "Ground Spice", "1 kg", "Active", true,
    "Order enquiries open", "SARKSH Foods Chilli Powder in a 1 kg carton for household and commercial requirements.",
    "https://sarkshfoods.in/assets/sarksh-foods-chilli-powder-1kg-india.webp", "", now, now,
  ]]);
}

function seedWebsite_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.websites, HEADERS.websites);
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  sheet.getRange(2, 1, 1, HEADERS.websites.length).setValues([[
    "SF-W-MAIN", "SARKSH Foods", "https://sarkshfoods.in/", "Production", "Not checked", "", "", "", "Primary production website", now,
  ]]);
}

function readRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
}

function findRowByValue_(sheet, header, value) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const index = headers.indexOf(header);
  if (index < 0) throw new Error("Database column not found: " + header);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][index]) === String(value)) return { rowNumber: i + 2, values: values[i] };
  }
  return null;
}

function upsertRow_(sheet, keyHeader, keyValue, row) {
  const found = findRowByValue_(sheet, keyHeader, keyValue);
  if (found) {
    sheet.getRange(found.rowNumber, 1, 1, row.length).setValues([row]);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
  }
}

function logAudit_(admin, action, entity, entityId, details) {
  try {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, SHEETS.audit, HEADERS.audit);
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.audit.length).setValues([[new Date(), admin.email, action, entity, entityId, clean_(details, 1000)]]);
  } catch (error) {
    console.warn("Audit log failed: " + error);
  }
}

function normalizeUrl_(value) {
  const url = clean_(value, 500);
  if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/|$)/i.test(url)) throw new Error("Website URL must begin with https://");
  return /^https:\/\/[^/]+$/i.test(url) ? url + "/" : url;
}

function clean_(value, maxLength) {
  return String(value == null ? "" : value).trim().slice(0, maxLength);
}

function slug_(value) {
  return clean_(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

function allow_(value, allowed, fallback) {
  return allowed.indexOf(value) >= 0 ? value : fallback;
}

function dateString_(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function digest_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, "").slice(0, 48);
}

function html_(value) {
  return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
