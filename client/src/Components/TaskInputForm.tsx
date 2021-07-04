import React from 'react';

type Props = {
  className?: string,
  taskSubject: string,
  taskName: string,
  startHour?: string,
  startMin?: string,
  endHour?: string,
  endMin?: string,
  suggestList: string[],
  onChangeSubject: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeStartHour?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeStartMin?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeEndHour?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onChangeEndMin?: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

const isShowTimeInput = (hour?: string, min?: string, onChangeHour?: (e: React.ChangeEvent<HTMLInputElement>) => void, onChangeMin?: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
  return typeof hour !== 'undefined' && typeof min !== 'undefined' && typeof onChangeHour !== 'undefined' && typeof onChangeMin !== 'undefined';
}

const TaskInputForm: React.FC<Props> = (props: Props) => {
  const suggestListElements = props.suggestList.map((v) => {
    return (<option value={v} key={v} />)
  })

  const startTimeElement = isShowTimeInput(props.startHour, props.startMin, props.onChangeStartHour, props.onChangeStartMin) ? (
    <div>
      <label
        htmlFor="task-input-form-start-hour"
        className="label"
      >
        開始時刻
      </label>
      <div className="tag-required">
        必須
      </div>
      <fieldset className="task-input-form-time start">
        <input
          id="task-input-form-start-hour"
          value={props.startHour}
          onChange={props.onChangeStartHour}
          placeholder="開始時"
          type="number"
          min="0"
          max="23"
        />:
        <input
          id="task-input-form-start-min"
          value={props.startMin}
          onChange={props.onChangeStartMin}
          placeholder="開始分"
          type="number"
          min="0"
          max="59"
        />
      </fieldset>
    </div>
  ) : '';

  const endTimeElement = isShowTimeInput(props.endHour, props.endMin, props.onChangeEndHour, props.onChangeEndMin) ? (
    <div>
      <label
        htmlFor="task-input-form-end-hour"
        className="label"
      >
        終了時刻
      </label>
      <div className="tag-required">
        必須
      </div>
      <fieldset className="task-input-form-time">
        <input
          id="task-input-form-end-hour"
          value={props.endHour}
          onChange={props.onChangeEndHour}
          placeholder="終了時"
          type="number"
          min="0"
          max="23"
        />:
        <input
          id="task-input-form-end-min"
          value={props.endMin}
          onChange={props.onChangeEndMin}
          placeholder="終了分"
          type="number"
          min="0"
          max="59"
        />
      </fieldset>
    </div>
  ) : '';

  return (
    <form className={props.className}>
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
      <div className="time-input">
        {startTimeElement}
        {endTimeElement}
      </div>
      {props.children}
    </form>
  );
}

export default TaskInputForm
