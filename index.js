import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/ramanAssessment.sol/ramanAssessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerName, setOwnerName] = useState("Divneet");
  const [ownerCity, setOwnerCity] = useState("Chandigarh University");
  const [ownerStatus, setOwnerStatus] = useState("Eligible Owner");
  const [networkID, setNetworkID] = useState(null); // Initialize networkID state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [Subtract, setsub] = useState("");
  const [Multiply, setAdd] = useState("");
  const [Divide, setdiv] = useState("");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account is found like this");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("**-- Connect your Metamask wallet by clicking here --**");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet, "any");
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async (walletaddress) => {
    if (atm) {
      alert(walletaddress);
      setBalance((await atm.getBalanceFromWalletAddress(walletaddress)).toNumber());
    }
  };

  const deposit = async () => {
    alert(account);
    if (atm) {
      let tx = await atm.depositAmount(4, { gasLimit: 3e7 });
      await tx.wait();
      getBalance(account);
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdrawAmount(1, {gasLimit: 3e7 });
      await tx.wait();
      getBalance(account);
    }
  };

  const checkOwnerName = async () => {
    if (atm) {
      let ownerName = await atm.ownerName();
      setOwnerName(ownerName);
    }
  };

  const checkOwnerCity = async () => {
    if (atm) {
      let ownerCity = await atm.ownerCity();
      setOwnerCity(ownerCity);
    }
  };

  const checkOwnerStatus = async () => {
    if (atm) {
      let ownerStatus = await atm.ownerStatus();
      setOwnerStatus(ownerStatus);
    }
  };

  
  const multiply = async () => {
    if (atm) {
      const a = parseInt(inputA);
      const b = parseInt(inputB);
      let tx = await atm.multiply(a, b, { gasLimit: 3000000 });
      const receipt = await tx.wait();
      const result = receipt.events.find(event => event.event === "multiplyResult").args.result.toNumber();
      setAdd(result);
    }
  };
    const divide = async () => {
      if (atm) {
        const a = parseInt(inputA);
        const b = parseInt(inputB);
        let tx = await atm.divide(a, b, { gasLimit: 3000000 });
        const receipt = await tx.wait();
        const result = receipt.events.find(event => event.event === "divideResult").args.result.toNumber();
        setdiv(result);
      }

  };
  const checkNetworkId = async () => {
    if (!ethWallet) {
      console.error("Ethereum provider not found.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(ethWallet);
    const network = await provider.getNetwork();
    setNetworkID(network.chainId.toString());
  };


  const transferFunds = async (toAddress, amount) => {
    if (!ethWallet || !account) {
      alert("Wallet not connected");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(ethWallet);  //Creates a new Web3 provider using an existing Ethereum wallet.
      const signer = provider.getSigner();  //Retrieves the signer (account) to authorize transactions from the provider.
      const tx = await signer.sendTransaction({ //Sends the transaction to address, with ether
        to: toAddress,
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      console.log("Transaction confirmed:", tx);
      alert("Transfer successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transfer failed!");
    }
  };

  const handleInputAChange = (event) => {
    setInputA(event.target.value);
  };

  const handleInputBChange = (event) => {
    setInputB(event.target.value);
  };

  const initUser = () => {
    // Check if user has Metamask
    if (!ethWallet) {
      return <p>You need to install Metamask in order to use this ATM.</p>;
    }

    // Check if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance(account);
    }
    if (networkID === null) {
      checkNetworkId();
    }

    return (
      <div className="overlay">
        <p>Your Balance: {balance}</p>
        <p>Your Account: {account}</p>
        <p style={{ fontFamily: "Sans-serif" }}>Owner Name: {ownerName}</p>
        <p style={{ fontFamily: "Sans-serif" }}>Owner City: {ownerCity}</p>
        <p style={{ fontFamily: "Sans-serif" }}>Owner Status: {ownerStatus}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={async () => {
          alert((await atm.getBalanceFromWalletAddress(prompt("Wallet Address: "))).toNumber());
        }}>
          Check Others Balance
        </button>
        <h2>Transfer funds</h2>
      
        <div className="flex items-center justify-center mt-8">
          <div className="grid grid-cols-2 gap-6 max-w-[500px]">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Recipient address"
              className="px-4 py-3 bg-gray-100 rounded-lg shadow-md focus:outline-none"
            />
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter transfer amount (ETH)"
              className="px-4 py-3 bg-gray-100 rounded-lg shadow-md focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-4">
          <button
            className="bg-black text-white px-6 py-3 rounded-lg shadow-md focus:outline-none"
            onClick={() => transferFunds(recipientAddress, transferAmount)}
          >
            Transfer Funds
          </button>
          <h2>Calculation For Token</h2>
        <p style={{ fontFamily: "Sans-serif" }}>solution multi: {Multiply}</p>
        <p style={{ fontFamily: "Sans-serif" }}>solution div:{Divide}</p>
        <input
          type="number"
          placeholder="Enter the value of first variable A: "
          value={inputA}
          onChange={handleInputAChange}
        />
        <input
          type="number"
          placeholder="Enter the value of the second variable B: "
          value={inputB}
          onChange={handleInputBChange}
        />

        <button style={{ backgroundColor: "yellow" }} onClick= {multiply}>
        solution multi:
        </button>
        <button style={{ backgroundColor: "yellow" }} onClick={divide}>
        solution div:
        </button>
        </div>
      
      </div>
        
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>WELCOME TO  ** Chandigarh University Track **</h1>
        <p>Let's TRANSACT</p>
        <p>MAKE A SELECTION:-</p>
      </header>
      
      {initUser()}
      <style jsx>
        {`
          .container {
            text-align: center;
            background-color: black;
            background-size: cover;
            color: olive green;
            font-family: "Times New Roman", serif;
            border: 10px solid black;
            border-radius: 20px;
            background-image: url("https://i.pinimg.com/originals/6a/66/7f/6a667f769cef106afa00d2c309816a21.jpg");
            height: 850px;
            width: 1500px;
            opacity: 0.9 ;
            font-weight: 1000;
          }

          header {
            padding: 10px;
          }

          h1 {
            font-family: "Arial", serif;
            font-size: 60px;
            margin-bottom: 20px;
          }

          p {
            font-size: 24px;
          }

          button {
            background-color: #4caf50;
            color: white;
            border: none;
            padding: 200px 30px;
            font-size: 2000px;
            cursor: pointer;
          }

          button:hover {
            cursor: pointer;
          }
        }
      `}
    </style>
  </main>
 );
  }
