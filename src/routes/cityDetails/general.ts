import { Router } from "express";
import prisma from "../../prisma";
import axios from "axios";
import multer from "multer";
import dotenv from "dotenv";

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/createOverview", async (req, res) => {
	const { cityName, country, generalRating, overview } = req.body;

	try {
		if (!cityName || !country || generalRating === undefined || !overview) {
			res.status(400).json({ error: "All fields are required." });
			return;
		}

		if (generalRating < 0 || generalRating > 5) {
			res.status(400).json({ error: "Rating must be between 0 and 5." });
			return;
		}

		const city = await prisma.city.create({
			data: {
				cityName,
				country,
				overview,
				generalRatings: {
					create: {
						rating: generalRating,
					},
				},
			},
			include: {
				generalRatings: true,
			},
		});

		res.status(201).json(city);
	} catch (error) {
		console.error("Failed to create city:", error);
		res.status(500).json({ error: "Failed to create city." });
	}
});

router.post("/uploadImage", upload.single("image"), async (req, res) => {
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

router.get("/getAll/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const city = await prisma.city.findUnique({
			where: { id },
			include: {
				generalRatings: {
					select: {
						rating: true,
					},
				},
				hospitals: true,
				emergencyInfo: {
					include: {
						ambulanceService: true,
					},
				},
				commonIllnesses: true,
				vaccines: true,
				insuranceInfo: true,
				healthRatings: {
					select: {
						languageSupport: true,
						waterSafety: true,
						foodSafety: true,
						healthRisk: true,
						airQuality: true,
					},
				},
			},
		});

		if (!city) {
			res.status(404).json({ error: "City not found." });
			return;
		}

		const totalGeneralRatings = city.generalRatings.length;
		const averageGeneralRating = totalGeneralRatings
			? city.generalRatings.reduce((sum, { rating }) => sum + rating, 0) /
			  totalGeneralRatings
			: 0;

		const totalHealthRatings = city.healthRatings.length;
		const averageHealthRatings = totalHealthRatings
			? city.healthRatings.reduce(
					(averages, rating) => {
						averages.languageSupport += rating.languageSupport;
						averages.waterSafety += rating.waterSafety;
						averages.foodSafety += rating.foodSafety;
						averages.healthRisk += rating.healthRisk;
						averages.airQuality += rating.airQuality;
						return averages;
					},
					{
						languageSupport: 0,
						waterSafety: 0,
						foodSafety: 0,
						healthRisk: 0,
						airQuality: 0,
					}
			  )
			: null;

		const healthRatingsAverage =
			totalHealthRatings && averageHealthRatings
				? {
						languageSupport: parseFloat(
							(
								averageHealthRatings.languageSupport /
								totalHealthRatings
							).toFixed(2)
						),
						waterSafety: parseFloat(
							(
								averageHealthRatings.waterSafety /
								totalHealthRatings
							).toFixed(2)
						),
						foodSafety: parseFloat(
							(
								averageHealthRatings.foodSafety /
								totalHealthRatings
							).toFixed(2)
						),
						healthRisk: parseFloat(
							(
								averageHealthRatings.healthRisk /
								totalHealthRatings
							).toFixed(2)
						),
						airQuality: parseFloat(
							(
								averageHealthRatings.airQuality /
								totalHealthRatings
							).toFixed(2)
						),
				  }
				: {
						languageSupport: 0,
						waterSafety: 0,
						foodSafety: 0,
						healthRisk: 0,
						airQuality: 0,
				  };

		const enrichedCity = {
			...city,
			averageGeneralRating: parseFloat(averageGeneralRating.toFixed(2)),
			averageHealthRatings: healthRatingsAverage,
		};

		res.status(200).json(enrichedCity);
	} catch (error) {
		console.error("Failed to fetch city info:", error);
		res.status(500).json({ error: "Failed to fetch city info." });
	}
});

export default router;
