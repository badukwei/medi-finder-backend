import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, vaccine, importance } = req.body;

	try {
		if (!cityId || !vaccine || importance === undefined) {
			res.status(400).json({
				error: "City ID, vaccine, and importance are required.",
			});
			return;
		}

		const newVaccine = await prisma.vaccine.create({
			data: {
				cityId,
				vaccine,
				importance,
			},
		});

		res.status(201).json(newVaccine);
	} catch (error) {
		console.error("Failed to create vaccine:", error);
		res.status(500).json({ error: "Failed to create vaccine." });
	}
});

router.post("/createMany", async (req, res) => {
	const { cityId, vaccines } = req.body;

	try {
		if (!cityId || !Array.isArray(vaccines) || vaccines.length === 0) {
			res.status(400).json({
				error: "City ID and vaccines array are required.",
			});
			return;
		}

		const invalidVaccine = vaccines.some(
			(vaccine) => !vaccine.vaccine || vaccine.importance === undefined
		);

		if (invalidVaccine) {
			res.status(400).json({
				error: "All fields are required for each vaccine.",
			});
			return;
		}

		const createdVaccines = await prisma.vaccine.createMany({
			data: vaccines.map((vaccine) => ({
				cityId,
				vaccine: vaccine.vaccine,
				importance: vaccine.importance,
			})),
		});

		res.status(201).json({
			success: true,
			message: `${createdVaccines.count} vaccine(s) created successfully.`,
		});
	} catch (error) {
		console.error("Failed to create vaccines:", error);
		res.status(500).json({ error: "Failed to create vaccines." });
	}
});

router.get("/get/:id", async (req, res) => {
	const { id } = req.params;

	try {
		if (!id) {
			res.status(400).json({ error: "Vaccine ID is required." });
			return;
		}

		const vaccine = await prisma.vaccine.findUnique({
			where: { id },
		});

		if (!vaccine) {
			res.status(404).json({ error: "Vaccine not found." });
			return;
		}

		res.status(200).json(vaccine);
	} catch (error) {
		console.error("Failed to fetch vaccine:", error);
		res.status(500).json({ error: "Failed to fetch vaccine." });
	}
});

router.get("/getMany/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		if (!cityId) {
			res.status(400).json({ error: "City ID is required." });
			return;
		}

		const vaccines = await prisma.vaccine.findMany({
			where: { cityId },
		});

		if (vaccines.length === 0) {
			res.status(404).json({
				error: "No vaccines found for the given city.",
			});
			return;
		}

		res.status(200).json(vaccines);
	} catch (error) {
		console.error("Failed to fetch vaccines:", error);
		res.status(500).json({ error: "Failed to fetch vaccines." });
	}
});

router.delete("/delete", async (req, res) => {
	const { vaccineIds } = req.body;

	try {
		if (!Array.isArray(vaccineIds) || vaccineIds.length === 0) {
			res.status(400).json({ error: "Vaccine IDs are required." });
			return;
		}

		const deleteResult = await prisma.vaccine.deleteMany({
			where: {
				id: { in: vaccineIds },
			},
		});

		if (deleteResult.count === 0) {
			res.status(404).json({ error: "No vaccines found to delete." });
			return;
		}

		res.status(200).json({
			success: true,
			message: `${deleteResult.count} vaccine(s) deleted successfully.`,
		});
	} catch (error) {
		console.error("Failed to delete vaccines:", error);
		res.status(500).json({ error: "Failed to delete vaccines." });
	}
});

router.put("/edit", async (req, res) => {
	const { cityId, vaccines } = req.body;

	try {
		if (!cityId || !Array.isArray(vaccines) || vaccines.length === 0) {
			res.status(400).json({
				error: "City ID and vaccines array are required.",
			});
			return;
		}

		const invalidVaccine = vaccines.some(
			(vaccine) => !vaccine.vaccine || vaccine.importance === undefined
		);

		if (invalidVaccine) {
			res.status(400).json({
				error: "All fields are required for each vaccine.",
			});
			return;
		}

		const result = await prisma.$transaction(async (prisma) => {
			await prisma.vaccine.deleteMany({
				where: { cityId },
			});

			const createdVaccines = await prisma.vaccine.createMany({
				data: vaccines.map((vaccine) => ({
					cityId,
					vaccine: vaccine.vaccine,
					importance: vaccine.importance,
				})),
			});

			return createdVaccines;
		});

		res.status(200).json({
			success: true,
			message: `${result.count} vaccine(s) updated successfully.`,
		});
	} catch (error) {
		console.error("Failed to edit vaccines:", error);
		res.status(500).json({ error: "Failed to edit vaccines." });
	}
});

export default router;