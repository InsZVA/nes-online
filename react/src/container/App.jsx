import React from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import './main.scss'
import GameTab from './GameTab/GameTab'
import UserTab from './UserTab/UserTab'
import ws from '../utils/websocket'
import Game from './GameTab/Game.jsx'
import SettingTab from './SettingTab/SettingTab.jsx'

class App extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.user==null) {
      location.href = "#/login";
      return
    }
    ws.createWS(this.props.user);
  }
  render() {
    if (this.props.user==null) {
      return (
        <div />
      )
    }
    var Header = (
      <div className='Header'>
        <div className='title'>
          NES Online
        </div>
      </div>
    )
    var Footer = (
      <div className='Footer'>
        <a style={{float: "right"}} target="blank" href="https://github.com/MeteorKL">
          <img src="/img/github.png"/>
        </a>
      </div>
    )
    var Account = (
      <div className='Account'>
        <div className='user'>
          <img src={this.props.user.avatar}/>
          <input value={this.props.user.name} disabled></input>
        </div>
      </div>
    )
    return (
      <div >
        {this.props.children}
        {this.props.tab=='Game'?<Game/>:<div/>}
        {Header}
        {Account}
        <GameTab />
        <UserTab user={this.props.user}/>
        <SettingTab/>
        {Footer}
      </div>
    )
  }
}

function mapStateToProps(state) {
    return {
      user: state.user,
      tab: state.tab,
    }
}

export default connect(mapStateToProps, null)(App);