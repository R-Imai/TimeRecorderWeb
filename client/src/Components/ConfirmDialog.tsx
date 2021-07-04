import React from 'react';

type Props = {
  message: string,
  onCancel: () => void,
  onSubmit: () => void,
}

const ConfirmDialog: React.FC<Props> = (props: Props) => {
  return (
    <div className="dialog">
      <div>
        {props.message}
      </div>
      <div className="btn-space">
        <button className="cancel" onClick={props.onCancel}>
          キャンセル
        </button>
        <button className="decision" onClick={props.onSubmit}>
          決定
        </button>
      </div>
    </div>
  );
}

export default ConfirmDialog
