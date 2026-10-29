"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	DashboardGrid,
	DashboardSection,
	StatGroup,
} from "@crm/ui/components/dashboard";
import { StatCard } from "@crm/ui/components/stat-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import {
	ArrowRightIcon,
	DatabaseIcon,
	FileTextIcon,
	RadarIcon,
	ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { SALES_INTELLIGENCE_SNAPSHOT as snapshot } from "./sales-intelligence-snapshot";

const STATUS_VARIANT = {
	Live: "default",
	Integration: "outline",
	Blocked: "destructive",
	"Re-engage": "secondary",
} as const;

export function AcquisitionDashboard() {
	const workspaceUrl = useWorkspaceUrl();
	return (
		<div className="flex flex-col gap-6">
			<section className="relative overflow-hidden rounded-md bg-card p-6 shadow-border">
				<div className="absolute inset-y-0 right-0 hidden w-2/5 bg-brand/5 @3xl/page-content:block" />
				<div className="relative flex max-w-3xl flex-col gap-4">
					<div className="flex items-center gap-2 font-medium text-brand text-xs uppercase tracking-widest">
						<RadarIcon aria-hidden className="size-4" />
						ETG sales intelligence
					</div>
					<h2 className="font-heading font-semibold text-3xl tracking-tight text-balance">
						From market signal to API partner action.
					</h2>
					<p className="max-w-2xl text-muted-foreground text-sm">
						This control tower combines the current research, account summaries,
						and pre-call reports in SalesIntelligence.
					</p>
					<div className="flex flex-wrap items-center gap-3 text-13 text-muted-foreground">
						<span>Snapshot {snapshot.updatedAt}</span>
						<Badge variant="secondary">Approval required for outreach</Badge>
					</div>
				</div>
			</section>

			<StatGroup>
				<StatCard
					label="Travel targets"
					value={snapshot.sources.discoveryTargets}
					description="Researched platform records"
				/>
				<StatCard
					label="Managed accounts"
					value={snapshot.sources.managedAccounts}
					description="Across both active cohorts"
				/>
				<StatCard
					label="Action queue"
					value={14}
					description="Blocked or stale accounts"
				/>
				<StatCard
					label="Pre-call reports"
					value={snapshot.sources.preCallReports}
					description="Stored in private S3"
				/>
			</StatGroup>

			<DashboardSection
				title="Acquisition route"
				description="A shared view from discovery through manager handoff."
			>
				<div className="grid overflow-hidden rounded-md bg-card shadow-border @3xl/page-content:grid-cols-5">
					{snapshot.flow.map((step, index) => (
						<div
							key={step.label}
							className="flex min-h-40 flex-col justify-between gap-5 border-b p-5 last:border-b-0 @3xl/page-content:border-r @3xl/page-content:border-b-0 @3xl/page-content:last:border-r-0"
						>
							<div className="flex items-center justify-between gap-3">
								<span className="font-medium text-13">{step.label}</span>
								{index < snapshot.flow.length - 1 ? (
									<ArrowRightIcon aria-hidden className="size-4 text-brand" />
								) : null}
							</div>
							<strong className="font-heading text-4xl tabular-nums">
								{step.value}
							</strong>
							<span className="text-muted-foreground text-xs">
								{step.detail}
							</span>
						</div>
					))}
				</div>
			</DashboardSection>

			<DashboardGrid columns={3}>
				{snapshot.regions.map((region) => (
					<Card key={region.name}>
						<CardHeader>
							<CardTitle>{region.name}</CardTitle>
							<CardDescription>{region.signal}</CardDescription>
							<CardAction>
								<Badge variant="secondary">{region.accounts} accounts</Badge>
							</CardAction>
						</CardHeader>
						<CardContent>
							<span className="text-13 text-muted-foreground">
								Current regional account summary
							</span>
						</CardContent>
					</Card>
				))}
			</DashboardGrid>

			<DashboardSection
				title="Priority account queue"
				description="Accounts with a specific next action from the latest summaries."
				action={
					<Button asChild variant="outline" size="sm">
						<Link href={workspaceUrl("/companies")}>Open companies</Link>
					</Button>
				}
			>
				<div className="overflow-hidden rounded-md bg-card shadow-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Account</TableHead>
								<TableHead>Region</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Next action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{snapshot.priorityAccounts.map((account) => (
								<TableRow key={account.name}>
									<TableCell className="font-medium">{account.name}</TableCell>
									<TableCell className="text-muted-foreground">
										{account.region}
									</TableCell>
									<TableCell>
										<Badge variant={STATUS_VARIANT[account.status]}>
											{account.status}
										</Badge>
									</TableCell>
									<TableCell>{account.nextAction}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</DashboardSection>

			<DashboardGrid columns={3}>
				<SourceCard
					icon={DatabaseIcon}
					title="Research dataset"
					detail="199 travel platforms with market, type, evidence, and confidence."
				/>
				<SourceCard
					icon={FileTextIcon}
					title="Pre-call intelligence"
					detail="Marriott and Luxury Escapes reports remain private in S3."
				/>
				<SourceCard
					icon={ShieldCheckIcon}
					title="Outreach control"
					detail="The CRM prepares action queues. External messages still require approval."
				/>
			</DashboardGrid>

			<DashboardSection
				title="Discovery shortlist"
				description="The first researched API ecosystem targets."
			>
				<div className="overflow-hidden rounded-md bg-card shadow-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Company</TableHead>
								<TableHead>Platform type</TableHead>
								<TableHead>Market</TableHead>
								<TableHead>Confidence</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{snapshot.discoveryTargets.map((target) => (
								<TableRow key={target.name}>
									<TableCell className="font-medium">{target.name}</TableCell>
									<TableCell>{target.type}</TableCell>
									<TableCell className="text-muted-foreground">
										{target.market}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												target.confidence === "High" ? "default" : "secondary"
											}
										>
											{target.confidence}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</DashboardSection>
		</div>
	);
}

function SourceCard({
	icon: Icon,
	title,
	detail,
}: {
	icon: typeof DatabaseIcon;
	title: string;
	detail: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardAction>
					<Icon aria-hidden className="size-4 text-brand" />
				</CardAction>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground text-sm">{detail}</p>
			</CardContent>
		</Card>
	);
}
