document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageElement = document.getElementById('errorMessage');
    const accountTable = document.getElementById('accountTable');
    const accountTableBody = document.getElementById('accountTableBody');
    const logoutButton = document.getElementById('logoutButton');
    const userInfoDiv = document.getElementById('userInfo');
    const userNameSpan = document.getElementById('userName');
    const userEmailSpan = document.getElementById('userEmail');


    // --- ログアウト処理 ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken'); // トークンを削除
        alert('ログアウトしました。');
        window.location.href = 'login.html'; // ログインページに戻る
    });

    // --- トークンチェック ---
    if (!token) {
        // トークンがない場合はログインページにリダイレクト
        alert('ログインしていません。ログインページに移動します。');
        window.location.href = 'login.html';
        return; // 以降の処理を中断
    }

    // --- ユーザー情報と口座情報の取得・表示 ---
    const fetchData = async () => {
        loadingMessage.style.display = 'block';
        errorMessageElement.textContent = '';
        accountTable.style.display = 'none';
        userInfoDiv.style.display = 'none';


        try {
             // 1. ユーザー情報の取得 (/users/profile を使用)
             const userResponse = await fetch('http://localhost:8080/profile', {
                 method: 'GET',
                 headers: {
                     'Authorization': `Bearer ${token}`,
                     'Accept': 'application/json'
                 }
             });

             if (!userResponse.ok) {
                  if (userResponse.status === 401 || userResponse.status === 403) {
                     throw new Error('認証エラーが発生しました。再度ログインしてください。');
                  }
                 throw new Error(`ユーザー情報の取得に失敗しました (${userResponse.status})`);
             }

             const userData = await userResponse.json();
             console.log("User Data:", userData); // デバッグ用

             if (userData && userData.success && userData.data) {
                 userNameSpan.textContent = `${userData.data.firstName || ''} ${userData.data.lastName || ''}`.trim() || 'ゲスト'; // 名前がない場合も考慮
                 userEmailSpan.textContent = userData.data.email || '不明';
                 userInfoDiv.style.display = 'block'; // ユーザー情報を表示
             } else {
                  console.warn('ユーザー情報の取得に成功しましたが、データ形式が不正です。', userData);
                  // 必須ではないのでエラー表示はしないが、警告は出す
             }


            // 2. 口座情報の取得
            const accountResponse = await fetch('http://localhost:8080/accounts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Authorization ヘッダーにトークンを設定
                    'Accept': 'application/json'      // 受け入れるレスポンスタイプを指定
                }
            });

            if (!accountResponse.ok) {
                 if (accountResponse.status === 401 || accountResponse.status === 403) {
                     throw new Error('認証エラーが発生しました。再度ログインしてください。');
                 }
                // その他のHTTPエラー
                 let errorDetails = '';
                 try { errorDetails = await accountResponse.text(); } catch (e) {}
                 throw new Error(`口座情報の取得に失敗しました (${accountResponse.status}). ${errorDetails}`);
            }

            const accountData = await accountResponse.json();
            console.log("Account Data:", accountData); // デバッグ用

            loadingMessage.style.display = 'none'; // ローディングメッセージを非表示

            if (accountData && accountData.success && Array.isArray(accountData.data)) {
                if (accountData.data.length === 0) {
                     errorMessageElement.textContent = '表示できる口座情報がありません。';
                     errorMessageElement.style.color = '#666'; // 通常のメッセージ色
                } else {
                    // 口座情報をテーブルに表示
                    accountData.data.forEach(account => {
                        const row = accountTableBody.insertRow();

                        const cellAccountNumber = row.insertCell();
                        cellAccountNumber.textContent = account.card_number || 'N/A';

                        const cellBalance = row.insertCell();
                        // toLocaleString() を使って数値を読みやすい形式（例: 3桁区切り）にする
                        cellBalance.textContent = typeof account.balance === 'number'
                            ? account.balance.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' }) // 通貨形式
                            : 'N/A';
                        cellBalance.style.textAlign = 'right'; // 金額は右寄せ

                        const cellCreatedAt = row.insertCell();
                         // 日付を指定のフォーマットに変換 (例: YYYY/MM/DD HH:mm)
                        cellCreatedAt.textContent = account.created_at
                             ? new Date(account.created_at).toLocaleString('ja-JP', {
                                   year: 'numeric', month: '2-digit', day: '2-digit',
                                   hour: '2-digit', minute: '2-digit'
                               })
                             : 'N/A';

                         // 必要に応じてIDセルを追加
                         // const cellId = row.insertCell();
                         // cellId.textContent = account.id || 'N/A';
                    });
                    accountTable.style.display = 'table'; // テーブルを表示
                }
            } else {
                 // APIは成功したが、レスポンス形式が予期したものと違う場合
                 throw new Error('サーバーから予期しない形式のデータが返されました。');
            }

        } catch (error) {
            console.error('データ取得エラー:', error);
            loadingMessage.style.display = 'none'; // ローディング非表示
            errorMessageElement.textContent = error.message || 'データの取得中にエラーが発生しました。';

            // 認証エラーの場合はログインページに戻す
             if (error.message.includes('認証エラー')) {
                localStorage.removeItem('authToken'); // 無効なトークンを削除
                setTimeout(() => {
                     alert(error.message); // アラート表示
                     window.location.href = 'login.html';
                 }, 500); // 少し待ってからリダイレクト
             }
        }
    };

    // ページ読み込み時にデータを取得
    fetchData();
});