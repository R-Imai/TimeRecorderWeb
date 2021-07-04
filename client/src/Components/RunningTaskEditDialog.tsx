import React from 'react';

import TaskInputForm from './TaskInputForm';

type Props = {
  taskSubject: string,
  taskName: string,
  startHour: string,
  startMin: string,
  suggestList: string[],
  onChangeSubject: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeHour: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeMin: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onCancel: () => void,
  onSubmit: () => void,
}

const RunningTaskEditDialog: React.FC<Props> = (props: Props) => {
  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onSubmit();
  }

  return (
    <div className="dialog">
      <div className="dialog-main task-input-form">
        <h1>
          実行中タスク編集
        </h1>
        <TaskInputForm
          className="dialog-content"
          taskSubject={props.taskSubject}
          taskName={props.taskName}
          startHour={props.startHour}
          startMin={props.startMin}
          suggestList={props.suggestList}
          onChangeSubject={props.onChangeSubject}
          onChangeName={props.onChangeName}
          onChangeStartHour={props.onChangeHour}
          onChangeStartMin={props.onChangeMin}
        >
          <div className="btn-space">
            <button type="button" className="cancel" onClick={props.onCancel}>
              キャンセル
            </button>
            <button type="submit" className="decision" onClick={onSubmit} disabled={props.taskSubject === '' || props.startHour === '' || props.startMin === ''}>
              決定
            </button>
          </div>
        </TaskInputForm>
      </div>
    </div>
  );
}

export default RunningTaskEditDialog
