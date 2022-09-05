import React from "react";
import { Input } from "antd";
import "./index.scss";

const InputBid = ({ placeholder, inputHandler, width, height, value }) => {
	return (
		<div
			id="input-bidder"
			className={`${width ? `w-[${width}]` : "w-[75%]"} ${
				height ? `h-[${height}]` : "h-[40px]"
			}`}
		>
			<Input value={value} placeholder={placeholder} onChange={inputHandler} />
		</div>
	);
};

export default InputBid;
