import {
	PageShell,
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
} from "@crm/ui/components/page-shell";
import { requireSession } from "@/lib/session";
import { AcquisitionDashboard } from "./acquisition-dashboard";

export default async function AcquisitionPage() {
	await requireSession();

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
				<AcquisitionDashboard />
			</PageShellContent>
		</PageShell>
	);
}
