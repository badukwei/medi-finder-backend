import { Router } from "express";
import prisma from "../prisma";
import multer from "multer";
import axios from "axios";
import dotenv from "dotenv";

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/get", async (req, res) => {
	try {
		const cities = await prisma.city.findMany({
			include: {
				hospitals: true,
				emergencyInfo: {
					include: {
						ambulanceService: true,
					},
				},
				commonIllnesses: true,
				vaccines: true,
				insuranceInfo: true,
				healthRatings: true,
			},
		});
		res.status(200).json(cities);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch cities" });
	}
});

router.post("/create", async (req, res) => {
	const {
		cityName,
		country,
		generalRating,
		overview,
		description,
		hospitals,
		emergencyInfo,
		commonIllnesses,
		vaccines,
		insuranceInfo,
		healthRatings,
	} = req.body;

	try {
		const city = await prisma.city.create({
			data: {
				cityName,
				country,
				generalRating,
				overview,
				description,
				hospitals: {
					create: hospitals,
				},
				emergencyInfo: {
					create: {
						emergencyPhone: emergencyInfo.emergencyPhone,
						ambulanceService: {
							create: {
								available:
									emergencyInfo.ambulanceService.available,
								lowestFees:
									emergencyInfo.ambulanceService.lowestFees,
								highestFees:
									emergencyInfo.ambulanceService.highestFees,
								responseTime:
									emergencyInfo.ambulanceService.responseTime,
							},
						},
					},
				},
				commonIllnesses: {
					create: commonIllnesses.map((illness: string) => ({
						illness,
					})),
				},
				vaccines: {
					create: vaccines,
				},
				insuranceInfo: {
					create: insuranceInfo,
				},
				healthRatings: {
					create: healthRatings,
				},
			},
		});
		res.status(201).json(city);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to create city" });
	}
});

router.post("/upload", upload.single("image"), async (req, res) => {
	if (!req.file) {
		res.status(400).json({ error: "No file uploaded" });
		return;
	}

	const { cityId } = req.body;
	if (!cityId) {
		res.status(400).json({ error: "City ID is required" });
		return;
	}

	try {
		const imageBase64 = req.file.buffer.toString("base64");

		const response = await axios.post(
			"https://api.imgur.com/3/image",
			{
				image: imageBase64,
				type: "base64",
			},
			{
				headers: {
					Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
				},
			}
		);

		const imageUrl = response.data.data.link;

		const updatedCity = await prisma.city.update({
			where: { id: cityId },
			data: { cityImageUrl: imageUrl },
		});

		res.status(200).json({
			success: true,
			message: "Image uploaded and URL added to the database",
			url: imageUrl,
			city: updatedCity,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: "Failed to upload image or update city",
		});
	}
});


export default router;
