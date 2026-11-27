export type Layout = "circle" | "square";
export type ShowHalf = "full" | "upper" | "lower";

export interface ViewBoxOptions {
	/** Teeth per quadrant, used to pick the default `archHeight`. */
	maxTeeth?: number;
	/** Height of one arch. The full chart is twice as high. */
	archHeight?: number;
	/** Width of the chart, cropped around its center. */
	chartWidth?: number;
	/** Extra room around the chart (outer sides only). */
	padding?: number;
}

// Height of one arch of the "circle" layout for 1 to 8 teeth per quadrant.
const CIRCLE_ARCH_HEIGHTS = [87, 91, 108, 131, 157, 219, 275, 347];

export function getArchHeight(layout: Layout, maxTeeth = 8): number {
	return layout === "square" ? 75 : (CIRCLE_ARCH_HEIGHTS[Math.floor(maxTeeth) - 1] ?? 347);
}

export function getViewBox(
	layout: Layout,
	showHalf: ShowHalf,
	{
		maxTeeth,
		archHeight = getArchHeight(layout, maxTeeth),
		chartWidth,
		padding = 0,
	}: ViewBoxOptions = {},
): string {
	const fullWidth = layout === "square" ? 900 : 409;
	const width = chartWidth ?? fullWidth;
	const x = (fullWidth - width) / 2;

	// The padding is added on the outer sides only (not between the two arches).
	const top = showHalf === "lower" ? 0 : padding;
	const bottom = showHalf === "upper" ? 0 : padding;
	const y = showHalf === "lower" ? archHeight : 0;
	const height = showHalf === "full" ? archHeight * 2 : archHeight;
	return `${x - padding} ${y - top} ${width + 2 * padding} ${height + top + bottom}`;
}
