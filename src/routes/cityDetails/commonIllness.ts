import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, illness } = req.body;

	try {
		if (!cityId || !illness) {
			res.status(400).json({
				error: "City ID and illness are required.",
			});
			return;
		}

		const newIllness = await prisma.commonIllness.create({
			data: {
				cityId,
				illness,
			},
		});

		res.status(201).json(newIllness);
	} catch (error) {
		console.error("Failed to create common illness:", error);
		res.status(500).json({ error: "Failed to create common illness." });
	}
});

router.post("/createMany", async (req, res) => {
	const { cityId, illnesses } = req.body;

	try {
		if (!cityId || !Array.isArray(illnesses) || illnesses.length === 0) {
			res.status(400).json({
				error: "City ID and a non-empty array of illnesses are required.",
			});
			return;
		}

		const invalidIllness = illnesses.some((illness) => !illness);
		if (invalidIllness) {
			res.status(400).json({
				error: "All illnesses must be valid strings.",
			});
			return;
		}

		const createdIllnesses = await prisma.commonIllness.createMany({
			data: illnesses.map((illness) => ({
				cityId,
				illness,
			})),
		});

		res.status(201).json({
			success: true,
			message: `${createdIllnesses.count} illnesses created successfully.`,
		});
	} catch (error) {
		console.error("Failed to create common illnesses:", error);
		res.status(500).json({ error: "Failed to create common illnesses." });
	}
});

router.get("/get/:id", async (req, res) => {
	const { id } = req.params;

	try {
		if (!id) {
			res.status(400).json({ error: "Illness ID is required." });
			return;
		}

		const illness = await prisma.commonIllness.findUnique({
			where: { id },
		});

		if (!illness) {
			res.status(404).json({ error: "Common illness not found." });
			return;
		}

		res.status(200).json(illness);
	} catch (error) {
		console.error("Failed to fetch the common illness:", error);
		res.status(500).json({ error: "Failed to fetch the common illness." });
	}
});

router.get("/getMany/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		const illnesses = await prisma.commonIllness.findMany({
			where: { cityId },
		});

		if (illnesses.length === 0) {
			res.status(404).json({
				error: "No common illnesses found for the given city.",
			});
			return;
		}

		res.status(200).json(illnesses);
	} catch (error) {
		console.error("Failed to fetch common illnesses:", error);
		res.status(500).json({ error: "Failed to fetch common illnesses." });
	}
});

router.delete("/delete/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const deletedIllness = await prisma.commonIllness.delete({
			where: { id },
		});

		res.status(200).json({
			success: true,
			message: "Common illness deleted successfully.",
			deletedIllness,
		});
	} catch (error) {
		console.error("Failed to delete common illness:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "Common illness not found." });
			return;
		}

		res.status(500).json({ error: "Failed to delete common illness." });
	}
});

router.put("/edit/:cityId", async (req, res) => {
	const { cityId } = req.params;
	const { illnesses } = req.body;

	try {
		if (!cityId || !Array.isArray(illnesses) || illnesses.length === 0) {
			res.status(400).json({
				error: "City ID and a non-empty array of illnesses are required.",
			});
			return;
		}

		const invalidIllness = illnesses.some((illness) => !illness);
		if (invalidIllness) {
			res.status(400).json({
				error: "All illnesses must be valid strings.",
			});
			return;
		}

		await prisma.$transaction(async (prisma) => {
			await prisma.commonIllness.deleteMany({
				where: { cityId },
			});

			const createdIllnesses = await prisma.commonIllness.createMany({
				data: illnesses.map((illness) => ({
					cityId,
					illness,
				})),
			});

			return createdIllnesses;
		});

		res.status(200).json({
			success: true,
			message: "Common illnesses updated successfully.",
		});
	} catch (error) {
		console.error("Failed to edit common illnesses:", error);
		res.status(500).json({ error: "Failed to edit common illnesses." });
	}
});

export default router;
