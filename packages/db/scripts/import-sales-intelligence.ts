import { resolve } from "node:path";
import { db } from "../src/client";

type ResearchRow = {
	platform_name: string;
	matched_website: string;
	platform_type: string;
	headquarters: string;
	markets_served: string;
	confidence: string;
	analyst_note: string;
	source_urls: string;
};

const PRIORITY = [
	[
		"PriceTravel",
		"CLOSED_WON",
		"Live API bookings confirmed",
		"Build the 90-day optimization plan",
	],
	[
		"Snowtorm Technologies",
		"CLOSED_WON",
		"Making live API bookings",
		"Schedule the CEO growth call",
	],
	[
		"Engine",
		"DECISION_MAKER_BOUGHT_IN",
		"API certification in progress",
		"Close the certification document gap",
	],
	[
		"HotelPlanner",
		"DECISION_MAKER_BOUGHT_IN",
		"Certification feedback delivered",
		"Collect partner certification files",
	],
	[
		"Fursan Travel",
		"QUALIFIED_TO_BUY",
		"Ready to transact directly",
		"Approve the $500K credit addendum",
	],
	[
		"TravelgateX",
		"QUALIFIED_TO_BUY",
		"Global connectivity footprint verified",
		"Identify the hotel supply decision owner",
	],
	[
		"Travel Compositor",
		"DEMO_BOOKED",
		"Booking-engine fit verified",
		"Research current hotel supply partners",
	],
	[
		"Viajes Veracruz",
		"DEMO_BOOKED",
		"No contact for 252 days",
		"Re-open the commercial conversation",
	],
] as const;

const sourcePath = resolve(
	import.meta.dir,
	"..",
	"..",
	"..",
	"..",
	"outputs",
	"apollo_platform_research",
	"hotel_travel_platform_research.csv",
);

const text = await Bun.file(sourcePath).text();
const rows = parseCsv(text);
const [headers, ...records] = rows;

if (!headers)
	throw new Error("The SalesIntelligence research file has no header row.");

const research = records
	.map(
		(values) =>
			Object.fromEntries(
				headers.map((header, index) => [header, values[index] ?? ""]),
			) as ResearchRow,
	)
	.filter((row) => row.platform_name.trim());

for (const row of research) {
	const name = row.platform_name.trim();
	const website = validWebsite(row.matched_website);
	const domain = directDomain(website);
	const existing = await db.company.findFirst({
		where: {
			archivedAt: null,
			OR: [{ name }, ...(domain ? [{ domain }] : [])],
		},
	});
	const data = {
		name,
		website,
		domain,
		industry: "Travel",
		subIndustry: clean(row.platform_type),
		description: clean(row.analyst_note),
		country: clean(row.headquarters),
		source: "IMPORT" as const,
	};

	if (existing) await db.company.update({ where: { id: existing.id }, data });
	else await db.company.create({ data });
}

const owner = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
if (!owner)
	throw new Error("Seed the CRM before importing SalesIntelligence records.");

for (const [name, stage, signal, nextAction] of PRIORITY) {
	let company = await db.company.findFirst({
		where: { name: { equals: name, mode: "insensitive" }, archivedAt: null },
	});
	company ??= await db.company.create({
		data: { name, industry: "Travel", source: "IMPORT" },
	});

	const dealName = `${name} · ETG API partnership`;
	const existingDeal = await db.deal.findFirst({
		where: { name: dealName, companyId: company.id, archivedAt: null },
	});
	const dealData = {
		name: dealName,
		companyId: company.id,
		ownerId: owner.id,
		stage,
		description: `${signal}\n\nNext action: ${nextAction}`,
	};
	const deal = existingDeal
		? await db.deal.update({ where: { id: existingDeal.id }, data: dealData })
		: await db.deal.create({ data: dealData });

	const imported = await db.activity.findFirst({
		where: { dealId: deal.id, subject: "SalesIntelligence import" },
	});
	if (!imported) {
		await db.activity.create({
			data: {
				type: "NOTE",
				subject: "SalesIntelligence import",
				body: signal,
				companyId: company.id,
				dealId: deal.id,
				createdById: owner.id,
				meta: { nextAction, source: "SalesIntelligence" },
			},
		});
	}
}

const totals = await Promise.all([
	db.company.count({ where: { source: "IMPORT" } }),
	db.deal.count({ where: { name: { endsWith: "· ETG API partnership" } } }),
]);
console.log(
	`Imported ${totals[0]} travel companies and ${totals[1]} ETG API opportunities.`,
);
await db.$disconnect();

function clean(value: string): string | null {
	const trimmed = value.trim();
	return !trimmed || /^not |^unavailable$/i.test(trimmed) ? null : trimmed;
}

function validWebsite(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed.startsWith("http")) return null;
	try {
		return new URL(trimmed).toString();
	} catch {
		return null;
	}
}

function directDomain(website: string | null): string | null {
	if (!website) return null;
	const hostname = new URL(website).hostname.replace(/^www\./, "");
	return ["linkedin.com", "owler.com"].some((domain) =>
		hostname.endsWith(domain),
	)
		? null
		: hostname;
}

function parseCsv(value: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let quoted = false;
	for (let index = 0; index < value.length; index++) {
		const character = value[index];
		if (character === '"') {
			if (quoted && value[index + 1] === '"') {
				field += '"';
				index++;
			} else quoted = !quoted;
		} else if (character === "," && !quoted) {
			row.push(field);
			field = "";
		} else if ((character === "\n" || character === "\r") && !quoted) {
			if (character === "\r" && value[index + 1] === "\n") index++;
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else field += character;
	}
	if (field || row.length) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}
