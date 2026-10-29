"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	DashboardGrid,
	DashboardPanel,
	DashboardSection,
	StatGroup,
} from "@crm/ui/components/dashboard";
import { PageShellLoading } from "@crm/ui/components/page-shell";
import { StatCard } from "@crm/ui/components/stat-card";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type Summary = RouterOutputs["dashboard"]["summary"];
type Stage = Summary["pipeline"]["stages"][number]["stage"];

const FLOW: {
	stage: Stage;
	label: string;
	description: string;
	transfer: string;
}[] = [
	{
		stage: "DEMO_BOOKED",
		label: "Engaged",
		description: "A verified contact accepts a commercial conversation.",
		transfer: "Confirm partner model",
	},
	{
		stage: "QUALIFIED_TO_BUY",
		label: "Qualified",
		description: "The account has API demand and a supported ETG fit.",
		transfer: "Assign sales manager",
	},
	{
		stage: "DECISION_MAKER_BOUGHT_IN",
		label: "Manager handoff",
		description: "A sales manager owns the relationship and next action.",
		transfer: "Shape commercial path",
	},
	{
		stage: "CONTRACT_SENT",
		label: "Commercial review",
		description: "Terms, integration, and launch requirements are in review.",
		transfer: "Close and activate",
	},
	{
		stage: "CLOSED_WON",
		label: "Partner won",
		description: "The opportunity converts to an ETG API partnership.",
		transfer: "Start optimization",
	},
];

function stageCount(summary: Summary, stage: Stage) {
	return (
		summary.pipeline.stages.find((item) => item.stage === stage)?.count ?? 0
	);
}

function percent(value: number, base: number) {
	if (base === 0) return "0%";
	return `${Math.round((value / base) * 100)}%`;
}

export function AcquisitionDashboard() {
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const summaryQuery = useQuery({
		...trpc.dashboard.summary.queryOptions({ scope: "everyone" }),
		placeholderData: (previous) => previous,
	});

	const summary = summaryQuery.data;
	if (!summary) return <PageShellLoading shape="dashboard" />;

	const engaged = stageCount(summary, "DEMO_BOOKED");
	const qualified = stageCount(summary, "QUALIFIED_TO_BUY");
	const handoffs = stageCount(summary, "DECISION_MAKER_BOUGHT_IN");
	const won = summary.wonThisMonth.count;
	const outreach = summary.recentActivity.filter(
		(activity) => activity.type === "EMAIL" || activity.type === "CALL",
	).length;

	return (
		<div className="flex flex-col gap-6">
			<StatGroup>
				<StatCard
					label="Active acquisition"
					value={summary.pipeline.totalDeals}
					description="Open API partner opportunities"
				/>
				<StatCard
					label="Outreach activity"
					value={outreach}
					description="Recent calls and email touches"
				/>
				<StatCard
					label="Qualified for handoff"
					value={qualified}
					delta={{ value: percent(qualified, engaged), label: "of engaged" }}
				/>
				<StatCard
					label="Won this month"
					value={won}
					description={`${percent(won, qualified)} of qualified opportunities`}
				/>
			</StatGroup>

			<DashboardSection
				title="Conversion board"
				description="Every account moves through an evidence-backed transfer."
				action={
					<Button asChild variant="outline" size="sm">
						<Link href={workspaceUrl("/deals")}>Open all opportunities</Link>
					</Button>
				}
			>
				<div className="grid grid-cols-1 overflow-hidden rounded-md bg-card shadow-border @4xl/page-content:grid-cols-5">
					{FLOW.map((item, index) => {
						const count = stageCount(summary, item.stage);
						return (
							<Link
								key={item.stage}
								href={`${workspaceUrl("/deals")}?stage=${item.stage}`}
								className="group flex min-h-48 flex-col justify-between gap-6 border-b p-5 outline-none last:border-b-0 focus-visible:shadow-focus @4xl/page-content:border-r @4xl/page-content:border-b-0 @4xl/page-content:last:border-r-0"
							>
								<span className="flex items-center justify-between gap-3">
									<Badge variant={index === 2 ? "default" : "secondary"}>
										{item.label}
									</Badge>
									{index < FLOW.length - 1 ? (
										<ArrowRightIcon
											aria-hidden
											className="text-muted-foreground"
										/>
									) : null}
								</span>
								<span className="flex flex-col gap-2">
									<strong className="font-semibold text-3xl tabular-nums">
										{count}
									</strong>
									<span className="text-muted-foreground text-sm">
										{item.description}
									</span>
								</span>
								<span className="font-medium text-xs group-hover:underline">
									Next: {item.transfer}
								</span>
							</Link>
						);
					})}
				</div>
			</DashboardSection>

			<DashboardGrid columns={3}>
				<OperatingCard
					title="Discovery agent"
					description="Finds travel companies, gathers evidence, and schedules rechecks."
					status="Evidence only"
					action={<Link href={workspaceUrl("/chat")}>Open agent</Link>}
				/>
				<OperatingCard
					title="Outreach control"
					description="Drafts relevant messages and keeps external sends behind approval."
					status={`${outreach} recent touches`}
					action={<Link href={workspaceUrl("/tasks")}>Review work</Link>}
				/>
				<OperatingCard
					title="Manager handoff"
					description="Packages fit, sources, risks, contacts, and the next action."
					status={`${handoffs} active handoffs`}
					action={
						<Link
							href={`${workspaceUrl("/deals")}?stage=DECISION_MAKER_BOUGHT_IN`}
						>
							Open handoffs
						</Link>
					}
				/>
			</DashboardGrid>
		</div>
	);
}

function OperatingCard({
	title,
	description,
	status,
	action,
}: {
	title: string;
	description: string;
	status: string;
	action: ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
				<CardAction>
					<Badge variant="secondary">{status}</Badge>
				</CardAction>
			</CardHeader>
			<DashboardPanel>
				<div className="p-5">
					<Button asChild variant="outline" size="sm">
						{action}
					</Button>
				</div>
			</DashboardPanel>
		</Card>
	);
}
