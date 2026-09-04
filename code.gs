const SPREADSHEET_ID = '1k0Ncz-ypCgB2Nzhjq3cPrQBDOW2na_a1FJEF_7vjaDY';
const DRIVE_FOLDER_ID = '1i2YMUvtXi5Mccs5tIncRvRs0S2SrBX_b';
const STATE_KEY = 'app_state';

function doGet() {
  return jsonResponse({ ok: true, message: 'CARKECORS Apps Script aktif.' });
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents || '{}');
    let data;

    if (request.action === 'getState') {
      data = readState();
    } else if (request.action === 'saveState') {
      writeState(request.state);
      data = request.state;
    } else if (request.action === 'uploadFile') {
      data = uploadFile(request);
    } else {
      throw new Error('Action tidak dikenal.');
    }

    return jsonResponse({ ok: true, data });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName('AppState') || spreadsheet.insertSheet('AppState');
}

function readState() {
  const sheet = getStateSheet();
  const values = sheet.getDataRange().getValues();
  for (let row = 1; row < values.length; row += 1) {
    if (values[row][0] === STATE_KEY && values[row][1]) return JSON.parse(values[row][1]);
  }
  return null;
}

function writeState(state) {
  if (!state || !state.members || !state.albums || !state.videos || !state.settings) {
    throw new Error('Format state tidak valid.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getStateSheet();
    if (sheet.getLastRow() === 0) sheet.appendRow(['key', 'value', 'updatedAt']);
    const values = sheet.getDataRange().getValues();
    const serializedState = JSON.stringify(state);
    let stateRow = -1;

    for (let row = 1; row < values.length; row += 1) {
      if (values[row][0] === STATE_KEY) {
        stateRow = row + 1;
        break;
      }
    }

    if (stateRow === -1) {
      sheet.appendRow([STATE_KEY, serializedState, new Date()]);
    } else {
      sheet.getRange(stateRow, 2, 1, 2).setValues([[serializedState, new Date()]]);
    }
  } finally {
    lock.releaseLock();
  }
}

function uploadFile(request) {
  if (!request.base64 || !request.fileName || !request.mimeType) {
    throw new Error('Data file tidak lengkap.');
  }

  const base64Data = request.base64.replace(/^data:[^;]+;base64,/, '');
  const bytes = Utilities.base64Decode(base64Data);
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const folderName = String(request.folder || 'media').replace(/[^a-zA-Z0-9_-]/g, '') || 'media';
  const folders = rootFolder.getFoldersByName(folderName);
  const folder = folders.hasNext() ? folders.next() : rootFolder.createFolder(folderName);
  const file = folder.createFile(Utilities.newBlob(bytes, request.mimeType, request.fileName));

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}
