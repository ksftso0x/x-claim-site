import React, { useEffect } from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { init, useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers'
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import dcentModule from '@web3-onboard/dcent';
import config from '../assets/config.json';
import Unconnected from './Unconnected';
import Claimables from './Claimables';
import { useSetChain } from '@web3-onboard/react'


import stakingObj from '../assets/stakings.json';

import coinAbi from '../abis/IERC20Burnable.json';

import canaryStakingAbi from '../abis/CanaryStaking.json';

export default function Staking() {

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [isClaiming, setIsClaiming] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [chainToSwitchTo, setChainToSwitchTo] = React.useState('');

  const [rewards, setRewards] = React.useState(0);

  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
      settingChain // boolean indicating if the chain is in the process of being set
    },
    setChainTo // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()


  const formatEtherNicely = (eth) => {
    console.log("ETH", eth)
    if (eth == 0)
      return "0.0"
    if (eth < ethers.formatEther(1))
      return "< 0.1"
    return Number(ethers.formatEther(eth)).toFixed(1)
  }

  const displayError = (error) => {

    const formattedErrorMessage = formatJsString(error.message);
    console.error(error)
    toast.error(formattedErrorMessage);

  }

  const formatJsString = (string) => {
    // Split the string into words.
    const words = string.split(' ');

    // If the string has more than 6 words, truncate it and add an ellipsis.
    if (words.length > 5) {
      return `${words.slice(0, 5).join(' ')}`;
    }

    // Otherwise, return the original string.
    return string;
  }

  const getContract = async () => {
    try {
      if (!wallet) {
        console.log('Wallet not connected.')
        return
      }
      if (wallet.chains[0]['id'] !== stakingObj.chain) {
        throw new Error('Invalid chain.')
      }
      const provider = new ethers.BrowserProvider(wallet.provider, 'any')
      const signer = await provider.getSigner();
      const readContract = new ethers.Contract(stakingObj.addr, canaryStakingAbi, provider)
      const writeContract = new ethers.Contract(stakingObj.addr, canaryStakingAbi, signer)
      if (!readContract) {
        throw new Error('Failed to initialize contract.')
      }
      if (!writeContract) {
        throw new Error('Failed to initialize contract.')
      }
      return { "read": readContract, "write": writeContract };
    } catch (error) {
      displayError(error)
    }
  }


  const setChain = async () => {
    const SetChainOptions = {
      chainId: stakingObj.chain,
      chainName: stakingObj.chain_name,
    }
    setChainTo({ chainId: stakingObj.chain, chainNamespace: "evm" })
  };


  const getTotalStakedRewards = async () => {
    try {
      const contractCreator = await getContract()
      const contract = contractCreator.read
      console.log(contract)
      let stakedNfts = await contract.stakedNFTSByUser(wallet.accounts[0]['address'])
      let totalRewards = 0n;
      console.log("--------")
      console.log(await stakedNfts)
      if(await stakedNfts.length != 0)
      for(let i = 0; i < await stakedNfts.length; i++)
      {
        if (Number(await stakedNfts[i].toString()) !== 0) {
        const rewards = await contract.pendingRewards(await stakedNfts[i].toString())
        console.log(await stakedNfts[i], await stakedNfts[i].toString(), rewards, formatEtherNicely(rewards))
        totalRewards += await rewards
        }
      }
      let rewardsFormatted = formatEtherNicely(totalRewards)
      console.log(rewardsFormatted)
      setRewards(rewardsFormatted)
    }
    catch (error) {
      displayError(error)
    }
  }

  const claimRewards = async () => {
    try {
      const contractCreator = await getContract()
      const contract = contractCreator.write
      console.log(contract)
      const tx = await contract.harvestBatch(wallet.accounts[0]['address'])
      setIsClaiming(true)
      toast.info('Claiming rewards...')
      await tx.wait()
      setIsClaiming(false)
      toast.success('Rewards claimed!')
      console.log(tx)
    }
    catch (error) {
      setIsClaiming(false)
      displayError(error)
    }
  }

  useEffect(() => {
    if(wallet == null)
    {
      return
    }
    if (stakingObj.chain === wallet.chains[0]['id']) {
      getTotalStakedRewards()
      // claimRewards()
    }
  }, [wallet])


  return (
    <div className='claimables-holder'>
      <div className={`holder holds-claimables`}>
        {wallet && !isLoading && stakingObj.chain === wallet.chains[0]['id'] &&
          <div className='unconnected'>
            <p>{stakingObj.name}</p>
            <p>Rewards: {rewards} CGLD</p>
            <button className={`btn ${!stakingObj.chain === wallet.chains[0]['id'] ? "full-width" : ""}`}
              onClick={() => { stakingObj.chain === wallet.chains[0]['id'] ? claimRewards() : setChain(stakingObj) }}
              disabled={(stakingObj.chain === wallet.chains[0]['id'] && rewards == 0)}>
              {stakingObj.chain === wallet.chains[0]['id'] ? "Claim" : `Switch to ${stakingObj.chain_name}`}</button>

          </div>
        }
        {wallet && stakingObj.chain !== wallet.chains[0]['id'] &&
          <div className='unconnected'>
            <p>{stakingObj.name}</p>
            <p>Change Chain</p>
            <button className={`btn ${!stakingObj.chain === wallet.chains[0]['id'] ? "full-width" : ""}`}
              onClick={() => { stakingObj.chain === wallet.chains[0]['id'] ? claimRewards() : setChain(stakingObj) }}
              disabled={(stakingObj.chain === wallet.chains[0]['id'] && rewards == 0)}>
              {stakingObj.chain === wallet.chains[0]['id'] ? "Claim" : `Switch to ${stakingObj.chain_name}`}</button>

          </div>
        }
        <Unconnected wallet={wallet} isLoading={isLoading}></Unconnected>
      </div>
    </div >
  )
}
