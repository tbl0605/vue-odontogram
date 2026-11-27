export type Layout = "circle" | "square";
export type ShowHalf = "full" | "upper" | "lower";

export interface ViewBoxOptions {
	/** Teeth per quadrant, used to pick the default `archHeight`. */
	maxTeeth?: number;
	/** Height of one arch. The full chart is twice as high. */
	archHeight?: number;
	/** Width of the chart, cropped around its center. */
	chartWidth?: number;
}

// Height of one arch of the "circle" layout for 1 to 8 teeth per quadrant.
const CIRCLE_ARCH_HEIGHTS = [87, 91, 108, 131, 157, 219, 275, 347];

export function getArchHeight(layout: Layout, maxTeeth = 8): number {
	return layout === "square" ? 75 : (CIRCLE_ARCH_HEIGHTS[maxTeeth - 1] ?? 347);
}

export function getViewBox(
	layout: Layout,
	showHalf: ShowHalf,
	{
		maxTeeth,
		archHeight = getArchHeight(layout, maxTeeth),
		chartWidth,
	}: ViewBoxOptions = {},
): string {
	const fullWidth = layout === "square" ? 900 : 409;
	const width = chartWidth ?? fullWidth;
	const x = (fullWidth - width) / 2;

	if (showHalf === "upper") {
		return `${x} 0 ${width} ${archHeight}`;
	}
	if (showHalf === "lower") {
		return `${x} ${archHeight} ${width} ${archHeight}`;
	}
	return `${x} 0 ${width} ${archHeight * 2}`;
}
