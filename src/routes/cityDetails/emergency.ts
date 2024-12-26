import { Router } from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, emergencyPhone, ambulanceService } = req.body;

	try {
		if (!cityId || !emergencyPhone) {
			res.status(400).json({
				error: "City ID and emergencyPhone are required.",
			});
			return;
		}

		const emergencyInfo = await prisma.emergencyInfo.create({
			data: {
				cityId,
				emergencyPhone,
				ambulanceService: ambulanceService
					? {
							create: {
								available: ambulanceService.available,
								lowestFees: ambulanceService.lowestFees,
								highestFees: ambulanceService.highestFees,
								responseTime: ambulanceService.responseTime,
							},
					  }
					: undefined,
			},
			include: {
				ambulanceService: true,
			},
		});

		res.status(201).json(emergencyInfo);
	} catch (error) {
		console.error("Failed to create EmergencyInfo:", error);
		res.status(500).json({ error: "Failed to create EmergencyInfo" });
	}
});

router.delete("/delete", async (req, res) => {
	const { emergencyInfoId } = req.body;

	try {
		if (!emergencyInfoId) {
			res.status(400).json({ error: "EmergencyInfo ID is required." });
			return;
		}

		await prisma.$transaction(async (prisma) => {
			await prisma.ambulanceService.deleteMany({
				where: { emergencyInfoId },
			});

			await prisma.emergencyInfo.delete({
				where: { id: emergencyInfoId },
			});
		});

		res.status(200).json({
			success: true,
			message: "EmergencyInfo deleted successfully.",
		});
	} catch (error) {
		console.error("Failed to delete EmergencyInfo:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "EmergencyInfo not found." });
			return;
		}

		res.status(500).json({ error: "Failed to delete EmergencyInfo." });
	}
});

router.put("/edit/:id", async (req, res) => {
	const { id } = req.params;
	const { emergencyPhone, ambulanceService } = req.body;

	try {
		if (!id) {
			res.status(400).json({ error: "EmergencyInfo ID is required." });
			return;
		}

		const updatedEmergencyInfo = await prisma.emergencyInfo.update({
			where: { id },
			data: {
				emergencyPhone,
				ambulanceService: ambulanceService
					? {
							update: {
								available: ambulanceService.available,
								lowestFees: ambulanceService.lowestFees,
								highestFees: ambulanceService.highestFees,
								responseTime: ambulanceService.responseTime,
							},
					  }
					: undefined,
			},
			include: {
				ambulanceService: true,
			},
		});

		res.status(200).json(updatedEmergencyInfo);
	} catch (error) {
		console.error("Failed to update EmergencyInfo:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			res.status(404).json({ error: "EmergencyInfo not found." });
			return;
		}

		res.status(500).json({ error: "Failed to update EmergencyInfo." });
	}
});

export default router;
