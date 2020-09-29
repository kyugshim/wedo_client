import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch, useHistory, Redirect } from "react-router-dom";

import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Mypage from "./pages/Mypage"
import axios from "axios"
import { render } from 'react-dom';

axios.defaults.withCredentials = true;

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isSignin: false,
      userinfo: {},
      todos: [{ id: 1, title: "111", body: "1111" },
      { id: 2, title: "111", body: "1111" },
      { id: 3, title: "111", body: "1111" },
      { id: 4, title: "111", body: "1111" },
      { id: 5, title: "111", body: "1111" },
      { id: 6, title: "111", body: "1111" },
      { id: 7, title: "111", body: "1111" },
      { id: 8, title: "111", body: "1111" },
      { id: 9, title: "111", body: "1111" },
      { id: 10, title: "111", body: "1111" },
      { id: 11, title: "111", body: "1111" },
      { id: 12, title: "111", body: "1111" }]
    };
    this.handleisSigninChange = this.handleisSigninChange.bind(this);
    this.handleSignout = this.handleSignout.bind(this);
    this.passwordValidationCheck = this.passwordValidationCheck.bind(this)
    this.handleEditedData = this.handleEditedData.bind(this)
    this.handleFetchTodo = this.handleFetchTodo.bind(this)
    this.handleAddTodo = this.handleAddTodo.bind(this)
  }

  handleisSigninChange() {
    this.setState({ isSignin: true });
    axios.all([axios.get("http://localhost:5000/mypage"), axios.get("http://localhost:5000/main")]) // userinfo를 가져오는 url주소를 API문서와 일치시켰습니다 (signin => mypage)
      .then(axios.spread((userData, todoData) => {
        this.setState({ userinfo: userData.data, todos: todoData.data });
      }))
  }
  handleEditedData(record) {
    let temp = this.state.todos
    console.log(record)
    for (let i = 0; i < temp.length; i++) {
      if (record.id === temp[i].id) {
        temp[i] = record
      }
    }
    console.log(temp)
    this.setState({ todos: temp })
  }
  handleFetchTodo(data) {
    this.setState({ todos: data })
  }
  handleAddTodo(data) {
    let temp = this.state.todos
    temp.push(data)

    this.setState({
      todos: temp
    })
  }
  handleSignout() {
    this.setState({ isSignin: false, userinfo: {}, todos: [] });
    axios
      .post("http://localhost:5000/signout")
      .catch(e => console.log(e))
  }

  passwordValidationCheck = (pw) => { // signup과 mypage에서 공통적으로 사용되는 method이기 때문에, app에서 props로 내려주도록 했습니다.
    let num = pw.search(/[0-9]/g);  // 주어진 pw에 0~9사이에 숫자가 있으면 0, 없으면 -1
    let eng = pw.search(/[a-z]/ig); // 주어진 pw에 a~z사이에 문자가 있으면 0, 없으면 -1
    let spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi); // 주어진 pw에 대괄호 안의 특수문자가 있으면 0, 없으면 -1

    if (pw.length < 8 || pw.length > 20) {
      alert("비밀번호는 8~20자 이내입니다.")
      return false;
    } else if (pw.search(/\s/) !== -1) {
      alert("비밀번호에는 공백을 포함할 수 없습니다.")
      return false;
    } else if (num < 0 || eng < 0 || spe < 0) {
      alert("비밀번호에는 숫자, 영문, 특수문자가 포함되어야 합니다")
      return false;
    } else {
      return true
    }
  }

  render() {
    const { isSignin, userinfo, todos } = this.state;
    console.log(isSignin, userinfo);
    return (
      <div>
        <BrowserRouter>
          <Switch>
            <Route
              path="/signin"
              render={() => (
                <Signin
                  isSignin={isSignin}
                  handleisSigninChange={this.handleisSigninChange}
                  history={useHistory}
                />
              )}
            />
            <Route
              exact
              path="/signup"
              render={() => <Signup isSignin={isSignin} pwCheck={this.passwordValidationCheck} />}
            />
            <Route
              exact
              path="/mypage"
              render={() => <Mypage isSignin={isSignin} handleSignout={this.handleSignout} userinfo={userinfo} history={useHistory} pwCheck={this.passwordValidationCheck} />}
            />
            <Route
              exact
              path="/main"
              render={() => <Main isSignin={isSignin} userinfo={userinfo} handleSignout={this.handleSignout} todos={todos} handleEditedData={this.handleEditedData} handleFetchTodo={this.handleFetchTodo} handleAddTodo={this.handleAddTodo} />}
            />
            <Route
              path="/"
              render={() => {
                if (isSignin) {
                  return <Redirect to="/main" />;
                }
                return <Redirect to="/signin" />;
              }}
            />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}
export default App;
