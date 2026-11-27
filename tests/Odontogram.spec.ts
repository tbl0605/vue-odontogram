import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import Odontogram from "../src/components/Odontogram.vue";
import { getViewBox } from "../src/getViewBox";
import { frLabels } from "../src/labels";
import {
	convertFDIToNotation,
	getToothNotations,
	mapToCssVars,
} from "../src/utils";

describe("Odontogram", () => {
	it("renders all permanent teeth by default", () => {
		const wrapper = mount(Odontogram);

		expect(
			wrapper.get('[role="listbox"][aria-label="Odontogram"]'),
		).toBeTruthy();

		expect(wrapper.findAll('[role="option"]')).toHaveLength(32);
	});

	it("renders the tooth numbers in the selected notation", () => {
		const wrapper = mount(Odontogram, {
			props: { showNumbers: true, notation: "Universal" },
		});

		expect(wrapper.findAll("text")).toHaveLength(32);
		expect(wrapper.findAll("text")[0].text()).toBe("8");

		// Hidden by default.
		const hidden = mount(Odontogram);
		expect(hidden.findAll("text")).toHaveLength(0);
	});

	it("places the tooth numbers inside by default or outside the teeth", () => {
		const transform = (numberPosition?: "inside" | "outside") =>
			mount(Odontogram, { props: { showNumbers: true, numberPosition } })
				.get("text")
				.attributes("transform");

		expect(transform()).toContain("translate(181 73)");
		expect(transform("outside")).toContain("translate(173 -14)");

		// Room is only added around the view box when the numbers are outside.
		const viewBox = (props: object) =>
			mount(Odontogram, { props }).get("svg").attributes("viewBox");

		expect(viewBox({ showNumbers: true })).toBe("0 0 409 694");
		expect(viewBox({ numberPosition: "outside" })).toBe("0 0 409 694");
		expect(viewBox({ showNumbers: true, numberPosition: "outside" })).toBe(
			"-30 -30 469 754",
		);
		expect(
			viewBox({ showNumbers: true, numberPosition: "outside", showHalf: "upper" }),
		).toBe("-30 -30 469 377");
		expect(
			viewBox({ showNumbers: true, numberPosition: "outside", showHalf: "lower" }),
		).toBe("-30 347 469 377");
	});

	it("displays Palmer as text or as grid corner symbols", () => {
		const texts = (palmerStyle?: "text" | "symbol") =>
			mount(Odontogram, {
				props: { showNumbers: true, notation: "Palmer", palmerStyle },
			})
				.findAll("text")
				.map((text) => text.text());

		expect(texts()[0]).toBe("1UR");
		expect(texts("symbol").filter((t) => t.includes("⌋"))).toHaveLength(8);
		expect(texts("symbol")[0]).toBe("1⌋");
		expect(texts("symbol")[8]).toBe("⌊1");
		expect(convertFDIToNotation("teeth-31", "Palmer", "symbol")).toBe("⌈1");
		expect(convertFDIToNotation("teeth-41", "Palmer", "symbol")).toBe("1⌉");
	});

	it("translates the Palmer text but not the emitted Palmer notation", () => {
		const wrapper = mount(Odontogram, {
			props: { showNumbers: true, notation: "Palmer", labels: frLabels },
		});
		const numbers = wrapper.findAll("text").map((text) => text.text());

		expect(numbers[0]).toBe("1SD");
		expect(numbers[8]).toBe("1SG");
		expect(convertFDIToNotation("teeth-31", "Palmer")).toBe("1LL");
		expect(
			convertFDIToNotation(
				"teeth-31",
				"Palmer",
				"text",
				frLabels.palmerQuadrants,
			),
		).toBe("1IG");
		// The notations of the tooth details are always the corner symbols.
		expect(getToothNotations("teeth-31").palmer).toBe("⌈1");
	});

	it("numbers the teeth of the lower half correctly", () => {
		const wrapper = mount(Odontogram, {
			props: { showNumbers: true, showHalf: "lower" },
		});
		const numbers = wrapper.findAll("text").map((text) => text.text());

		expect(numbers[0]).toBe("41");
		expect(numbers[8]).toBe("31");
		expect(wrapper.find('[class~="teeth-31"]').exists()).toBe(true);
	});

	it("draws the FDI quadrants 4 and 3 on the left and right of the lower row", () => {
		const wrapper = mount(Odontogram);
		const transform = (id: string) =>
			wrapper.get(`[class~="${id}"]`).element.parentElement?.getAttribute(
				"transform",
			);

		// Quadrant 4 is on the left (not mirrored horizontally), like quadrant 1.
		expect(transform("teeth-41")).toContain("scale(1, -1)");
		expect(transform("teeth-31")).toContain("scale(-1, -1)");
	});

	it("displays the texts in English by default and accepts custom labels", async () => {
		const english = mount(Odontogram);
		expect(english.get("[role=listbox]").attributes("aria-label")).toBe(
			"Odontogram",
		);
		expect(english.get('[class~="teeth-11"]').attributes("aria-label")).toBe(
			"Tooth 11",
		);

		const french = mount(Odontogram, {
			props: {
				labels: frLabels,
				teethConditions: [
					{ label: "Carie", teeth: [], outlineColor: "#000", fillColor: "#f00" },
				],
				showLabels: true,
			},
		});
		expect(french.get("[role=listbox]").attributes("aria-label")).toBe(
			"Odontogramme",
		);
		expect(french.get('[class~="teeth-11"]').attributes("aria-label")).toBe(
			"Dent 11",
		);
		expect(french.get("ul").attributes("aria-label")).toBe(
			frLabels.legend,
		);

		await french.get('[class~="teeth-11"]').trigger("mouseenter");
		const tooltip = french.get('[role="tooltip"]').text();
		expect(tooltip).toContain("Dent: 11");
		expect(tooltip).toContain("Type: Incisive centrale");
	});

	it("shrinks the view box for a partial dentition", () => {
		const wrapper = mount(Odontogram, { props: { maxTeeth: 5 } });

		expect(wrapper.get("svg").attributes("viewBox")).toBe("0 0 409 314");
		expect(getViewBox("circle", "full")).toBe("0 0 409 694");
		expect(wrapper.html()).toContain("translate(0, -380) scale(1, -1)");
	});

	it("accepts a custom arch height and chart width", () => {
		const wrapper = mount(Odontogram, {
			props: { archHeight: 200, chartWidth: 309 },
		});

		expect(wrapper.get("svg").attributes("viewBox")).toBe("50 0 309 400");
	});

	it("renders only upper or lower halves when requested", () => {
		const upper = mount(Odontogram, {
			props: { showHalf: "upper" },
		});
		expect(upper.findAll('[role="option"]')).toHaveLength(16);

		const lower = mount(Odontogram, {
			props: { showHalf: "lower" },
		});
		expect(lower.findAll('[role="option"]')).toHaveLength(16);
	});

	it("respects maxTeeth for each quadrant", () => {
		const wrapper = mount(Odontogram, {
			props: { maxTeeth: 5 },
		});
		expect(wrapper.findAll('[role="option"]')).toHaveLength(20);
	});

	it("toggles selection and emits detailed change payload", async () => {
		const onChange = vi.fn();

		const wrapper = mount(Odontogram, {
			props: {
				readOnly: false,
				onChange,
			},
		});

		const tooth = wrapper.get('[role="option"][aria-label="Tooth 11"]');

		await tooth.trigger("click");

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenLastCalledWith([
			{
				id: "teeth-11",
				notations: {
					fdi: "11",
					universal: "8",
					palmer: "1⌋",
				},
				type: "Central Incisor",
			},
		]);

		const hiddenInput = wrapper.get('input[type="hidden"][name="teeth"]');
		expect((hiddenInput.element as HTMLInputElement).value).toBe(
			JSON.stringify(["teeth-11"]),
		);

		await tooth.trigger("click");

		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it("limits selection to one tooth in singleSelect mode", async () => {
		const onChange = vi.fn();

		const wrapper = mount(Odontogram, {
			props: {
				singleSelect: true,
				readOnly: false,
				onChange,
			},
		});

		expect(
			wrapper.get('[role="listbox"][aria-label="Odontogram"]').attributes(
				"aria-multiselectable",
			),
		).toBe("false");

		const tooth11 = wrapper.get('[role="option"][aria-label="Tooth 11"]');
		const tooth12 = wrapper.get('[role="option"][aria-label="Tooth 12"]');

		await tooth11.trigger("click");
		expect(tooth11.attributes("aria-selected")).toBe("true");
		expect(tooth12.attributes("aria-selected")).toBe("false");

		await tooth12.trigger("click");
		expect(tooth11.attributes("aria-selected")).toBe("false");
		expect(tooth12.attributes("aria-selected")).toBe("true");

		const hiddenInput = wrapper.get('input[type="hidden"][name="teeth"]');
		expect((hiddenInput.element as HTMLInputElement).value).toBe(
			JSON.stringify(["teeth-12"]),
		);
		expect(onChange).toHaveBeenLastCalledWith([
			expect.objectContaining({ id: "teeth-12" }),
		]);

		await tooth12.trigger("click");
		expect((hiddenInput.element as HTMLInputElement).value).toBe(
			JSON.stringify([]),
		);
		expect(onChange).toHaveBeenLastCalledWith([]);
	});

	it("keeps only first defaultSelected tooth in singleSelect mode", () => {
		const wrapper = mount(Odontogram, {
			props: {
				singleSelect: true,
				defaultSelected: ["teeth-11", "teeth-12"],
			},
		});

		expect(
			wrapper.get('[role="option"][aria-label="Tooth 11"]').attributes(
				"aria-selected",
			),
		).toBe("true");
		expect(
			wrapper.get('[role="option"][aria-label="Tooth 12"]').attributes(
				"aria-selected",
			),
		).toBe("false");
	});

	it("supports keyboard selection with Enter and Space", async () => {
		const wrapper = mount(Odontogram);

		const tooth = wrapper.get('[role="option"][aria-label="Tooth 12"]');

		await tooth.trigger("keydown", { key: "Enter" });
		expect(tooth.attributes("aria-selected")).toBe("true");

		await tooth.trigger("keydown", { key: " " });
		expect(tooth.attributes("aria-selected")).toBe("false");
	});

	it("does not render tooltip when showTooltip is false", async () => {
		const wrapper = mount(Odontogram, {
			props: { showTooltip: false },
		});

		const tooth = wrapper.get('[role="option"][aria-label="Tooth 11"]');

		await tooth.trigger("mouseenter");

		expect(wrapper.find('[role="tooltip"]').exists()).toBe(false);
	});

	it("supports v-model:selected two-way binding", async () => {
		const wrapper = mount(Odontogram, {
			props: {
				selected: [],
				"onUpdate:selected": (value: string[]) =>
					wrapper.setProps({ selected: value }),
			},
		});

		const tooth = wrapper.get('[role="option"][aria-label="Tooth 11"]');
		await tooth.trigger("click");

		expect(wrapper.props("selected")).toEqual(["teeth-11"]);

		await tooth.trigger("click");
		expect(wrapper.props("selected")).toEqual([]);
	});

	it("renders custom tooltip slot content", async () => {
		const wrapper = mount(Odontogram, {
			attachTo: document.body,
			slots: {
				tooltip: ({ payload }: { payload?: { notations: { fdi: string } } }) =>
					`Custom ${payload?.notations.fdi}`,
			},
		});

		const tooth = wrapper.get('[role="option"][aria-label="Tooth 11"]');
		await tooth.trigger("mouseenter");
		await flushPromises();

		expect(wrapper.find(".odontogram-tooltip").text()).toContain("Custom 11");

		wrapper.unmount();
	});
});

describe("notation helpers", () => {
	it("converts FDI notation to Universal and Palmer", () => {
		expect(convertFDIToNotation("teeth-21", "Universal")).toBe("9");
		expect(convertFDIToNotation("teeth-21", "Palmer")).toBe("1UL");
		expect(convertFDIToNotation("teeth-21", "FDI")).toBe("21");
	});

	it("returns complete notation object", () => {
		expect(getToothNotations("teeth-48")).toEqual({
			fdi: "48",
			universal: "32",
			palmer: "8⌉",
		});
	});

	it("maps provided colors to css variables", () => {
		expect(
			mapToCssVars({
				darkBlue: "#1",
				baseBlue: "#2",
			}),
		).toEqual({
			"--dark-blue": "#1",
			"--base-blue": "#2",
		});
	});
});
