interface Hospital {
	name: string;
	address: string;
	contact: string;
	open24Hours: boolean;
}

interface AmbulanceService {
	available: boolean;
	lowestFees: number;
	highestFees: number;
	responseTime: string;
}

interface EmergencyInfo {
	emergencyPhone: string;
	hospitals: Hospital[];
	ambulanceService: AmbulanceService;
}

interface Vaccine {
	vaccine: string;
	importance: number;
}

interface InsuranceInfo {
	internationalAccepted: boolean;
	travelInsuranceRecommended: boolean;
}

export interface CityHealthInfo {
	id: string;
	cityName: string;
	country: string;
	generalRating: number;
	overview: string;
	description: string;
	emergencyInfo: EmergencyInfo;
	commonIllnesses: string[];
	vaccinesRecommended: Vaccine[];
	insuranceInfo: InsuranceInfo;
	languageSupport: number;
	waterSafety: number;
	foodSafety: number;
	healthRisk: number;
	airQuality: number;
}
