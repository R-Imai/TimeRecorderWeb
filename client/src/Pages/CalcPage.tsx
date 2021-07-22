import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import {getUserInfo, logout} from '../Actions/AuthAction'
import {calcMonthGraph, calcDaily, getRecord, TaskRecordType, CalcResultType} from '../Actions/RecorderAction';
import logo from '../Image/logo.svg';
import {isApiErrorData} from '../Actions/ApiBase';
import Indicator from '../Components/Indicator'
import ConfirmDialog from '../Components/ConfirmDialog'
import UserSettingDialog from '../Components/UserSettingDialog'
import Message from '../Components/Message'
import TaskRecords from '../Components/TaskRecords'
import RecordSummary from '../Components/RecordSummary'

type State = {
  graphPath: string,
  showIndicator: boolean,
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  showLogoutDialog: boolean;
  showUserSettingDialog: boolean;
  dailyTask: todaysTaskType[];
  showCopyMsg: boolean;
  recordSummary: recordSummaryType[];
  calcTaskSummaryDate: string;
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
      showUserSettingDialog: false,
      dailyTask: [],
      showCopyMsg: false,
      recordSummary: [],
      calcTaskSummaryDate: '',
    };
    this.logout = this.logout.bind(this);
    this.onClickCalcDaily = this.onClickCalcDaily.bind(this);
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

  async onClickCalcDaily(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (this.state.calcTaskSummaryDate === '') {
      return;
    }
    this.setState({
      showIndicator: true,
    })
    const response = await Promise.all([
      getRecord(this.state.calcTaskSummaryDate),
      calcDaily(this.state.calcTaskSummaryDate),
    ]);
    this.setState({
      showIndicator: false,
      dailyTask: response[0].map((v) => {return this.convertTodaysTaskResponce(v)}),
      recordSummary: response[1].map((v) => {return this.convertCalcResultResponce(v)}),
    })
  }

  convertTodaysTaskResponce(responce: TaskRecordType) {
    return {
      taskId: responce.task_id,
      taskSubject: responce.task_subject,
      taskName: responce.task_name,
      startTime: responce.start_time,
      endTime: responce.end_time,
    };
  }

  convertCalcResultResponce(responce: CalcResultType) {
    return {
      taskSubject: responce.task_subject,
      taskName: responce.task_name,
      passedSecond: responce.passed_second,
      passedTimeStr: responce.passed_time_str,
    };
  }

  render() {
    
    const logoutDialogElem = this.state.showLogoutDialog ? (
      <ConfirmDialog message="ログアウトします。よろしいですか。" onCancel={() => {this.setState({showLogoutDialog: false})}} onSubmit={this.logout} />
    ) : '';
    const userSettingDialogElem = this.state.showUserSettingDialog ? (
      <UserSettingDialog onClose={() => {this.setState({showUserSettingDialog: false})}} />
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
            <span className="link" onClick={() => {this.setState({showUserSettingDialog: true})}}>
              <div className="icon-user" title="ユーザ設定"/>
            </span>
            <span className="link" onClick={() => {this.setState({showLogoutDialog: true})}}>
              <div className="icon-exit" title="ログアウト"/>
            </span>
          </div>
        </div>
        <h2>過去の業務記録参照</h2>
        <form className="calc-date-input">
          <input value={this.state.calcTaskSummaryDate} type="date" onChange={(e) => {this.setState({calcTaskSummaryDate: e.target.value})}}/>
          <button onClick={this.onClickCalcDaily}>参照</button>
        </form>
        <div className="record-space">
          <div className="record-history">
            <h3>業務履歴</h3>
            <TaskRecords todaysTask={this.state.dailyTask} />
          </div>
          <div className="record-summary">
            <h3>集計結果</h3>
            {this.state.showCopyMsg ? <Message type="info" value="コピーしました" /> : ''}
            <RecordSummary summaryData={this.state.recordSummary} onCopySuccess={() => {
              this.setState({showCopyMsg: true});
              setTimeout(() => {
                this.setState({showCopyMsg: false});
              }, 3000);
            }}/>
          </div>
        </div>
        <div className="image-space">
          <h2>今月の稼働状況</h2>
          <img src={this.state.graphPath} alt="今月の稼働割合グラフ"/>
        </div>
        {logoutDialogElem}
        {userSettingDialogElem}
        <Indicator show={this.state.showIndicator} />
      </div>
    );
  }
}

export default withRouter(Calc)
