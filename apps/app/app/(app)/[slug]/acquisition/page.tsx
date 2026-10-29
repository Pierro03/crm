import {
	PageShell,
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
} from "@crm/ui/components/page-shell";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AcquisitionDashboard } from "./acquisition-dashboard";

export default function AcquisitionPage() {
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
				<Suspense fallback={<PageShellLoading shape="dashboard" />}>
					<AcquisitionSummary />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function AcquisitionSummary() {
	await requireSession();
	const queryClient = getServerQueryClient();
	await queryClient.prefetchQuery(
		getServerTrpc().dashboard.summary.queryOptions({ scope: "everyone" }),
	);

	return (
		<HydrateClient>
			<AcquisitionDashboard />
		</HydrateClient>
	);
}
