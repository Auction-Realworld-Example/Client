import React, { useState, useEffect } from "react";
import { useMoralis, useChain } from "react-moralis";
import { Button, Tabs } from "antd";
import RenderIf from "./configs/RenderIf";
import Auction from "./components/Auction";
import Collection from "./components/Collection";

const { TabPane } = Tabs;
const App = () => {
	const {
		authenticate, // help us to connect your metamask to dapp
		isAuthenticated, // check whether you are login with metamask in your dapp
		isAuthenticating, // false => true => false => using for making loading
		user,
		account,
		logout,
	} = useMoralis();
	const { chainId, switchNetwork } = useChain();
	console.log("Chain: ", parseInt(chainId, 16));
	const [userAddress, setUserAddress] = useState("");
	const login = async () => {
		await authenticate()
			.then((user) => {
				setUserAddress(user.get("ethAddress"));
				sessionStorage.setItem("metamask-address", user.get("ethAddress"));
			})
			.catch((e) => {
				console.log("Error");
				console.log(e);
			});
	};

	const logOut = async () => {
		await logout();
		sessionStorage.removeItem("metamask-address");
		sessionStorage.removeItem("metamask-chainId");
	};

	useEffect(() => {
		(async () => {
			if (!sessionStorage.getItem("metamask-address")) {
				await logout();
			}
		})();
	}, []);

	useEffect(() => {
		if (account) {
			sessionStorage.setItem("metamask-address", account);
			setUserAddress(account);
		} else {
			setUserAddress(sessionStorage.getItem("metamask-address"));
		}
	}, [account]);

	useEffect(() => {
		if (chainId && chainId != 97) {
			if (
				window.confirm(
					"You are not on BSC Testnet, do you want to change to BSC Testnet"
				) == true
			) {
				switchNetwork(97);
			} else {
				logOut();
			}
		}
		if (chainId) {
			sessionStorage.setItem("metamask-chainId", chainId);
		} else {
			sessionStorage.setItem("metamask-chainId", "0x61");
		}
	}, [chainId]);
	return (
		<div className="p-20 w-100 h-[100%] bg-black text-center" id="app">
			<h2 className="text-white text-2xl font-bold">Moralis Hello World! 🚀</h2>
			<div className="flex justify-center items-center mt-2">
				<RenderIf isTrue={!isAuthenticated}>
					<Button type="primary" onClick={login} loading={isAuthenticating}>
						🦊 Moralis Metamask Login
					</Button>
				</RenderIf>
				<RenderIf isTrue={isAuthenticated}>
					<p className="text-white font-medium text-base">
						Welcome, {userAddress}
					</p>
					<Button
						type="primary mx-2"
						ghost
						onClick={logOut}
						disabled={isAuthenticating}
					>
						Logout
					</Button>
				</RenderIf>
			</div>
			<RenderIf isTrue={isAuthenticated}>
				<div className="flex justify-center items-center mt-2 mb-2">
					<p className="text-base text-white">{`You are using chain: ${
						chainId
							? parseInt(chainId, 16)
							: parseInt(sessionStorage.getItem("metamask-chainId"), 16)
					}`}</p>
				</div>
			</RenderIf>
			<>
				<Tabs defaultActiveKey="1">
					<TabPane tab="Auction" key="1">
						<Auction />
					</TabPane>
					<TabPane tab="NFT Collection" key="2">
						<Collection />
					</TabPane>
				</Tabs>
			</>
		</div>
	);
};

export default App;
