const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageElement = document.getElementById('errorMessage');
const successMessageElement = document.getElementById('successMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // デフォルトのフォーム送信をキャンセル

    // メッセージをクリア
    errorMessageElement.textContent = '';
    successMessageElement.textContent = '';

    const email = emailInput.value;
    const password = passwordInput.value;

    // 簡単な入力チェック (より詳細なチェックも可能)
    if (!email || !password) {
        errorMessageElement.textContent = 'メールアドレスとパスワードを入力してください。';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json(); // レスポンスボディをJSONとして解析

        if (data && data.success) {
            // ログイン成功
            successMessageElement.textContent = 'ログインに成功しました！';
            console.log('ログイン成功:', data);

            // トークンを取得して保存 (localStorageの場合)
            if (data.data && data.data.token) {
                localStorage.setItem('authToken', data.data.token);
                console.log('トークンを保存しました:', data.data.token);

                // 必要に応じて他のページにリダイレクト
                // 例: 1秒後にダッシュボードへ遷移
                setTimeout(() => {
                   window.location.href = '/samplehtml/dashboard.html'; // ダッシュボードページのパスに適宜変更
                }, 1000);

            } else {
                 console.warn('レスポンスにトークンが含まれていませんでした。');
                 errorMessageElement.textContent = 'ログイン処理中に予期せぬエラーが発生しました。(トークンなし)';
            }

        } else {
            // ログイン失敗
            let errorMsg = 'メールアドレスまたはパスワードが正しくありません。'; // デフォルトのエラー
            if (data && data.errors) {
                // バックエンドからのエラーメッセージを使用
                // data.errorsが文字列の場合とオブジェクトの場合があるためチェック
                if (typeof data.errors === 'string') {
                    errorMsg = data.errors;
                } else if (typeof data.errors === 'object') {
                     // エラーオブジェクトの内容を見て適切に表示
                     // 例: 最初のフィールドのエラーを表示
                     const firstErrorKey = Object.keys(data.errors)[0];
                     if(firstErrorKey){
                         errorMsg = data.errors[firstErrorKey];
                     } else {
                         errorMsg = '不明なエラーが発生しました。';
                     }
                }
            }
             errorMessageElement.textContent = errorMsg;
            console.error('ログイン失敗:', data);
        }

    } catch (error) {
        // 通信エラーなど
        errorMessageElement.textContent = 'ログインリクエストの送信中にエラーが発生しました。ネットワーク接続を確認してください。';
        console.error('ログインリクエストエラー:', error);
    }
});