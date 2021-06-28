import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import {Link} from 'react-router-dom';

import Indicator from '../Components/Indicator'
import {getUserInfo} from '../Actions/AuthAction'


type State = {
  userInfo: {
    user_cd: string;
    name: string;
    image?: string;
  } | null;
  showIndicator: boolean;
}

class HomePage extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      userInfo: null,
      showIndicator: false
    };
  }

  async componentDidMount() {
    this.setState({
      showIndicator: true
    })
    const userInfo = await getUserInfo().catch((e: Error) => {
      console.error(e.message);
      return;
    });
    if (!userInfo) {
      return;
    }
    this.setState({
      userInfo: userInfo,
      showIndicator: false
    })
  }

  render() {
    const txt = this.state.userInfo === null ? '' : `ようこそ ${this.state.userInfo.name} さん`
    return (
      <div className="global-nav-page indicator-parent">
        <div>{txt}</div>
        <Indicator show={this.state.showIndicator} />
      </div>
    )
  }
}

export default withRouter(HomePage)
