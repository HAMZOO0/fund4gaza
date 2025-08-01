import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, ContractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const ownerButton = document.getElementById("owner");
const fundButton = document.getElementById("fundButton");
const WithdrawButton = document.getElementById("WithdrawButton");
const getBalanceButton = document.getElementById("GetBalance");
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner(); //signer=  Get the currently connected wallet (account) from MetaMask that will sign and send transactions to the blockchain.

connectButton.onclick = connect;
fundButton.onclick = fund;
WithdrawButton.onclick = withdraw;
getBalanceButton.onclick = getBalance;
ownerButton.onclick = findContractOwner;

async function connect() {
   if (window.ethereum !== "undefined") {
      // account have array of metamask accounts and accout[0] is currect account which we are using.
      const account = await window.ethereum.request({
         method: "eth_requestAccounts",
      });
      // console.log(ethers);

      // connect with metamask
      document.getElementById("connectButton").innerHTML = `Connected ${account[0]}`;
   } else {
      console.log("Meta-Mask Not Found");
      document.getElementById("connectButton").innerHTML = "Please Install MetaMask!";
   }
}
async function fund() {
   //provider  - connection with blockchain
   //signer - wallet  - someone with some gas
   // contract - that we are interating with

   const inputAmount = document.getElementById("ethInput").value;

   if (!inputAmount || isNaN(inputAmount)) {
      alert("Please enter a valid ETH amount");
      return;
   }

   const sendValue = ethers.utils.parseEther(inputAmount.toString()); // 1 ETH

   // const provider = new ethers.providers.Web3Provider(window.ethereum);
   // const signer = provider.getSigner();
   //  console.log("signer :: ", signer);
   const contract = new ethers.Contract(ContractAddress, abi, signer);
   try {
      const txResponse = await contract.Fund({ value: sendValue });
      await txResponse.wait();
      console.log("Funded ✅");
      // const owner = await contract.getOwner();
      // console.log("Owner Address:", owner);
   } catch (err) {
      console.error("❌ Error funding:", err);
   }
}
async function withdraw() {
   const isOwner = await findContractOwner();

   // const provider = new ethers.providers.Web3Provider(window.ethereum);
   // const signer = provider.getSigner();
   const contract = new ethers.Contract(ContractAddress, abi, signer);
   if (!isOwner) {
      alert("Only the contract owner can withdraw funds");
      return;
   }

   try {
      const txResponse = await contract.cheaperWithdraw();
      await txResponse.wait();
      console.log("Withdraw Successful ✅");
   } catch (error) {
      console.error("❌ Withdraw failed:", error);
   }
}

async function getBalance() {
   if (window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(ContractAddress);
      const string_balance = balance.toString();
      alert(`Contract Balance: ${ethers.utils.formatEther(string_balance)} ETH`);

      console.log(ethers.utils.formatEther(string_balance));
   }
}

async function findContractOwner() {
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();
   const contract = new ethers.Contract(ContractAddress, abi, signer);
   const currentUser = await signer.getAddress();
   const owner = await contract.getOwner();

   console.log("🔑 Contract Owner:", owner);
   alert(`Contract Owner : ${owner}`);

   if (owner.toLowerCase() == currentUser.toLowerCase()) {
      console.log("🧑 You (Connected Account):", currentUser);
      console.log("✅ You ARE the contract owner");

      return true;
   } else {
      console.log("❌ You are NOT the contract owner");

      return false;
   }
}
