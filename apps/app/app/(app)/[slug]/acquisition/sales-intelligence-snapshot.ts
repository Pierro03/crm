export type PriorityAccount = {
	name: string;
	region: string;
	status: "Live" | "Integration" | "Blocked" | "Re-engage";
	nextAction: string;
};

export type DiscoveryTarget = {
	name: string;
	type: string;
	market: string;
	confidence: "High" | "Medium";
};

export const SALES_INTELLIGENCE_SNAPSHOT = {
	updatedAt: "October 28, 2026",
	sources: {
		discoveryTargets: 199,
		managedAccounts: 61,
		preCallReports: 3,
		cohorts: 2,
	},
	flow: [
		{ label: "Discovered", value: 199, detail: "Travel platforms researched" },
		{ label: "Reviewed", value: 61, detail: "Accounts with current signals" },
		{ label: "Active", value: 18, detail: "Live or integrating partners" },
		{ label: "Needs action", value: 14, detail: "Blocked or stale accounts" },
		{ label: "Manager ready", value: 6, detail: "Clear commercial next step" },
	],
	regions: [
		{
			name: "MEA · CIS",
			accounts: 37,
			signal: "Credit and integration decisions",
		},
		{ name: "LATAM", accounts: 12, signal: "Live growth and legal follow-up" },
		{
			name: "NORAM",
			accounts: 12,
			signal: "Certification and deposit blockers",
		},
	],
	priorityAccounts: [
		{
			name: "PriceTravel",
			region: "LATAM",
			status: "Live",
			nextAction: "Optimize active API bookings",
		},
		{
			name: "Snowtorm Technologies",
			region: "NORAM",
			status: "Live",
			nextAction: "Schedule the CEO growth call",
		},
		{
			name: "Engine",
			region: "NORAM",
			status: "Integration",
			nextAction: "Close certification documents",
		},
		{
			name: "Hotelplanner",
			region: "NORAM",
			status: "Integration",
			nextAction: "Collect partner certification files",
		},
		{
			name: "Fursan Travel",
			region: "MEA · CIS",
			status: "Blocked",
			nextAction: "Approve the $500K credit addendum",
		},
		{
			name: "American Executive International",
			region: "NORAM",
			status: "Blocked",
			nextAction: "Escalate the outstanding deposit",
		},
		{
			name: "Easytravelchoice.com",
			region: "MEA · CIS",
			status: "Re-engage",
			nextAction: "Re-open contact after 498 days",
		},
		{
			name: "Viajes Veracruz",
			region: "LATAM",
			status: "Re-engage",
			nextAction: "Re-open contact after 252 days",
		},
	] satisfies PriorityAccount[],
	discoveryTargets: [
		{
			name: "TravelgateX",
			type: "Connectivity hub",
			market: "Global",
			confidence: "Medium",
		},
		{
			name: "ATRIIS Technologies",
			type: "Travel agency platform",
			market: "Israel",
			confidence: "High",
		},
		{
			name: "Travel Compositor",
			type: "Booking engine",
			market: "Global",
			confidence: "High",
		},
		{
			name: "Juniper",
			type: "Connectivity hub",
			market: "Global",
			confidence: "High",
		},
		{
			name: "Gimmonix",
			type: "Travel technology",
			market: "Global",
			confidence: "High",
		},
		{
			name: "DCS Plus",
			type: "Travel agency platform",
			market: "Global",
			confidence: "Medium",
		},
	] satisfies DiscoveryTarget[],
} as const;
