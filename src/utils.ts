import { defaultLabels } from "./labels";
import type {
	Notation,
	OdontogramColors,
	PalmerStyle,
	Placement,
} from "./types";

export function mapToCssVars(colors: OdontogramColors) {
	const cssVars: Record<string, string> = {};

	if (colors.darkBlue) {
		cssVars["--dark-blue"] = colors.darkBlue;
	}
	if (colors.baseBlue) {
		cssVars["--base-blue"] = colors.baseBlue;
	}
	if (colors.lightBlue) {
		cssVars["--light-blue"] = colors.lightBlue;
	}

	return cssVars;
}

export function getToothNotations(fdi: string) {
	const num = fdi.replace("teeth-", "");
	const universal = convertFDIToNotation(fdi, "Universal");
	// Language independent, unlike the Palmer text.
	const palmer = convertFDIToNotation(fdi, "Palmer", "symbol");

	return {
		fdi: num,
		universal,
		palmer,
	};
}

export const placements: Record<
	Placement,
	(toothBox: DOMRect, margin: number) => { x: number; y: number }
> = {
	top: (t, m) => ({ x: t.left + t.width / 2, y: t.top - m }),
	"top-start": (t, m) => ({ x: t.left, y: t.top - m }),
	"top-end": (t, m) => ({ x: t.right, y: t.top - m }),
	bottom: (t, m) => ({ x: t.left + t.width / 2, y: t.bottom + m }),
	"bottom-start": (t, m) => ({ x: t.left, y: t.bottom + m }),
	"bottom-end": (t, m) => ({ x: t.right, y: t.bottom + m }),
	left: (t, m) => ({ x: t.left - m, y: t.top + t.height / 2 }),
	"left-start": (t, m) => ({ x: t.left - m, y: t.top }),
	"left-end": (t, m) => ({ x: t.left - m, y: t.bottom }),
	right: (t, m) => ({ x: t.right + m, y: t.top + t.height / 2 }),
	"right-start": (t, m) => ({ x: t.right + m, y: t.top }),
	"right-end": (t, m) => ({ x: t.right + m, y: t.bottom }),
};

//425, 55

export const quadrants: Array<{
	name: "first" | "second" | "third" | "fourth";
	transform: string;
	label: string;
}> = [
	{
		name: "first",
		transform: "",
		label: "Upper Right",
	},
	{
		name: "second",
		transform: "translate(840, 0) scale(-1, 1) translate(-55,0)",
		label: "Upper Left",
	},
	{
		name: "third",
		transform: "scale(1, -1) translate(0, -150)",
		label: "Lower Right",
	},
	{
		name: "fourth",
		transform: "translate(840, 0) scale(-1, -1) translate(-55,-150)",
		label: "Lower Left",
	},
];

export const oldquadrants: Array<{
	name: "first" | "second" | "third" | "fourth";
	transform: string;
	label: string;
}> = [
	{
		name: "first",
		transform: "",
		label: "Upper Right",
	},
	{
		name: "second",
		transform: "scale(-1, 1) translate(-409, 0)",
		label: "Upper Left",
	},
	{
		name: "third",
		transform: "scale(1, -1) translate(0, -694)",
		label: "Lower Right",
	},
	{
		name: "fourth",
		transform: "scale(-1, -1) translate(-409, -694)",
		label: "Lower Left",
	},
];

export function convertFDIToNotation(
	fdi: string,
	notation: Notation,
	palmerStyle: PalmerStyle = "text",
	palmerQuadrants: Record<string, string> = defaultLabels.palmerQuadrants,
) {
	const num = fdi.replace("teeth-", "");

	const fdiToUniversal: Record<string, number> = {
		"11": 8,
		"12": 7,
		"13": 6,
		"14": 5,
		"15": 4,
		"16": 3,
		"17": 2,
		"18": 1,
		"21": 9,
		"22": 10,
		"23": 11,
		"24": 12,
		"25": 13,
		"26": 14,
		"27": 15,
		"28": 16,
		"31": 24,
		"32": 23,
		"33": 22,
		"34": 21,
		"35": 20,
		"36": 19,
		"37": 18,
		"38": 17,
		"41": 25,
		"42": 26,
		"43": 27,
		"44": 28,
		"45": 29,
		"46": 30,
		"47": 31,
		"48": 32,
	};

	if (notation === "Universal") {
		return String(fdiToUniversal[num] ?? num);
	}

	if (notation === "Palmer") {
		if (num.length < 2) {
			return num;
		}

		const quadrant = num[0];
		const tooth = num[1];
		if (palmerStyle === "symbol") {
			// Palmer grid corner: ⌋ upper right, ⌊ upper left, ⌉ lower right,
			// ⌈ lower left. It follows the number on the right side of the mouth
			// and precedes it on the left side.
			const corners: Record<string, string> = {
				"1": "⌋",
				"2": "⌊",
				"3": "⌈",
				"4": "⌉",
			};
			const corner = corners[quadrant] ?? "";
			return quadrant === "1" || quadrant === "4"
				? `${tooth}${corner}`
				: `${corner}${tooth}`;
		}

		return `${tooth}${palmerQuadrants[quadrant] ?? ""}`;
	}

	return num;
}
