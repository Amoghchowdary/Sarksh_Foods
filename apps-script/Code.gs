const APP = {
  name: "SARKSH Foods Production API",
  version: "8.4",
  adminEmail: "amoghchowdaryamaraneni@gmail.com",
};

const SHEETS = {
  booking: "Bookings",
  enquiry: "Enquiries",
  products: "Products",
  websites: "Websites",
  audit: "Audit Log",
  customers: "Customers",
  addresses: "Customer Addresses",
  customerSessions: "Customer Sessions",
  passwordResets: "Password Resets",
  adminSessions: "Admin Sessions",
};

const HEADERS = {
  booking: ["Reference", "Created At", "Product Slug", "Product Name", "Pack Size", "Customer", "Phone", "Email", "Buyer Type", "Quantity", "PIN Code", "Address", "Notes", "Status", "Updated At", "Customer ID", "Address ID", "Payment Method", "Payment Status"],
  enquiry: ["Reference", "Created At", "Name", "Phone", "Email", "Requirement Type", "Requirement Details", "Status", "Updated At"],
  products: ["ID", "Slug", "Name", "Category", "Pack Size", "Status", "Featured", "Stock Label", "Short Description", "Image URL", "Drive File ID", "Created At", "Updated At"],
  websites: ["ID", "Name", "URL", "Environment", "Status", "HTTP Status", "Response ms", "Last Checked", "Notes", "Updated At"],
  audit: ["Timestamp", "Admin Email", "Action", "Entity", "Entity ID", "Details"],
  customers: ["Customer ID", "Created At", "Full Name", "Phone", "Email", "Password Hash", "Password Salt", "Password Iterations", "Status", "Last Login At", "Updated At"],
  addresses: ["Address ID", "Customer ID", "Label", "Recipient Name", "Phone", "Line 1", "Line 2", "Landmark", "City", "District", "State", "PIN Code", "Country", "Is Default", "Created At", "Updated At"],
  customerSessions: ["Session Hash", "Customer ID", "Created At", "Expires At", "Last Used At", "Revoked"],
  passwordResets: ["Reset Hash", "Customer ID", "Created At", "Expires At", "Used"],
  adminSessions: ["Session Hash", "Admin Email", "Created At", "Expires At", "Last Used At", "Revoked"],
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
    customerAccountsConfigured: Boolean(props.getProperty("SPREADSHEET_ID")),
    adminPasswordConfigured: Boolean(props.getProperty("ADMIN_PASSWORD_HASH")),
    timestamp: new Date().toISOString(),
  });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "").toLowerCase();

    if (action === "booking") return saveBooking_(body);
    if (action === "enquiry") return saveEnquiry_(body);

    if (action === "admin.login") return json_(adminLogin_(body));
    if (action === "admin.logout") return json_(adminLogout_(body));
    if (action === "admin.password.change") return json_(adminPasswordChange_(body));
    if (action.indexOf("admin.") === 0) {
      const admin = requireAdminSession_(body.sessionToken);
      return handleAdmin_(action, body, admin);
    }

    if (action === "customer.register") return json_(customerRegister_(body));
    if (action === "customer.login") return json_(customerLogin_(body));
    if (action === "customer.logout") return json_(customerLogout_(body));
    if (action === "customer.password.request") return json_(customerPasswordResetRequest_(body));
    if (action === "customer.password.reset") return json_(customerPasswordReset_(body));
    if (action.indexOf("customer.") === 0) {
      const customer = requireCustomerSession_(body.sessionToken);
      return json_(handleCustomer_(action, body, customer));
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
  if (!props.getProperty("AUTH_PEPPER")) props.setProperty("AUTH_PEPPER", randomToken_());
  if (!props.getProperty("SESSION_PEPPER")) props.setProperty("SESSION_PEPPER", randomToken_());

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
  ensureSheet_(spreadsheet, SHEETS.customers, HEADERS.customers);
  ensureSheet_(spreadsheet, SHEETS.addresses, HEADERS.addresses);
  ensureSheet_(spreadsheet, SHEETS.customerSessions, HEADERS.customerSessions);
  ensureSheet_(spreadsheet, SHEETS.passwordResets, HEADERS.passwordResets);
  ensureSheet_(spreadsheet, SHEETS.adminSessions, HEADERS.adminSessions);

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
    adminPasswordConfigured: Boolean(props.getProperty("ADMIN_PASSWORD_HASH")),
    customerAccountsConfigured: true,
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
  try {
    return json_(saveBookingObject_(body));
  } catch (error) {
    return json_({ ok: false, message: error && error.message ? String(error.message) : "Please complete the required order details." });
  }
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
  const customers = readCustomers_(spreadsheet);
  const props = PropertiesService.getScriptProperties();
  return {
    ok: true,
    admin: { email: admin.email, name: admin.name || "Administrator" },
    stats: {
      products: products.length,
      customers: customers.length,
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
    customers: customers,
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
    ? ["New", "Contacted", "Confirmed", "Packed", "Out for delivery", "Delivered", "Closed", "Cancelled"]
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
      headers: { "User-Agent": "SARKSH-Foods-Site-Monitor/8.4" },
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
      customerId: row[15] || "", addressId: row[16] || "", paymentMethod: row[17] || "", paymentStatus: row[18] || "",
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

function readCustomers_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.customers, HEADERS.customers);
  return readRows_(sheet).map(function (row) {
    return { id: String(row[0] || ""), createdAt: dateString_(row[1]), name: String(row[2] || ""), phone: String(row[3] || ""), email: String(row[4] || ""), status: String(row[8] || ""), lastLoginAt: dateString_(row[9]), updatedAt: dateString_(row[10]) };
  }).reverse();
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

function initializeAdminAccess() {
  const password = generateTemporaryPassword_();
  setAdminPassword_(password, false);
  MailApp.sendEmail({
    to: PropertiesService.getScriptProperties().getProperty("ADMIN_EMAIL") || APP.adminEmail,
    subject: "SARKSH Foods admin access initialized",
    body: "Your initial SARKSH Foods admin password is:\n\n" + password + "\n\nSign in at https://www.sarkshfoods.in/admin/. This password is shown only in this email; only its salted hash is stored by the backend.",
    name: "SARKSH Foods",
  });
  return { ok: true, message: "A temporary admin password was generated and emailed to the configured admin address." };
}

function resetAdminAccess() {
  return initializeAdminAccess();
}

function setAdminPassword_(password, mustChange) {
  const value = String(password || "");
  validatePassword_(value);
  const props = PropertiesService.getScriptProperties();
  const salt = randomToken_().slice(0, 48);
  const iterations = 12000;
  const hash = derivePassword_(value, salt, iterations);
  props.setProperties({
    ADMIN_PASSWORD_HASH: hash,
    ADMIN_PASSWORD_SALT: salt,
    ADMIN_PASSWORD_ITERATIONS: String(iterations),
    ADMIN_PASSWORD_MUST_CHANGE: mustChange ? "true" : "false",
  }, false);
}

function adminLogin_(body) {
  const email = normalizeEmail_(body.email);
  const password = String(body.password || "");
  const props = PropertiesService.getScriptProperties();
  const adminEmail = normalizeEmail_(props.getProperty("ADMIN_EMAIL") || APP.adminEmail);
  rateLimit_("admin-login-" + email, 8, 600);
  if (!props.getProperty("ADMIN_PASSWORD_HASH")) throw new Error("Admin password is not initialized. Run initializeAdminAccess() once in Apps Script.");
  if (!email || email !== adminEmail || !verifyPassword_(password, props.getProperty("ADMIN_PASSWORD_HASH"), props.getProperty("ADMIN_PASSWORD_SALT"), Number(props.getProperty("ADMIN_PASSWORD_ITERATIONS") || 12000))) {
    throw new Error("Invalid admin email or password.");
  }
  const token = createSession_(SHEETS.adminSessions, adminEmail, 8 * 60 * 60 * 1000);
  return { ok: true, sessionToken: token, admin: { email: adminEmail, name: "Administrator" }, mustChangePassword: props.getProperty("ADMIN_PASSWORD_MUST_CHANGE") === "true" };
}

function adminLogout_(body) {
  revokeSession_(SHEETS.adminSessions, body.sessionToken);
  return { ok: true };
}

function adminPasswordChange_(body) {
  const admin = requireAdminSession_(body.sessionToken);
  const current = String(body.currentPassword || "");
  const next = String(body.newPassword || "");
  const props = PropertiesService.getScriptProperties();
  if (!verifyPassword_(current, props.getProperty("ADMIN_PASSWORD_HASH"), props.getProperty("ADMIN_PASSWORD_SALT"), Number(props.getProperty("ADMIN_PASSWORD_ITERATIONS") || 12000))) throw new Error("Current password is incorrect.");
  setAdminPassword_(next, false);
  revokeAllSessionsForSubject_(SHEETS.adminSessions, admin.email);
  const token = createSession_(SHEETS.adminSessions, admin.email, 8 * 60 * 60 * 1000);
  logAudit_(admin, "admin.password.change", "Admin", admin.email, "Admin password changed");
  return { ok: true, sessionToken: token, mustChangePassword: false };
}

function requireAdminSession_(token) {
  const subject = requireSession_(SHEETS.adminSessions, token);
  const email = normalizeEmail_(subject);
  const adminEmail = normalizeEmail_(PropertiesService.getScriptProperties().getProperty("ADMIN_EMAIL") || APP.adminEmail);
  if (!email || email !== adminEmail) throw new Error("Admin session is invalid or expired.");
  return { email: email, name: "Administrator" };
}

function handleCustomer_(action, body, customer) {
  switch (action) {
    case "customer.bootstrap": return customerBootstrap_(customer);
    case "customer.address.upsert": return customerAddressUpsert_(body, customer);
    case "customer.address.delete": return customerAddressDelete_(body, customer);
    case "customer.order.create": return customerOrderCreate_(body, customer);
    case "customer.order.reorder": return customerReorder_(body, customer);
    case "customer.password.change": return customerPasswordChange_(body, customer);
    default: throw new Error("Unsupported customer action.");
  }
}

function customerRegister_(body) {
  const fullName = clean_(body.fullName, 80);
  const phone = normalizePhone_(body.phone);
  const email = normalizeEmail_(body.email);
  const password = String(body.password || "");
  if (fullName.length < 2 || phone.length < 8 || !isEmail_(email)) throw new Error("Enter a valid name, mobile number and email address.");
  validatePassword_(password);
  rateLimit_("customer-register-" + email, 5, 900);

  const spreadsheet = getSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SHEETS.customers, HEADERS.customers);
  if (findCustomerByEmail_(sheet, email)) throw new Error("An account already exists for this email. Sign in instead.");

  const id = "SF-C-" + Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase();
  const salt = randomToken_().slice(0, 48);
  const iterations = 12000;
  const hash = derivePassword_(password, salt, iterations);
  const now = new Date();
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.customers.length).setValues([[
    id, now, fullName, phone, email, hash, salt, iterations, "Active", now, now,
  ]]);
  const token = createSession_(SHEETS.customerSessions, id, 30 * 24 * 60 * 60 * 1000);
  return { ok: true, sessionToken: token, customer: customerProfileById_(id) };
}

function customerLogin_(body) {
  const email = normalizeEmail_(body.email);
  const password = String(body.password || "");
  rateLimit_("customer-login-" + email, 10, 600);
  const sheet = ensureSheet_(getSpreadsheet_(), SHEETS.customers, HEADERS.customers);
  const found = findCustomerByEmail_(sheet, email);
  if (!found || String(found.values[8] || "") !== "Active" || !verifyPassword_(password, found.values[5], found.values[6], Number(found.values[7] || 12000))) throw new Error("Invalid email or password.");
  const now = new Date();
  sheet.getRange(found.rowNumber, 10).setValue(now);
  sheet.getRange(found.rowNumber, 11).setValue(now);
  const id = String(found.values[0]);
  const token = createSession_(SHEETS.customerSessions, id, 30 * 24 * 60 * 60 * 1000);
  return { ok: true, sessionToken: token, customer: customerProfileById_(id) };
}

function customerLogout_(body) {
  revokeSession_(SHEETS.customerSessions, body.sessionToken);
  return { ok: true };
}

function customerBootstrap_(customer) {
  const spreadsheet = getSpreadsheet_();
  const profile = customerProfileById_(customer.id);
  const addresses = readCustomerAddresses_(spreadsheet, customer.id);
  const allOrders = readBookings_(spreadsheet, 1000);
  const orders = allOrders.filter(function (order) {
    return String(order.customerId || "") === customer.id || (!order.customerId && ((normalizeEmail_(order.email) && normalizeEmail_(order.email) === profile.email) || normalizePhone_(order.phone) === profile.phone));
  });
  const products = readProducts_(spreadsheet).filter(function (product) { return String(product.status || "").toLowerCase() === "active"; });
  return {
    ok: true,
    customer: profile,
    addresses: addresses,
    orders: orders,
    products: products,
    payments: { onlineEnabled: false, provider: "Razorpay", message: "Online payments are not enabled in this release. Payment will be connected after the ordering flow is approved." },
  };
}

function customerAddressUpsert_(body, customer) {
  const incoming = body.address || {};
  const id = clean_(incoming.id, 80) || ("SF-A-" + Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase());
  const label = clean_(incoming.label, 40) || "Home";
  const recipientName = clean_(incoming.recipientName, 80) || customer.name;
  const phone = normalizePhone_(incoming.phone) || customer.phone;
  const line1 = clean_(incoming.line1, 160);
  const line2 = clean_(incoming.line2, 160);
  const landmark = clean_(incoming.landmark, 120);
  const city = clean_(incoming.city, 80);
  const district = clean_(incoming.district, 80);
  const state = clean_(incoming.state, 80);
  const pincode = clean_(incoming.pincode, 12);
  const country = clean_(incoming.country, 60) || "India";
  if (recipientName.length < 2 || phone.length < 8 || line1.length < 4 || city.length < 2 || state.length < 2 || pincode.length < 4) throw new Error("Complete the required delivery-address fields.");

  const spreadsheet = getSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SHEETS.addresses, HEADERS.addresses);
  const existing = findRowByValue_(sheet, "Address ID", id);
  if (existing && String(existing.values[1]) !== customer.id) throw new Error("Address not found.");
  const current = readCustomerAddresses_(spreadsheet, customer.id);
  const isDefault = Boolean(incoming.isDefault) || current.length === 0;
  if (isDefault) clearDefaultAddresses_(sheet, customer.id);
  const now = new Date();
  const createdAt = existing ? existing.values[14] : now;
  upsertRow_(sheet, "Address ID", id, [id, customer.id, label, recipientName, phone, line1, line2, landmark, city, district, state, pincode, country, isDefault, createdAt, now]);
  return { ok: true, id: id, addresses: readCustomerAddresses_(spreadsheet, customer.id) };
}

function customerAddressDelete_(body, customer) {
  const id = clean_(body.addressId, 80);
  const spreadsheet = getSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SHEETS.addresses, HEADERS.addresses);
  const found = findRowByValue_(sheet, "Address ID", id);
  if (!found || String(found.values[1]) !== customer.id) throw new Error("Address not found.");
  const wasDefault = Boolean(found.values[13]);
  sheet.deleteRow(found.rowNumber);
  if (wasDefault) {
    const remaining = readCustomerAddresses_(spreadsheet, customer.id);
    if (remaining.length) {
      const next = findRowByValue_(sheet, "Address ID", remaining[0].id);
      if (next) sheet.getRange(next.rowNumber, 14).setValue(true);
    }
  }
  return { ok: true, addresses: readCustomerAddresses_(spreadsheet, customer.id) };
}

function customerOrderCreate_(body, customer) {
  const productSlug = clean_(body.productSlug, 100);
  const quantity = Math.max(1, Math.min(1000, Math.floor(Number(body.quantity) || 1)));
  const addressId = clean_(body.addressId, 80);
  const spreadsheet = getSpreadsheet_();
  const product = readProducts_(spreadsheet).filter(function (item) { return item.slug === productSlug && String(item.status).toLowerCase() === "active"; })[0];
  if (!product) throw new Error("This product is not currently available for ordering.");
  const address = readCustomerAddresses_(spreadsheet, customer.id).filter(function (item) { return item.id === addressId; })[0];
  if (!address) throw new Error("Choose a saved delivery address.");
  const formatted = formatAddress_(address);
  const result = saveBookingObject_({
    productSlug: product.slug, productName: product.name, packSize: product.packSize,
    name: address.recipientName || customer.name, phone: address.phone || customer.phone, email: customer.email,
    buyerType: "Household customer", quantity: quantity, pincode: address.pincode, address: formatted,
    notes: clean_(body.notes, 600), customerId: customer.id, addressId: address.id,
    paymentMethod: "To be confirmed", paymentStatus: "Not initiated",
  });
  return { ok: true, id: result.id };
}

function customerReorder_(body, customer) {
  const reference = clean_(body.reference, 100);
  const addressId = clean_(body.addressId, 80);
  const orders = readBookings_(getSpreadsheet_(), 1000).filter(function (item) { return item.reference === reference; });
  const previous = orders[0];
  if (!previous || (String(previous.customerId || "") !== customer.id && normalizeEmail_(previous.email) !== customer.email && normalizePhone_(previous.phone) !== customer.phone)) throw new Error("Order not found.");
  return customerOrderCreate_({ productSlug: previous.productSlug, quantity: previous.quantity || 1, addressId: addressId, notes: "Reorder of " + reference }, customer);
}

function customerPasswordChange_(body, customer) {
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  validatePassword_(newPassword);
  const spreadsheet = getSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SHEETS.customers, HEADERS.customers);
  const found = findRowByValue_(sheet, "Customer ID", customer.id);
  if (!found || !verifyPassword_(currentPassword, found.values[5], found.values[6], Number(found.values[7] || 12000))) throw new Error("Current password is incorrect.");
  const salt = randomToken_().slice(0, 48);
  const iterations = 12000;
  const hash = derivePassword_(newPassword, salt, iterations);
  sheet.getRange(found.rowNumber, 6, 1, 3).setValues([[hash, salt, iterations]]);
  sheet.getRange(found.rowNumber, 11).setValue(new Date());
  revokeAllSessionsForSubject_(SHEETS.customerSessions, customer.id);
  const token = createSession_(SHEETS.customerSessions, customer.id, 30 * 24 * 60 * 60 * 1000);
  return { ok: true, sessionToken: token };
}

function customerPasswordResetRequest_(body) {
  const email = normalizeEmail_(body.email);
  rateLimit_("reset-request-" + email, 4, 3600);
  const spreadsheet = getSpreadsheet_();
  const customerSheet = ensureSheet_(spreadsheet, SHEETS.customers, HEADERS.customers);
  const found = findCustomerByEmail_(customerSheet, email);
  if (!found) return { ok: true, message: "If an account exists for that email, a reset code has been sent." };
  const code = randomToken_().slice(0, 8).toUpperCase();
  const resetSheet = ensureSheet_(spreadsheet, SHEETS.passwordResets, HEADERS.passwordResets);
  const now = new Date();
  const hash = sessionHash_(code + "|" + String(found.values[0]));
  resetSheet.getRange(resetSheet.getLastRow() + 1, 1, 1, HEADERS.passwordResets.length).setValues([[hash, found.values[0], now, new Date(now.getTime() + 15 * 60 * 1000), false]]);
  MailApp.sendEmail({ to: email, subject: "SARKSH Foods password reset code", body: "Your SARKSH Foods reset code is " + code + ". It expires in 15 minutes. If you did not request this, you can ignore this email.", name: "SARKSH Foods" });
  return { ok: true, message: "If an account exists for that email, a reset code has been sent." };
}

function customerPasswordReset_(body) {
  const email = normalizeEmail_(body.email);
  const code = clean_(body.code, 12);
  const password = String(body.newPassword || "");
  validatePassword_(password);
  rateLimit_("reset-confirm-" + email, 8, 900);
  const spreadsheet = getSpreadsheet_();
  const customerSheet = ensureSheet_(spreadsheet, SHEETS.customers, HEADERS.customers);
  const customerFound = findCustomerByEmail_(customerSheet, email);
  if (!customerFound) throw new Error("Reset code is invalid or expired.");
  const customerId = String(customerFound.values[0]);
  const hash = sessionHash_(code + "|" + customerId);
  const resetSheet = ensureSheet_(spreadsheet, SHEETS.passwordResets, HEADERS.passwordResets);
  const rows = readRows_(resetSheet);
  let rowNumber = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (safeEqual_(String(rows[i][0] || ""), hash) && String(rows[i][1] || "") === customerId && !Boolean(rows[i][4]) && new Date(rows[i][3]).getTime() > Date.now()) { rowNumber = i + 2; break; }
  }
  if (!rowNumber) throw new Error("Reset code is invalid or expired.");
  const salt = randomToken_().slice(0, 48);
  const iterations = 12000;
  const passwordHash = derivePassword_(password, salt, iterations);
  customerSheet.getRange(customerFound.rowNumber, 6, 1, 3).setValues([[passwordHash, salt, iterations]]);
  customerSheet.getRange(customerFound.rowNumber, 11).setValue(new Date());
  resetSheet.getRange(rowNumber, 5).setValue(true);
  revokeAllSessionsForSubject_(SHEETS.customerSessions, customerId);
  return { ok: true, message: "Password updated. You can sign in now." };
}

function customerProfileById_(id) {
  const sheet = ensureSheet_(getSpreadsheet_(), SHEETS.customers, HEADERS.customers);
  const found = findRowByValue_(sheet, "Customer ID", id);
  if (!found) throw new Error("Customer account not found.");
  return { id: String(found.values[0]), name: String(found.values[2] || ""), phone: String(found.values[3] || ""), email: String(found.values[4] || ""), status: String(found.values[8] || ""), createdAt: dateString_(found.values[1]), lastLoginAt: dateString_(found.values[9]) };
}

function readCustomerAddresses_(spreadsheet, customerId) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.addresses, HEADERS.addresses);
  return readRows_(sheet).filter(function (row) { return String(row[1]) === customerId; }).map(function (row) {
    return { id: String(row[0]), customerId: String(row[1]), label: String(row[2] || "Home"), recipientName: String(row[3] || ""), phone: String(row[4] || ""), line1: String(row[5] || ""), line2: String(row[6] || ""), landmark: String(row[7] || ""), city: String(row[8] || ""), district: String(row[9] || ""), state: String(row[10] || ""), pincode: String(row[11] || ""), country: String(row[12] || "India"), isDefault: Boolean(row[13]), createdAt: dateString_(row[14]), updatedAt: dateString_(row[15]) };
  }).sort(function (a, b) { return a.isDefault === b.isDefault ? a.label.localeCompare(b.label) : (a.isDefault ? -1 : 1); });
}

function clearDefaultAddresses_(sheet, customerId) {
  if (sheet.getLastRow() < 2) return;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  values.forEach(function (row, index) { if (String(row[1]) === customerId && Boolean(row[13])) sheet.getRange(index + 2, 14).setValue(false); });
}

function formatAddress_(address) {
  return [address.line1, address.line2, address.landmark, address.city, address.district, address.state, address.pincode, address.country].filter(Boolean).join(", ");
}

function findCustomerByEmail_(sheet, email) {
  if (!email || sheet.getLastRow() < 2) return null;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < rows.length; i++) if (normalizeEmail_(rows[i][4]) === email) return { rowNumber: i + 2, values: rows[i] };
  return null;
}

function createSession_(sheetName, subject, durationMs) {
  const spreadsheet = getSpreadsheet_();
  const headers = sheetName === SHEETS.adminSessions ? HEADERS.adminSessions : HEADERS.customerSessions;
  const sheet = ensureSheet_(spreadsheet, sheetName, headers);
  const token = randomToken_();
  const now = new Date();
  const expires = new Date(now.getTime() + durationMs);
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([[sessionHash_(token), subject, now, expires, now, false]]);
  return token;
}

function requireSession_(sheetName, token) {
  const raw = clean_(token, 500);
  if (!raw) throw new Error("Session is required.");
  const sheet = ensureSheet_(getSpreadsheet_(), sheetName, sheetName === SHEETS.adminSessions ? HEADERS.adminSessions : HEADERS.customerSessions);
  const hash = sessionHash_(raw);
  const rows = readRows_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (safeEqual_(String(rows[i][0] || ""), hash)) {
      if (Boolean(rows[i][5]) || new Date(rows[i][3]).getTime() <= Date.now()) throw new Error("Session is invalid or expired.");
      sheet.getRange(i + 2, 5).setValue(new Date());
      return String(rows[i][1] || "");
    }
  }
  throw new Error("Session is invalid or expired.");
}

function requireCustomerSession_(token) {
  const id = requireSession_(SHEETS.customerSessions, token);
  const profile = customerProfileById_(id);
  if (profile.status !== "Active") throw new Error("Customer account is not active.");
  return profile;
}

function revokeSession_(sheetName, token) {
  const raw = clean_(token, 500);
  if (!raw) return;
  const sheet = ensureSheet_(getSpreadsheet_(), sheetName, sheetName === SHEETS.adminSessions ? HEADERS.adminSessions : HEADERS.customerSessions);
  const hash = sessionHash_(raw);
  const rows = readRows_(sheet);
  for (let i = rows.length - 1; i >= 0; i--) if (safeEqual_(String(rows[i][0] || ""), hash)) { sheet.getRange(i + 2, 6).setValue(true); return; }
}

function revokeAllSessionsForSubject_(sheetName, subject) {
  const sheet = ensureSheet_(getSpreadsheet_(), sheetName, sheetName === SHEETS.adminSessions ? HEADERS.adminSessions : HEADERS.customerSessions);
  const rows = readRows_(sheet);
  rows.forEach(function (row, index) { if (String(row[1] || "") === String(subject)) sheet.getRange(index + 2, 6).setValue(true); });
}

function saveBookingObject_(body) {
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
  if (!productSlug || !productName || name.length < 2 || phone.length < 8 || !buyerType || quantity < 1 || pincode.length < 4 || address.length < 6) throw new Error("Please complete the required order details.");
  const id = "SF-B-" + Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase();
  const now = new Date();
  append_(SHEETS.booking, HEADERS.booking, [id, now, productSlug, productName, packSize, name, phone, email, buyerType, quantity, pincode, address, notes, "New", now, clean_(body.customerId, 80), clean_(body.addressId, 80), clean_(body.paymentMethod, 60) || "To be confirmed", clean_(body.paymentStatus, 40) || "Not initiated"]);
  sendAdminNotification_("New SARKSH Foods order request · " + id, "A new order request was received.", [["Reference", id], ["Product", productName + " " + packSize], ["Customer", name], ["Phone", phone], ["Buyer type", buyerType], ["Quantity", String(quantity)], ["PIN code", pincode], ["Address", address], ["Notes", notes || "—"]]);
  return { ok: true, id: id };
}

function normalizeEmail_(value) { return clean_(value, 160).toLowerCase(); }
function normalizePhone_(value) { return clean_(value, 32).replace(/[^0-9+]/g, ""); }
function isEmail_(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "")); }
function validatePassword_(value) { const p = String(value || ""); if (p.length < 10 || !/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) throw new Error("Password must be at least 10 characters and include a letter and a number."); }

function derivePassword_(password, salt, iterations) {
  const pepper = PropertiesService.getScriptProperties().getProperty("AUTH_PEPPER") || "";
  let state = salt + "|" + password + "|" + pepper;
  const rounds = Math.max(4000, Math.min(20000, Number(iterations) || 12000));
  for (let i = 0; i < rounds; i++) {
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, state, Utilities.Charset.UTF_8);
    state = Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, "") + "|" + salt + "|" + pepper;
  }
  return state.split("|")[0];
}

function verifyPassword_(password, expectedHash, salt, iterations) {
  if (!expectedHash || !salt) return false;
  return safeEqual_(derivePassword_(String(password || ""), String(salt), Number(iterations) || 12000), String(expectedHash));
}

function safeEqual_(a, b) {
  const left = String(a || ""); const right = String(b || "");
  let diff = left.length ^ right.length; const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i++) diff |= (left.charCodeAt(i % Math.max(1, left.length)) || 0) ^ (right.charCodeAt(i % Math.max(1, right.length)) || 0);
  return diff === 0;
}

function randomToken_() { return [Utilities.getUuid(), Utilities.getUuid(), Utilities.getUuid()].join("").replace(/-/g, ""); }
function sessionHash_(token) { return digest_(String(token || "") + "|" + (PropertiesService.getScriptProperties().getProperty("SESSION_PEPPER") || "")); }
function generateTemporaryPassword_() { return "Sf!" + randomToken_().slice(0, 14) + "9"; }

function rateLimit_(key, maxAttempts, seconds) {
  const cache = CacheService.getScriptCache();
  const cacheKey = "rate-" + digest_(key);
  const count = Number(cache.get(cacheKey) || 0) + 1;
  cache.put(cacheKey, String(count), seconds);
  if (count > maxAttempts) throw new Error("Too many attempts. Please try again later.");
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
  file.setDescription("SARKSH Foods private product media uploaded from the admin portal");
  // Drive remains private. Public website/customer images must use an approved public URL
  // (for example a versioned GitHub Pages asset), never a shared Google Drive link.

  if (existingFileId) {
    try { DriveApp.getFileById(existingFileId).setTrashed(true); } catch (error) { console.warn(error); }
  }
  return { id: file.getId() };
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
    return sheet;
  }
  const current = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const missing = headers.filter(function (header) { return current.indexOf(header) < 0; });
  if (missing.length) {
    const start = sheet.getLastColumn() + 1;
    sheet.getRange(1, start, 1, missing.length).setValues([missing]);
    sheet.getRange(1, start, 1, missing.length).setFontWeight("bold").setBackground("#681D17").setFontColor("#FFF7ED");
    sheet.autoResizeColumns(start, missing.length);
  }
  sheet.setFrozenRows(1);
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
    "https://www.sarkshfoods.in/assets/sarksh-foods-chilli-powder-1kg-india.webp", "", now, now,
  ]]);
}

function seedWebsite_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SHEETS.websites, HEADERS.websites);
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  sheet.getRange(2, 1, 1, HEADERS.websites.length).setValues([[
    "SF-W-MAIN", "SARKSH Foods", "https://www.sarkshfoods.in/", "Production", "Not checked", "", "", "", "Primary production website", now,
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
