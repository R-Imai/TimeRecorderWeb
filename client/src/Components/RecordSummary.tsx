import React from 'react';

type Props = {
  summaryData: recordSummaryType[];
  onCopySuccess?: () => void;
}

type showRecordType = {
  subject: string,
  timeStr: string,
  task: {
    taskName: string,
    timestr: string,
  }[]
}

const transformSummaryData = (summaryData: recordSummaryType[]) => {
  const subjectList =  Array.from(new Set(summaryData.map((v) => {return v.taskSubject})));
  const returnData = subjectList.map((subj) => {
    const targetRecords = summaryData.filter((v) => {return v.taskSubject === subj && v.taskName !== ''});
    const subjectRecord = summaryData.find((v) => {return v.taskSubject === subj && v.taskName === ''});
    const showRecord: showRecordType = {
      subject: subj,
      timeStr: typeof subjectRecord !== 'undefined' ? subjectRecord.passedTimeStr : '',
      task: targetRecords.map((v) => {return {
        taskName: v.taskName,
        timestr: v.passedTimeStr,
      }})
    }
    return showRecord;
  });
  return returnData;
}

const copy = (copyTxt: string, onCopySuccess?: () => void) => {
  const textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.zIndex = '-9999';
  textarea.style.opacity = '0';
  textarea.value = copyTxt;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('Copy');
  document.body.removeChild(textarea);
  if (onCopySuccess) {
    onCopySuccess();
  }
}

const recordSummary: React.FC<Props> = (props: Props) => {
  const showData = transformSummaryData(props.summaryData);
  const mainElem = showData.length !==0 ? showData.map((subjData, i) => {
    return (
      <li key={`task-${i}`}>
        <span className="subject">{subjData.subject}</span>
        {subjData.timeStr !== '' ? <span className="time">{subjData.timeStr}</span> : ''}
        <ul>
          {subjData.task.map((taskData, j) => {
            return (
              <li key={`task-${i}-${j}`}>
                <span className="task-name">{taskData.taskName}</span>
                <span className="time">{taskData.timestr}</span>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }) : (
    <div className="message mt-10">対象の記録はありません。</div>
  );
  const copyText = showData.map((subjData) => {
    const taskData = subjData.task.map((taskData) => {
      return `    - ${taskData.taskName}: ${taskData.timestr}\r\n`;
    })
    return `- ${subjData.subject}${subjData.timeStr !== '' ? `: ${subjData.timeStr}`: ''}\r\n` + taskData.join('');
  }).join('');

  const btnSpaceElem = showData.length !==0 ? (
    <div className="btn-space">
      <button className="copy-btn" type="button" onClick={() => {copy(copyText, props.onCopySuccess);}}>テキストでコピー</button>
    </div>
  ): '';

  return (
    <div className="task-summary">
      <ul>
        {mainElem}
      </ul>
      {btnSpaceElem}
    </div>
  );
}

export default recordSummary
