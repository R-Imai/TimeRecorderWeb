import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  
  document.title = "TimeRecorder | ログインが必要です";

  return (
    <div className="error-page">
      <h1>ログインが必要です</h1>
      <div className="message-area">
        <div className="message">
          <span>このページの表示にはログインが必要です。</span>
          <span>アカウント登録済みの方はログイン画面よりログインしてください。</span>
          <span>アカウント登録お済みではない方は、登録画面よりアカウント登録をしてください。</span>
        </div>
      </div>
      <div className="btn-space">
        <Link className="btn" to="/registration">登録画面へ</Link>
        <Link className="btn" to="/login">ログイン画面へ</Link>
      </div>
    </div>
  );
}

export default withRouter(Unauthorized);
