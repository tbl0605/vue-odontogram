import type { App, Plugin } from "vue";
import Odontogram from "./components/Odontogram.vue";
import { getArchHeight, getViewBox } from "./getViewBox";
import "./styles.css";

export { Odontogram, getArchHeight, getViewBox };
export type * from "./types";

export default Odontogram;

export const VueOdontogram: Plugin = {
	install(app: App) {
		app.component("Odontogram", Odontogram);
	},
};
