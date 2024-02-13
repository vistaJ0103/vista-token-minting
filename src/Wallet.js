import { React, useState, useEffect } from "react";
import token_abi from "./Contracts/token_abi.json";
import detectEthereumProvider from "@metamask/detect-provider";
const ethers = require("ethers");

const Wallet = () => {
  const contractAddress = "0xF5aA9824496903927E464c8b2248B6B565dB0D68";

  const [tokenName, setTokenName] = useState("Token");
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      await provider
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChangeHandler(result[0]);
          setConnButtonText("wallet connected");
        })
        .catch((err) => {
          setErrorMessage(err.message);
        });
    } else {
      setErrorMessage("Please install Metamask");
    }
  };
  const accountChangeHandler = (newAddress) => {
    setDefaultAccount(newAddress);
    updateEthers();
  };
  const updateEthers = async () => {
    const provider = await detectEthereumProvider();
    let tempProvider = new ethers.BrowserProvider(provider);
    let tempSigner = await tempProvider.getSigner();
    let tempContract = new ethers.Contract(
      contractAddress,
      token_abi,
      tempSigner
    );
    setContract(tempContract);
  };
  useEffect(() => {
    if (contract != null) {
      updateBalance();
      updateTokenName();
    }
  }, [contract]);
  const updateBalance = async () => {
    let balanceBigN = await contract.balanceOf(defaultAccount);
    let decimals = await contract.decimals();
    let tokenBalance = ethers.formatUnits(balanceBigN, decimals);
    setBalance(tokenBalance);
  };
  const updateTokenName = async () => {
    setTokenName(await contract.name());
  };
  const addBlackList = async (e) => {
    e.preventDefault();
    let recieverAddress = e.target.recieverAddress.value;
    await contract.addToBlacklist(recieverAddress);
  };
  const removeBlackList = async (e) => {
    e.preventDefault();
    let recieverAddress = e.target.recieverAddress.value;
    await contract.removeFromBlacklist(recieverAddress);
  };
  // const updateBlackList = async () => {
  //   setBlacklist(await contract.blackLists(defaultAccount));
  //   console.log(await contract.blackLists(defaultAccount));
  // };

  const transferHandler = async (e) => {
    e.preventDefault();
    let transferAmount = e.target.sendAmount.value;
    let recieverAddress = e.target.recieverAddress.value;
    let decimals = await contract.decimals();
    let tx = await contract.transfer(
      recieverAddress,
      ethers.parseUnits(transferAmount, decimals)
    );
    await tx.wait();
    // } else {
    //   setErrorMessage("User is not on the blacklist.");
    // }

    updateBalance();
  };
  const changeOwner = async (e) => {
    e.preventDefault();
    let newAddress = e.target.changeOwnerAddress.value;
    await contract.transferOwnership(newAddress);
  };
  const tokenMint = async (e) => {
    e.preventDefault();
    let mint = e.target.tokenMint.value;
    await contract.mint(mint);
    updateBalance();
  };

  return (
    <div>
      <h2> {tokenName + "ERC-20 wallet"} </h2>
      <button onClick={connectWallet}>{connButtonText}</button>
      <div>
        <div>
          <h3> Address: {defaultAccount}</h3>
        </div>
        <div>
          <h3>
            {" "}
            {tokenName} Balance: {balance}
          </h3>
        </div>
        {errorMessage}
      </div>
      <div className="wallet">
        <div>
          <form onSubmit={tokenMint}>
            <h3>TokenMint</h3>
            <input type="text" id="tokenMint" />
            <button type="subimit">Mint</button>
          </form>
        </div>
        <div>
          <form onSubmit={changeOwner}>
            <h3>ChangeOwner</h3>
            <input type="text" id="changeOwnerAddress" />
            <button type="subimit"> Change</button>
          </form>
        </div>
      </div>
      <div>
        <form onSubmit={transferHandler}>
          <h3>Transfer Coins</h3>
          <div className="wallet">
            {" "}
            <div>
              {" "}
              <p>Reciever Address</p>
              <input type="text" id="recieverAddress" />
            </div>
            <div>
              {" "}
              <p>Send amount</p>
              <input type="number" id="sendAmount" min="0" />
              <button type="subimit"> send</button>
            </div>
          </div>
        </form>
      </div>
      <div className="wallet">
        <form onSubmit={addBlackList}>
          <h3>Add BlackList</h3>
          <p>Reciever Address</p>
          <input type="text" id="recieverAddress" />

          <button type="subimit"> Add</button>
        </form>
        <form onSubmit={removeBlackList}>
          <h3>Delete BlackList</h3>
          <p>Reciever Address</p>
          <input type="text" id="recieverAddress" />

          <button type="subimit"> Delete</button>
        </form>
      </div>
    </div>
  );
};

export default Wallet;
