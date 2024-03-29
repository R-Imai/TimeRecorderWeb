import React from 'react';


type Props = {
  todaysTask: todaysTaskType[];
  onClick?: (task: todaysTaskType) => void;
}

const zeroPadding = (val: number, length: number) => {
  return val.toString().padStart(length, '0');
}

const displayTime = (timeStr: string) => {
  const time = new Date(Date.parse(timeStr));
  return `${zeroPadding(time.getHours(), 2)}:${zeroPadding(time.getMinutes(), 2)}`
}

const TaskRecords: React.FC<Props> = (props: Props) => {

  const onClick = props.onClick ? props.onClick : (t: todaysTaskType) => {}

  const taskList = props.todaysTask.map((task) => {
    return (
      <li key={task.taskId} onClick={() => {onClick(task)}} className={props.onClick ? 'hover' : ''}>
        <span className="time">{displayTime(task.startTime)} - {displayTime(task.endTime)}</span>
        <span className="subject">{task.taskSubject}</span>
        <span className="name">{task.taskName}</span>
      </li>
    )
  });

  const mainElem = props.todaysTask.length !== 0 ? (
    <ul>
      {taskList}
    </ul>
  ):(
    <div className="message mt-10">業務履歴はありません。</div>
  );

  return (
    <div className="task-records">
      {mainElem}
    </div>
  );
}

export default TaskRecords
