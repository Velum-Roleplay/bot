import {ChartJSNodeCanvas} from "chartjs-node-canvas";
import {AttachmentBuilder} from "discord.js";
import path from "path";

import {Statistiques} from "../interface";
import {getCharacters} from "../maps";
import {capitalize} from "./index";

export async function chart(stat: Statistiques, lineColor?: string, fillColor?: string) {
	if (!lineColor) lineColor = "rgb(14,71,178)";
	if (!fillColor) fillColor = "rgba(27,137,204,0.2)";
	// for data, we need list of stats and number
	const data = {
		labels: Object.keys(stat.stats).map((key) => {
			if (key === "agilite") return "Agilité";
			return capitalize(key);
		}),
		datasets: [{
			data: Object.values(stat.stats),
			fill: true,
			backgroundColor: fillColor,
			borderColor: lineColor,
			pointStyle: "cross",
		}]
	};
	const steps = 4;
	const options = {
		elements: {
			line: {
				borderWidth: 1,
			},
		},
		scales: {
			r: {
				angleLines: {
					color: "darkgrey",
					display: true,
					lineWidth: 2,
				},
				grid: {
					color: "darkgrey",
					circular: true,
					lineWidth: 1,
					borderDash: [10, 10],
				},
				ticks: {
					stepSize: steps,
					display: true,
					//eslint-disable-next-line @typescript-eslint/no-explicit-any
					callback: (value: any) => {
						let space = "   ";
						if (value === 12) space += "   ";
						if (value === 20) space = "      ";
						if (value === 16) space = "      ";
						return `${space}• ${value}`;
					},
					color: "darkgrey",
					showLabelBackdrop: false,
					font: {
						family: "Ubuntu",
						size: 30,
					},
					z: 100,
				},
				pointLabels: {
					color: "darkgrey",
					font: {
						size: 30,
						family: "'Jost'",
						weight: "700",
					},
					display: true,
					centerPointLabels: false,
				},
				suggestedMin: 0,
				suggestedMax: 20
			},
		},
		plugins: {
			legend: {
				display: false,
			},
		},
		aspectRatio: 1,
	};
	
	const renderer = new ChartJSNodeCanvas({ width: 800, height: 800});
	let fontPath = path.resolve(__dirname, "../../assets/fonts/Jost-Regular.ttf");
	//remove dist/ in fontPath if any
	fontPath= fontPath.replace("dist/", "");
	renderer.registerFont(fontPath, {family: "Jost"});
	let ubuntuPath = path.resolve(__dirname, "../../assets/fonts/Ubuntu-Regular.ttf");
	//remove dist/ in fontPath if any
	ubuntuPath= ubuntuPath.replace("dist/", "");
	renderer.registerFont(path.resolve(ubuntuPath), {family: "Ubuntu"});

	return await renderer.renderToBuffer({
		type: "radar",
		data: data,
		options: options,
	});
}

export async function imageChar(user: string, guild: string, chara?: string, lineColor?: string, fillColor?: string) {
	const stat = getCharacters(user, guild, chara);
	if (!stat) return;
	const charGraph = await chart(stat, lineColor, fillColor);
	if (!charGraph) return;
	return new AttachmentBuilder(charGraph);
}

export async function imagePersonalized(stat: Statistiques, lineColor?: string, fillColor?: string) {
	const charGraph = await chart(stat, lineColor, fillColor);
	if (!charGraph) return;
	return new AttachmentBuilder(charGraph);
}
