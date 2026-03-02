function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Census');
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var rows = data.slice(1);
  var records = rows.map(function(r, i) {
    var shiftVal = '1';
    if (r[1] && r[1].toString().indexOf('บ่าย') > -1) shiftVal = '2';
    else if (r[1] && r[1].toString().indexOf('ดึก') > -1) shiftVal = '3';

    var dateStr = "";
    if (r[0]) {
      try { dateStr = Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "yyyy-MM-dd"); } 
      catch(ex) { dateStr = r[0]; }
    }

    return {
      id: i + 1, date: dateStr, shift: shiftVal, ward: r[2] || "",
      before: r[3] || 0, admit: r[4] || 0, discharge: r[5] || 0,
      transIn: r[6] || 0, transOut: r[7] || 0, death: r[8] || 0,
      remain: r[9] || 0, bed: r[10] || 0, hn: r[11] || 0,
      rn: r[12] || 0, tn: r[13] || 0, pn: r[14] || 0, // <--- เพิ่ม pn ตรงนี้ (r[14])
      na: r[15] || 0, note: r[16] || "" // <--- ขยับลำดับ na และ note ออกไป 1 ตำแหน่ง
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify(records)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(data.sheetName || 'Census') || ss.insertSheet(data.sheetName || 'Census');
    
    if (data.action === 'sync') {
      sheet.clearContents();
      // แก้หัวข้อด้านล่างนี้ให้มี PN แยกออกมา
      const headers = ['วันที่', 'เวร', 'หน่วยงาน', 'นอน', 'รับใหม่', 'จำหน่าย',
        'ย้ายเข้า', 'ย้ายออก', 'เสียชีวิต', 'คงเหลือ', 'เตียง', 'HN', 'RN', 'TN', 'PN', 'NA', 'ภาระงาน(Productivity)'];
      sheet.appendRow(headers);
      if (data.rows && data.rows.length > 0) {
         sheet.getRange(2, 1, data.rows.length, data.rows[0].length).setValues(data.rows);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', msg: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
