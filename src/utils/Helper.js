class Helper {
	numberToCurrencyStyle(x, style = ".") {
		if (!x) return `0,0`;
		let nString = x.toString();
		let first = nString.split(".")[0];
		let se = nString.split(".")[1];
		if (!se) se = 0;
		return `${first.toString().replace(/\B(?=(\d{3})+(?!\d))/g, style)}${
			se === "0" ? "" : "," + se
		}`;
	}

	shortTextAdress(address) {
		if (!address) return "no connect";
		const first = address.slice(0, 5);
		const last = address.slice(-4);
		return `${first}...${last}`;
	}
	/**
	 * @dev get img http from tokenUri
	 */
	getImgHttp(tokenUri) {
		const hash = tokenUri.split("//")[1];
		return `https://gateway.pinata.cloud/ipfs/${hash}`;
	}

	optionsDateJs(day, options, timeZone) {
		options.timeZone = timeZone;
		return new Date(day).toLocaleString("en-US", options);
	}
}

export default new Helper();
