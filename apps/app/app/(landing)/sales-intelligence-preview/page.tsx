import { AcquisitionDashboard } from "../../(app)/[slug]/acquisition/acquisition-dashboard";

export const metadata = { title: "ETG Sales Intelligence Preview" };

export default function SalesIntelligencePreviewPage() {
	return (
		<main className="mx-auto min-h-screen w-full max-w-screen-2xl bg-background p-4 text-foreground sm:p-6 lg:p-8">
			<div className="mb-6 flex flex-col gap-1">
				<h1 className="font-heading font-semibold text-xl tracking-tight">
					API partner acquisition
				</h1>
				<p className="text-muted-foreground text-sm">
					Local product preview using current SalesIntelligence outputs.
				</p>
			</div>
			<AcquisitionDashboard />
		</main>
	);
}
