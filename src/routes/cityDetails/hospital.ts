import { Router } from "express";
import prisma from "../../prisma";

const router = Router();

router.post("/create", async (req, res) => {
	const { cityId, name, address, contact, open24Hours } = req.body;

	try {
		if (
			!cityId ||
			!name ||
			!address ||
			!contact ||
			open24Hours === undefined
		) {
			res.status(400).json({ error: "All fields are required." });
			return;
		}

		const hospital = await prisma.hospital.create({
			data: {
				cityId,
				name,
				address,
				contact,
				open24Hours,
			},
		});

		res.status(201).json(hospital);
	} catch (error) {
		console.error("Failed to create hospital:", error);
		res.status(500).json({ error: "Failed to create hospitals" });
	}
});

router.post("/createMany", async (req, res) => {
	const { cityId, hospitals } = req.body;

	try {
		if (!cityId || !Array.isArray(hospitals) || hospitals.length === 0) {
			res.status(400).json({
				error: "City ID and hospitals array are required.",
			});
			return;
		}

		const invalidHospital = hospitals.some(
			(hospital) =>
				!hospital.name ||
				!hospital.address ||
				!hospital.contact ||
				hospital.open24Hours === undefined
		);

		if (invalidHospital) {
			res.status(400).json({
				error: "All fields are required for each hospital.",
			});
			return;
		}

		const createdHospitals = await prisma.hospital.createMany({
			data: hospitals.map((hospital) => ({
				cityId,
				name: hospital.name,
				address: hospital.address,
				contact: hospital.contact,
				open24Hours: hospital.open24Hours,
			})),
		});

		res.status(201).json({
			success: true,
			message: `${createdHospitals.count} hospitals created successfully.`,
		});
	} catch (error) {
		console.error("Failed to create hospitals:", error);
		res.status(500).json({ error: "Failed to create hospitals" });
	}
});

router.get("/get/:id", async (req, res) => {
	const { id } = req.params;

	try {
		if (!id) {
			res.status(400).json({ error: "Hospital ID is required." });
			return;
		}

		const hospital = await prisma.hospital.findUnique({
			where: { id },
		});

		if (!hospital) {
			res.status(404).json({ error: "Hospital not found." });
			return;
		}

		res.status(200).json(hospital);
	} catch (error) {
		console.error("Failed to fetch hospital:", error);
		res.status(500).json({ error: "Failed to fetch hospital." });
	}
});

router.get("/getMany/:cityId", async (req, res) => {
	const { cityId } = req.params;

	try {
		if (!cityId) {
			res.status(400).json({ error: "City ID is required." });
			return;
		}

		const hospitals = await prisma.hospital.findMany({
			where: { cityId },
		});

		if (hospitals.length === 0) {
			res.status(404).json({
				error: "No hospitals found for the given city.",
			});
			return;
		}

		res.status(200).json(hospitals);
	} catch (error) {
		console.error("Failed to fetch hospitals:", error);
		res.status(500).json({ error: "Failed to fetch hospitals." });
	}
});


router.delete("/delete", async (req, res) => {
	const { hospitalIds } = req.body;

	try {
		if (!Array.isArray(hospitalIds) || hospitalIds.length === 0) {
			res.status(400).json({ error: "Hospital IDs are required." });
			return;
		}

		const deleteResult = await prisma.hospital.deleteMany({
			where: {
				id: { in: hospitalIds },
			},
		});

		if (deleteResult.count === 0) {
			res.status(404).json({ error: "No hospitals found to delete." });
			return;
		}

		res.status(200).json({
			success: true,
			message: `${deleteResult.count} hospital(s) deleted successfully.`,
		});
	} catch (error) {
		console.error("Failed to delete hospitals:", error);
		res.status(500).json({ error: "Failed to delete hospitals." });
	}
});

router.put("/edit", async (req, res) => {
	const { cityId, hospitals } = req.body;

	try {
		if (!cityId || !Array.isArray(hospitals) || hospitals.length === 0) {
			res.status(400).json({
				error: "City ID and hospitals array are required.",
			});
			return;
		}

		const invalidHospital = hospitals.some(
			(hospital) =>
				!hospital.name ||
				!hospital.address ||
				!hospital.contact ||
				hospital.open24Hours === undefined
		);

		if (invalidHospital) {
			res.status(400).json({
				error: "All fields are required for each hospital.",
			});
            return;
		}

		const result = await prisma.$transaction(async (prisma) => {
			await prisma.hospital.deleteMany({
				where: { cityId },
			});

			const createdHospitals = await prisma.hospital.createMany({
				data: hospitals.map((hospital) => ({
					cityId,
					name: hospital.name,
					address: hospital.address,
					contact: hospital.contact,
					open24Hours: hospital.open24Hours,
				})),
			});

			return createdHospitals;
		});

		res.status(200).json({
			success: true,
			message: `${result.count} hospital(s) updated successfully.`,
		});
	} catch (error) {
		console.error("Failed to edit hospitals:", error);
		res.status(500).json({ error: "Failed to edit hospitals." });
	}
});

export default router;
