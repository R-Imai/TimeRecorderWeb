import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { sha256 } from 'js-sha256';
import {Link} from 'react-router-dom';

import Indicator from '../Components/Indicator'
import logo from '../Image/logo.svg';
import {getUserInfo, logout, updatePassword} from '../Actions/AuthAction'
import {isApiErrorData} from '../Actions/ApiBase';
import ConfirmDialog from '../Components/ConfirmDialog'
import Message, {msgType} from '../Components/Message'

type State = {
  showIndicator: boolean;
  userInfo: UserInfo | null;
  currentPass: string,
  newPass1: string,
  newPass2: string,
  msgInfo: {
    value: string;
    type: msgType;
  } | null;
  showLogoutDialog: boolean;
}

class PasswordSettingPage extends React.Component<RouteComponentProps , State> {
  constructor(props: RouteComponentProps) {
    super(props);
    
    document.title = "TimeRecorder | パスワード変更";

    this.state = {
      showIndicator: false,
      userInfo: null,
      currentPass: '',
      newPass1: '',
      newPass2: '',
      msgInfo: null,
      showLogoutDialog: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    this.setState({
      showIndicator: true
    })
    try {
      const response = await Promise.all([
        getUserInfo(),
      ]);
      const userInfo = response[0];

      this.setState({
        userInfo: userInfo,
      })
    } catch (e) {
      if (isApiErrorData(e)) {
        if (e.response?.status === 401) {
          console.error('Auth');
          console.log(e.response.data.detail);
          this.props.history.push('/error/401');
        }
        if (e.response?.status === 400) {
          console.error('Bad Request');
          console.log(e.response.data.detail);
        }
        if (e.response?.status === 409) {
          console.error('Already');
          console.log(e.response.data.detail);
        }
        if (e.response?.status === 404) {
          console.error('Not found');
          console.log(e.response.data.detail);
          // TODO: 404に遷移
        }
        if (e.response?.status === 500) {
          console.error('Error');
          console.log(e.response.data.detail);
          // TODO: 500に遷移
        }
      }
    } finally {
      this.setState({
        showIndicator: false,
      })
    }
  }

  async logout() {
    this.setState({
      showIndicator: true,
      showLogoutDialog: false,
    })
    await logout();
    this.setState({
      showIndicator: false,
    })
    this.props.history.push('/login');
  }

  async onSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (this.state.newPass1 !== this.state.newPass2) {
      return;
    }
    this.setState({
      showIndicator: true
    })
    const param = {
      current: sha256(this.state.currentPass),
      new: sha256(this.state.newPass1),
    }
    try {
      await updatePassword(param);
      this.setState({
        msgInfo: {
          type: 'info',
          value: 'パスワードを変更しました。'
        }
      })
      setTimeout(() => {
        this.setState({
          msgInfo: null,
        })
      }, 5000)
    } catch(e) {
      if (isApiErrorData(e)) {
        this.setState({
          msgInfo: {
            type: 'error',
            value: e.response?.data.detail ? e.response?.data.detail : '予期せぬエラーが発生しました。'
          }
        })
      }
    } finally {
      this.setState({
        showIndicator: false,
      })
    }
  }

  render() {

    const logoutDialogElem = this.state.showLogoutDialog ? (
      <ConfirmDialog message="ログアウトします。よろしいですか。" onCancel={() => {this.setState({showLogoutDialog: false})}} onSubmit={this.logout} />
    ) : '';
  
    return (
      <div id="password-setting-page" className="indicator-parent">
        <h1><img src={logo} className="logo" alt="logo" />パスワード変更</h1>
        <div className="header-menu">
          <div>パスワードを変更します。</div>
          <div className="icon-space">
            <Link to="/home">
              <div className="icon-home" title="記録画面へ"/>
            </Link>
            <Link to="/calc">
              <div className="icon-graph" title="集計画面へ"/>
            </Link>
            <Link to="/setting/subject">
              <div className="icon-setting" title="作業ジャンル設定画面へ"/>
            </Link>
            <span className="link" onClick={() => {this.setState({showLogoutDialog: true})}}>
              <div className="icon-exit" title="ログアウト"/>
            </span>
          </div>
        </div>
        { this.state.msgInfo !== null ? <Message value={this.state.msgInfo.value} type={this.state.msgInfo.type} /> : ''}
        <form className="password-setting-form">
          <label
            htmlFor="password-setting-form-current"
            className="label"
          >
            現在のパスワード
          </label>
          <input
            id="password-setting-form-current"
            value={this.state.currentPass}
            onChange={(e) => {this.setState({currentPass: e.target.value})}}
            placeholder="現在のパスワード"
            className="input-form"
            type="password"
          />
          <label
            htmlFor="password-setting-form-new1"
            className="label"
          >
            新しいパスワード
          </label>
          <input
            id="password-setting-form-new1"
            value={this.state.newPass1}
            onChange={(e) => {this.setState({newPass1: e.target.value})}}
            placeholder="新しいパスワード"
            className="input-form"
            type="password"
          />
          <label
            htmlFor="password-setting-form-new2"
            className={`label  ${this.state.newPass1 !== this.state.newPass2 ? 'label-error' : ''}`}
          >
            新しいパスワード（確認）
          </label>
          <input
            id="password-setting-form-new2"
            value={this.state.newPass2}
            onChange={(e) => {this.setState({newPass2: e.target.value})}}
            placeholder="新しいパスワード（確認）"
            className={`input-form ${this.state.newPass1 !== this.state.newPass2 ? 'input-form-error' : ''}`}
            type="password"
          />
          {
            this.state.newPass1 !== this.state.newPass2 ? (
            <span className="err-msg">
              パスワードが一致していません。
            </span>) : '' 
          }
          <div className="btn-space">
            <button type="submit" className="submit" onClick={this.onSubmit} disabled={this.state.newPass1 !== this.state.newPass2}>
              更新
            </button>
          </div>
        </form>
        {logoutDialogElem}
        <Indicator show={this.state.showIndicator} />
      </div>
    );
  }
}

export default withRouter(PasswordSettingPage)