import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import "antd/dist/antd.css";
import "./index.scss";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import { MoralisProvider } from "react-moralis";

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<MoralisProvider
					serverUrl={process.env.REACT_APP_SERVER_URL}
					appId={process.env.REACT_APP_APP_ID}
				>
					<App />
				</MoralisProvider>
			</PersistGate>
		</Provider>
	</React.StrictMode>,
	document.getElementById("root")
);
