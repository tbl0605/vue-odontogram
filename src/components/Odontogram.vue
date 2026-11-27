<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from "vue";
import {
	LABEL_PADDING,
	labelPositions,
	NewTeethPaths,
	outsideLabelPositions,
	teethPaths,
} from "../data";
import { getArchHeight, getViewBox } from "../getViewBox";
import { defaultLabels } from "../labels";
import type {
	OdontogramEmits,
	OdontogramProps,
	ToothConditionGroup,
	ToothDetail,
	TooltipPosition,
} from "../types";
import {
	convertFDIToNotation,
	getToothNotations,
	mapToCssVars,
	quadrants as newQuadrants,
	oldquadrants,
	placements,
} from "../utils";
import ConditionLabels from "./ConditionLabels.vue";
import OdontogramTooltip from "./OdontogramTooltip.vue";
import Tooth from "./Tooth.vue";

const props = withDefaults(defineProps<OdontogramProps>(), {
	defaultSelected: () => [],
	singleSelect: false,
	name: "teeth",
	class: "",
	theme: "light",
	colors: () => ({}),
	notation: "FDI",
	palmerStyle: "text",
	tooltipPlacement: "top",
	tooltipMargin: 10,
	showTooltip: true,
	showHalf: "full",
	maxTeeth: 8,
	readOnly: false,
	showLabels: false,
	showNumbers: false,
	numberPosition: "inside",
	layout: "circle",
});

const emit = defineEmits<OdontogramEmits>();

const text = computed(() => ({ ...defaultLabels, ...props.labels }));

const teethpath = computed(() =>
	props.layout === "circle" ? teethPaths : NewTeethPaths,
);

const quadrants = computed(() =>
	props.layout === "circle" ? oldquadrants : newQuadrants,
);

// The lower quadrants are mirrored around the bottom of the view box.
function quadrantTransform({ name, transform }: { name: string; transform: string }) {
	if (name !== "third" && name !== "fourth") {
		return transform;
	}
	const archHeight = props.archHeight ?? getArchHeight(props.layout, props.maxTeeth);
	const shift = (archHeight - getArchHeight(props.layout)) * 2;
	return `translate(0, ${shift}) ${transform}`;
}

// Position of a tooth number, not mirrored with its quadrant.
function numberTransform(toothName: string, quadrantName: string) {
	const positions =
		props.numberPosition === "outside" ? outsideLabelPositions : labelPositions;
	const { x, y } = positions[props.layout][toothName];
	const sx = quadrantName === "second" || quadrantName === "fourth" ? -1 : 1;
	const sy = quadrantName === "third" || quadrantName === "fourth" ? -1 : 1;
	return `translate(${x} ${y}) scale(${sx} ${sy})`;
}

const toothTypeByName = computed(
	() => new Map(teethpath.value.map((t) => [t.name, t.type])),
);

function getToothType(id: string) {
	const toothName = id.replace("teeth-", "").slice(1);
	return toothTypeByName.value.get(toothName) ?? "Unknown";
}

function clampMaxTeeth(value: number | undefined) {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return teethpath.value.length;
	}
	return Math.max(0, Math.min(teethpath.value.length, Math.floor(value)));
}

function buildToothDetail(id: string): ToothDetail {
	return {
		id,
		notations: getToothNotations(id),
		type: getToothType(id),
	};
}

const themeColors = computed(() =>
	props.theme === "dark"
		? {
				"--dark-blue": "#aab6ff",
				"--base-blue": "#d0d5f6",
				"--light-blue": "#5361e6",
			}
		: {
				"--dark-blue": "#3e5edc",
				"--base-blue": "#8a98be",
				"--light-blue": "#c6ccf8",
			},
);

const internalSelected = ref<Set<string>>(
	new Set(
		props.singleSelect
			? props.defaultSelected.slice(0, 1)
			: props.defaultSelected,
	),
);

watch(
	() => props.selected,
	(value) => {
		if (value !== undefined) {
			internalSelected.value = new Set(value);
		}
	},
	{ deep: true },
);

const selectedSet = computed(() => {
	if (props.selected !== undefined) {
		return new Set(props.selected);
	}
	return internalSelected.value;
});

const svgRef = ref<SVGSVGElement | null>(null);

const tooltipData = ref<{
	active: boolean;
	position?: TooltipPosition;
	payload?: ToothDetail;
}>({ active: false });

function emitSelection(updated: Set<string>) {
	const selectedArray = Array.from(updated);
	if (props.selected === undefined) {
		internalSelected.value = updated;
	}
	emit("update:selected", selectedArray);
	emit("change", selectedArray.map(buildToothDetail));
}

function handleToggle(id: string) {
	if (props.readOnly) {
		return;
	}

	const updated = new Set(selectedSet.value);

	if (props.singleSelect) {
		if (updated.has(id)) {
			updated.delete(id);
		} else {
			updated.clear();
			updated.add(id);
		}
	} else {
		if (updated.has(id)) {
			updated.delete(id);
		} else {
			updated.add(id);
		}
	}

	emitSelection(updated);
}

function handleKeyDown(event: KeyboardEvent, id: string) {
	if (props.readOnly) {
		return;
	}

	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		handleToggle(id);
	}
}

function handleHover(
	id: string,
	event: MouseEvent | FocusEvent,
) {
	if (!props.showTooltip) {
		return;
	}

	const placement = props.tooltipPlacement;
	const target = event.currentTarget as SVGGElement | null;
	const path = target?.querySelector("path");
	if (!(path && svgRef.value)) {
		return;
	}

	const toothBox = path.getBoundingClientRect();
	const margin = props.tooltipMargin;

	const { x } =
		placements[placement]?.(toothBox, margin) ??
		placements.right(toothBox, margin);

	tooltipData.value = {
		active: true,
		position: {
			x,
			placement,
			margin,
			anchorRect: {
				top: toothBox.top,
				right: toothBox.right,
				bottom: toothBox.bottom,
				left: toothBox.left,
			},
		},
		payload: buildToothDetail(id),
	};
}

function handleLeave() {
	tooltipData.value = { ...tooltipData.value, active: false };
}

const visibleQuadrants = computed(() => {
	if (props.showHalf === "upper") {
		return quadrants.value.slice(0, 2);
	}
	if (props.showHalf === "lower") {
		return quadrants.value.slice(2);
	}
	return quadrants.value;
});

const filteredTeeth = computed(() =>
	teethpath.value.slice(0, clampMaxTeeth(props.maxTeeth)),
);

const conditionMap = computed(() => {
	const map = new Map<string, ToothConditionGroup>();

	if (props.teethConditions) {
		for (const condition of props.teethConditions) {
			for (const toothId of condition.teeth) {
				map.set(toothId, condition);
			}
		}
	}

	return map;
});

function teethPrefix(index: number) {
	// With the lower half only, the first visible quadrant is the third one.
	const offset = props.showHalf === "lower" ? 2 : 0;
	// FDI: the patient's lower right is quadrant 4, drawn on the left of the
	// lower row, and the lower left is quadrant 3.
	return `teeth-${[1, 2, 4, 3][index + offset]}`;
}

function toothLabel(id: string) {
	return convertFDIToNotation(
		id,
		props.notation,
		props.palmerStyle,
		text.value.palmerQuadrants,
	);
}

function toothId(prefix: string, toothName: string) {
	return `${prefix}${toothName}`;
}

function isSelected(id: string) {
	return selectedSet.value.has(id);
}

const finalColors = computed(() => ({
	...themeColors.value,
	...mapToCssVars(props.colors),
}));

const containerClasses = computed(() =>
	["Odontogram", props.theme === "dark" ? "dark-theme" : "", props.class]
		.filter(Boolean)
		.join(" "),
);

const containerStyle = computed<CSSProperties>(() => ({
	...finalColors.value,
	width: "100%",
	margin: "0 auto",
	display: "flex",
	flexDirection: "column",
	gap: "20px",
	justifyContent: "center",
	alignItems: "center",
	...(props.style ?? {}),
}));

const hiddenInputValue = computed(() =>
	JSON.stringify(Array.from(selectedSet.value)),
);

const viewBox = computed(() =>
	getViewBox(props.layout, props.showHalf, {
		...props,
		padding:
			props.showNumbers && props.numberPosition === "outside"
				? LABEL_PADDING
				: 0,
	}),
);
</script>

<template>
	<div
		:class="containerClasses"
		:style="containerStyle"
		:role="readOnly ? 'group' : 'listbox'"
		:aria-multiselectable="readOnly ? undefined : !singleSelect"
		:aria-label="text.odontogram"
		:data-read-only="readOnly ? 'true' : 'false'"
		:tabindex="readOnly ? -1 : 0"
	>
		<input type="hidden" :name="name" :value="hiddenInputValue" />

		<svg
			ref="svgRef"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			:viewBox="viewBox"
			class="Odontogram"
			:style="{
				width: '100%',
				height: 'auto',
				userSelect: 'none',
				touchAction: 'manipulation',
			}"
		>
			<title>{{ text.odontogram }}</title>

			<g
				v-for="(quadrant, index) in visibleQuadrants"
				:key="quadrant.name"
				:transform="quadrantTransform(quadrant)"
			>
				<Tooth
					v-for="tooth in filteredTeeth"
					:key="toothId(teethPrefix(index), tooth.name)"
					v-bind="tooth"
					:name="toothId(teethPrefix(index), tooth.name)"
					:selected="isSelected(toothId(teethPrefix(index), tooth.name))"
					:condition="
						conditionMap.get(toothId(teethPrefix(index), tooth.name))
					"
					:read-only="readOnly"
					:label="`${text.tooth} ${toothId(teethPrefix(index), tooth.name).replace('teeth-', '')}`"
					@click="handleToggle"
					@keydown="handleKeyDown"
					@hover="handleHover"
					@leave="handleLeave"
				>
					<title>
						{{ toothLabel(toothId(teethPrefix(index), tooth.name)) }}
					</title>
				</Tooth>
				<template v-if="showNumbers">
					<text
						v-for="tooth in filteredTeeth"
						:key="tooth.name"
						:transform="numberTransform(tooth.name, quadrant.name)"
						:font-size="(layout === 'circle' ? 16 : 14) * (notation === 'Palmer' && palmerStyle === 'text' ? 0.75 : 1)"
						text-anchor="middle"
						dominant-baseline="central"
						fill="var(--dark-blue)"
						pointer-events="none"
						aria-hidden="true"
					>
						{{ toothLabel(toothId(teethPrefix(index), tooth.name)) }}
					</text>
				</template>
			</g>
		</svg>

		<OdontogramTooltip
			v-if="showTooltip"
			:active="tooltipData.active"
			:position="tooltipData.position"
			:payload="tooltipData.payload"
			:labels="text"
		>
			<template v-if="$slots.tooltip" #default="slotProps">
				<slot name="tooltip" v-bind="slotProps" />
			</template>
		</OdontogramTooltip>

		<ConditionLabels
			v-if="showLabels"
			:conditions="teethConditions"
			:aria-label="text.legend"
		/>
	</div>
</template>
