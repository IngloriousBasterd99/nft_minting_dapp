import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './contractABI';

const contractAddress = '0x321B29FeD4c7bEBfe564C5A1512d65A4a278d73F';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [amount, setAmount] = useState(1);
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setContract(contract);
      loadOwnedNFTs(signer, contract);
    }
  }, []);

  async function mintNFT() {
    if (!contract) return;
    try {
      const tx = await contract.mint(amount);
      await tx.wait();
      loadOwnedNFTs(signer, contract);
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  }

  async function loadOwnedNFTs(signer, contract) {
    console.log('Loading owned NFTs...');
    if (!signer || !contract) return;
    const address = await signer.getAddress();
    const balance = await contract.balanceOf(address);
    let ownedNfts = [];
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);
      const tokenURI = await contract.tokenURI(tokenId);
      const metadata = await fetch(tokenURI).then((response) => response.json());
      ownedNfts.push(metadata.image);
    }
    console.log('Owned NFTs:', ownedNfts);
    setNfts(ownedNfts);
  }

  return (
    <div>
      <h1>Mint NFTs</h1>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" max="10" />
      <button onClick={mintNFT}>Mint NFT</button>
      <h2>Your NFTs</h2>
      <div>
        {nfts.map((nft, index) => (
          <img key={index} src={nft} alt="NFT" style={{ width: 100, height: 100, margin: 10 }} />
        ))}
      </div>
    </div>
  );
}

export default App;
