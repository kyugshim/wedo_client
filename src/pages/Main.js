import React from 'react';
import { withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios'
import { render } from 'react-dom';
import TodoEntry from "./TodoEntry"
import { Motion, spring } from "react-motion"
class Main extends React.Component {
    constructor() {
        super()
        this.state = {
            todos: [],
            isAddOpen: false,
            isDeleted: false,
            title: "",
            body: "",
            currentTime: { hour: null, minutes: null },
            current: null,
            currentWeatherIcon: null,
            currentTemp: null,
            isShareOpen: false,
            searchFriend: [],
            shareTo: [],
        }
        this.handleInputValue = this.handleInputValue.bind(this)
        this.handleAdd = this.handleAdd.bind(this)
        this.handleAddOpen = this.handleAddOpen.bind(this)
        this.resetForm = this.resetForm.bind(this)
        this.getTime = this.getTime.bind(this)
        this.getWeather = this.getWeather.bind(this)
        this.handleSearchFriend = this.handleSearchFriend.bind(this)
        this.handleIsShareOpen = this.handleIsShareOpen.bind(this)
        this.handleAddShareTo = this.handleAddShareTo.bind(this)
    }
    componentDidMount() {
        this.getWeather()
        setInterval(this.getTime, 1000)
    }

    handleSearchFriend = (e) => { //  Todo Add 시 친구 찾기 input을 통해 친구를 검색합니다.
        console.log(`나 일 하고있어요`)
        let keyword = String(e.target.value)
        if (keyword) {
            let searchList = this.props.followinfo.reduce(
                (acc, cur) => {
                    if (cur.fullname.includes(keyword)) {
                        acc.push([cur.id, cur.fullname])
                    }
                    return acc
                }, [])
            console.log(searchList)
            if (searchList[0]) {
                this.setState({ searchFriend: searchList })
            } else {
                this.setState({ searchFriend: [] })
            }
        } else {
            this.setState({ searchFriend: [] })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.todos.length !== this.props.todos.length) {
            this.setState({ todos: this.props.todos })
        }
    }
    getTime() {
        let day = new Date()
        let time = {}
        let hours = day.getHours()
        let str = day.toLocaleTimeString().split(':')
        if (hours <= 11) {
            this.setState({ current: "morning" })
        } else if (hours <= 17) {
            this.setState({ current: "afternoon" })
        } else {
            this.setState({ current: "evening" })
        }
        time.hour = str[0]
        time.minutes = str[1]
        this.setState({ currentTime: time })
    }
    handleIsShareOpen = () => {
        this.setState({ isShareOpen: !this.state.isShareOpen })
    }
    handleInputValue = (key) => (e) => {
        this.setState({ [key]: e.target.value });
    };

    handleAddShareTo = (e) => {
        let userid = e.target.getAttribute('userid')
        let fullname = e.target.innerHTML
        let temp = this.state.shareTo
        let isThere = false;

        for (let user of temp) {
            if (user[0] === userid) {
                isThere = true;
            }
        }

        if (isThere) {
            alert("이미 추가된 친구입니다")
        } else {
            temp.push([userid, fullname])
            this.setState({ shareTo: temp })
        }
    }

    // render에 직접 적용된 함수를 메소드로 정리했습니다.
    handleAdd = () => {
        const { title, body } = this.state
        if (title && body) {
            axios.post("http://localhost:5000/todowrite", { title, body })
                .then(res => this.props.handleAddTodo(res.data))
                .then(() => this.handleAddOpen())
                .catch(err => { alert("에러가 발생했습니다. 다시 시도해주세요."); console.log(err) });
        }
        else {
            alert("내용을 입력해주세요.")
        }
    }
    handleAddOpen = () => {
        this.setState({ isAddOpen: !this.state.isAddOpen })
        console.log(this)
    }

    resetForm() {
        document.querySelector("#titleInput").value = null
        document.querySelector("#bodyInput").value = null
        this.setState({ title: null, body: null }) // Form reset시 state도 비워주는 구문을 추가했습니다.
    }
    getWeather() { // 일단 서울 날씨를 Signin 페이지에 표기합니다.
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&units=metric&lang=kr&appid=${process.env.REACT_APP_WEATHER_API_KEY}`, { // REACT에서 활용할 환경변수는 앞에 REACT_APP_ 이 붙어있어야 한다.
            withCredentials: false
        })
            .then(data => {
                let { temp } = data.data.main;
                let { icon } = data.data.weather[0]
                console.log(data.data)
                this.setState({ currentTemp: temp.toFixed(1), currentWeatherIcon: icon })
            })
    }
    render() {
        let { isAddOpen, currentWeatherIcon, currentTemp, isShareOpen, searchFriend, shareTo } = this.state
        let { todos, handleEditedData, handleFetchTodo } = this.props
        return (
            <div>
                <div className="pagebox">
                    <div className="nav">
                        <button id='edit-logout' onClick={() => { this.props.handleSignout(); this.props.history.push('/') }}>로그아웃</button>
                        <button id='gotomypage' onClick={() => { this.props.history.push('/mypage') }}>Mypage</button>
                        <button id='followlist' onClick={() => { this.props.history.push('/followlist') }}>친구목록</button>
                        <div className={this.state.current === "day" ? "Text weatherInfo-day" : "Text weatherInfo-night"} >
                            <img src={`http://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`} className="weatherImage" />
                            <div className="currentTemp">
                                서울<p><b style={{ fontWeight: "bolder" }}>{currentTemp} 도</b></p>
                            </div>
                        </div>
                        <div className="currentTime-main" >
                            현재 시각
                        <p>
                                <b>{this.state.currentTime.hour}시 {this.state.currentTime.minutes}분</b>
                            </p>
                        </div>
                    </div>
                    <div className="textbox">
                        <div className="Text Sayhi">
                            {this.state.current === "morning" ? <div> 안녕하세요! <br></br> 좋은 아침이에요</div>
                                : this.state.current === "afternoon" ? <div> 피곤하시죠? <br></br>
                                    <a href="https://www.google.com/search?source=hp&ei=AL5yX4fHF4i2mAWf75vACA&q=%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4&oq=%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4&gs_lcp=CgZwc3ktYWIQAzIFCAAQsQMyBQgAELEDMgUIABCxAzICCAAyBQgAELEDMgIIADICCAAyAggAMgIIADICCAA6CAgAELEDEIMBOgQIABAKUPACWO8VYJ8XaAhwAHgDgAFviAHoCZIBBDAuMTKYAQCgAQGqAQdnd3Mtd2l6sAEA&sclient=psy-ab&ved=0ahUKEwiHx8WdyY3sAhUIG6YKHZ_3BogQ4dUDCAc&uact=5">
                                        커피 한 잔 어때요?</a></div>
                                    : <div>오늘도 고생하셨어요<br></br> 좋은 밤 되세요 </div>}
                        </div>
                        <div className="todoListTitle">
                            TODO LIST
                        </div>
                        <button id="addButton" onClick={this.handleAddOpen} style={{ display: isAddOpen ? "none" : "block" }}>추가하기</button> {/*  Add가 열리면 Add 버튼을 숨깁니다. */} {/* TodoEntry가 렌더되는 부분입니다*/}
                        <div className="add-todo" style={{ display: isAddOpen ? "block" : "none" }}> {/*  isAddOpened를 확인하여 렌더합니다. */}
                            <form className={isShareOpen ? "addForm toLeft" : "addForm"} onSubmit={(e) => { e.preventDefault(); this.handleAdd(); this.resetForm(); }} >
                                <div><input type="title" id="titleInput" placeholder="제목" onChange={this.handleInputValue("title")} /></div>
                                <div><textarea type="body" id="bodyInput" placeholder="내용" onChange={this.handleInputValue("body")} /></div>
                                <span className="editFormButtons">
                                    <button id="cancelButton-main" type="reset" onClick={this.handleAddOpen}></button>
                                    <button id="editOkay-main" type="submit"></button>
                                    <button id="shareButton-main" type="button" onClick={this.handleIsShareOpen}> Share </button> {/* todo Add와 동시에 Share 할 수 있는 기능 구현*/}
                                </span>
                            </form>
                            <div className="addForm" id="shareForm-main" style={{ display: isShareOpen ? "" : "none" }}>
                                <input placeholder="친구이름입력" onChange={(e) => this.handleSearchFriend(e)}></input>  {/*친구 이름 검색창*/}
                                <div id="searchFriendList" style={{ display: searchFriend.length > 0 ? "" : "none" }}>   {/* 검색 결과 표시  */}
                                    {searchFriend.length > 0 ?
                                        searchFriend.map(val =>
                                            <button key={val[0]} userid={val[0]} onClick={(e) => this.handleAddShareTo(e)}>
                                                {val[1]}
                                            </button>) : ''}
                                </div>
                                <div id="shareTo"> 선택된 친구리스트
                                <ul>
                                        {shareTo.map(friend => <li key={friend[0]}>{friend[1]}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Motion
                            defaultStyle={{ x: -200, opacity: 0 }}
                            style={{ x: spring(0), opacity: spring(1) }} >
                            {(style) => (<div style={{ transform: `translateX(${style.x}px)`, opacity: style.opacity }}>
                                {todos.map(todo =>
                                    <TodoEntry
                                        key={todo.id}
                                        todo={todo}
                                        handleInputValue={this.handleInputValue}
                                        handleFetchTodo={handleFetchTodo}
                                        handleEditedData={handleEditedData} />)}</div>)}
                        </Motion>
                    </div>
                </div>
            </div>
        )
    }
}
export default withRouter(Main)