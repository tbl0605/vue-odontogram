import type { OdontogramLabels } from "./types";

export const defaultLabels: OdontogramLabels = {
	odontogram: "Odontogram",
	tooth: "Tooth",
	type: "Type",
	universal: "Universal",
	palmer: "Palmer",
	palmerQuadrants: { "1": "UR", "2": "UL", "3": "LL", "4": "LR" },
	legend: "Tooth condition legend",
};

export const frLabels: OdontogramLabels = {
	odontogram: "Odontogramme",
	tooth: "Dent",
	type: "Type",
	universal: "Universelle",
	palmer: "Palmer",
	palmerQuadrants: { "1": "SD", "2": "SG", "3": "IG", "4": "ID" },
	legend: "Légende des états des dents",
	toothTypes: {
		"Central Incisor": "Incisive centrale",
		"Lateral Incisor": "Incisive latérale",
		Canine: "Canine",
		"First Premolar": "Première prémolaire",
		"Second Premolar": "Deuxième prémolaire",
		"First Molar": "Première molaire",
		"Second Molar": "Deuxième molaire",
		"Third Molar": "Troisième molaire",
	},
};
