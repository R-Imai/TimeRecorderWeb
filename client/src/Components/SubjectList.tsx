import React from 'react';
import Sortable from 'sortablejs';

type Props = {
  subjectList: subjectType[],
  id: string,
  className?: string,
  onChange: (oldIndex:number, newIndex:number) => void,
  onStateChange: (subjectInfo:subjectType) => void,
  onSubmitColor: (subjectInfo:subjectType) => void,
  onChangeColor: (subjectInfo:subjectType, color:string) => void,
  onClickDelete?: (subjectInfo:subjectType) => void,
}

const SubjectList: React.FC<Props>  = (props: Props) => {

  React.useEffect(() => {
    const onMove = (e:Sortable.SortableEvent) => {
      const oldIndex = e.oldIndex
      const newIndex = e.newIndex
      const isChangeStatus = e.target !== e.to;   // グループ化していないのでtrueにはならない
      if (typeof oldIndex === 'undefined' || typeof newIndex === 'undefined') {
        return;
      }
      if (oldIndex !== newIndex || isChangeStatus) {
        props.onChange(oldIndex, newIndex);
      }
      return;
    }
    const dom = document.getElementById(props.id);
    if(dom === null) {
      return;
    }
    Sortable.create(dom,{
      // group: "shared",
      onEnd: onMove,
      animation: 150
    });
  }, [props]);

  const onClickDelete = (subj: subjectType) => {
    if (!props.onClickDelete) {
      return () => {};
    }
    const func = props.onClickDelete;
    return () => {func(subj)}
  }

  const subjectListElem = props.subjectList.map((subj, i) => {
    const bgStyle = {
      borderLeftColor: subj.color,
    }
    return (
      <li
        key={subj.subjectId}
        data-id={subj.subjectId}
        style={bgStyle}
      >
        <button className="swith-btn" onClick={() => {props.onStateChange(subj)}}>
          {subj.isActive ? "無効にする" : "有効にする"}
        </button>
        <span
          className="subject-name"
          title={subj.name}
        >
          {subj.name}
        </span>
        <input
          type="color"
          className="color"
          value={subj.color}
          onChange={(e) => {props.onChangeColor(subj, e.target.value)}}
          onBlur={() => {props.onSubmitColor(subj)}}
        />
        { props.onClickDelete ? (
            <button onClick={onClickDelete(subj)} className="delete-btn">
              x
            </button>
          ) : ''
        }
      </li>
    )
  });

  return (
    <ul id={props.id} className={`${props.className} subject-list`}>
      {subjectListElem}
    </ul>
  )
}

export default SubjectList;