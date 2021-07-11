import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {Link} from 'react-router-dom';
import logo from '../Image/logo.svg';

import Indicator from '../Components/Indicator'
import {isApiErrorData} from '../Actions/ApiBase';
import {getUserInfo} from '../Actions/AuthAction'
import {getSubject, updateSubject, SubjectType} from '../Actions/RecorderAction';

import SubjectList from '../Components/SubjectList';

type State = {
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  subjectList: subjectType[],
  showIndicator: boolean,
}

class SubjectSettingPage extends React.Component<RouteComponentProps , State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      userInfo: null,
      subjectList: [],
      showIndicator: false,
    };
    this.convertSubjectListResponce = this.convertSubjectListResponce.bind(this);
    this.onMoveSubject = this.onMoveSubject.bind(this);
    this.onMoveActiveSubject = this.onMoveActiveSubject.bind(this);
    this.onMoveDeactiveSubject = this.onMoveDeactiveSubject.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeColor = this.onChangeColor.bind(this);
    this.onSubmitColor = this.onSubmitColor.bind(this);
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

      this.setState({
        userInfo: userInfo,
        subjectList: subjectList,
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

  render() {
    const activeSubjects = this.state.subjectList.filter((subj) => {return subj.isActive});
    const deactiveSubjects = this.state.subjectList.filter((subj) => {return !subj.isActive});
    return (
      <div id="subject-setting-page" className="indicator-parent">
        <h1><img src={logo} className="logo" alt="logo" />作業ジャンル設定</h1>
        <Link to="/home">Home</Link>
        <div style={{display: "flex"}}>
          <div className="list-space">
            <h2>有効</h2>
            <SubjectList
              id="acvive-subject-list"
              className="acvive"
              subjectList={activeSubjects}
              onChange={this.onMoveActiveSubject}
              onStateChange={this.onChangeState}
              onChangeColor={this.onChangeColor}
              onSubmitColor={this.onSubmitColor}
            />
          </div>
          <div className="list-space">
            <h2>無効</h2>
            <SubjectList
              id="deacvive-subject-list"
              className="deactive"
              subjectList={deactiveSubjects}
              onChange={this.onMoveDeactiveSubject}
              onStateChange={this.onChangeState}
              onChangeColor={this.onChangeColor}
              onSubmitColor={this.onSubmitColor}
            />
          </div>
        </div>
        <Indicator show={this.state.showIndicator} />
      </div>
    );
  }
}

export default withRouter(SubjectSettingPage)
