import type { CSSProperties } from "vue";

export type Notation = "FDI" | "Universal" | "Palmer";

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
	tooltipPlacement?: Placement;
	tooltipMargin?: number;
	showTooltip?: boolean;
	showHalf?: "upper" | "lower" | "full";
	maxTeeth?: number;
	archHeight?: number;
	chartWidth?: number;
	showNumbers?: boolean;
	teethConditions?: ToothConditionGroup[];
	readOnly?: boolean;
	showLabels?: boolean;
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
}
