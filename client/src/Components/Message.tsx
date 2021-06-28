import React from 'react';

import infoIcon from '../Image/info.svg';
import warnIcon from '../Image/warn.svg';
import errorIcon from '../Image/error.svg';

export type msgType = 'error' | 'warn' | 'info'

type Props = {
  value: string,
  type: msgType,
  width?: string,
}

const Message: React.FC<Props> = (props: Props) => {
  const iconSrc = {
    'error': errorIcon,
    'warn': warnIcon,
    'info': infoIcon
  }[props.type]
  return (
    <div className={`message-space message-space-${props.type}`} style={props.width? {width: props.width}: {}}>
      <img src={iconSrc} alt={props.type}/>
      <div className="msg">
        {props.value}
      </div>
    </div>
  );
}

export default Message
