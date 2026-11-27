import type { CSSProperties } from "vue";

export type Notation = "FDI" | "Universal" | "Palmer";

/** Palmer notation: text ("6UR") or grid corner symbol ("6⌋"). */
export type PalmerStyle = "text" | "symbol";

/** Tooth numbers inside the arch/rows or outside of them. */
export type NumberPosition = "inside" | "outside";

export type Theme = "light" | "dark";

export type Placement =
	| "top"
	| "top-start"
	| "top-end"
	| "right"
	| "right-start"
	| "right-end"
	| "bottom"
	| "bottom-start"
	| "bottom-end"
	| "left"
	| "left-start"
	| "left-end";

export interface ToothDetail {
	id: string;
	notations: {
		fdi: string;
		universal: string;
		palmer: string;
	};
	type: string;
}

/** Texts displayed by the component. `toothTypes` translates `ToothDetail.type`. */
export interface OdontogramLabels {
	odontogram: string;
	tooth: string;
	type: string;
	universal: string;
	palmer: string;
	/** Abbreviations of the Palmer text style, by FDI quadrant. */
	palmerQuadrants: Record<"1" | "2" | "3" | "4", string>;
	legend: string;
	toothTypes?: Record<string, string>;
}

export interface OdontogramColors {
	darkBlue?: string;
	baseBlue?: string;
	lightBlue?: string;
}

export interface ToothCondition {
	fillColor?: string;
	outlineColor?: string;
}

export interface ToothProps {
	name: string;
	outlinePath: string;
	shadowPath: string;
	lineHighlightPath: string | string[];
	selected?: boolean;
	condition?: ToothCondition;
	readOnly?: boolean;
	showLabel?: boolean;
	label?: string;
}

export type ToothConditionGroup = {
	label: string;
	teeth: string[];
	outlineColor: string;
	fillColor: string;
};

export interface OdontogramProps {
	selected?: string[];
	defaultSelected?: string[];
	singleSelect?: boolean;
	name?: string;
	class?: string;
	theme?: Theme;
	colors?: OdontogramColors;
	notation?: Notation;
	palmerStyle?: PalmerStyle;
	tooltipPlacement?: Placement;
	tooltipMargin?: number;
	showTooltip?: boolean;
	showHalf?: "upper" | "lower" | "full";
	maxTeeth?: number;
	archHeight?: number;
	chartWidth?: number;
	showNumbers?: boolean;
	numberPosition?: NumberPosition;
	teethConditions?: ToothConditionGroup[];
	readOnly?: boolean;
	showLabels?: boolean;
	labels?: Partial<OdontogramLabels>;
	layout?: "circle" | "square";
	style?: CSSProperties;
}

export interface OdontogramEmits {
	"update:selected": [selected: string[]];
	change: [selected: ToothDetail[]];
}

export interface TooltipPosition {
	x: number;
	placement: Placement;
	margin: number;
	anchorRect: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export interface OdontogramTooltipProps {
	active: boolean;
	payload?: ToothDetail;
	position?: TooltipPosition;
	labels?: OdontogramLabels;
}
