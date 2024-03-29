import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import defaultIcon from '../Image/defaultIcon.png';
import { sha256 } from 'js-sha256';

import AccountEdit from '../Components/AccountEdit'
import Indicator from '../Components/Indicator'
import {register} from '../Actions/AuthAction'

type State = {
  id: string,
  name: string,
  pass1: string,
  pass2: string,
  image: string,
  imageSrc: string,
  isError: boolean,
  errMsg: string,
  showIndicator: boolean,
  errMessage: string
}

class RegisterPage extends React.Component<RouteComponentProps , State> {
  constructor(props: RouteComponentProps) {
    super(props);
    
    document.title = "TimeRecorder | アカウント作成";

    this.state = {
      id: '',
      name: '',
      pass1: '',
      pass2: '',
      image: '',
      imageSrc: defaultIcon,
      isError: false,
      errMsg: '',
      showIndicator: false,
      errMessage: ''
    };

    this.idChange = this.idChange.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.pass1Change = this.pass1Change.bind(this);
    this.pass2Change = this.pass2Change.bind(this);
    this.imageChange = this.imageChange.bind(this);
    this.imageClear = this.imageClear.bind(this);
    this.register = this.register.bind(this);
  }

  idChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      id: e.target.value
    });
  };

  nameChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      name: e.target.value
    });
  };

  pass1Change(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      pass1: e.target.value
    });
  };

  pass2Change(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      pass2: e.target.value
    });
  };

  imageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const reader = new FileReader();
    if(e.target.files !== null){
      reader.onload = (e) => {
        if (e.target !== null && e.target.result !== null) {
          this.setState({
            imageSrc: e.target.result.toString()
          });
        }
      }
      reader.readAsDataURL(e.target.files[0]);
    }

    this.setState({
      image: e.target.value
    });
  }

  imageClear() {
    this.setState({
      imageSrc: defaultIcon,
      image: ''
    });
  }

  async register() {
    this.setState(({
      showIndicator: true
    }));
    const pass = sha256(this.state.pass1);
    const userInfo = {
      user_cd: this.state.id,
      name: this.state.name,
      image: this.state.imageSrc,
      password: pass
    }
    try {
      await register(userInfo);
    }
    catch (e) {
      this.setState({
        errMessage: e.message
      })
      return;
    }
    finally {
      this.setState({
        showIndicator: false
      });
    }
    this.props.history.push({
      pathname: '/registration/done',
      state: {
        id: this.state.id,
        name: this.state.name
      }
    });
  }

  render() {
    const accountInfo = {
      id: {
        value: this.state.id,
        editable: true,
        onChange: this.idChange
      },
      name: {
        value: this.state.name,
        editable: true,
        onChange: this.nameChange
      },
      pass1: {
        value: this.state.pass1,
        editable: true,
        onChange: this.pass1Change
      },
      pass2: {
        value: this.state.pass2,
        editable: true,
        onChange: this.pass2Change
      },
      image: {
        value: this.state.image,
        editable: true,
        imageSrc: this.state.imageSrc,
        onChange: this.imageChange,
        imageClear: this.imageClear
      }
    }
    return (
      <div id="register-page" className="indicator-parent">
        <h1>
          アカウント作成
        </h1>
        <div className="main">
          <Link to="/login" className="to-login-button">
            &lt;&lt;ログインフォームへ戻る
          </Link>
          <AccountEdit
            accountInfo={accountInfo}
            submitText="登録する"
            onClickSubmit={this.register}
            errorMessage={this.state.errMessage}
          />
        </div>
        <Indicator show={this.state.showIndicator} />
      </div>
    );
  }
}

export default withRouter(RegisterPage)
