import { useState, useEffect } from "react";
import "./App.css";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { MintNFTForm } from "./Mint";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Metamask is not installed");
      return false;
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (!accounts.length) {
      console.log("No authorized accounts found");
      return false;
    }
    console.log("Authorized account found:", accounts[0]);
    setCurrentAccount(accounts[0]);
    return true;
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <ConnectWalletButton
        currentAccount={currentAccount}
        setCurrentAccount={setCurrentAccount}
      />
      <MintNFTForm currentAccount={currentAccount} />
    </div>
  );
}
