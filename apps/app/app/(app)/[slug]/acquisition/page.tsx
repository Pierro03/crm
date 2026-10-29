import {
	PageShell,
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
} from "@crm/ui/components/page-shell";
import { requireSession } from "@/lib/session";
import { AcquisitionDashboard } from "./acquisition-dashboard";
import { loadSalesIntelligenceData } from "./sales-intelligence-data";

export default async function AcquisitionPage() {
	await requireSession();
	const intelligence = await loadSalesIntelligenceData();

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<h1 className="font-semibold text-xl tracking-tight">
						API partner acquisition
					</h1>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<AcquisitionDashboard
					companiesHref="../companies"
					initialAccounts={intelligence.accounts}
					sourceTotals={intelligence.sourceTotals}
				/>
			</PageShellContent>
		</PageShell>
	);
}
