import React from "react";
import "./index.scss";
import { Button } from "antd";

const ButtonBid = ({
	text,
	clickHandler,
	loading,
	width,
	height,
	disabled,
}) => {
	return (
		<div
			className={`${width ? `w-[${width}]` : "w-[22.5%]"} ${
				height ? `h-[${height}]` : "h-[40px]"
			}`}
			id="btn-bidder"
		>
			<Button loading={loading} onClick={clickHandler} disabled={disabled}>
				{text}
			</Button>
		</div>
	);
};

export default ButtonBid;
