import { useContext } from 'react';
import { Web3Context } from '../providers/web3';

const useWeb3Provider = () => {
    return useContext(Web3Context);
};

export default useWeb3Provider;