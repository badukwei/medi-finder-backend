import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, internationalAccepted, travelInsuranceRecommended } =
		req.body;

	try {
		if (
			!cityId ||
			internationalAccepted === undefined ||
			travelInsuranceRecommended === undefined
		) {
			res.status(400).json({
				error: "City ID, internationalAccepted, and travelInsuranceRecommended are required.",
			});
			return;
		}

		const insuranceInfo = await prisma.insuranceInfo.create({
			data: {
				cityId,
				internationalAccepted,
				travelInsuranceRecommended,
			},
		});

		res.status(201).json(insuranceInfo);
	} catch (error) {
		console.error("Failed to create InsuranceInfo:", error);
		res.status(500).json({ error: "Failed to create InsuranceInfo." });
	}
});

router.delete("/delete", async (req, res) => {
	const { id } = req.body;

	try {
		if (!id) {
			res.status(400).json({ error: "InsuranceInfo ID is required." });
			return;
		}

		const deleteResult = await prisma.insuranceInfo.delete({
			where: { id },
		});

		res.status(200).json({
			success: true,
			message: `InsuranceInfo with ID ${id} deleted successfully.`,
		});
	} catch (error) {
		console.error("Failed to delete InsuranceInfo:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "InsuranceInfo not found." });
			return;
		}

		res.status(500).json({ error: "Failed to delete InsuranceInfo." });
	}
});

router.put("/edit", async (req, res) => {
	const { id, internationalAccepted, travelInsuranceRecommended } = req.body;

	try {
		if (
			!id ||
			internationalAccepted === undefined ||
			travelInsuranceRecommended === undefined
		) {
			res.status(400).json({
				error: "InsuranceInfo ID, internationalAccepted, and travelInsuranceRecommended are required.",
			});
			return;
		}

		const updatedInsuranceInfo = await prisma.insuranceInfo.update({
			where: { id },
			data: {
				internationalAccepted,
				travelInsuranceRecommended,
			},
		});

		res.status(200).json(updatedInsuranceInfo);
	} catch (error) {
		console.error("Failed to edit InsuranceInfo:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "InsuranceInfo not found." });
			return;
		}

		res.status(500).json({ error: "Failed to edit InsuranceInfo." });
	}
});

router.get("/get/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		const insuranceInfo = await prisma.insuranceInfo.findUnique({
			where: { cityId },
		});

		if (!insuranceInfo) {
			res.status(404).json({ error: "InsuranceInfo not found." });
			return;
		}

		res.status(200).json(insuranceInfo);
	} catch (error) {
		console.error("Failed to get InsuranceInfo:", error);
		res.status(500).json({ error: "Failed to get InsuranceInfo." });
	}
});

export default router;
