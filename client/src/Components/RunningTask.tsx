import React from 'react';


type Props = {
  runningTask: runningTaskType,
  onCancel: () => void,
  onEdit: () => void,
  onEnd: () => void,
}

const zeroPadding = (val: number, length: number) => {
  return val.toString().padStart(length, '0');
}

const displayTime = (timeStr: string) => {
  const time = new Date(Date.parse(timeStr));
  return `${zeroPadding(time.getHours(), 2)}:${zeroPadding(time.getMinutes(), 2)} ～ `
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
          {displayTime(props.runningTask.startTime)}
        </div>
      </div>
      <div className="btn-space">
        <button className="cancel" onClick={props.onCancel}>
          タスクキャンセル
        </button>
        <button className="edit" onClick={props.onEdit}>
          編集
        </button>
        <button className="end" onClick={props.onEnd}>
          タスク完了
        </button>
      </div>
    </div>
  );
}

export default RunningTask
