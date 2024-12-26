import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, rating } = req.body;

	try {
		if (!cityId || rating === undefined || rating < 0 || rating > 5) {
			res.status(400).json({
				error: "Invalid city ID or rating value (0-5 required).",
			});
			return;
		}

		const newRating = await prisma.generalRating.create({
			data: {
				cityId,
				rating,
			},
		});

		res.status(201).json(newRating);
	} catch (error) {
		console.error("Failed to create general rating:", error);
		res.status(500).json({ error: "Failed to create general rating." });
	}
});

router.get("get/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		const ratings = await prisma.generalRating.findMany({
			where: { cityId },
		});

		if (!ratings || ratings.length === 0) {
			res.status(404).json({
				error: "No ratings found for the given city.",
			});
			return;
		}

		const averageRating =
			ratings.reduce((sum, rating) => sum + rating.rating, 0) /
			ratings.length;

		res.status(200).json({ ratings, averageRating });
	} catch (error) {
		console.error("Failed to fetch general ratings:", error);
		res.status(500).json({ error: "Failed to fetch general ratings." });
	}
});

router.delete("/delete/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const deletedRating = await prisma.generalRating.delete({
			where: { id },
		});

		res.status(200).json({
			success: true,
			message: "Rating deleted successfully.",
			deletedRating,
		});
	} catch (error) {
		console.error("Failed to delete general rating:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "Rating not found." });
			return;
		}

		res.status(500).json({ error: "Failed to delete general rating." });
	}
});

router.put("/edit/:id", async (req, res) => {
	const { id } = req.params;
	const { rating } = req.body;

	try {
		if (rating === undefined || rating < 0 || rating > 5) {
			res.status(400).json({
				error: "Invalid rating value (0-5 required).",
			});
			return;
		}

		const updatedRating = await prisma.generalRating.update({
			where: { id },
			data: { rating },
		});

		res.status(200).json({ success: true, updatedRating });
	} catch (error) {
		console.error("Failed to edit general rating:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "Rating not found." });
			return;
		}

		res.status(500).json({ error: "Failed to edit general rating." });
	}
});

export default router;