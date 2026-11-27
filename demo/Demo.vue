<script setup lang="ts">
import { computed, ref } from "vue";
import { getArchHeight, getViewBox, Odontogram } from "../src";
import type {
	Notation,
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
const showNumbers = ref(true);
const showLabels = ref(false);
const singleSelect = ref(false);
const readOnly = ref(false);
const showTooltip = ref(true);

const layouts = [
	{ id: "circle", label: "Arcade" },
	{ id: "square", label: "Rangées" },
] as const;

const dentitions = [
	{ value: 8, label: "Adulte (8 par quadrant)" },
	{ value: 5, label: "5 par quadrant" },
] as const;

const halves = [
	{ id: "full", label: "Les deux" },
	{ id: "upper", label: "Haut" },
	{ id: "lower", label: "Bas" },
] as const;

const notations: Notation[] = ["FDI", "Universal", "Palmer"];

const conditions: ToothConditionGroup[] = [
	{
		label: "Carie",
		teeth: ["teeth-16", "teeth-26"],
		outlineColor: "#c0392b",
		fillColor: "#f5b7b1",
	},
	{
		label: "Obturation",
		teeth: ["teeth-36", "teeth-46"],
		outlineColor: "#1e8449",
		fillColor: "#abebc6",
	},
];

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
	}),
);

const withConditions = ref(false);
const teethConditions = computed(() =>
	withConditions.value ? conditions : undefined,
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
		<p class="intro">
			Odontogramme interactif avec numéros de dents. Cliquez sur une dent pour
			la sélectionner, survolez-la pour voir le détail.
		</p>

		<div class="layout">
			<section class="chart" :class="{ wide: layout === 'square' }">
				<Odontogram
					v-model:selected="selected"
					:notation="notation"
					:layout="layout"
					:theme="theme"
					:max-teeth="maxTeeth"
					:arch-height="archHeight"
					:chart-width="chartWidth"
					:show-half="showHalf"
					:show-numbers="showNumbers"
					:show-labels="showLabels"
					:single-select="singleSelect"
					:read-only="readOnly"
					:show-tooltip="showTooltip"
					:teeth-conditions="teethConditions"
					@change="details = $event"
				/>
			</section>

			<aside class="panel">
				<fieldset>
					<legend>Disposition</legend>
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
					<legend>Dentition</legend>
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
					<legend>Arcade</legend>
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
					<legend>Cadre (unités SVG)</legend>
					<label>
						Hauteur d'une arcade
						<input
							v-model="archHeightInput"
							type="number"
							min="1"
							:placeholder="`auto (${autoArchHeight})`"
						/>
					</label>
					<label>
						Largeur
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
					<legend>Notation</legend>
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

				<fieldset>
					<legend>Thème</legend>
					<button
						type="button"
						:class="{ active: theme === 'light' }"
						@click="theme = 'light'"
					>
						Clair
					</button>
					<button
						type="button"
						:class="{ active: theme === 'dark' }"
						@click="theme = 'dark'"
					>
						Sombre
					</button>
				</fieldset>

				<fieldset>
					<legend>Options</legend>
					<label><input v-model="showNumbers" type="checkbox" /> Numéros</label>
					<label><input v-model="showTooltip" type="checkbox" /> Infobulle</label>
					<label>
						<input v-model="singleSelect" type="checkbox" /> Sélection unique
					</label>
					<label><input v-model="readOnly" type="checkbox" /> Lecture seule</label>
					<label>
						<input v-model="withConditions" type="checkbox" /> Exemple de
						pathologies
					</label>
					<label>
						<input v-model="showLabels" type="checkbox" /> Légende des
						pathologies
					</label>
				</fieldset>

				<button type="button" class="reset" @click="reset">Réinitialiser</button>
			</aside>
		</div>

		<section class="result">
			<h2>Sélection</h2>
			<p v-if="details.length === 0" class="muted">Aucune dent sélectionnée.</p>
			<ul v-else>
				<li v-for="tooth in details" :key="tooth.id">
					<strong>{{ tooth.notations.fdi }}</strong> — {{ tooth.type }}
					<span class="muted">
						(Universal {{ tooth.notations.universal }}, Palmer
						{{ tooth.notations.palmer }})
					</span>
				</li>
			</ul>
			<label class="fdi">
				Numéros FDI
				<input readonly :value="codesFdi" placeholder="Aucune dent sélectionnée" />
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
