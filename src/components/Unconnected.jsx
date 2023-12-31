import React, { useEffect } from 'react'
import { Route, Routes, BrowserRouter, Link } from "react-router-dom";
import { init, useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers'
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import dcentModule from '@web3-onboard/dcent';
import { faGear, faL } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../assets/config.json'

export default function Unconnected(props) {


    const [isCorrectChain, setIsCorrectChain] = React.useState(false)
    const chainsList = config.CHAINS;

    const checkIfUsingCorrectNetwork = async (chainId) => {
        for (let index = 0; index < chainsList.length; index++) {
            console.log(chainsList[index].CHAIN_ID, chainId);
            console.log(Number(chainsList[index].CHAIN_ID) == Number(chainId))
            if(Number(chainsList[index].CHAIN_ID) == Number(chainId))
            {
                console.log("correct chain")
                setIsCorrectChain(true)
                return
            }
        }
        console.log("incorrect chain")
        setIsCorrectChain(false)

    }

    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

    // create an ethers provider
    let ethersProvider

    if (wallet) {
        // if using ethers v6 this is:
        ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any')
        // ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any')
    }

    useEffect(() => {
        if(wallet)
        checkIfUsingCorrectNetwork(props.wallet.chains[0]['id'])
    }
    , [props.wallet, props.isLoading, props.wallet])


    if (!props.wallet ) {
        return (
            <div className='unconnected'>
                <h1>Welcome to X-Claiming</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam dolores, voluptas sunt quod atque, maiores quis praesentium doloremque sint porro debitis, dolorum omnis nesciunt?</p>
                <button className='btn' disabled={connecting} onClick={() => (wallet ? disconnect(wallet) : connect())}>
                        {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect'}
                </button>
            </div>
        )
    }
    if (props.isLoading) {
        return (
            <div className='unconnected'>
           <FontAwesomeIcon icon={faGear} spin size='2xl'/>
        </div>
        )
    }
}
