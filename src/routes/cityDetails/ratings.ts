import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const {
		cityId,
		languageSupport,
		waterSafety,
		foodSafety,
		healthRisk,
		airQuality,
	} = req.body;

	try {
		if (
			!cityId ||
			[
				languageSupport,
				waterSafety,
				foodSafety,
				healthRisk,
				airQuality,
			].some((rating) => rating < 0 || rating > 5)
		) {
			res.status(400).json({
				error: "City ID is required, and all ratings must be between 0 and 5.",
			});
			return;
		}

		const healthRating = await prisma.healthRating.create({
			data: {
				cityId,
				languageSupport,
				waterSafety,
				foodSafety,
				healthRisk,
				airQuality,
			},
		});

		res.status(201).json(healthRating);
	} catch (error) {
		console.error("Failed to create HealthRating:", error);
		res.status(500).json({ error: "Failed to create HealthRating." });
	}
});

router.get("/get/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		const healthRatings = await prisma.healthRating.findMany({
			where: { cityId },
		});

		if (healthRatings.length === 0) {
			res.status(404).json({
				error: "No HealthRatings found for the specified city.",
			});
			return;
		}

		res.status(200).json(healthRatings);
	} catch (error) {
		console.error("Failed to fetch HealthRatings:", error);
		res.status(500).json({ error: "Failed to fetch HealthRatings." });
	}
});

router.delete("/delete/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const deletedHealthRating = await prisma.healthRating.delete({
			where: { id },
		});

		res.status(200).json({
			success: true,
			message: `HealthRating deleted successfully.`,
			data: deletedHealthRating,
		});
	} catch (error) {
		console.error("Failed to delete HealthRating:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "HealthRating not found." });
			return;
		}

		res.status(500).json({ error: "Failed to delete HealthRating." });
	}
});

router.put("/edit/:id", async (req, res) => {
	const { id } = req.params;
	const { languageSupport, waterSafety, foodSafety, healthRisk, airQuality } =
		req.body;

	try {
		if (
			[
				languageSupport,
				waterSafety,
				foodSafety,
				healthRisk,
				airQuality,
			].some((rating) => rating < 0 || rating > 5)
		) {
			res.status(400).json({
				error: "All ratings must be between 0 and 5.",
			});
			return;
		}

		const updatedHealthRating = await prisma.healthRating.update({
			where: { id },
			data: {
				languageSupport,
				waterSafety,
				foodSafety,
				healthRisk,
				airQuality,
			},
		});

		res.status(200).json(updatedHealthRating);
	} catch (error) {
		console.error("Failed to edit HealthRating:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "HealthRating not found." });
			return;
		}

		res.status(500).json({ error: "Failed to edit HealthRating." });
	}
});

export default router;
