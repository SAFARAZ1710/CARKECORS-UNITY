const SPREADSHEET_ID = "1rd10ptl7sB8JOJ3t_6OplhXkSmd5jwY7-pJjM-g26bo";

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Data Anggota
  const sheetAnggota = ss.getSheetByName("Anggota");
  const dataAnggota = sheetAnggota.getDataRange().getValues();
  const members = {};
  for (let i = 1; i < dataAnggota.length; i++) {
    const row = dataAnggota[i];
    const key = String(row[0]).trim();
    if (!key) continue;
    let photos = [];
    try { photos = JSON.parse(row[9] || "[]"); } catch (err) { photos = []; }

    members[key] = {
      name: row[1] || "",
      role: row[2] || "",
      dob: row[3] || "",
      quote: row[4] || "",
      ig: row[5] || "",
      tiktok: row[6] || "",
      pin: String(row[7] || "1234"),
      avatarUrl: row[8] || "",
      photos: photos
    };
  }

  // 2. Data Album
  const sheetAlbum = ss.getSheetByName("Album");
  const dataAlbum = sheetAlbum.getDataRange().getValues();
  const albums = {};
  for (let i = 1; i < dataAlbum.length; i++) {
    const row = dataAlbum[i];
    const key = String(row[0]).trim();
    if (!key) continue;
    let photos = [];
    try { photos = JSON.parse(row[5] || "[]"); } catch (err) { photos = []; }

    albums[key] = {
      category: row[1] || "random",
      title: row[2] || "",
      desc: row[3] || "",
      cover: row[4] || "",
      photos: photos
    };
  }

  // 3. Data Video
  let videos = [];
  const sheetVideo = ss.getSheetByName("Video");
  if (sheetVideo) {
    const dataVideo = sheetVideo.getDataRange().getValues();
    for (let i = 1; i < dataVideo.length; i++) {
      const row = dataVideo[i];
      if (row[0]) {
        videos.push({
          title: row[0] || "",
          desc: row[1] || "",
          src: row[2] || ""
        });
      }
    }
  }

  // 4. Pengaturan
  const sheetPengaturan = ss.getSheetByName("Pengaturan");
  const settings = { filosofiPhoto: "", logoUrl: "" };
  if (sheetPengaturan) {
    const dataSettings = sheetPengaturan.getDataRange().getValues();
    for (let i = 1; i < dataSettings.length; i++) {
      const k = String(dataSettings[i][0]).trim();
      const v = String(dataSettings[i][1] || "");
      if (k) settings[k] = v;
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ members, albums, videos, settings }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === "updateProfile") {
      const sheet = ss.getSheetByName("Anggota");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === payload.key) {
          const rowNum = i + 1;
          if (payload.quote !== undefined) sheet.getRange(rowNum, 5).setValue(payload.quote);
          if (payload.ig !== undefined) sheet.getRange(rowNum, 6).setValue(payload.ig);
          if (payload.tiktok !== undefined) sheet.getRange(rowNum, 7).setValue(payload.tiktok);
          if (payload.pin !== undefined) sheet.getRange(rowNum, 8).setValue(payload.pin);
          if (payload.avatarUrl) sheet.getRange(rowNum, 9).setValue(payload.avatarUrl);
          break;
        }
      }
    } else if (action === "addMember") {
      const sheet = ss.getSheetByName("Anggota");
      sheet.appendRow([
        payload.id,
        payload.name,
        payload.role,
        payload.dob,
        payload.quote,
        payload.ig || "",
        payload.tiktok || "",
        payload.pin || "1234",
        payload.avatarUrl || "",
        JSON.stringify(payload.photos || [])
      ]);
    } else if (action === "addAlbum") {
      const sheet = ss.getSheetByName("Album");
      sheet.appendRow([
        payload.id,
        payload.category,
        payload.title,
        payload.desc,
        payload.cover,
        JSON.stringify(payload.photos || [])
      ]);
    } else if (action === "addPhotoToAlbum") {
      const sheet = ss.getSheetByName("Album");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === payload.albumKey) {
          let photos = [];
          try { photos = JSON.parse(data[i][5] || "[]"); } catch (err) { photos = []; }
          photos.push(payload.photoUrl);
          sheet.getRange(i + 1, 6).setValue(JSON.stringify(photos));
          break;
        }
      }
    } else if (action === "addPersonalPhoto") {
      const sheet = ss.getSheetByName("Anggota");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === payload.memberKey) {
          let photos = [];
          try { photos = JSON.parse(data[i][9] || "[]"); } catch (err) { photos = []; }
          photos.push(payload.photoUrl);
          sheet.getRange(i + 1, 10).setValue(JSON.stringify(photos));
          break;
        }
      }
    } else if (action === "addVideo") {
      const sheet = ss.getSheetByName("Video");
      if (sheet) {
        sheet.appendRow([payload.title, payload.desc, payload.src]);
      }
    } else if (action === "updateSetting") {
      const sheet = ss.getSheetByName("Pengaturan");
      const data = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === payload.key) {
          sheet.getRange(i + 1, 2).setValue(payload.value);
          found = true;
          break;
        }
      }
      if (!found) sheet.appendRow([payload.key, payload.value]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}