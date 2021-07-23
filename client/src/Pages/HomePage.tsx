import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {Link} from 'react-router-dom';

import {isApiErrorData} from '../Actions/ApiBase';
import Message from '../Components/Message'
import Indicator from '../Components/Indicator'
import TaskStartInputForm from '../Components/TaskStartInputForm'
import RunningTask from '../Components/RunningTask'
import ConfirmDialog from '../Components/ConfirmDialog'
import UserSettingDialog from '../Components/UserSettingDialog'
import RunningTaskEditDialog from '../Components/RunningTaskEditDialog'
import RecordTaskEditDialog from '../Components/RecordTaskEditDialog'
import TaskRecords from '../Components/TaskRecords'
import RecordSummary from '../Components/RecordSummary'

import {getUserInfo, logout} from '../Actions/AuthAction'
import {getActiveSubjects, taskStart, getRunningTask, taskEnd, taskEdit, taskCancel, recordToday, recordEdit, calcToday, StartTaskInfoType, TaskRecordType, CalcResultType} from '../Actions/RecorderAction'
import logo from '../Image/logo.svg';

interface EditTaskType extends startTaskType {
  startTime: string;
  startHour: string;
  startMin: string;
}

interface EditRecordType extends EditTaskType {
  taskId: string;
  endTime: string;
  endHour: string;
  endMin: string;
}

type State = {
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  inputTaskInfo: startTaskType;
  editTaskInfo: EditTaskType;
  editRecordInfo: EditRecordType;
  activeSubjectName: string[];
  todaysTask: todaysTaskType[];
  showIndicator: boolean;
  runningTask: runningTaskType | null;
  showConfirmDialog: boolean;
  showTaskEditDialog: boolean;
  showRecordEditDialog: boolean;
  errMsg: string;
  recordSummary: recordSummaryType[];
  showCopyMsg: boolean;
  showLogoutDialog: boolean;
  showUserSettingDialog: boolean;
  taskCandidateStart: string[];
  taskCandidateEditTask: string[];
  taskCandidateEditRecord: string[];
}

class HomePage extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);

    document.title = "TimeRecorder | ホーム";

    this.state = {
      userInfo: null,
      showIndicator: false,
      inputTaskInfo: {
        taskSubject: '',
        taskName: '',
      },
      editTaskInfo: {
        taskSubject: '',
        taskName: '',
        startTime: '',
        startHour: '',
        startMin: '',
      },
      editRecordInfo: {
        taskId: '',
        taskSubject: '',
        taskName: '',
        startTime: '',
        startHour: '',
        startMin: '',
        endTime: '',
        endHour: '',
        endMin: '',
      },
      activeSubjectName: [],
      todaysTask: [],
      runningTask: null,
      showConfirmDialog: false,
      showTaskEditDialog: false,
      showRecordEditDialog: false,
      errMsg: '',
      recordSummary: [],
      showCopyMsg: false,
      showLogoutDialog: false,
      showUserSettingDialog: false,
      taskCandidateStart: [],
      taskCandidateEditTask: [],
      taskCandidateEditRecord: [],
    };
    this.reload = this.reload.bind(this);
    this.taskStart = this.taskStart.bind(this);
    this.taskEnd = this.taskEnd.bind(this);
    this.taskCancel = this.taskCancel.bind(this);
    this.taskCancelClick = this.taskCancelClick.bind(this);
    this.taskEditClick = this.taskEditClick.bind(this);
    this.taskEdit = this.taskEdit.bind(this);
    this.recordRowClick = this.recordRowClick.bind(this);
    this.recordEdit = this.recordEdit.bind(this);
    this.logout = this.logout.bind(this);
    this.calcTaskCandidate = this.calcTaskCandidate.bind(this);
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
        getActiveSubjects(),
        getRunningTask(),
        recordToday(),
        calcToday(),
      ]);
      const userInfo = response[0];
      const activeSubjects = response[1];
      const runningTask = this.convertRunningTaskResponce(response[2]);
      const todaysRecord = response[3].map((v) => {return this.convertTodaysTaskResponce(v)});
      const recordSummary = response[4].map((v) => {return this.convertCalcResultResponce(v)});

      const activeSubjectName = activeSubjects.map((v) => {return v.name});
      todaysRecord.forEach((v) => {
        if (activeSubjectName.indexOf(v.taskSubject) < 0) {
          activeSubjectName.push(v.taskSubject);
        }
      })

      this.setState({
        userInfo: userInfo,
        activeSubjectName: activeSubjectName,
        runningTask: runningTask,
        todaysTask: todaysRecord,
        recordSummary: recordSummary,
        taskCandidateStart: [],
        taskCandidateEditTask: [],
        taskCandidateEditRecord: [],
  
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

  convertRunningTaskResponce(responce: StartTaskInfoType | null) {
    return responce != null ? {
      taskSubject: responce.task_subject,
      taskName: responce.task_name,
      startTime: responce.start_time,
    } : null;
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

  async taskStart() {
    if (this.state.inputTaskInfo.taskSubject === '') {
      // TODO: エラー表示する
      return
    }
    this.setState({
      showIndicator: true
    })
    const requestParam = {
      task_subject: this.state.inputTaskInfo.taskSubject,
      task_name: this.state.inputTaskInfo.taskName,
    }
    try {
      const responce = await taskStart(requestParam)
      const startTask = this.convertRunningTaskResponce(responce);
      this.setState({
        runningTask: startTask,
        showIndicator: false,
        inputTaskInfo: {
          taskSubject: '',
          taskName: '',
        }
      });
    } catch (e) {
      if (isApiErrorData(e)) {
        if (e.response?.status === 401) {
          console.error('Auth');
          console.log(e.response.data.detail);
          this.props.history.push('/error/401');
        }
        this.setState({
          errMsg: e.response?.data.detail ? e.response?.data.detail : '予期せぬエラーが発生しました。',
        })
      }
    } finally {
      this.setState({
        showIndicator: false,
      })
    }
  }

  async taskEnd() {
    this.setState({
      showIndicator: true
    })
    try {
      await taskEnd();
      await this.reload();
    } catch (e) {
      if (isApiErrorData(e)) {
        if (e.response?.status === 401) {
          console.error('Auth');
          console.log(e.response.data.detail);
          this.props.history.push('/error/401');
        }
        this.setState({
          errMsg: e.response?.data.detail ? e.response?.data.detail : '予期せぬエラーが発生しました。',
        })
      }
    } finally {
      this.setState({
        showIndicator: false,
      })
    }
  }

  taskCancelClick() {
    this.setState({
      showConfirmDialog: true,
    })
  }

  async taskCancel() {
    this.setState({
      showIndicator: true,
      showConfirmDialog: false,
    })
    try {
      await taskCancel();
      await this.reload();
    } catch (e) {
      if (isApiErrorData(e)) {
        if (e.response?.status === 401) {
          console.error('Auth');
          console.log(e.response.data.detail);
          this.props.history.push('/error/401');
        }
        this.setState({
          errMsg: e.response?.data.detail ? e.response?.data.detail : '予期せぬエラーが発生しました。',
        })
      }
    } finally {
      this.setState({
        showIndicator: false,
      })
    }
  }

  taskEditClick() {
    if (this.state.runningTask === null) {
      return;
    }
    const startTime = new Date(Date.parse(this.state.runningTask.startTime));
    const h = startTime.getHours().toString();
    const m = startTime.getMinutes().toString();
    const editInfo = Object.assign({}, this.state.runningTask, {startHour: h, startMin: m});
    this.setState({
      showTaskEditDialog: true,
      editTaskInfo: editInfo,
      taskCandidateEditTask: this.calcTaskCandidate(this.state.runningTask.taskSubject),
    })
  }

  async taskEdit() {
    if (this.state.editTaskInfo.taskSubject === '' || this.state.editTaskInfo.startHour === '' || this.state.editTaskInfo.startMin === '') {
      return;
    }
    this.setState({
      showIndicator: true,
      showTaskEditDialog: false,
    })
    const startTime = new Date(Date.parse(this.state.editTaskInfo.startTime));
    startTime.setHours(Number.parseInt(this.state.editTaskInfo.startHour));
    startTime.setMinutes(Number.parseInt(this.state.editTaskInfo.startMin));
    const startTimeStr = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()} ${startTime.getHours()}:${startTime.getMinutes()}`
    const requestParam = {
      task_subject: this.state.editTaskInfo.taskSubject,
      task_name: this.state.editTaskInfo.taskName,
      start_time: startTimeStr,
    }
    try {
      await taskEdit(requestParam);
      await this.reload();
    } catch (e) {
      if (isApiErrorData(e)) {
        if (e.response?.status === 401) {
          console.error('Auth');
          console.log(e.response.data.detail);
          this.props.history.push('/error/401');
        }
        this.setState({
          errMsg: e.response?.data.detail ? e.response?.data.detail : '予期せぬエラーが発生しました。',
        })
      }
    } finally {
      this.setState({
        showIndicator: false,
      })
    }
  }

  recordRowClick(task: todaysTaskType) {
    const startTime = new Date(Date.parse(task.startTime));
    const startHour = startTime.getHours().toString();
    const startMin = startTime.getMinutes().toString();
    const endTime = new Date(Date.parse(task.endTime));
    const endHour = endTime.getHours().toString();
    const endMin = endTime.getMinutes().toString();
    const editInfo = Object.assign({}, task, {startHour: startHour, startMin: startMin, endHour: endHour, endMin: endMin});
    this.setState({
      showRecordEditDialog: true,
      taskCandidateEditRecord: this.calcTaskCandidate(task.taskSubject),
      editRecordInfo: editInfo,
    })
  }

  async recordEdit() {
    if (this.state.editRecordInfo.taskSubject === '' || this.state.editRecordInfo.startHour === '' || this.state.editRecordInfo.startMin === '' || this.state.editRecordInfo.endHour === '' || this.state.editRecordInfo.endMin === '') {
      return;
    }
    this.setState({
      showIndicator: true,
      showRecordEditDialog: false,
    })
    const startTime = new Date(Date.parse(this.state.editRecordInfo.startTime));
    startTime.setHours(Number.parseInt(this.state.editRecordInfo.startHour));
    startTime.setMinutes(Number.parseInt(this.state.editRecordInfo.startMin));
    const startTimeStr = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()} ${startTime.getHours()}:${startTime.getMinutes()}`
    const endTime = new Date(Date.parse(this.state.editRecordInfo.endTime));
    endTime.setHours(Number.parseInt(this.state.editRecordInfo.endHour));
    endTime.setMinutes(Number.parseInt(this.state.editRecordInfo.endMin));
    const endTimeStr = `${endTime.getFullYear()}-${endTime.getMonth() + 1}-${endTime.getDate()} ${endTime.getHours()}:${endTime.getMinutes()}`
    const requestParam = {
      task_id: this.state.editRecordInfo.taskId,
      task_subject: this.state.editRecordInfo.taskSubject,
      task_name: this.state.editRecordInfo.taskName,
      start_time: startTimeStr,
      end_time: endTimeStr,
    }
    try {
      await recordEdit(requestParam);
      await this.reload();
    } catch (e) {
      if (isApiErrorData(e)) {
        if (e.response?.status === 401) {
          console.error('Auth');
          console.log(e.response.data.detail);
          this.props.history.push('/error/401');
        }
        this.setState({
          errMsg: e.response?.data.detail ? e.response?.data.detail : '予期せぬエラーが発生しました。',
        })
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

  calcTaskCandidate(subject: string) {
    const taskCandidate: string[] = []
    this.state.todaysTask.filter((v) => {
      return v.taskSubject === subject;
    }).forEach((w) => {
      if (taskCandidate.indexOf(w.taskName) < 0) {
        taskCandidate.push(w.taskName);
      }
    })

    return taskCandidate;
  }

  render() {
    const txt = this.state.userInfo === null ? '' : `${this.state.userInfo.name} さん`

    const inputSpaceElement = this.state.runningTask === null ? (
      <TaskStartInputForm
        taskSubject={this.state.inputTaskInfo.taskSubject}
        taskName={this.state.inputTaskInfo.taskName}
        suggestList={this.state.activeSubjectName}
        taskCandidate={this.state.taskCandidateStart}
        onChangeSubject={(e: React.ChangeEvent<HTMLInputElement>) => {
          this.setState({
            inputTaskInfo: {taskSubject: e.target.value, taskName: this.state.inputTaskInfo.taskName},
            taskCandidateStart: this.calcTaskCandidate(e.target.value),
          });
        }}
        onChangeName={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({inputTaskInfo: {taskSubject: this.state.inputTaskInfo.taskSubject, taskName: e.target.value}})}}
        onSubmit={this.taskStart}
      />
    ) : (
      <RunningTask
        runningTask={this.state.runningTask}
        onCancel={this.taskCancelClick}
        onEdit={this.taskEditClick}
        onEnd={this.taskEnd}
      />
    )

    const confirmDialogElement = this.state.showConfirmDialog ? (
      <ConfirmDialog message="タスクをキャンセルします。よろしいですか。" onCancel={() => {this.setState({showConfirmDialog: false})}} onSubmit={this.taskCancel} />
    ) : '';

    const runningTaskEditDialogElement = this.state.showTaskEditDialog ? (
      <RunningTaskEditDialog
        taskSubject={this.state.editTaskInfo.taskSubject}
        taskName={this.state.editTaskInfo.taskName}
        startHour={this.state.editTaskInfo.startHour}
        startMin={this.state.editTaskInfo.startMin}
        suggestList={this.state.activeSubjectName}
        taskCandidate={this.state.taskCandidateEditTask}
        onChangeSubject={(e: React.ChangeEvent<HTMLInputElement>) => {
          this.setState({
            editTaskInfo: Object.assign({}, this.state.editTaskInfo, {taskSubject: e.target.value}),
            taskCandidateEditTask: this.calcTaskCandidate(e.target.value), 
          })
        }}
        onChangeName={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editTaskInfo: Object.assign({}, this.state.editTaskInfo, {taskName: e.target.value})})}}
        onChangeHour={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editTaskInfo: Object.assign({}, this.state.editTaskInfo, {startHour: e.target.value})})}}
        onChangeMin={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editTaskInfo: Object.assign({}, this.state.editTaskInfo, {startMin: e.target.value})})}}
        onCancel={() => {this.setState({showTaskEditDialog: false})}}
        onSubmit={this.taskEdit}
      />
    ) : '';

    const RecordTaskEditDialogElement = this.state.showRecordEditDialog ? (
      <RecordTaskEditDialog
        taskSubject={this.state.editRecordInfo.taskSubject}
        taskName={this.state.editRecordInfo.taskName}
        startHour={this.state.editRecordInfo.startHour}
        startMin={this.state.editRecordInfo.startMin}
        endHour={this.state.editRecordInfo.endHour}
        endMin={this.state.editRecordInfo.endMin}
        suggestList={this.state.activeSubjectName}
        taskCandidate={this.state.taskCandidateEditRecord}
        onChangeSubject={(e: React.ChangeEvent<HTMLInputElement>) => {
          this.setState({
            editRecordInfo: Object.assign({}, this.state.editRecordInfo, {taskSubject: e.target.value}),
            taskCandidateEditRecord: this.calcTaskCandidate(e.target.value),
          })
        }}
        onChangeName={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editRecordInfo: Object.assign({}, this.state.editRecordInfo, {taskName: e.target.value})})}}
        onChangeStartHour={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editRecordInfo: Object.assign({}, this.state.editRecordInfo, {startHour: e.target.value})})}}
        onChangeStartMin={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editRecordInfo: Object.assign({}, this.state.editRecordInfo, {startMin: e.target.value})})}}
        onChangeEndHour={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editRecordInfo: Object.assign({}, this.state.editRecordInfo, {endHour: e.target.value})})}}
        onChangeEndMin={(e: React.ChangeEvent<HTMLInputElement>) => {this.setState({editRecordInfo: Object.assign({}, this.state.editRecordInfo, {endMin: e.target.value})})}}
        onCancel={() => {this.setState({showRecordEditDialog: false})}}
        onSubmit={this.recordEdit}
      />
    ) : '';

    const logoutDialogElem = this.state.showLogoutDialog ? (
      <ConfirmDialog message="ログアウトします。よろしいですか。" onCancel={() => {this.setState({showLogoutDialog: false})}} onSubmit={this.logout} />
    ) : '';

    const userSettingDialogElem = this.state.showUserSettingDialog ? (
      <UserSettingDialog onClose={() => {this.setState({showUserSettingDialog: false})}} />
    ) : '';

    return (
      <div id="main-page" className="indicator-parent">
        <h1><img src={logo} className="logo" alt="logo" />業務履歴登録</h1>
        <div className="header-menu">
          <div>
            {txt}
          </div>
          <div className="icon-space">
            <Link to="/calc">
              <div className="icon-graph" title="集計画面へ"/>
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
        {this.state.errMsg !== '' ? <Message value={this.state.errMsg} type="error" /> : ''}
        {inputSpaceElement}
        {confirmDialogElement}

        <h2>本日の業務記録</h2>
        <div className="record-space">
          <div className="record-history">
            <h3>業務履歴</h3>
            <TaskRecords todaysTask={this.state.todaysTask} onClick={this.recordRowClick}/>
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

        {runningTaskEditDialogElement}
        {RecordTaskEditDialogElement}
        {userSettingDialogElem}
        {logoutDialogElem}
        <Indicator show={this.state.showIndicator} />
      </div>
    )
  }
}

export default withRouter(HomePage)
