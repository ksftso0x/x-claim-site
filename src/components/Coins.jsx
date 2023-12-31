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
import coinData from '../assets/coins.json';
import CanaryGold from '../abis/CanaryGold.json';
import Unconnected from './Unconnected';

const abis = {
    CanaryGold: CanaryGold,
}
export default function Coins() {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
    const [coins, setCoins] = React.useState([])
    const [isClaiming, setIsClaiming] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

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

    const createCoinObj = async (_coin) => {
        const rewards = await getRewards(_coin)
        console.log(_coin.name)
        console.log(rewards)
        return {
            "name": _coin.name, "chain": _coin.chain,
            "rewards": formatEtherNicely(rewards),
            "claim": () => { claimRewards(_coin) }
        }
    }

    const getContractNFT = async (_coinObj) => {
        try {
            if (!wallet) {
                console.log('Wallet not connected.')
                return
            }
            if (wallet.chains[0]['id'] !== _coinObj.chain) {
                throw new Error('Invalid chain.')
            }

            console.log('wallet', wallet.accounts[0]['address'])
            const provider = new ethers.BrowserProvider(wallet.provider, 'any')
            const signer = await provider.getSigner();
            const readContract = new ethers.Contract(_coinObj.addr, abis[_coinObj.abi_file_name], provider)
            const writeContract = new ethers.Contract(_coinObj.addr, abis[_coinObj.abi_file_name], signer)
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

    const getRewards = async (_coin) => {
        try {
            const contractCreator = await getContractNFT(_coin)
            const contract = contractCreator.read
            console.log(_coin.read_func)
            console.log(await contract)
            let rewards = _coin.needs_address ? await contract[_coin.read_func](wallet.accounts[0]['address']) : await contract[_coin.read_func]()
            //const rewards = await contract.getRewardsAmount(wallet.accounts[0]['address'])
            console.log("REWARDS: ", rewards)
            //const rewards = await contract.getClaimableAmountSGB(wallet.accounts[0]['address'])
            return rewards
        }
        catch (error) {
            displayError(error)
        }
    }

    const claimRewards = async (_coin) => {
        try {
            const contractCreator = await getContractNFT(_coin)
            const contract = contractCreator.write
            console.log(contract)
            let tx = _coin.needs_address ? await contract[_coin.claim_func](wallet.accounts[0]['address']) : await contract[_coin.claim_func]()
            setIsClaiming(true)
            toast.info('Claiming rewards...')
            await tx.wait()
            setIsClaiming(false)
            toast.success('Rewards claimed!')
            console.log(tx)
            //const rewards = await contract.getClaimableAmountSGB(wallet.accounts[0]['address'])
        }
        catch (error) {
            setIsClaiming(false)
            displayError(error)
        }
    }


    const getCoins = async () => {
        if (wallet) {
            setIsLoading(true)
            let tempcoins = [...coins]
            for (let i = 0; i < coinData.length; i++) {
                let _coin = coinData[i]
                console.log(_coin)
                console.log(wallet.chains[0]['id'], _coin.chain)
                if (wallet.chains[0]['id'] === _coin.chain && coins.filter(nft => nft.name === _coin.name).length === 0) {
                    console.log(_coin.name)
                    tempcoins.push(await createCoinObj(_coin))
                }
            }
            console.log(tempcoins)
            setCoins(tempcoins)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getCoins()
    }
        , [wallet])

    return (
        
        <div className='claimables-holder'>
        <div className={`holder holds-claimables`}>
                {wallet && coins.map((nft, index) => {
                    if (nft.chain === wallet.chains[0]['id'])
                        return (
                            <div className='unconnected' key={index}>
                                <h1>{nft.name}</h1>
                                <h2>{nft.rewards}</h2>
                                <button className='btn' onClick={nft.claim}>Claim</button>
                            </div>
                        )
                }
                )}
                            <Unconnected wallet={wallet} isLoading={isLoading}></Unconnected>
            </div>
        </div>
    )
}
