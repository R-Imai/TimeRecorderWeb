import React from 'react';

import TaskInputForm from './TaskInputForm';

type Props = {
  taskSubject: string,
  taskName: string,
  startHour: string,
  startMin: string,
  endHour: string,
  endMin: string,
  suggestList: string[],
  onChangeSubject: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeStartHour: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeStartMin: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeEndHour: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeEndMin: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onCancel: () => void,
  onSubmit: () => void,
}

const RecordTaskEditDialog: React.FC<Props> = (props: Props) => {
  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onSubmit();
  }

  return (
    <div className="dialog">
      <div className="dialog-main task-input-form">
        <h1>
          タスク履歴修正
        </h1>
        <TaskInputForm
          className="dialog-content"
          taskSubject={props.taskSubject}
          taskName={props.taskName}
          startHour={props.startHour}
          startMin={props.startMin}
          endHour={props.endHour}
          endMin={props.endMin}
          suggestList={props.suggestList}
          onChangeSubject={props.onChangeSubject}
          onChangeName={props.onChangeName}
          onChangeStartHour={props.onChangeStartHour}
          onChangeStartMin={props.onChangeStartMin}
          onChangeEndHour={props.onChangeEndHour}
          onChangeEndMin={props.onChangeEndMin}
        >
          <div className="btn-space">
            <button type="button" className="cancel" onClick={props.onCancel}>
              キャンセル
            </button>
            <button type="submit" className="decision" onClick={onSubmit} disabled={props.taskSubject === '' || props.startHour === '' || props.startMin === '' || props.endHour === '' || props.endMin === ''}>
              決定
            </button>
          </div>
        </TaskInputForm>
      </div>
    </div>
  );
}

export default RecordTaskEditDialog
