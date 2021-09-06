/*
    @Author akdadoc 2020 
    metamask api
*/

//  MetaMask Provider
const provider = await detectEthereumProvider();
const server = "http://bfd.samaritannet.com";
const port = 8080;
const forwarderOrigin = server + ":" + port + "/bfd";
const web3 = new Web3(provider);

//Create Contract Instance
import { bfdAbi } from "./bfdAbi.js";
const bfdAddress = "0x041d5F549bB9d3b75f703be8e698Eee3cDF04E0A";

const contract = new web3.eth.Contract(bfdAbi, bfdAddress);

if (provider) {
  console.log("MetaMask is  Installed!");
} else {
  console.log("Please install MetaMask!");
}

const initialize = () => {
  //  basic button functions
  const mintButton = document.getElementById("mintButton");
  const onboardButton = document.getElementById("connectButton");
  const accountUser = document.getElementById("user");
  const balanceUser = document.getElementById("balance");
  const tokenIdUser = document.getElementById("tokenid");
  const tokenUriUser = document.getElementById("tokenuri");
  const respondOut = document.getElementById("response");
  const urlImg = document.getElementById("asset");
  const totalMinited = document.getElementById("total-minted");

  //We create a new MetaMask onboarding object to use in our app
  const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

  //Created check function to see if the MetaMask extension is installed
  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  // Start the Minting of a NFT
  const onMint = () => {
    MintDick();
  };

  //This will start the onboarding proccess
  const onClickInstall = () => {
    onboardButton.innerText = "Onboarding in progress";
    onboardButton.disabled = true;
    //On this object we have startOnboarding which will start the onboarding process for our end user
    onboarding.startOnboarding();
  };

  const onClickConnect = async () => {
    try {
      // Will open the MetaMask UI
      // You should disable this button while the request is pending!
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error(error);
    } finally {
      web3.eth.getChainId().then((chainId) => {
        if (chainId == 20018) {
          respondOut.innerText =
            "You are now Connected to The Samaritan Block Chain";
        } else {
          respondOut.innerText = "You are connected to chainId: " + chainId;
        }
      });
    }
    mintButton.disabled = false;
  };

  /**********************************************************/
  /* Handle chain (network) and chainChanged (per EIP-1193) */
  /**********************************************************/

  const chainId = async () => {
    try {
      await ethereum.request({ method: "eth_chainId" });
    } catch (error) {
      console.error(error);
    } finally {
      handleChainChanged(chainId);
    }
  };

  ethereum.on("chainChanged", handleChainChanged);

  function handleChainChanged(_chainId) {
    // We recommend reloading the page, unless you must do otherwise
    window.location.reload();
  }

  /***********************************************************/
  /* Handle user accounts and accountsChanged (per EIP-1193) */
  /***********************************************************/

  let currentAccount = null;
  ethereum
    .request({ method: "eth_accounts" })
    .then(handleAccountsChanged)
    .catch((err) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err);
    });

  // Note that this event is emitted on page load.
  // If the array of accounts is non-empty, you're already
  // connected.
  ethereum.on("accountsChanged", handleAccountsChanged);

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log("Please connect to MetaMask.");
      MetaMaskClientCheck();
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      console.log("accounts changed to: " + currentAccount);
      accountUser.innerText = currentAccount;
      onboardButton.innerText = "Now Connected";
      balanceOfOwner();
    }
  }

  function getJson(url) {
    $.getJSON(url, function(result) {
      urlImg.src = result.image;
    });
  }
  /***********************************************************/
  /* Handle contract interactions                             */
  /***********************************************************/

  async function balanceOfOwner() {
    contract.methods
      .balanceOf(currentAccount)
      .call({ from: currentAccount })
      .then((owned) => {
        console.log(owned);
        if (owned !== "0") {
          mintButton.disabled = true;
          OwnerAssetId();
        }
        balanceUser.innerText = owned;
        Minted();
      });
  }
  async function Minted() {
    contract.methods
      .minted()
      .call({ from: currentAccount })
      .then((total) => {
        console.log(total);
        totalMinited.innerText = "Total minted : " + total + "|2000";
      });
  }
  async function OwnerAssetId() {
    contract.methods
      .getOwnerTokenId(currentAccount)
      .call({ from: currentAccount })
      .then((id) => {
        tokenIdUser.innerText = id;
        if (id !== "0") {
          AssetUri(id);
        }
      });
  }
  async function AssetUri(_id) {
    contract.methods
      .tokenURI(_id)
      .call({ from: currentAccount })
      .then((url) => {
        tokenUriUser.innerText = url;
        getJson(url);
      });
  }

  async function MintDick() {
    await contract.methods
      .mintDick()
      .send({ from: currentAccount, gas: 3000000 }, (error) => {
        alert("Minting A Dick...");
      })
      .on("confirmation", (confirmations, receipt) => {
        console.log("CONFIRMATION");
        console.log(confirmations);
        console.log(receipt);
      })
      .on("receipt", (receipt) => {
        console.log(receipt);
      })
      .on("error", (error) => {
        alert(JSON.stringify(error));
      });
  }

  const MetaMaskClientCheck = () => {
    //Now we check to see if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      //If it isn't installed we ask the user to click to install it
      onboardButton.innerText = "Click here to install MetaMask!";

      //When the button is clicked we call this function
      onboardButton.onclick = onClickInstall;
      //The button is now disabled
      onboardButton.disabled = false;
    } else {
      //If it is installed we change our button text
      onboardButton.innerText = "Connect Wallet";
      accountUser.innerText = "No Account Connected";

      //When the button is clicked we call this function to connect the users MetaMask Wallet
      onboardButton.onclick = onClickConnect;
      mintButton.onclick = onMint;
      mintButton.disabled = true;
    }
  };
  MetaMaskClientCheck();
};

window.addEventListener("DOMContentLoaded", initialize);
