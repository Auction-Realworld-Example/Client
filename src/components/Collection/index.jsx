import React, { useState, useEffect } from "react";
import baseImg from "../../assets/image/5.jpg";
import { Divider, Image } from "antd";
import { ethers } from "ethers";
import { nftAddress, nftAbi } from "../../configs/contracts/nft";
import { useMoralis, useMoralisQuery } from "react-moralis";
import Helper from "../../utils/Helper";
import axios from "axios";
const Collection = () => {
	const { enableWeb3, isAuthenticated, authenticate } = useMoralis();
	const [nftData, setNftData] = useState([]);
	const [provider, setProvider] = useState({
		data: null,
		isSigner: false,
	});

	useEffect(() => {
		(async () => {
			if (isAuthenticated) {
				const web3Provider = await enableWeb3();
				const signer = web3Provider.getSigner();
				setProvider({ ...provider, data: signer, isSigner: true });
			} else {
				await authenticate();
			}
		})();
	}, [isAuthenticated]);

	useEffect(() => {
		(async () => {
			if (provider.isSigner) {
				const signer = provider.data;
				const nftContract = new ethers.Contract(nftAddress, nftAbi, signer);
				const address = await signer.getAddress();
				const nftTotal = await nftContract.balanceOf(address);
				for (let idx = 0; idx < nftTotal; idx++) {
					const nftId = await nftContract.tokenOfOwnerByIndex(address, idx);
					console.log("NFT ID:", nftId);
					const uri = await nftContract.tokenURI(nftId);
					const data = await axios.get(Helper.getImgHttp(uri));
					console.log(data);
					if (data.status == 200 || data.status == 201) {
						setNftData((item) => [...item, data.data]);
					}
				}
			}
		})();
	}, [provider]);
	return (
		<div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[16px]">
			{[...nftData].map((item, idx) => (
				<div
					className="text-left border-white border-solid border-[1px] p-[24px]"
					key={idx}
				>
					<Image src={item?.image} preview={false} />
					<h3 className="text-[24px] text-white font-bold mt-[16px]">
						{item?.name}
					</h3>
					{/* <p className="text-base text-[#72ec9c] font-medium">{ethers.utils.formatEther(item?)} MDT</p> */}
				</div>
			))}
		</div>
	);
};

export default Collection;
