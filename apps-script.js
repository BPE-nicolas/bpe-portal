// ═══════════════════════════════════════════════════════════════
// BPE — Google Apps Script
// Recibe postulaciones, guarda CVs en Drive y datos en Sheets
// ═══════════════════════════════════════════════════════════════

// ─── CONFIGURACIÓN ──────────────────────────────────────────────
// Reemplazá este ID con el de tu carpeta de Google Drive
// Para obtenerlo: abrí la carpeta en Drive y copiá el ID de la URL
// Ej: https://drive.google.com/drive/folders/ESTE_ES_EL_ID
const DRIVE_FOLDER_ID = '1blWbPzVW9S-uWcwykpMrctyrNzBmWcN0';

// Nombre de la hoja de cálculo donde se guardarán las postulaciones
const SHEET_NAME = 'Postulaciones';
// ────────────────────────────────────────────────────────────────


function doPost(e) {
  // Permitir CORS para que el sitio pueda hacer POST
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Parsear el body JSON
    const data = JSON.parse(e.postData.contents);

    // Validar campos obligatorios
    const required = ['position', 'nombre', 'apellido', 'email', 'telefono', 'linkedin', 'fileName', 'fileBase64'];
    for (const field of required) {
      if (!data[field]) {
        return buildResponse({ status: 'error', message: 'Campo faltante: ' + field }, headers);
      }
    }

    // 1. Guardar CV en Google Drive
    const cvUrl = saveCvToDrive(data);

    // 2. Guardar datos en Google Sheet
    saveToSheet(data, cvUrl);

    return buildResponse({ status: 'ok', message: 'Postulación recibida' }, headers);

  } catch (err) {
    return buildResponse({ status: 'error', message: err.toString() }, headers);
  }
}


// Necesario para preflight CORS
function doGet(e) {
  return buildResponse({ status: 'ok', message: 'BPE Apps Script activo' }, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
}


// ─── GUARDAR CV EN DRIVE ────────────────────────────────────────
function saveCvToDrive(data) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

  // Crear subcarpeta por posición si no existe
  let subfolder;
  const subfolderName = sanitizeName(data.position);
  const existing = folder.getFoldersByName(subfolderName);
  if (existing.hasNext()) {
    subfolder = existing.next();
  } else {
    subfolder = folder.createFolder(subfolderName);
  }

  // Decodificar base64 y crear el archivo
  const decoded = Utilities.base64Decode(data.fileBase64);
  const blob = Utilities.newBlob(decoded, data.fileType || 'application/octet-stream', data.fileName);

  // Nombre del archivo: Apellido_Nombre_archivo.pdf
  const fileName = sanitizeName(data.apellido + '_' + data.nombre) + '_' + data.fileName;
  blob.setName(fileName);

  const file = subfolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}


// ─── OBTENER O CREAR SPREADSHEET ────────────────────────────────
function getOrCreateSpreadsheet() {
  const name = 'BPE - Postulaciones';
  const files = DriveApp.getFilesByName(name);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  } else {
    return SpreadsheetApp.create(name);
  }
}


// ─── GUARDAR DATOS EN SHEETS ────────────────────────────────────
function saveToSheet(data, cvUrl) {
  const ss = getOrCreateSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Crear la hoja si no existe
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Encabezados
    sheet.appendRow([
      'Fecha', 'Posición', 'Nombre', 'Apellido',
      'Email', 'Teléfono', 'LinkedIn', 'CV (link)'
    ]);
    // Formato del encabezado
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#0a0d0f');
    headerRange.setFontColor('#00e5b4');
  }

  // Agregar fila
  const now = new Date();
  const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

  sheet.appendRow([
    dateStr,
    data.position,
    data.nombre,
    data.apellido,
    data.email,
    data.telefono,
    data.linkedin,
    cvUrl
  ]);
}


// ─── HELPERS ────────────────────────────────────────────────────
function sanitizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

function buildResponse(data, headers) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
