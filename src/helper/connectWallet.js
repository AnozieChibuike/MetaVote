import Web3 from "web3";

async function loadWeb3(networkChainId, chainName, RPC_URL, explorerUrl) {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const chainId = await web3.eth.getChainId();
      // alert(chainId);
      if (chainId !== parseInt(networkChainId, 16)) {
        try {
          // Prompt MetaMask to switch to Minato Testnet
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: networkChainId }],
          });
        } catch (error) {
          // If the chain is not added to MetaMask, add it
          alert(error.code);
          if (error.code === 4902 || error.code === -32603) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: networkChainId,
                    chainName: chainName,
                    rpcUrls: [RPC_URL],
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    blockExplorerUrls: [explorerUrl],
                  },
                ],
              });
              // alert(chainName + "Testnet added and switched!");
            } catch (addError) {
              alert(addError.message);
              alert(`Failed to add ${chainName} Testnet`, addError.message);
              return;
            }
          } else {
            console.error(`Failed to switch to ${chainName} Testnet`, error);
          }
        }
      }
      const accounts = await web3.eth.getAccounts();

      return accounts;
      // setAccount(accounts[0]);
      // // Load contract
      // const votingContract = new web3.eth.Contract(
      //   contractABI,
      //   contractAddress
      // );
      // console.log(votingContract);
      // setWeb3(web3);
      // setContract(votingContract);
      // checkVotingStatus(votingContract);
      // loadCandidates(votingContract);
    } catch (error) {
      console.error("Error connecting to Web3:", error);
    }
  } else {
    openMetaMaskDeepLink();
    alert("Please use MetaMask to access the page!");
  }
}

function openMetaMaskDeepLink() {
  const host = window.location.hostname;
  const port = window.location.port ? ":" + window.location.port : "";
  const metamaskAppDeepLink = `https://metamask.app.link/dapp/${host}${port}`;

  // Redirect to the MetaMask deep link
  window.location.href = metamaskAppDeepLink;
}
export default loadWeb3;
