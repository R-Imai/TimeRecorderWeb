import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {Link} from 'react-router-dom';
import logo from '../Image/logo.svg';

import Indicator from '../Components/Indicator'
import {isApiErrorData} from '../Actions/ApiBase';
import {getUserInfo, logout} from '../Actions/AuthAction'
import {getSubject, updateSubject, deleteSubject, addSubject, SubjectType} from '../Actions/RecorderAction';

import ConfirmDialog from '../Components/ConfirmDialog'
import UserSettingDialog from '../Components/UserSettingDialog'
import SubjectList from '../Components/SubjectList';

type State = {
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  addSubjectInfo: {
    name: string,
    color: string,
    sortVal: number,
    isActive: true,
  },
  subjectList: subjectType[],
  showIndicator: boolean,
  deleteSubjectInfo: subjectType | null,
  showLogoutDialog: boolean;
  showUserSettingDialog: boolean;
}

class SubjectSettingPage extends React.Component<RouteComponentProps , State> {
  constructor(props: RouteComponentProps) {
    super(props);
    
    document.title = "TimeRecorder | 作業ジャンル設定";

    this.state = {
      userInfo: null,
      subjectList: [],
      showIndicator: false,
      deleteSubjectInfo: null,
      addSubjectInfo: {
        name: '',
        color: '#000000',
        sortVal: 0,
        isActive: true,
      },
      showLogoutDialog: false,
      showUserSettingDialog: false,
    };
    this.convertSubjectListResponce = this.convertSubjectListResponce.bind(this);
    this.onMoveSubject = this.onMoveSubject.bind(this);
    this.onMoveActiveSubject = this.onMoveActiveSubject.bind(this);
    this.onMoveDeactiveSubject = this.onMoveDeactiveSubject.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeColor = this.onChangeColor.bind(this);
    this.onSubmitColor = this.onSubmitColor.bind(this);
    this.subjctDelete = this.subjctDelete.bind(this);
    this.onSubjectAdd = this.onSubjectAdd.bind(this);
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
      const response = await Promise.all([
        getUserInfo(),
        getSubject(),
      ]);
      const userInfo = response[0];
      const subjectList = response[1].map((v) => {return this.convertSubjectListResponce(v)});
      const addSubjectInfo = Object.assign({}, this.state.addSubjectInfo);
      addSubjectInfo.sortVal = subjectList[subjectList.length - 1].sortVal + 1;

      this.setState({
        userInfo: userInfo,
        subjectList: subjectList,
        addSubjectInfo: addSubjectInfo,
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

  convertSubjectListResponce(subj: SubjectType) {
    return {
      name: subj.name,
      color: subj.color,
      sortVal: subj.sort_val,
      isActive: subj.is_active,
      subjectId: subj.subject_id,
    }
  }

  async updateSubject(subj: subjectType) {
    const requestParam = {
      name: subj.name,
      color: subj.color,
      sort_val: subj.sortVal,
      is_active: subj.isActive,
      subject_id: subj.subjectId,
    }
    await updateSubject(requestParam);
  }

  async onMoveSubject(oldIndex:number, newIndex:number, subjList: subjectType[]) {
    const targetSubject = Object.assign({}, subjList[oldIndex]);

    const newSortVal = subjList[newIndex].sortVal;

    targetSubject.sortVal = newSortVal;

    this.setState({
      showIndicator: true,
    })

    await this.updateSubject(targetSubject);
    await this.reload();

  }

  onMoveActiveSubject(oldIndex:number, newIndex:number) {
    const activeSubjects = this.state.subjectList.filter((subj) => {return subj.isActive});
    this.onMoveSubject(oldIndex, newIndex, activeSubjects);
  }

  onMoveDeactiveSubject(oldIndex:number, newIndex:number) {
    const deactiveSubjects = this.state.subjectList.filter((subj) => {return !subj.isActive});
    this.onMoveSubject(oldIndex, newIndex, deactiveSubjects);
  }

  async onChangeState(subjectInfo:subjectType) {
    subjectInfo.isActive = !subjectInfo.isActive;
    this.setState({
      showIndicator: true,
    })

    await this.updateSubject(subjectInfo);
    await this.reload();
  }

  async onChangeColor(subjectInfo:subjectType, color:string) {
    subjectInfo.color = color;
    const newSubjectList = this.state.subjectList.map((s) => {
      return s.subjectId === subjectInfo.subjectId ? subjectInfo : s
    })
    this.setState({
      subjectList: newSubjectList
    })
  }

  async onSubmitColor(subjectInfo:subjectType) {
    this.setState({
      showIndicator: true,
    })

    await this.updateSubject(subjectInfo);
    await this.reload();
  }

  async subjctDelete() {
    if (!this.state.deleteSubjectInfo) {
      return;
    }
    const id = this.state.deleteSubjectInfo.subjectId;
    this.setState({
      showIndicator: true,
      deleteSubjectInfo: null,
    })
    await deleteSubject(id);
    await this.reload();
  }

  async onSubjectAdd() {
    if (this.state.addSubjectInfo.name === '') {
      return;
    }
    const param = {
      name: this.state.addSubjectInfo.name,
      color: this.state.addSubjectInfo.color,
      sort_val: this.state.addSubjectInfo.sortVal,
      is_active: this.state.addSubjectInfo.isActive,
    }
    this.setState({
      showIndicator: true,
      addSubjectInfo: {
        name: '',
        color: '#000000',
        sortVal: this.state.addSubjectInfo.sortVal + 1,
        isActive: true,
      },
    })
    await addSubject(param);
    await this.reload();
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
    const activeSubjects = this.state.subjectList.filter((subj) => {return subj.isActive});
    const deactiveSubjects = this.state.subjectList.filter((subj) => {return !subj.isActive});

    const confirmDialogElement = this.state.deleteSubjectInfo ? (
      <ConfirmDialog message={`${this.state.deleteSubjectInfo.name}を削除します。よろしいですか。`} onCancel={() => {this.setState({deleteSubjectInfo: null})}} onSubmit={this.subjctDelete} />
    ) : '';

    const logoutDialogElem = this.state.showLogoutDialog ? (
      <ConfirmDialog message="ログアウトします。よろしいですか。" onCancel={() => {this.setState({showLogoutDialog: false})}} onSubmit={this.logout} />
    ) : '';
    const userSettingDialogElem = this.state.showUserSettingDialog ? (
      <UserSettingDialog onClose={() => {this.setState({showUserSettingDialog: false})}} />
    ) : '';

    return (
      <div id="subject-setting-page" className="indicator-parent">
        <h1><img src={logo} className="logo" alt="logo" />作業ジャンル設定</h1>
        <div className="header-menu">
          <div>タスクの大まかなジャンルを定義することで、記録時に候補として表示します。</div>
          <div className="icon-space">
            <Link to="/home">
              <div className="icon-home" title="記録画面へ"/>
            </Link>
            <Link to="/calc">
              <div className="icon-graph" title="集計画面へ"/>
            </Link>
            <span className="link" onClick={() => {this.setState({showUserSettingDialog: true})}}>
              <div className="icon-user" title="ユーザ設定"/>
            </span>
            <span className="link" onClick={() => {this.setState({showLogoutDialog: true})}}>
              <div className="icon-exit" title="ログアウト"/>
            </span>
          </div>
        </div>
        <div className="subject-setting-space">
          <div className="list-space">
            <h2>有効</h2>
            <SubjectList
              id="active-subject-list"
              className="active"
              subjectList={activeSubjects}
              onChange={this.onMoveActiveSubject}
              onStateChange={this.onChangeState}
              onChangeColor={this.onChangeColor}
              onSubmitColor={this.onSubmitColor}
            />
            <div className="subject-add-form">
              <input
                type="text"
                className="subjct-name"
                value={this.state.addSubjectInfo.name}
                onChange={(e) => {this.setState({addSubjectInfo: Object.assign(this.state.addSubjectInfo, {name: e.target.value})})}}
              />
              <input
                type="color"
                className="subjct-color"
                value={this.state.addSubjectInfo.color}
                onChange={(e) => {this.setState({addSubjectInfo: Object.assign(this.state.addSubjectInfo, {color: e.target.value})})}}
              />
              <button
                onClick={this.onSubjectAdd}
              >
                追加
              </button>
            </div>
          </div>
          <div className="list-space">
            <h2>無効</h2>
            <SubjectList
              id="deactive-subject-list"
              className="deactive"
              subjectList={deactiveSubjects}
              onChange={this.onMoveDeactiveSubject}
              onStateChange={this.onChangeState}
              onChangeColor={this.onChangeColor}
              onSubmitColor={this.onSubmitColor}
              onClickDelete={(s) => {this.setState({deleteSubjectInfo: s})}}
            />
          </div>
        </div>
        {confirmDialogElement}
        {logoutDialogElem}
        {userSettingDialogElem}
        <Indicator show={this.state.showIndicator} />
      </div>
    );
  }
}

export default withRouter(SubjectSettingPage)
