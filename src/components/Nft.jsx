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
import nftData from '../assets/nfts.json';
import FlareApes from '../abis/FlareApes.json';
import SongbirdApes from '../abis/SongbirdApes.json'
import CanaryPunks from '../abis/CanaryPunks.json'
import Unconnected from './Unconnected';
import Claimables from './Claimables';
import { useSetChain } from '@web3-onboard/react'


// img imports for nfts
import FlareApesImg from '../assets/img/FlareApes.png'
import SongbirdApesImg from '../assets/img/SongbirdApes.png'
import CanaryPunksImg from '../assets/img/CanaryPunks.png'
import FlarePunksImg from '../assets/img/FlarePunks.png'

import FlareApesLogo from '../assets/img/FlareApesLogo.png'
import SongbirdApesLogo from '../assets/img/SongbirdApesLogo.png'
import CanaryPunksLogo from '../assets/img/CanaryPunksLogo.png'
import FlarePunksLogo from '../assets/img/FlarePunksLogo.png'

import FlareApesBg from '../assets/img/FlareApesBg.png'
import SongbirdApesBg from '../assets/img/SongbirdApesBg.png'
import CanaryPunksBg from '../assets/img/CanaryPunksBg.png'
import FlarePunksBg from '../assets/img/FlarePunksBg.png'



const abis = {
    FlareApes: FlareApes,
    SongbirdApes: SongbirdApes,
    CanaryPunks: CanaryPunks
}

const visualsForCollections = {
    FlareApes: { "img": FlareApesImg, "logo": FlareApesLogo,"bg": FlareApesBg , "color": "#000", Avalible: true },
    SongbirdApes: { "img": SongbirdApesImg, "logo": SongbirdApesLogo,"bg": SongbirdApesBg, "color": "#dc4185", Avalible: true },
    CanaryPunks: { "img": CanaryPunksImg, "logo": CanaryPunksLogo,"bg": CanaryPunksBg, "color": "#00aeef", Avalible: false },
    FlarePunks: { "img": FlarePunksImg, "logo": FlarePunksLogo,"bg": FlarePunksBg, "color": "#f7d303", Avalible: true }
}


export default function Nft() {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
    const [nfts, setNfts] = React.useState([])
    const [isClaiming, setIsClaiming] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [chainToSwitchTo, setChainToSwitchTo] = React.useState('');


const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
      settingChain // boolean indicating if the chain is in the process of being set
    },
    setChainTo // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()

    

    const formatEtherNicely = (eth) => {
        console.log("ETH",eth)
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

      const createNftObj = async (_nft) => {
        let rewards = 0;
        if(wallet.chains[0]['id'] === _nft.chain)
        {
          rewards = await getRewards(_nft)
        }
        console.log(_nft.code_name)
        let nftImage = visualsForCollections[_nft.code_name]['img']
        let nftLogo = visualsForCollections[_nft.code_name]['logo']
        let nftColor = visualsForCollections[_nft.code_name]['color']
        let nftBg = visualsForCollections[_nft.code_name]['bg']
        let isAvalible = visualsForCollections[_nft.code_name]['Avalible']
        console.log(_nft.name)
        return { "name": _nft.name, "chain": _nft.chain, "chain_name":_nft.chain_name, "rewards": formatEtherNicely(rewards), "claim": () => { claimRewards(_nft) }, "image": nftImage, "logo": nftLogo,"bg": nftBg, "color": nftColor, "avalible": isAvalible}
    }

    const getContractNFT = async (_nftObj) => {
        try {
            if (!wallet) {
                console.log('Wallet not connected.')
                return
            }
            if (wallet.chains[0]['id'] !== _nftObj.chain) {
                throw new Error('Invalid chain.')
            }

            console.log('wallet', wallet.accounts[0]['address'])
            const provider = new ethers.BrowserProvider(wallet.provider, 'any')
            const signer = await provider.getSigner();
            const readContract = new ethers.Contract(_nftObj.addr, abis[_nftObj.abi_file_name], provider)
            const writeContract = new ethers.Contract(_nftObj.addr, abis[_nftObj.abi_file_name], signer)
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

    const getRewards = async (_nft) => {
        try {
            const contractCreator = await getContractNFT(_nft)
            const contract = contractCreator.read
            console.log(contract)
            const rewards = await contract[_nft.read_func](_nft.needs_address ? wallet.accounts[0]['address'] : '')
            //const rewards = await contract.getRewardsAmount(wallet.accounts[0]['address'])
            console.log("REWARDS: ", rewards)
            //const rewards = await contract.getClaimableAmountSGB(wallet.accounts[0]['address'])
            return rewards
        }
        catch (error) {
            displayError(error)
        }
    }

    const setChain = async (_nft) => {
        const SetChainOptions = {
            chainId: _nft.chain,
            chainName: _nft.chain_name,
        }
      setChainTo({chainId: _nft.chain, chainNamespace: "evm"})
      };

        

    const claimRewards = async (_nft) => {
        try {
            // if(_nft.chain != wallet.chains[0]['id'])
            // {
    
            // } else  {
                const contractCreator = await getContractNFT(_nft)
                const contract = contractCreator.write
                console.log(contract)
                const tx = await contract[_nft.claim_func](_nft.needs_address ? wallet.accounts[0]['address'] : '')
                setIsClaiming(true)
                toast.info('Claiming rewards...')
                await tx.wait()
                setIsClaiming(false)
                toast.success('Rewards claimed!')
                console.log(tx)
            // }
            //const rewards = await contract.getClaimableAmountSGB(wallet.accounts[0]['address'])
        }
        catch (error) {
            setIsClaiming(false)
            displayError(error)
        }
    }


    const getNfts = async () => {
        if (wallet && nfts.length === 0) {
            setIsLoading(true)
            let tempNfts = [...nfts]
            for (let i = 0; i < nftData.length; i++) {
                let _nft = nftData[i]
                console.log(_nft)
                console.log(wallet.chains[0]['id'], _nft.chain)
                if (nfts.filter(nft => nft.name === _nft.name).length === 0) {
                    console.log(_nft.name)
                    tempNfts.push(await createNftObj(_nft))
                }
            }
            console.log(tempNfts)
            setNfts(tempNfts)
            setIsLoading(false)
        } 

        if(wallet && nfts.length != 0) {
            setIsLoading(true)
            let tempNfts = []
            for (let i = 0; i < nftData.length; i++) {
                let _nft = nftData[i]
                console.log(_nft)
                console.log(wallet.chains[0]['id'], _nft.chain)
                if (nfts.filter(nft => nft.name === _nft.name).length === 0) {
                    console.log(_nft.name)
                    tempNfts.push(await createNftObj(_nft))
                } else {
                    tempNfts.push(await createNftObj(_nft))
                }
            }
            console.log(tempNfts)
            setNfts(tempNfts)
            setIsLoading(false)

        }
    }

    useEffect(() => {
        getNfts()
    }
        , [wallet])

    return (
        <div className='claimables-holder'>
        <div className={`holder holds-claimables`}>
            {wallet && !isLoading && nfts.map((nft, index) => {

                const isCorrectChainCurrently = nft.chain === wallet.chains[0]['id']
                    return (
                        <Claimables  name={nft.name} logo={nft.logo} img={nft.image} 
                        rewards={nft.rewards} iconColor={nft.color}
                        isCorrectChain={isCorrectChainCurrently}
                        chainName={nft.chain_name}
                        bgImg={nft.bg}
                        avalible={nft.avalible}
                        >
                         <button className={`btn ${!isCorrectChainCurrently ? "full-width" : ""}`}
                          onClick={()=>{isCorrectChainCurrently ? nft.claim() : setChain(nft)}}
                          disabled={(isCorrectChainCurrently && nft.rewards == 0)}>
                            {isCorrectChainCurrently ? "Claim" : `Switch to ${nft.chain_name}`}</button>
                        </Claimables>
                    )
            }
            )}
            <Unconnected wallet={wallet} isLoading={isLoading}></Unconnected>
        </div>
        </div>
    )
}
