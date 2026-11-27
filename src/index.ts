import type { App, Plugin } from "vue";
import Odontogram from "./components/Odontogram.vue";
import { getArchHeight, getViewBox } from "./getViewBox";
import { LABEL_PADDING } from "./data";
import { defaultLabels, frLabels } from "./labels";
import "./styles.css";

export {
	LABEL_PADDING,
	Odontogram,
	defaultLabels,
	frLabels,
	getArchHeight,
	getViewBox,
};
export type * from "./types";

export default Odontogram;

export const VueOdontogram: Plugin = {
	install(app: App) {
		app.component("Odontogram", Odontogram);
	},
};
