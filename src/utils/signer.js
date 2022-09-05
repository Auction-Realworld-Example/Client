const ethers = require("ethers");
const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545"; // bsc
// const rpcUrl = "https://polygontestapi.terminet.io/rpc"; // matic

function getProvider() {
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
	return provider;
}

module.exports = {
	getProvider,
};
