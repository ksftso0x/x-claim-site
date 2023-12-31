import React from 'react'
import { Route, Routes, BrowserRouter, Link } from "react-router-dom";
import { init, useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers'
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import dcentModule from '@web3-onboard/dcent';
import '../css/header.css'
import { faXTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../assets/config.json';
import FlareLogo from '../assets/img/FlareLogo.png'
import SongbirdLogo from '../assets/img/SongbirdLogo.png'

const logoList = {
    "FLR": FlareLogo,
    "SGB": SongbirdLogo
}

export default function Header() {


    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()


    const addrFormated = (addr) => {
        if(wallet == undefined){
            return "Connect"
        }
        if(wallet.accounts[0].balance == undefined){
         return addr.slice(0, 6) + '...' + addr.slice(-4)
        }
        let tokenName = "ETH";
        for(let i = 0; i < config.CHAINS.length; i++){
            console.log(config.CHAINS[i].CHAIN_ID)
            console.log(wallet.chains[0]['id'])
            if(config.CHAINS[i].CHAIN_ID == wallet.chains[0]['id']){
                tokenName = config.CHAINS[i].CHAIN_TOKEN_NAME;
            }
        }
        let balance = wallet.accounts[0].balance[tokenName]
        return <span className='text-with-icon'>{addr.slice(0, 6) + '...' + addr.slice(-4) + " - " + Number(balance).toFixed(2)} <img className='icon' src={logoList[tokenName]} alt={tokenName}></img></span>
    }

    // create an ethers provider
    let ethersProvider

    if (wallet) {
        // if using ethers v6 this is:
        ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any')
        // ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any')
    }

    return (
        <div className='header-holder'>
            <header className='bottom-border'>
                <nav>
                    <a className='link' href='https://twitter.com/Canary_Punks'><FontAwesomeIcon icon={faXTwitter} size="xl"></FontAwesomeIcon></a>
                    <a className='link' href='https://discord.com/invite/8cdPB9M3e8'><FontAwesomeIcon icon={faDiscord} size="xl"></FontAwesomeIcon></a>
                </nav>
                <nav>
                    <button className='btn long' disabled={connecting} onClick={() => (wallet ? disconnect(wallet) : connect())}>
                        {connecting ? 'Connecting' : wallet ? 
                        addrFormated((wallet.accounts[0]['address']).toString())
                        : 'Connect'}
                    </button>
                </nav>
            </header>
            <header className='tabs'>
                <nav className='nav-tab'>
                    <Link className="link" to="/">NFT Rewards</Link>
                    <Link className="link" to="/tokens">Token Rewards</Link>
                    <Link className="link" to="/staking">NFT Staking</Link>
                    <p className="soon" to="/">NFT Marketplace</p>
                    <p className="soon" to="/">Token Staking</p>
                </nav>
            </header>
        </div>
    )
}
