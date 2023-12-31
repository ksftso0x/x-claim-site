import { useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { init, useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers'
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import dcentModule from '@web3-onboard/dcent';
import config from '../assets/config.json';
import { Route, Routes, BrowserRouter, Link } from "react-router-dom";
import '../css/buttons.css'
import Header from './Header';
import Nft from './Nft';
import Coins from './Coins';
import Footer from './Footer';
import '../css/panel.css'
import Staking from './Staking';

const chainsList = config.CHAINS;

const chainsMapped = chainsList.map((_chain) => {
  return {
    id: _chain.CHAIN_ID,
    token: _chain.CHAIN_TOKEN_NAME,
    label: _chain.CHAIN_LABEL,
    rpcUrl: _chain.CHAIN_URI,
  }
})

console.log(chainsMapped)

const injected = injectedModule()

const walletConnect = walletConnectModule({
  version: 2,
  projectId: config.PROJECT_ID,
  handleUri: uri => console.log(uri),
  qrcodeModalOptions: {
    mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
  },
  connectFirstChainId: true
})

const dcent = dcentModule()

// initialize Onboard
init({
  wallets: [injected, walletConnect, dcent],
  chains: chainsMapped,
  theme: 'system',
  notify: {
    desktop: {
      enabled: true,
      transactionHandler: transaction => {
        console.log({ transaction })
        if (transaction.eventCode === 'txPool') {
          return {
            type: 'success',
            message: 'Your transaction from #1 DApp is in the mempool',
          }
        }
      },
      position: 'bottomRight'
    },
    mobile: {
      enabled: true,
      transactionHandler: transaction => {
        console.log({ transaction })
        if (transaction.eventCode === 'txPool') {
          return {
            type: 'success',
            message: 'Your transaction from #1 DApp is in the mempool',
          }
        }
      },
      position: 'bottomRight'
    }
  },
  accountCenter: {
    desktop: {
      position: 'bottomRight',
      enabled: true,
      minimal: true
    },
    mobile: {
      position: 'bottomRight',
      enabled: true,
      minimal: true
    }
  },

})

function App() {

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

  // create an ethers provider
  let ethersProvider

  if (wallet) {
    // if using ethers v6 this is:
    ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any')
    // ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any')
  }


  return (
    <>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    <div className='app'>
    <BrowserRouter basename="">
        <Header></Header>
        <Routes>
          <Route path="/" element={<Nft />} />
          <Route path="/tokens" element={<Coins />} />
          <Route path="/staking" element={<Staking></Staking>} />
        </Routes>
      </BrowserRouter>
      <Footer>

      </Footer>
    </div>
    </>
  )
}

export default App
