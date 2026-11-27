<script setup lang="ts">
import { computed, ref } from "vue";
import {
	LABEL_PADDING,
	defaultLabels,
	frLabels,
	getArchHeight,
	getViewBox,
	Odontogram,
} from "../src";
import type {
	Notation,
	NumberPosition,
	PalmerStyle,
	Theme,
	ToothConditionGroup,
	ToothDetail,
} from "../src";

const selected = ref<string[]>([]);
const details = ref<ToothDetail[]>([]);

const notation = ref<Notation>("FDI");
const layout = ref<"circle" | "square">("circle");
const theme = ref<Theme>("light");
const maxTeeth = ref(8);
const showHalf = ref<"full" | "upper" | "lower">("full");
const french = ref(true);
const showNumbers = ref(true);
const showLabels = ref(false);
const singleSelect = ref(false);
const readOnly = ref(false);
const showTooltip = ref(true);

// Texts of the demo itself (the component texts come from `labels`).
const messages = {
	fr: {
		intro:
			"Odontogramme interactif avec numéros de dents. Cliquez sur une dent pour la sélectionner, survolez-la pour voir le détail.",
		layout: "Disposition",
		arch: "Arcade",
		rows: "Rangées",
		dentition: "Dentition",
		adult: "Adulte (8 par quadrant)",
		five: "5 par quadrant",
		half: "Arcade",
		both: "Les deux",
		upper: "Haut",
		lower: "Bas",
		frame: "Cadre (unités SVG)",
		archHeight: "Hauteur d'une arcade",
		width: "Largeur",
		notation: "Notation",
		palmerDisplay: "Affichage Palmer",
		palmerText: "Texte (6SD)",
		palmerSymbol: "Symboles (6⌋)",
		numberPosition: "Position des numéros",
		inside: "Intérieur",
		outside: "Extérieur",
		language: "Langue des textes",
		theme: "Thème",
		light: "Clair",
		dark: "Sombre",
		options: "Options",
		numbers: "Numéros",
		tooltip: "Infobulle",
		singleSelect: "Sélection unique",
		readOnly: "Lecture seule",
		withConditions: "Exemple de pathologies",
		showLegend: "Légende des pathologies",
		reset: "Réinitialiser",
		selection: "Sélection",
		none: "Aucune dent sélectionnée.",
		fdiNumbers: "Numéros FDI",
		decay: "Carie",
		filling: "Obturation",
	},
	en: {
		intro:
			"Interactive odontogram with tooth numbers. Click a tooth to select it, hover it to see the details.",
		layout: "Layout",
		arch: "Arch",
		rows: "Rows",
		dentition: "Dentition",
		adult: "Adult (8 per quadrant)",
		five: "5 per quadrant",
		half: "Arch",
		both: "Both",
		upper: "Upper",
		lower: "Lower",
		frame: "Frame (SVG units)",
		archHeight: "Height of one arch",
		width: "Width",
		notation: "Notation",
		palmerDisplay: "Palmer display",
		palmerText: "Text (6UR)",
		palmerSymbol: "Symbols (6⌋)",
		numberPosition: "Number position",
		inside: "Inside",
		outside: "Outside",
		language: "Text language",
		theme: "Theme",
		light: "Light",
		dark: "Dark",
		options: "Options",
		numbers: "Numbers",
		tooltip: "Tooltip",
		singleSelect: "Single selection",
		readOnly: "Read only",
		withConditions: "Example conditions",
		showLegend: "Conditions legend",
		reset: "Reset",
		selection: "Selection",
		none: "No tooth selected.",
		fdiNumbers: "FDI numbers",
		decay: "Decay",
		filling: "Filling",
	},
};
const t = computed(() => messages[french.value ? "fr" : "en"]);
const labels = computed(() => (french.value ? frLabels : defaultLabels));

const layouts = computed(
	() =>
		[
			{ id: "circle", label: t.value.arch },
			{ id: "square", label: t.value.rows },
		] as const,
);

const dentitions = computed(
	() =>
		[
			{ value: 8, label: t.value.adult },
			{ value: 5, label: t.value.five },
		] as const,
);

const halves = computed(
	() =>
		[
			{ id: "full", label: t.value.both },
			{ id: "upper", label: t.value.upper },
			{ id: "lower", label: t.value.lower },
		] as const,
);

const notations: Notation[] = ["FDI", "Universal", "Palmer"];

const numberPosition = ref<NumberPosition>("inside");
const numberPositions = computed(
	() =>
		[
			{ id: "inside", label: t.value.inside },
			{ id: "outside", label: t.value.outside },
		] as const,
);

const palmerStyle = ref<PalmerStyle>("text");
const palmerStyles = computed(
	() =>
		[
			{ id: "text", label: t.value.palmerText },
			{ id: "symbol", label: t.value.palmerSymbol },
		] as const,
);

const conditions = computed<ToothConditionGroup[]>(() => [
	{
		label: t.value.decay,
		teeth: ["teeth-16", "teeth-26"],
		outlineColor: "#c0392b",
		fillColor: "#f5b7b1",
	},
	{
		label: t.value.filling,
		teeth: ["teeth-36", "teeth-46"],
		outlineColor: "#1e8449",
		fillColor: "#abebc6",
	},
]);

// Vide = valeur automatique de la bibliothèque.
const archHeightInput = ref("");
const chartWidthInput = ref("");
const archHeight = computed(() => toSize(archHeightInput.value));
const chartWidth = computed(() => toSize(chartWidthInput.value));

function toSize(value: string | number) {
	const size = Number(value);
	return value !== "" && Number.isFinite(size) && size > 0 ? size : undefined;
}

// Valeurs automatiques, affichées en indication dans les champs.
const autoArchHeight = computed(() => getArchHeight(layout.value, maxTeeth.value));
const autoWidth = computed(() => (layout.value === "square" ? 900 : 409));
const currentViewBox = computed(() =>
	getViewBox(layout.value, showHalf.value, {
		maxTeeth: maxTeeth.value,
		archHeight: archHeight.value,
		chartWidth: chartWidth.value,
		padding:
			showNumbers.value && numberPosition.value === "outside"
				? LABEL_PADDING
				: 0,
	}),
);

const withConditions = ref(false);
const teethConditions = computed(() =>
	withConditions.value ? conditions.value : undefined,
);

const codesFdi = computed(() =>
	details.value.map((d) => d.notations.fdi).join(", "),
);

function reset() {
	selected.value = [];
	details.value = [];
}
</script>

<template>
	<main class="demo" :class="{ dark: theme === 'dark' }">
		<h1>vue-odontogram</h1>
		<p class="intro">{{ t.intro }}</p>

		<div class="layout">
			<section class="chart" :class="{ wide: layout === 'square' }">
				<Odontogram
					v-model:selected="selected"
					:notation="notation"
					:palmer-style="palmerStyle"
					:layout="layout"
					:theme="theme"
					:max-teeth="maxTeeth"
					:arch-height="archHeight"
					:chart-width="chartWidth"
					:show-half="showHalf"
					:show-numbers="showNumbers"
					:number-position="numberPosition"
					:show-labels="showLabels"
					:labels="labels"
					:single-select="singleSelect"
					:read-only="readOnly"
					:show-tooltip="showTooltip"
					:teeth-conditions="teethConditions"
					@change="details = $event"
				/>
			</section>

			<aside class="panel">
				<fieldset>
					<legend>{{ t.layout }}</legend>
					<button
						v-for="item in layouts"
						:key="item.id"
						type="button"
						:class="{ active: layout === item.id }"
						@click="layout = item.id"
					>
						{{ item.label }}
					</button>
				</fieldset>

				<fieldset>
					<legend>{{ t.dentition }}</legend>
					<button
						v-for="item in dentitions"
						:key="item.value"
						type="button"
						:class="{ active: maxTeeth === item.value }"
						@click="maxTeeth = item.value"
					>
						{{ item.label }}
					</button>
				</fieldset>

				<fieldset>
					<legend>{{ t.half }}</legend>
					<button
						v-for="item in halves"
						:key="item.id"
						type="button"
						:class="{ active: showHalf === item.id }"
						@click="showHalf = item.id"
					>
						{{ item.label }}
					</button>
				</fieldset>

				<fieldset>
					<legend>{{ t.frame }}</legend>
					<label>
						{{ t.archHeight }}
						<input
							v-model="archHeightInput"
							type="number"
							min="1"
							:placeholder="`auto (${autoArchHeight})`"
						/>
					</label>
					<label>
						{{ t.width }}
						<input
							v-model="chartWidthInput"
							type="number"
							min="1"
							:placeholder="`auto (${autoWidth})`"
						/>
					</label>
					<small class="muted">viewBox : {{ currentViewBox }}</small>
				</fieldset>

				<fieldset>
					<legend>{{ t.notation }}</legend>
					<button
						v-for="item in notations"
						:key="item"
						type="button"
						:class="{ active: notation === item }"
						@click="notation = item"
					>
						{{ item }}
					</button>
				</fieldset>

				<fieldset v-if="notation === 'Palmer'">
					<legend>{{ t.palmerDisplay }}</legend>
					<button
						v-for="item in palmerStyles"
						:key="item.id"
						type="button"
						:class="{ active: palmerStyle === item.id }"
						@click="palmerStyle = item.id"
					>
						{{ item.label }}
					</button>
				</fieldset>

				<fieldset v-if="showNumbers">
					<legend>{{ t.numberPosition }}</legend>
					<button
						v-for="item in numberPositions"
						:key="item.id"
						type="button"
						:class="{ active: numberPosition === item.id }"
						@click="numberPosition = item.id"
					>
						{{ item.label }}
					</button>
				</fieldset>

				<fieldset>
					<legend>{{ t.language }}</legend>
					<button
						type="button"
						:class="{ active: !french }"
						@click="french = false"
					>
						English
					</button>
					<button
						type="button"
						:class="{ active: french }"
						@click="french = true"
					>
						Français
					</button>
				</fieldset>

				<fieldset>
					<legend>{{ t.theme }}</legend>
					<button
						type="button"
						:class="{ active: theme === 'light' }"
						@click="theme = 'light'"
					>
						{{ t.light }}
					</button>
					<button
						type="button"
						:class="{ active: theme === 'dark' }"
						@click="theme = 'dark'"
					>
						{{ t.dark }}
					</button>
				</fieldset>

				<fieldset>
					<legend>{{ t.options }}</legend>
					<label>
						<input v-model="showNumbers" type="checkbox" /> {{ t.numbers }}
					</label>
					<label>
						<input v-model="showTooltip" type="checkbox" /> {{ t.tooltip }}
					</label>
					<label>
						<input v-model="singleSelect" type="checkbox" />
						{{ t.singleSelect }}
					</label>
					<label>
						<input v-model="readOnly" type="checkbox" /> {{ t.readOnly }}
					</label>
					<label>
						<input v-model="withConditions" type="checkbox" />
						{{ t.withConditions }}
					</label>
					<label>
						<input v-model="showLabels" type="checkbox" /> {{ t.showLegend }}
					</label>
				</fieldset>

				<button type="button" class="reset" @click="reset">
					{{ t.reset }}
				</button>
			</aside>
		</div>

		<section class="result">
			<h2>{{ t.selection }}</h2>
			<p v-if="details.length === 0" class="muted">{{ t.none }}</p>
			<ul v-else>
				<li v-for="tooth in details" :key="tooth.id">
					<strong>{{ tooth.notations.fdi }}</strong> —
					{{ labels.toothTypes?.[tooth.type] ?? tooth.type }}
					<span class="muted">
						({{ labels.universal }} {{ tooth.notations.universal }},
						{{ labels.palmer }} {{ tooth.notations.palmer }})
					</span>
				</li>
			</ul>
			<label class="fdi">
				{{ t.fdiNumbers }}
				<input readonly :value="codesFdi" :placeholder="t.none" />
			</label>
		</section>
	</main>
</template>

<style>
body {
	margin: 0;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

.demo {
	--bg: #fff;
	--fg: #1f2430;
	--muted: #6b7280;
	--border: #d5d9e3;
	--accent: #3e5edc;
	min-height: 100vh;
	box-sizing: border-box;
	padding: 24px;
	background: var(--bg);
	color: var(--fg);
}

.demo.dark {
	--bg: #0b0d1a;
	--fg: #e4e6ef;
	--muted: #9aa0b4;
	--border: #2b3050;
	--accent: #aab6ff;
}

.demo h1 {
	margin: 0 0 4px;
}

.demo .intro,
.demo .muted {
	color: var(--muted);
}

.demo .layout {
	display: flex;
	flex-wrap: wrap;
	gap: 24px;
	align-items: flex-start;
	margin-top: 16px;
}

.demo .chart {
	flex: 1 1 420px;
	max-width: 560px;
}

.demo .chart.wide {
	max-width: 900px;
}

.demo .panel {
	flex: 1 1 280px;
	max-width: 420px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.demo fieldset {
	display: flex;
	flex-wrap: wrap;
	gap: 6px 12px;
	margin: 0;
	padding: 8px 12px 12px;
	border: 1px solid var(--border);
	border-radius: 8px;
}

.demo legend {
	padding: 0 6px;
	font-size: 0.85rem;
	color: var(--muted);
}

.demo button {
	padding: 6px 12px;
	border: 1px solid var(--accent);
	border-radius: 6px;
	background: transparent;
	color: var(--accent);
	cursor: pointer;
	font: inherit;
}

.demo button.active {
	background: var(--accent);
	color: var(--bg);
}

.demo .reset {
	align-self: flex-start;
	border-color: var(--border);
	color: var(--fg);
}

.demo fieldset label {
	display: flex;
	align-items: center;
	gap: 6px;
	width: 100%;
}

.demo .result {
	margin-top: 24px;
}

.demo .fdi {
	display: flex;
	flex-direction: column;
	gap: 4px;
	max-width: 420px;
	font-size: 0.9rem;
}

.demo .fdi input {
	padding: 6px 8px;
	border: 1px solid var(--border);
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
}
</style>
