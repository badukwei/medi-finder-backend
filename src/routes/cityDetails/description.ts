import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, description } = req.body;

	try {
		if (!cityId || !description) {
			res.status(400).json({
				error: "City ID and description are required.",
			});
			return;
		}

		const city = await prisma.city.update({
			where: { id: cityId },
			data: { description },
		});

		res.status(201).json(city);
	} catch (error) {
		console.error("Failed to create description:", error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "City not found." });
			return;
		}
		res.status(500).json({ error: "Failed to create description." });
	}
});

router.get("/get/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		const city = await prisma.city.findUnique({
			where: { id: cityId },
			select: { id: true, description: true },
		});

		if (!city) {
			res.status(404).json({ error: "City not found." });
			return;
		}

		res.status(200).json(city);
	} catch (error) {
		console.error("Failed to fetch description:", error);
		res.status(500).json({ error: "Failed to fetch description." });
	}
});

router.delete("/delete/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		const city = await prisma.city.update({
			where: { id: cityId },
			data: { description: null },
		});

		res.status(200).json({
			success: true,
			message: "Description deleted successfully.",
			city,
		});
	} catch (error) {
		console.error("Failed to delete description:", error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "City not found." });
			return;
		}
		res.status(500).json({ error: "Failed to delete description." });
	}
});

router.put("/edit/:cityId", async (req, res) => {
	const { cityId } = req.params;
	const { description } = req.body;

	try {
		if (!description) {
			res.status(400).json({ error: "Description is required." });
			return;
		}

		const city = await prisma.city.update({
			where: { id: cityId },
			data: { description },
		});

		res.status(200).json(city);
	} catch (error) {
		console.error("Failed to edit description:", error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "City not found." });
			return;
		}
		res.status(500).json({ error: "Failed to edit description." });
	}
});

export default router;