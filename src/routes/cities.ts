import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/getAll", async (req, res) => {
	try {
		const cities = await prisma.city.findMany({
			include: {
				hospitals: true,
				generalRatings: {
					select: {
						rating: true,
					},
				},
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

		const enrichedCities = cities.map((city) => {
			const totalGeneralRatings = city.generalRatings.length;
			const averageGeneralRating = totalGeneralRatings
				? city.generalRatings.reduce(
						(sum, { rating }) => sum + rating,
						0
				  ) / totalGeneralRatings
				: 0;

			const totalHealthRatings = city.healthRatings.length;
			const averageHealthRatings = totalHealthRatings
				? city.healthRatings.reduce(
						(sums, rating) => ({
							languageSupport:
								sums.languageSupport + rating.languageSupport,
							waterSafety: sums.waterSafety + rating.waterSafety,
							foodSafety: sums.foodSafety + rating.foodSafety,
							healthRisk: sums.healthRisk + rating.healthRisk,
							airQuality: sums.airQuality + rating.airQuality,
						}),
						{
							languageSupport: 0,
							waterSafety: 0,
							foodSafety: 0,
							healthRisk: 0,
							airQuality: 0,
						}
				  )
				: {
						languageSupport: 0,
						waterSafety: 0,
						foodSafety: 0,
						healthRisk: 0,
						airQuality: 0,
				  };

			const normalizedHealthRatings = totalHealthRatings
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

			return {
				...city,
				averageGeneralRating: parseFloat(
					averageGeneralRating.toFixed(2)
				), 
				averageHealthRating: normalizedHealthRatings,
			};
		});

		res.status(200).json(enrichedCities);
	} catch (error) {
		console.error("Failed to fetch cities:", error);
		res.status(500).json({ error: "Failed to fetch cities" });
	}
});

router.get("/getOverview", async (req, res) => {
	try {
		const cities = await prisma.city.findMany({
			select: {
				id: true,
				cityName: true,
				country: true,
				overview: true,
				cityImageUrl: true,
				generalRatings: {
					select: {
						rating: true,
					},
				},
			},
		});

		const enrichedCities = cities.map((city) => {
			const totalRatings = city.generalRatings.length;
			const averageRating = totalRatings
				? city.generalRatings.reduce(
						(sum, { rating }) => sum + rating,
						0
				  ) / totalRatings
				: 0;

			return {
				...city,
				averageGeneralRating: parseFloat(averageRating.toFixed(2)), // Add averageRatings field
			};
		});

		res.status(200).json(enrichedCities);
	} catch (error) {
		console.error("Failed to fetch basic city info:", error);
		res.status(500).json({ error: "Failed to fetch basic cities info" });
	}
});

export default router;
