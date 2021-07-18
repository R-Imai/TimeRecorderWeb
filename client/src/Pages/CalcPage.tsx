import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import {getUserInfo, logout} from '../Actions/AuthAction'
import {calcMonthGraph} from '../Actions/RecorderAction';
import logo from '../Image/logo.svg';
import {isApiErrorData} from '../Actions/ApiBase';
import Indicator from '../Components/Indicator'
import ConfirmDialog from '../Components/ConfirmDialog'

type State = {
  graphPath: string,
  showIndicator: boolean,
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  showLogoutDialog: boolean;
}

class Calc extends React.Component<RouteComponentProps , State> {
  constructor(props: RouteComponentProps) {
    super(props);
    
    document.title = "TimeRecorder | 集計";

    this.state = {
      graphPath: '',
      showIndicator: false,
      userInfo: null,
      showLogoutDialog: false,
    };
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    await this.reload();
  }

  async reload() {
    this.setState({
      showIndicator: true
    })
    try {
      const date = new Date().getTime()
      const response = await Promise.all([
        getUserInfo(),
        calcMonthGraph(),
      ]);
      const userInfo = response[0];
      const graphPath = `${response[1].path}?_=${date}`;

      this.setState({
        userInfo: userInfo,
        graphPath: graphPath,
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

  render() {
    
    const logoutDialogElem = this.state.showLogoutDialog ? (
      <ConfirmDialog message="ログアウトします。よろしいですか。" onCancel={() => {this.setState({showLogoutDialog: false})}} onSubmit={this.logout} />
    ) : '';

    return (
      <div id="calc-page" className="indicator-parent">
        <h1><img src={logo} className="logo" alt="logo" />集計</h1>
        <div className="header-menu">
          <div>活動記録を集計します。</div>
          <div className="icon-space">
            <Link to="/home">
              <div className="icon-home" title="記録画面へ"/>
            </Link>
            <Link to="/setting/subject">
              <div className="icon-setting" title="作業ジャンル設定画面へ"/>
            </Link>
            <span className="logout-btn" onClick={() => {this.setState({showLogoutDialog: true})}}>
              <div className="icon-exit" title="ログアウト"/>
            </span>
          </div>
        </div>
        <div className="image-space">
          <h2>今月の稼働状況</h2>
          <img src={this.state.graphPath} alt="今月の稼働割合グラフ"/>
        </div>
        {logoutDialogElem}
        <Indicator show={this.state.showIndicator} />
      </div>
    );
  }
}

export default withRouter(Calc)
