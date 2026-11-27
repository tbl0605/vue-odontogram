<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { defaultLabels } from "../labels";
import type { OdontogramTooltipProps } from "../types";

const ARROW_OFFSET = 12;
const VIEWPORT_PADDING = 8;

const props = defineProps<OdontogramTooltipProps>();
const text = computed(() => props.labels ?? defaultLabels);

const tooltipRef = ref<HTMLDivElement | null>(null);
const coords = ref<{
	left: number;
	top: number;
	isBottomPlacement: boolean;
} | null>(null);

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const prefersBottom = (placement: string) => placement.startsWith("bottom");

function measurePosition() {
	if (!(props.active && tooltipRef.value && props.position)) {
		coords.value = null;
		return;
	}

	const tooltipBox = tooltipRef.value.getBoundingClientRect();
	const { x, placement, margin, anchorRect } = props.position;

	const maxLeft = Math.max(
		VIEWPORT_PADDING,
		window.innerWidth - tooltipBox.width - VIEWPORT_PADDING,
	);
	const left = clamp(x - tooltipBox.width / 2, VIEWPORT_PADDING, maxLeft);

	const topWhenAbove =
		anchorRect.top - tooltipBox.height - margin - ARROW_OFFSET;
	const topWhenBelow = anchorRect.bottom + margin + ARROW_OFFSET;

	const shouldStartBelow = prefersBottom(placement);
	let isBottomPlacement = shouldStartBelow;
	let top = shouldStartBelow ? topWhenBelow : topWhenAbove;

	if (!isBottomPlacement && top < VIEWPORT_PADDING) {
		isBottomPlacement = true;
		top = topWhenBelow;
	}

	const maxTop = Math.max(
		VIEWPORT_PADDING,
		window.innerHeight - tooltipBox.height - VIEWPORT_PADDING,
	);

	if (isBottomPlacement && top > maxTop) {
		isBottomPlacement = false;
		top = topWhenAbove;
	}

	top = clamp(top, VIEWPORT_PADDING, maxTop);

	coords.value = { left, top, isBottomPlacement };
}

watch(
	() => [props.active, props.position] as const,
	() => {
		nextTick(measurePosition);
	},
	{ deep: true, immediate: true },
);
</script>

<template>
	<div
		v-if="active && payload"
		ref="tooltipRef"
		class="odontogram-tooltip"
		role="tooltip"
		:style="{
			position: 'fixed',
			pointerEvents: 'none',
			background: 'var(--odontogram-tooltip-bg, rgba(0,0,0,0.85))',
			color: 'var(--odontogram-tooltip-fg, #fff)',
			padding: '6px 10px',
			borderRadius: '6px',
			fontSize: '12px',
			lineHeight: 1.3,
			whiteSpace: 'nowrap',
			zIndex: 1000,
			left: `${coords?.left ?? -9999}px`,
			top: `${coords?.top ?? -9999}px`,
			opacity: coords ? 1 : 0,
			transition: 'opacity 0.15s ease',
		}"
	>
		<slot :payload="payload">
			<div>{{ text.tooth }}: {{ payload.notations.fdi }}</div>
			<div>
				{{ text.type }}: {{ text.toothTypes?.[payload.type] ?? payload.type }}
			</div>
			<div>
				{{ text.universal }}: {{ payload.notations.universal }},
				{{ text.palmer }}: {{ payload.notations.palmer }}
			</div>
		</slot>
		<div
			class="odontogram-tooltip-arrow"
			:style="{
				position: 'absolute',
				left: '50%',
				transform: 'translateX(-50%)',
				width: 0,
				height: 0,
				borderLeft: '6px solid transparent',
				borderRight: '6px solid transparent',
				...(coords?.isBottomPlacement
					? {
							top: '-6px',
							borderBottom:
								'6px solid var(--odontogram-tooltip-bg, rgba(0, 0, 0, 0.85))',
						}
					: {
							bottom: '-6px',
							borderTop:
								'6px solid var(--odontogram-tooltip-bg, rgba(0, 0, 0, 0.85))',
						}),
			}"
		/>
	</div>
</template>
