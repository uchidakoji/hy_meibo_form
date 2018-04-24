function memberInfoUpdate() {
/*
変更届フォームより入力された情報をメールで送信するスクリプト
*/
    
    // readConfig 関数を呼び出して、設定シート上にある値を読み込む。返り値は連想配列。
    var configHash = readConfig();
    // 連想配列からキー値を用いて値を読み込む
    var answerSheetName = configHash["回答シート名"];
    var groupName = configHash["グループ名"];
    var mailToGroup = configHash["グループ送信先"];
    var mailFrom = configHash["送信者"];
    var replyToAddress = configHash["返信先"];
    var bccAddress = configHash["bccアドレス"]; 

    // 会員がフォームに入力した情報を取得
    var updateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(answerSheetName);
    var lastRow = updateSheet.getLastRow();
    var lastCol = updateSheet.getLastColumn();
    var headerInfo = updateSheet.getSheetValues(1, 1, 1, lastCol); //　項目名を行列として取得
    var memberInfo = updateSheet.getSheetValues(lastRow, 1, 1, lastCol); // フォームからの入力情報を最終行に入力される。それを行列として取得

    if (memberInfo[0][0] !== "") {return;} // A列に何か文字が入力されている場合はそこで処理終了
    Logger.log(headerInfo);
    Logger.log(memberInfo);

    var txtContents = ""; // メールに添付されるtxtファイルの内容をここに格納
    var inputInfo = "----- 以下、入力された情報 -----<br/>"; // EmailのHTML Body用の情報をここに格納

    for (i = 2; i <= lastCol - 1; i++) {        
        var headerValue = headerInfo[0][i];
        var memberValue = memberInfo[0][i];
        
        if (headerValue === "メールアドレス" ) {
            var emailAddress = memberValue;
        } else if (headerValue === "氏名") {
            var name = memberValue;
        } else if (headerValue === "回生") {
            var kaisei = memberValue;        
        } else if ( (headerValue.indexOf("市町村番地") === 0) || (headerValue.indexOf("マンション") === 0) ) {
            // 市町村番地・マンション項目に入力されている半角英数字記号を全角に変換
            // 参考:https://nj-clucker.com/change-double-byte-to-half-width/　または　https://qiita.com/yamikoo@github/items/5dbcc77b267a549bdbae
            memberValue = memberValue.replace(/[!-~]/g, function(tmpStr) {
            return String.fromCharCode( tmpStr.charCodeAt(0) + 0xFEE0 ); 
            }); 
        }
        
        txtContents = txtContents + "[" + headerValue + "] " + memberValue + "\r\n";
        inputInfo = inputInfo + "[" + headerValue + "] " + memberValue + "<br/>";
    }

    Logger.log(txtContents);
    var message = kaisei + "回生 " + name + " 様<br/><br/>"
        + "会員情報変更の届け出ありがとうございました。<br/><br/>"
        + "何か質問がございましたら、こちらのメールにご返信ください。<br/><br/>"
        + mailFrom;
    var emailBody = "<body style= \"font-family:helvetica,arial,meiryo,sans-serif;font-size:10.5pt\">"　+ message + "<p style= \"font-family:helvetica,arial,meiryo,sans-serif;font-size:9pt\">" + inputInfo + "</p></body>";
    var subject = kaisei + "回生 " + name + " 様 会員情報変更の届け出ありがとうございました。";
        
    //　会員宛への受付確認メール送信
    MailApp.sendEmail({            
        to: emailAddress,
        subject: subject,
        htmlBody: emailBody,
        replyTo: replyToAddress,
        name: mailFrom            
    });
    
    //　グループ宛へのメール送信
    var emailBodyToGroup = "<body style= \"font-family:helvetica,arial,meiryo,sans-serif;font-size:10.5pt\">"　+ kaisei + "回生 " + name + " 様 より会員情報変更の届出を受付けました。"
        + "<p style= \"font-family:helvetica,arial,meiryo,sans-serif;font-size:9pt\">" + inputInfo + "</p></body>";
    var subjectToGroup = kaisei + "回生 " + name + " 様より会員情報変更の届出";
    
    // 添付するtxtファイルの作成
    var txtName = kaisei + "回生" + name + ".txt";
    var blob = Utilities.newBlob("", "text/csv", txtName);// txtファイルの作成
    blob.setDataFromString(txtContents, "utf-8"); // 作成したファイルへ情報の書き込み。文字コードはUFT-8
      
    MailApp.sendEmail({        
        to: mailToGroup,
        subject: subjectToGroup,
        htmlBody: emailBodyToGroup,
        replyTo: replyToAddress,
        name: mailFrom,
        attachments: [blob.getAs(MimeType.PLAIN_TEXT)]        
    });

    updateSheet.getRange(lastRow, 1).setValue("yes")　//　処理が終わった行のA列に処理済みのフラグをたてる

}