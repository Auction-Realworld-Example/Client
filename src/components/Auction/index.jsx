import React, { useEffect, useState } from "react";
import baseImg from "../../assets/image/5.jpg";
import { Row, Col, Image, Space, Divider } from "antd";
import { useMoralisQuery, useMoralis } from "react-moralis";
import { makeQueryBuilder } from "../../utils/moralis";
import InputBid from "../common/InputBid";
import ButtonBid from "../common/ButtonBid";
import Helper from "../../utils/Helper";
import { ethers } from "ethers";
import { nftAddress, nftAbi } from "../../configs/contracts/nft";
import { auctionAddress, auctionAbi } from "../../configs/contracts/auction";
import { tokenAddress, tokenAbi } from "../../configs/contracts/token";
import RenderIf from "../../configs/RenderIf";
import { getProvider } from "../../utils/signer";
import { message } from "antd";
import CountdownClock from "../Countdown";
import axios from "axios";
import moment from "moment";

const Auction = () => {
	const [nftData, setNftData] = useState([]);
	const [sessionData, setSessionData] = useState();
	const [bidValue, setBidValue] = useState();
	const [provider, setProvider] = useState({
		data: null,
		isSigner: false,
	});
	const [btnLoading, setBtnLoading] = useState(false);
	const [imgLoading, setImgLoading] = useState(false);
	const [entranceFee, setEntranceFee] = useState();
	const [canBid, setCanBid] = useState(true);
	const [noAuctionData, setNoAuctionData] = useState(false);
	const { enableWeb3, isAuthenticated, authenticate } = useMoralis();
	const { data: openData, isLoading: openLoading } = useMoralisQuery(
		"AuctionOpened",
		(query) => query.descending("createdAt").limit(1),
		[],
		{
			live: true,
			onLiveUpdate: (entity, all) => {
				setCanBid(true);
				setNoAuctionData(false);
				return [entity, ...all];
			},
		}
	);
	const { data: bidData, isLoading: bidLoading } = useMoralisQuery(
		"AuctionPlaceBid",
		(query) =>
			query
				.equalTo("nftId", sessionData?.nftId)
				.descending("createdAt")
				.descending("bidPrice")
				.limit(3),
		[sessionData],
		{
			live: true,
			onLiveEnter: (entity, all) => {
				console.log(entity);
				return [entity, ...all].splice(0, 3);
			},
		}
	);

	const { data: closeData, isLoading: closeLoading } = useMoralisQuery(
		"AuctionClosed",
		(query) => query.descending("createdAt").limit(1),
		[],
		{
			live: true,
			onLiveUpdate: (entity, all) => {
				return [entity, ...all];
			},
		}
	);
	/**
	 * Case 1: If auction is opened and not closed
	 * closeData[0].attributes.nftId != openData[0].attributes.nftId right ?
	 * Case 2: If auction is opened and closed
	 * closeData[0].attributes.nftId == openData[0].attributes.nftId
	 * + Case 2.1:
	 * 			if (nft is not burned): => not do anything on UI, maybe just show
	 *
	 * + Case 2.2:
	 * 			if (nft is burned) => what we will show ???, I think we will show the lastest close auction that not be burn
	 * 				2.2.1: if (we can't get the lastest close auction data that not be burn) => display that show UI: there
	 * 				are no auction at this time
	 */
	async function placeBid() {
		if (!bidValue) {
			message.error("Please place a bid!");
			return;
		}
		if (
			bidData[0]?.attributes?.bidPrice &&
			parseInt(bidValue) <=
				parseInt(ethers.utils.formatEther(bidData[0].attributes.bidPrice))
		) {
			message.error("You have to bid more than current bid");
			return;
		}
		if (provider.isSigner == false) {
			await authenticate();
		}
		setBtnLoading(true);
		const tokenContract = new ethers.Contract(
			tokenAddress,
			tokenAbi,
			provider.data
		);
		const auctionContract = new ethers.Contract(
			auctionAddress,
			auctionAbi,
			provider.data
		);
		const tx1 = await tokenContract.approve(
			auctionAddress,
			ethers.utils.parseEther(bidValue?.toString())
		);
		await tx1.wait();
		const tx2 = await auctionContract.placeBid(
			ethers.utils.parseEther(bidValue.toString()),
			{
				value: entranceFee,
			}
		);
		await tx2.wait();
		setBtnLoading(false);
		setBidValue();
	}

	async function handleData(data) {
		try {
			console.log(data);
			let nftNumber = data?.attributes?.nftId;
			setSessionData(data?.attributes || []);
			const nftContract = new ethers.Contract(
				nftAddress,
				nftAbi,
				provider.data
			);
			const auctionContract = new ethers.Contract(
				auctionAddress,
				auctionAbi,
				provider.data
			);
			setImgLoading(true);
			const uri = await nftContract.tokenURI(nftNumber); // ipfs://<hash>
			const response = await axios.get(Helper.getImgHttp(uri));
			const fee = await auctionContract.entranceFee();
			setEntranceFee(fee.toString());
			if (response.status == 200 || response.status == 201) {
				setNftData(response.data);
			}
			/**
			 * @dev Have to set to false to not run to case that data initialize = [] and setNoAuctionData(true)
			 */
			setNoAuctionData(false);
		} catch (e) {
			setNftData({ ...nftData, image: baseImg, name: "Multi Deactive Token" });
			if (openData.length == 0 && !openLoading) {
				setNoAuctionData(true);
			}
			console.log(e);
		} finally {
			setImgLoading(false);
		}
	}

	useEffect(() => {
		(async () => {
			if (closeData.length > 0 && !closeLoading) {
				try {
					if (closeData[0].attributes.nftId == openData[0].attributes.nftId) {
						if (closeData[0].attributes.finalPrice == 0) {
							const query = makeQueryBuilder("AuctionClosed")
								.descending("createdAt")
								.notEqualTo("finalPrice", "0")
								.limit(1);
							message.info("NFT is burned!");
							const data = await query.find();
							console.log(data);
							if (data.length > 0) {
								await handleData(data[0]);
							} else {
								setNoAuctionData(true);
							}
						}
					} else {
						await handleData(openData[0]);
					}
				} catch (e) {}
			} else {
				if (!openLoading) {
					if (openData.length > 0) {
						await handleData(openData[0]);
					}
				}
			}
		})();
	}, [closeData, openData]);

	useEffect(() => {
		(async () => {
			if (isAuthenticated) {
				const data = await enableWeb3();
				const signer = await data.getSigner();
				setProvider({ ...provider, isSigner: true, data: signer });
			} else {
				setProvider({ ...provider, isSigner: false, data: getProvider() });
			}
		})();
	}, [isAuthenticated]);

	return (
		<>
			<RenderIf isTrue={!noAuctionData}>
				<Row justify="space-between" className="p-5">
					<Col span={11}>
						{!imgLoading && (
							<Image
								src={nftData?.image}
								fallback={baseImg}
								className="object-contain"
								preview={false}
							/>
						)}
					</Col>
					<Col span={11} className="px-[8px] text-left">
						<Space size={12} direction="vertical" className="w-full">
							<p className="text-base font-medium text-white">
								<span className="text-[#999]">Ends on</span>{" "}
								{sessionData
									? moment(parseInt(`${sessionData.endTime}000`)).format("LL")
									: moment().format("LL")}
							</p>
							<h2 className="text-3xl text-white font-bold">
								{nftData?.name || "Multi Deactive Token"}
							</h2>
							<div className="flex justify-between items-center">
								<div>
									<p className="text-[24px] text-[#72ec9c] font-bold">
										{Helper.numberToCurrencyStyle(
											bidData.length == 0
												? 0
												: ethers.utils.formatEther(
														bidData[0]?.attributes?.bidPrice
												  )
										)}{" "}
										MDT
									</p>
									<p className="text-base font-medium text-[#999]">
										Current Bid
									</p>
								</div>
								<div>
									<p className="text-[24px] text-[#72ec9c] font-bold">
										{Helper.numberToCurrencyStyle(
											entranceFee ? ethers.utils.formatEther(entranceFee) : 0
										)}{" "}
										ETH
									</p>
									<p className="text-base font-medium text-[#999] whitespace-nowrap underline underline-offset-8">
										Entrance Fee
									</p>
								</div>
							</div>
							<div>
								{/* <p className="text-[24px] text-white font-bold">12:00:00</p> */}
								<RenderIf isTrue={!openLoading && openData.length > 0}>
									<CountdownClock
										expiredTime={parseInt(
											sessionData
												? `${sessionData.endTime}000`
												: moment().toDate().getTime()
										)}
										className="text-[24px] text-white font-bold"
										messageWarning="Session is expired! You can't bid at this time"
										func={() => {
											setCanBid(false);
										}}
									></CountdownClock>
								</RenderIf>
								<RenderIf isTrue={false}>
									<p className="text-[24px] text-white font-bold">00:00:00</p>
								</RenderIf>
								<p className="text-base font-medium text-[#999] whitespace-nowrap">
									Day remaining
								</p>
							</div>
							<div className="flex justify-between wrap">
								<InputBid
									inputHandler={(e) => {
										setBidValue(e.target.value);
									}}
									value={bidValue}
								/>
								<ButtonBid
									text={"Place Bid"}
									disabled={!canBid}
									clickHandler={placeBid}
									loading={btnLoading}
								/>
							</div>
							<Divider />
							<Space direction="vertical" size={12} className="w-full">
								<h3 className="text-white text-[24px] font-bold">
									History Bid:
								</h3>
								{[...bidData].map((item, idx) => (
									<div className="flex justify-between w-full" key={idx}>
										<span className="text-base font-medium text-[#999]">
											{Helper.shortTextAdress(item?.attributes?.bidder)}
										</span>
										<span className="text-[#72ec9c] text-base font-medium">
											{Helper.numberToCurrencyStyle(
												ethers.utils.formatEther(item?.attributes?.bidPrice) ||
													0
											)}{" "}
											MDT
										</span>
									</div>
								))}
							</Space>
						</Space>
					</Col>
				</Row>
			</RenderIf>
			<RenderIf isTrue={noAuctionData}>
				<h2 className="text-3xl text-white font-bold">
					There are no auction opened at this time!
				</h2>
			</RenderIf>
		</>
	);
};

export default Auction;
