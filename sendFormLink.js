function sendFormLink() {
/*
メール件名にあるキーワードを書いて、空メールを送信すると、会員情報変更届フォームを送信者に返信するスクリプト
*/
    // readConfig 関数を呼び出して、設定シート上にある値を読み込む。返り値は連想配列。
    var configHash = readConfig();
    // 連想配列からキー値を用いて値を読み込む
    var groupName = configHash["グループ名"];
    var mailToGroup = configHash["グループ送信先"];
    var mailFrom = configHash["送信者"];
    var replyToAddress = configHash["返信先"];
    var bccAddress = configHash["bccアドレス"];
    var URL = configHash["変更届フォームURL"];
    var keyword = configHash["キーワード"];

    // 日付演算は　GAS用Moment.jsライブラリを使用するともう少し簡単にできるが　とりあえずこのまま
    var todayDate = new Date();
    var tomorrowDate = new Date(todayDate.getYear(), todayDate.getMonth(), todayDate.getDate() + 1);
    var yesterdayDate = new Date(todayDate.getYear(), todayDate.getMonth(), todayDate.getDate() - 1);
      
    var todayDateFormat = Utilities.formatDate(todayDate,"JST","yyyy/MM/dd")
    var tomorrowDateFormat = Utilities.formatDate(tomorrowDate,"JST","yyyy/MM/dd")
    var yesterdayDateFormat = Utilities.formatDate(yesterdayDate,"JST","yyyy/MM/dd")
    
    var searchTerm = "subject:" + keyword + " after:" + yesterdayDateFormat + " before:" + tomorrowDateFormat; // 検索条件を設定    
    var myThreads = GmailApp.search(searchTerm, 0, 10); //条件にマッチしたスレッドを検索して取得
    var myMessages = GmailApp.getMessagesForThreads(myThreads);
        /* 各メールから日時、送信元、件名、内容を取り出す*/
        for(var i = 0;i < myMessages.length;i++){
            var emailAddress = myMessages[i][0].getFrom()
            Logger.log( myMessages[i][0].getDate() );
            Logger.log( myMessages[i][0].getFrom() );
            Logger.log( myMessages[i][0].getSubject() );
            Logger.log( myMessages[i][0].getPlainBody() );            
            var body = "<p>お問い合わせありがとうございました。<br/></br/><a href=" + URL + ">こちらのリンクが</a>" + groupName + " 会員情報変更届となっております。<br/><br/>"
                + "何か質問がございましたら、こちらのメールにご返信ください。</p>" + mailFrom;
        
            if(myMessages[i][0].getSubject() === keyword){
                MailApp.sendEmail({                
                to: emailAddress,
                subject: groupName + " 会員情報変更届フォーム リンク",
                htmlBody: body,
                replyTo: replyToAddress,
                name: mailFrom                 
                });
                
                //処理が終了したメールはごみ箱に移動する
                GmailApp.moveMessageToTrash(myMessages[i][0]);            
            }
        
        }
      
    }
    