import React from 'react';


type Props = {
  taskSubject: string,
  taskName: string,
  suggestList: string[],
  onChangeSubject: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSubmit: () => void,
}

const TaskInputForm: React.FC<Props> = (props: Props) => {

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.onSubmit();
  }

  const suggestListElements = props.suggestList.map((v) => {
    return (<option value={v} key={v} />)
  })

  return (
    <div className="task-input-form">
      <form>
        <label
          htmlFor="task-input-form-subject"
          className="label"
        >
          作業ジャンル
        </label>
        <div className="tag-required">
          必須
        </div>
        <input
          id="task-input-form-subject"
          value={props.taskSubject}
          onChange={props.onChangeSubject}
          placeholder="作業ジャンル"
          className="input-form"
          type="text"
          list="subject-sudgest"
        />
        <datalist id="subject-sudgest">
          {suggestListElements}
        </datalist>
        <label
          htmlFor="task-input-form-name"
          className="label"
        >
          作業名
        </label>
        <input
          id="task-input-form-name"
          value={props.taskName}
          onChange={props.onChangeName}
          placeholder="作業名"
          className="input-form"
          type="text"
        />
        <div className="btn-space">
          <button className="submit" type="submit" onClick={onSubmit}>
            タスク開始
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskInputForm
