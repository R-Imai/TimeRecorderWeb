import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {Link} from 'react-router-dom';

import Indicator from '../Components/Indicator'
import TaskInputForm from '../Components/TaskInputForm'
import RunningTask from '../Components/RunningTask'

import {getUserInfo} from '../Actions/AuthAction'
import {getActiveSubjects, taskStart, getRunningTask, StartTaskInfoType} from '../Actions/RecorderAction'
import logo from '../Image/logo.svg';

type State = {
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  inputTaskInfo: startTaskType;
  activeSubjectName: string[];
  showIndicator: boolean;
  runningTask: runningTaskType | null;
}

class HomePage extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      userInfo: null,
      showIndicator: false,
      inputTaskInfo: {
        taskSubject: '',
        taskName: '',
      },
      activeSubjectName: [],
      runningTask: null,
    };
    this.taskStart = this.taskStart.bind(this);
  }

  async componentDidMount() {
    this.setState({
      showIndicator: true
    })
    const response = await Promise.all([
      getUserInfo(),
      getActiveSubjects(),
      getRunningTask(),
    ]);
    // TODO: エラーハンドリング
    const userInfo = response[0];
    const activeSubjects = response[1];
    const runningTask = this.convertRunningTaskResponce(response[2]);

    this.setState({
      userInfo: userInfo,
      activeSubjectName: activeSubjects.map((v) => {return v.name}),
      showIndicator: false,
      runningTask: runningTask,
    })
  }

  convertRunningTaskResponce(responce: StartTaskInfoType | null) {
    return responce != null ? {
      taskSubject: responce.task_subject,
      taskName: responce.task_name,
      startTime: responce.start_time,
    } : null;
  }

  async taskStart() {
    if (this.state.inputTaskInfo.taskSubject === '') {
      // TODO: エラー表示する
      return
    }
    const requestParam = {
      task_subject: this.state.inputTaskInfo.taskSubject,
      task_name: this.state.inputTaskInfo.taskName,
    }
    const responce = await taskStart(requestParam)
    const startTask = this.convertRunningTaskResponce(responce);
    this.setState({
      runningTask: startTask,
    });
  }

  render() {
    const txt = this.state.userInfo === null ? '' : `ようこそ ${this.state.userInfo.name} さん`

    const inputSpaceElement = this.state.runningTask === null ? (
      <TaskInputForm
        taskSubject={this.state.inputTaskInfo.taskSubject}
        taskName={this.state.inputTaskInfo.taskName}
        suggestList={this.state.activeSubjectName}
        onChangeSubject={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({inputTaskInfo: {taskSubject: e.target.value, taskName: this.state.inputTaskInfo.taskName}})}}
        onChangeName={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({inputTaskInfo: {taskSubject: this.state.inputTaskInfo.taskSubject, taskName: e.target.value}})}}
        onSubmit={this.taskStart}
      />
    ) : (
      <RunningTask
        runningTask={this.state.runningTask}
        onCancel={() => {console.log("TODO: cancel")}}
        onEnd={() => {console.log("TODO: end")}}
      />
    )

    return (
      <div id="main-page" className="indicator-parent">
        <h1><img src={logo} className="logo" alt="logo" />業務履歴登録</h1>
        <div>{txt}</div>
        {inputSpaceElement}
        <Indicator show={this.state.showIndicator} />
      </div>
    )
  }
}

export default withRouter(HomePage)
