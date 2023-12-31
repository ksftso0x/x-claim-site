import React from 'react'
import '../css/claimables.css'

export default function Claimables(props) {

  const name = props.name;
  const logo = props.logo;
  const img = props.img;
  const bgImg = props.bgImg;
  const rewards = props.rewards;
  const isCorrectChain = props.isCorrectChain;
  const iconColor = props.iconColor;
  const chainName = props.chainName;
  const isAvalible = props.avalible;

  return (
    <div className={`hero`}>
      {!isAvalible &&
      <div className='hero-disabled-overlay'>
   <div className='hero-text-box'>
   <h2>Under Construction</h2>
        <h3>Join our <a target="_blank" href='https://discord.gg/rQpwddd7Xm'>discord</a> for updates</h3>
    </div>
  </div>
      }
      <div className='hero-color-bg'/>
      <img src={bgImg} className='hero-bg'/>
       <img className='hero-logo' style={{"color":iconColor}} src={logo} alt={name}></img>
        <div className='hero-content'>
          {isCorrectChain && <p>Rewards: {rewards}</p>}
          {!isCorrectChain && <p></p>}
          {props.children}
        </div>
        <img className='hero-character' src={img} alt=""></img>
    </div>
  )
}
