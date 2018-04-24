function readConfig() {
    var sheetConfig = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("設定");
    var lastRowConfig = sheetConfig.getLastRow();
    var lastColConfig = sheetConfig.getLastColumn();
    var values = sheetConfig.getSheetValues(1, 1, lastRowConfig, lastColConfig); //　設定シートの全てのセルを選択し、配列化する
    var hash = {}; // 項目名をKeyにした連想配列の作成

    for (var i = 1; i <= lastRowConfig - 1; i++ ) {
        var key = values[i][0];
        var value = values[i][1];
        hash[values[i][0]] = values[i][1];
    }
    return hash;
    
}
  