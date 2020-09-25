import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch, useHistory, Redirect } from "react-router-dom";

import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Mypage from "./pages/Mypage"
import axios from "axios"

axios.defaults.withCredentials = true;

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isSignin: false,
      userinfo: {},
      todos: []
    };
    this.handleisSigninChange = this.handleisSigninChange.bind(this);
    this.handleSignout = this.handleSignout.bind(this);
  }

  handleisSigninChange() {
    this.setState({ isSignin: true });
    axios.all([axios.get("http://18.216.148.52:5000/signin"), axios.get("http://18.216.148.52:5000/main")])
      .then(axios.spread((userData, todoData) => {
        this.setState({ userinfo: userData.data, todos: todoData });
      }))
  }

  handleSignout() {
    this.setState({ isSignin: false, userinfo: {}, todos: [] });
    axios
      .post("http://18.216.148.52:5000/signout")
      .catch(e => console.log(e))
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
                />
              )}
            />
            <Route
              exact
              path="/signup"
              render={() => <Signup isSignin={isSignin} />}
            />
            <Route
              exact
              path="/mypage"
              render={() => <Mypage isSignin={isSignin} userinfo={userinfo} handleSignout={this.handleSignout} history={useHistory} />}
            />
            <Route
              exact
              path="/main"
              render={() => <Main isSignin={isSignin} userinfo={userinfo} todos={todos} />}
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
