import React from 'react';


type Props = {
  runningTask: runningTaskType,
  onCancel: () => void,
  onEnd: () => void,
}

const RunningTask: React.FC<Props> = (props: Props) => {

  return (
    <div className="running-task-form">
      <div className="task-info">
        <div className="subject-info">
          <div className="subject">
            {props.runningTask.taskSubject}
          </div>
          <div className="name">
            {props.runningTask.taskName}
          </div>
        </div>
        <div className="start-time">
          {props.runningTask.startTime}
        </div>
      </div>
      <div className="btn-space">
        <button className="cancel">
          タスクキャンセル
        </button>
        <button className="end">
          タスク完了
        </button>
      </div>
    </div>
  );
}

export default RunningTask
