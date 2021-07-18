import React from 'react';
import {Link} from 'react-router-dom';

type Props = {
  onClose: () => void,
}

const UserSettingDialog: React.FC<Props> = (props: Props) => {
  return (
    <div className="dialog setting-dialog">
      {/*<Link to="/setting/profile" className="link-btn">
        プロフィール変更
      </Link>*/}
      <Link to="/setting/password" className="link-btn">
        パスワード変更
      </Link>
      <div className="btn-space">
        <button className="cancel" onClick={props.onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}

export default UserSettingDialog
