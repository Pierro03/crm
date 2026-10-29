import { db } from "@crm/db";
import "server-only";
import {
	type IntelligenceAccount,
	type PipelineStage,
	SALES_INTELLIGENCE_SNAPSHOT,
} from "./sales-intelligence-snapshot";

const STAGE_MAP = {
	DEMO_BOOKED: "Discovered",
	QUALIFIED_TO_BUY: "Qualified",
	UNQUALIFIED_TO_BUY: "Discovered",
	DECISION_MAKER_BOUGHT_IN: "Engaged",
	CONTRACT_SENT: "Engaged",
	CLOSED_WON: "Handoff",
	CLOSED_LOST: "Discovered",
} satisfies Record<string, PipelineStage>;

export type SalesIntelligenceData = {
	accounts: IntelligenceAccount[];
	sourceTotals: {
		discoveryTargets: number;
		managedAccounts: number;
		preCallReports: number;
	};
};

export async function loadSalesIntelligenceData(): Promise<SalesIntelligenceData> {
	const [companies, deals] = await Promise.all([
		db.company.count({ where: { source: "IMPORT", archivedAt: null } }),
		db.deal.findMany({
			where: {
				name: { endsWith: "· ETG API partnership" },
				archivedAt: null,
			},
			include: { company: true, owner: true },
			orderBy: { updatedAt: "desc" },
		}),
	]);

	const baselineByName = new Map(
		SALES_INTELLIGENCE_SNAPSHOT.accounts.map((account) => [
			account.name.toLowerCase(),
			account,
		]),
	);
	const accounts = deals.flatMap((deal) => {
		const baseline = baselineByName.get(deal.company.name.toLowerCase());
		if (!baseline) return [];
		return [
			{
				...baseline,
				id: deal.id,
				name: deal.company.name,
				owner: deal.owner.name,
				stage: STAGE_MAP[deal.stage],
			} satisfies IntelligenceAccount,
		];
	});

	return {
		accounts,
		sourceTotals: {
			discoveryTargets: companies,
			managedAccounts: deals.length,
			preCallReports: SALES_INTELLIGENCE_SNAPSHOT.sources.preCallReports,
		},
	};
}
