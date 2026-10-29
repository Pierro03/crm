export const PIPELINE_STAGES = [
	"Discovered",
	"Qualified",
	"Engaged",
	"Handoff",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type IntelligenceAccount = {
	id: string;
	name: string;
	region: "MEA · CIS" | "LATAM" | "NORAM" | "Global";
	segment: "OTA" | "Travel platform" | "TMC" | "Connectivity";
	stage: PipelineStage;
	score: number;
	owner: string;
	signal: string;
	nextAction: string;
	age: number;
	fit: readonly string[];
	evidence: readonly string[];
	risk: string;
};

export const SALES_INTELLIGENCE_SNAPSHOT = {
	updatedAt: "October 29, 2026",
	sources: { discoveryTargets: 199, managedAccounts: 61, preCallReports: 3 },
	proof: [
		{ value: "3M+", label: "properties" },
		{ value: "24B", label: "rates daily" },
		{ value: "100+", label: "certified platforms" },
		{ value: "50", label: "support languages" },
	],
	accounts: [
		{
			id: "price-travel",
			name: "PriceTravel",
			region: "LATAM",
			segment: "OTA",
			stage: "Handoff",
			score: 94,
			owner: "Maria Santos",
			signal: "Live API bookings confirmed",
			nextAction: "Build the 90-day optimization plan",
			age: 1,
			fit: ["Active API demand", "Regional expansion", "Optimization-ready"],
			evidence: [
				"Paid bookings recorded",
				"Partner is live",
				"Commercial relationship active",
			],
			risk: "Growth stalls without supply and conversion benchmarks.",
		},
		{
			id: "snowtorm",
			name: "Snowtorm Technologies",
			region: "NORAM",
			segment: "Travel platform",
			stage: "Handoff",
			score: 91,
			owner: "James Lee",
			signal: "Making live API bookings",
			nextAction: "Schedule the CEO growth call",
			age: 3,
			fit: ["Live integration", "Hotel supply demand", "Executive access"],
			evidence: [
				"API bookings confirmed",
				"CEO call requested",
				"Technical path complete",
			],
			risk: "Executive follow-up has no confirmed date.",
		},
		{
			id: "engine",
			name: "Engine",
			region: "NORAM",
			segment: "TMC",
			stage: "Engaged",
			score: 88,
			owner: "James Lee",
			signal: "API certification in progress",
			nextAction: "Close the certification document gap",
			age: 5,
			fit: ["In-house technology", "Corporate travel", "Fast TTR"],
			evidence: [
				"Certification started",
				"API support engaged",
				"Documents requested",
			],
			risk: "Outstanding documents delay launch.",
		},
		{
			id: "hotelplanner",
			name: "HotelPlanner",
			region: "NORAM",
			segment: "OTA",
			stage: "Engaged",
			score: 84,
			owner: "James Lee",
			signal: "Certification feedback delivered",
			nextAction: "Collect partner certification files",
			age: 7,
			fit: ["Large hotel demand", "API capability", "Global reach"],
			evidence: [
				"BP feedback delivered",
				"Certification path open",
				"Partner response pending",
			],
			risk: "Partner documents remain outstanding.",
		},
		{
			id: "fursan",
			name: "Fursan Travel",
			region: "MEA · CIS",
			segment: "TMC",
			stage: "Qualified",
			score: 86,
			owner: "Tina Petrova",
			signal: "Ready to transact directly",
			nextAction: "Approve the $500K credit addendum",
			age: 9,
			fit: ["Direct API demand", "MEA supply fit", "Post-pay candidate"],
			evidence: [
				"Partner ready",
				"Credit request submitted",
				"Commercial model selected",
			],
			risk: "Credit approval blocks transaction start.",
		},
		{
			id: "travelgatex",
			name: "TravelgateX",
			region: "Global",
			segment: "Connectivity",
			stage: "Qualified",
			score: 82,
			owner: "Unassigned",
			signal: "Global connectivity footprint verified",
			nextAction: "Identify the hotel supply decision owner",
			age: 2,
			fit: [
				"Connectivity ecosystem",
				"Global distribution",
				"Certified-platform potential",
			],
			evidence: [
				"IATA source located",
				"Multi-market presence",
				"Travel platform classification",
			],
			risk: "Decision-maker evidence is incomplete.",
		},
		{
			id: "travel-compositor",
			name: "Travel Compositor",
			region: "Global",
			segment: "Travel platform",
			stage: "Discovered",
			score: 79,
			owner: "Unassigned",
			signal: "Booking-engine fit verified",
			nextAction: "Research current hotel supply partners",
			age: 2,
			fit: ["Booking engine", "API-led distribution", "Fast TTR potential"],
			evidence: [
				"Official domain matched",
				"Platform type verified",
				"Global positioning found",
			],
			risk: "Current supplier mix is unknown.",
		},
		{
			id: "viajes-veracruz",
			name: "Viajes Veracruz",
			region: "LATAM",
			segment: "OTA",
			stage: "Discovered",
			score: 62,
			owner: "Maria Santos",
			signal: "No contact for 252 days",
			nextAction: "Re-open the commercial conversation",
			age: 252,
			fit: ["LATAM presence", "Hotel distribution", "Re-engagement candidate"],
			evidence: [
				"Prior relationship recorded",
				"Account remains open",
				"No recent activity",
			],
			risk: "Account context is stale.",
		},
	] satisfies readonly IntelligenceAccount[],
} as const;
