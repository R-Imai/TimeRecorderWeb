import React from 'react';

import TaskInputForm from './TaskInputForm';

type Props = {
  id?: string,
  taskSubject: string,
  taskName: string,
  suggestList: string[],
  taskCandidate?: string[],
  onChangeSubject: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: () => void,
}

const TaskStartInputForm: React.FC<Props> = (props: Props) => {

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onSubmit();
  }

  const id = props.id ? props.id : 'task-start';

  return (
    <div className="task-input-form">
      <TaskInputForm
        id={id}
        taskSubject={props.taskSubject}
        taskName={props.taskName}
        suggestList={props.suggestList}
        taskCandidate={props.taskCandidate}
        onChangeSubject={props.onChangeSubject}
        onChangeName={props.onChangeName}
      >
        <div className="btn-space">
          <button className="submit" type="submit" onClick={onSubmit}>
            タスク開始
          </button>
        </div>
      </TaskInputForm>
    </div>
  );
}

export default TaskStartInputForm
