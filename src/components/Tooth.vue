<script setup lang="ts">
import type { ToothProps } from "../types";

const props = withDefaults(defineProps<ToothProps>(), {
	selected: false,
	readOnly: false,
});

const emit = defineEmits<{
	click: [name: string];
	keydown: [event: KeyboardEvent, name: string];
	hover: [name: string, event: MouseEvent | FocusEvent];
	leave: [];
}>();

const strokeColor = () => props.condition?.outlineColor ?? "currentColor";
const fillColor = () => props.condition?.fillColor ?? "currentColor";

function handleClick() {
	if (!props.readOnly) {
		emit("click", props.name);
	}
}

function handleKeyDown(event: KeyboardEvent) {
	if (!props.readOnly) {
		emit("keydown", event, props.name);
	}
}

function handleHover(event: MouseEvent) {
	emit("hover", props.name, event);
}

function handleFocus(event: FocusEvent) {
	emit("hover", props.name, event);
}

function handleLeave() {
	emit("leave");
}
</script>

<template>
	<g
		:class="[name, { selected }]"
		:role="readOnly ? undefined : 'option'"
		:aria-selected="readOnly ? undefined : selected"
		:tabindex="readOnly ? -1 : 0"
		:aria-label="readOnly ? undefined : (label ?? `Tooth ${name.replace('teeth-', '')}`)"
		:aria-disabled="readOnly"
		:style="{
			cursor: readOnly ? 'default' : 'pointer',
			color: strokeColor(),
		}"
		@click="handleClick"
		@keydown="handleKeyDown"
		@mouseenter="handleHover"
		@focus="handleFocus"
		@mouseleave="handleLeave"
		@blur="handleLeave"
	>
		<slot />

		<!-- outline -->
		<path
			:stroke="strokeColor()"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			:d="outlinePath"
		/>

		<!-- fill -->
		<path
			:fill="fillColor()"
			:d="shadowPath"
			:data-colored="condition ? 'true' : undefined"
			:style="{ opacity: condition ? 1 : undefined }"
		/>

		<!-- highlight lines -->
		<template v-if="Array.isArray(lineHighlightPath)">
			<path
				v-for="d in lineHighlightPath"
				:key="d"
				:stroke="strokeColor()"
				stroke-linecap="round"
				stroke-linejoin="round"
				:d="d"
			/>
		</template>
		<path
			v-else
			:stroke="strokeColor()"
			stroke-linecap="round"
			stroke-linejoin="round"
			:d="lineHighlightPath"
		/>
	</g>
</template>
