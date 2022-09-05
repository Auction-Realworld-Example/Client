/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {},
		screens: {
			sm: "320px",
			md: "576px",
			lg: "768px",
			xl: "1024px",
			"2xl": "1280px",
		},
	},
	plugins: [],
};
