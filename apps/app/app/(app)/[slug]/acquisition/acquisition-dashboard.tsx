"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Input } from "@crm/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import {
	ArrowRightIcon,
	BriefcaseBusinessIcon,
	Building2Icon,
	CheckCircle2Icon,
	ChevronRightIcon,
	CircleDotIcon,
	Clock3Icon,
	FileTextIcon,
	Globe2Icon,
	ListFilterIcon,
	LockKeyholeIcon,
	RadarIcon,
	SearchIcon,
	SparklesIcon,
	TriangleAlertIcon,
	UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	type IntelligenceAccount,
	PIPELINE_STAGES,
	type PipelineStage,
	SALES_INTELLIGENCE_SNAPSHOT as snapshot,
} from "./sales-intelligence-snapshot";

type View = "command" | "pipeline";
type Region = "all" | IntelligenceAccount["region"];
type SourceTotals = {
	discoveryTargets: number;
	managedAccounts: number;
	preCallReports: number;
};

const STAGE_LABELS: Record<PipelineStage, string> = {
	Discovered: "Evidence found",
	Qualified: "ETG fit verified",
	Engaged: "Commercial motion",
	Handoff: "Manager owned",
};

export function AcquisitionDashboard({
	companiesHref,
	initialAccounts = snapshot.accounts,
	sourceTotals = snapshot.sources,
}: {
	companiesHref?: string;
	initialAccounts?: readonly IntelligenceAccount[];
	sourceTotals?: SourceTotals;
}) {
	const [view, setView] = useState<View>("command");
	const [query, setQuery] = useState("");
	const [region, setRegion] = useState<Region>("all");
	const [selected, setSelected] = useState<IntelligenceAccount | null>(null);
	const [stages, setStages] = useState<Record<string, PipelineStage>>(() =>
		Object.fromEntries(
			initialAccounts.map((account) => [account.id, account.stage]),
		),
	);

	const accounts = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		return initialAccounts.filter(
			(account) =>
				(region === "all" || account.region === region) &&
				(!normalized ||
					account.name.toLowerCase().includes(normalized) ||
					account.signal.toLowerCase().includes(normalized) ||
					account.segment.toLowerCase().includes(normalized)),
		);
	}, [initialAccounts, query, region]);

	const advance = (account: IntelligenceAccount) => {
		const current = stages[account.id] ?? account.stage;
		const next = PIPELINE_STAGES[PIPELINE_STAGES.indexOf(current) + 1];
		if (next) setStages((value) => ({ ...value, [account.id]: next }));
	};

	return (
		<div className="flex flex-col gap-5">
			<CommandHero />

			<section className="grid gap-3 @3xl/page-content:grid-cols-[minmax(0,1fr)_auto]">
				<div className="relative">
					<SearchIcon
						aria-hidden
						className="absolute top-2.5 left-3 size-4 text-muted-foreground"
					/>
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search accounts, segments, or signals"
						className="pl-9"
						aria-label="Search acquisition accounts"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Select
						value={region}
						onValueChange={(value) => setRegion(value as Region)}
					>
						<SelectTrigger aria-label="Filter by region">
							<ListFilterIcon aria-hidden />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All regions</SelectItem>
							<SelectItem value="MEA · CIS">MEA · CIS</SelectItem>
							<SelectItem value="LATAM">LATAM</SelectItem>
							<SelectItem value="NORAM">NORAM</SelectItem>
							<SelectItem value="Global">Global</SelectItem>
						</SelectContent>
					</Select>
					<Tabs value={view} onValueChange={(value) => setView(value as View)}>
						<TabsList>
							<TabsTrigger value="command">Command</TabsTrigger>
							<TabsTrigger value="pipeline">Pipeline</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</section>

			{view === "command" ? (
				<CommandView
					accounts={accounts}
					stages={stages}
					onSelect={setSelected}
				/>
			) : (
				<PipelineView
					accounts={accounts}
					stages={stages}
					onSelect={setSelected}
				/>
			)}

			<SourceBar companiesHref={companiesHref} sourceTotals={sourceTotals} />
			<AccountSheet
				account={selected}
				stage={selected ? (stages[selected.id] ?? selected.stage) : undefined}
				onOpenChange={(open) => !open && setSelected(null)}
				onAdvance={advance}
			/>
		</div>
	);
}

function CommandHero() {
	return (
		<section className="relative isolate min-h-96 overflow-hidden rounded-xl bg-foreground text-background shadow-border">
			<div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:3rem_3rem]" />
			<div className="relative grid min-h-96 gap-8 p-6 @3xl/page-content:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] @3xl/page-content:p-8">
				<div className="flex max-w-3xl flex-col justify-between gap-10">
					<div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-background/70">
						<RadarIcon aria-hidden className="size-4 text-brand" />
						Live acquisition intelligence
					</div>
					<div className="flex flex-col gap-4">
						<h2 className="max-w-2xl font-heading font-semibold text-4xl leading-none tracking-tight text-balance @3xl/page-content:text-6xl">
							Turn travel demand into ETG distribution.
						</h2>
						<p className="max-w-xl text-background/65 text-sm leading-relaxed">
							Every account earns its place through evidence, API fit, and a
							clear commercial action.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-4 @xl/page-content:grid-cols-4">
						{snapshot.proof.map((item) => (
							<div
								key={item.label}
								className="border-background/15 border-l pl-3"
							>
								<strong className="block font-heading text-2xl tabular-nums">
									{item.value}
								</strong>
								<span className="text-background/55 text-xs">{item.label}</span>
							</div>
						))}
					</div>
				</div>

				<div className="relative hidden items-center justify-center @3xl/page-content:flex">
					<div className="relative flex aspect-square w-full max-w-80 items-center justify-center rounded-full border border-background/15">
						<div className="absolute inset-8 rounded-full border border-background/15" />
						<div className="absolute inset-16 rounded-full border border-brand/50" />
						<div className="flex size-24 flex-col items-center justify-center rounded-full bg-brand text-center text-white shadow-lg">
							<SparklesIcon aria-hidden className="mb-1 size-5" />
							<strong className="text-2xl tabular-nums">94</strong>
							<span className="text-[10px] uppercase tracking-wider">
								top fit
							</span>
						</div>
						<OrbitNode
							className="top-3 left-1/2 -translate-x-1/2"
							label="Evidence"
						/>
						<OrbitNode
							className="top-1/2 right-0 -translate-y-1/2"
							label="Engage"
						/>
						<OrbitNode className="bottom-5 left-8" label="Qualify" />
						<OrbitNode className="top-16 left-0" label="Handoff" />
					</div>
				</div>
			</div>
		</section>
	);
}

function OrbitNode({ className, label }: { className: string; label: string }) {
	return (
		<span
			className={`absolute rounded-full border border-background/20 bg-foreground px-3 py-1.5 text-background/70 text-xs ${className}`}
		>
			{label}
		</span>
	);
}

function CommandView({
	accounts,
	stages,
	onSelect,
}: {
	accounts: readonly IntelligenceAccount[];
	stages: Record<string, PipelineStage>;
	onSelect: (account: IntelligenceAccount) => void;
}) {
	const priority = [...accounts].sort((a, b) => b.score - a.score).slice(0, 5);
	const stale = accounts.filter((account) => account.age > 30);
	return (
		<div className="grid gap-5 @4xl/page-content:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
			<section className="overflow-hidden rounded-xl bg-card shadow-border">
				<div className="flex items-end justify-between gap-4 border-b p-5">
					<div>
						<span className="text-brand text-xs uppercase tracking-widest">
							Today’s best moves
						</span>
						<h3 className="mt-1 font-heading font-semibold text-xl">
							Priority accounts
						</h3>
					</div>
					<Badge variant="secondary">{accounts.length} in view</Badge>
				</div>
				<div className="divide-y">
					{priority.map((account, index) => (
						<button
							key={account.id}
							type="button"
							onClick={() => onSelect(account)}
							className="group grid w-full gap-4 p-5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:shadow-focus @xl/page-content:grid-cols-[2rem_minmax(0,1.2fr)_minmax(0,1fr)_auto] @xl/page-content:items-center"
						>
							<span className="font-mono text-muted-foreground text-xs">
								0{index + 1}
							</span>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<strong className="truncate font-heading text-base">
										{account.name}
									</strong>
									<Score value={account.score} />
								</div>
								<p className="mt-1 truncate text-muted-foreground text-13">
									{account.signal}
								</p>
							</div>
							<div>
								<p className="text-13">{account.nextAction}</p>
								<p className="mt-1 text-muted-foreground text-xs">
									{account.owner} · {account.region}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<StageBadge stage={stages[account.id] ?? account.stage} />
								<ChevronRightIcon
									aria-hidden
									className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
								/>
							</div>
						</button>
					))}
				</div>
			</section>

			<div className="flex flex-col gap-5">
				<section className="rounded-xl bg-card p-5 shadow-border">
					<div className="flex items-center justify-between">
						<div>
							<span className="text-status-warning-text text-xs uppercase tracking-widest">
								Attention
							</span>
							<h3 className="mt-1 font-heading font-semibold text-lg">
								Signal decay
							</h3>
						</div>
						<Clock3Icon aria-hidden className="size-5 text-status-warning" />
					</div>
					<div className="mt-5 flex items-end gap-3">
						<strong className="font-heading text-5xl tabular-nums">
							{stale.length}
						</strong>
						<span className="pb-1 text-muted-foreground text-sm">
							accounts losing momentum
						</span>
					</div>
					<div className="mt-5 space-y-3">
						{stale.map((account) => (
							<button
								key={account.id}
								type="button"
								onClick={() => onSelect(account)}
								className="flex w-full items-center justify-between gap-3 rounded-md bg-muted p-3 text-left outline-none focus-visible:shadow-focus"
							>
								<span>
									<strong className="block text-sm">{account.name}</strong>
									<span className="text-muted-foreground text-xs">
										{account.age} days without movement
									</span>
								</span>
								<ArrowRightIcon aria-hidden className="size-4" />
							</button>
						))}
					</div>
				</section>
				<section className="rounded-xl bg-brand p-5 text-white shadow-border">
					<LockKeyholeIcon aria-hidden className="size-5" />
					<h3 className="mt-8 font-heading font-semibold text-xl">
						Human-controlled outreach
					</h3>
					<p className="mt-2 text-sm text-white/75">
						Research prepares the message. A manager approves every external
						send.
					</p>
					<div className="mt-5 flex items-center justify-between border-white/20 border-t pt-4 text-xs">
						<span>6 drafts ready</span>
						<span>0 sent without approval</span>
					</div>
				</section>
			</div>
		</div>
	);
}

function PipelineView({
	accounts,
	stages,
	onSelect,
}: {
	accounts: readonly IntelligenceAccount[];
	stages: Record<string, PipelineStage>;
	onSelect: (account: IntelligenceAccount) => void;
}) {
	return (
		<section className="overflow-x-auto pb-2" aria-label="Acquisition pipeline">
			<div className="grid min-w-5xl grid-cols-4 gap-3">
				{PIPELINE_STAGES.map((stage) => {
					const items = accounts.filter(
						(account) => (stages[account.id] ?? account.stage) === stage,
					);
					return (
						<div
							key={stage}
							className="flex min-h-96 flex-col rounded-xl bg-muted/50 p-2 shadow-border"
						>
							<div className="flex items-center justify-between px-2 py-3">
								<div>
									<h3 className="font-heading font-semibold">{stage}</h3>
									<p className="text-muted-foreground text-xs">
										{STAGE_LABELS[stage]}
									</p>
								</div>
								<Badge variant="secondary">{items.length}</Badge>
							</div>
							<div className="flex flex-col gap-2">
								{items.map((account) => (
									<button
										key={account.id}
										type="button"
										onClick={() => onSelect(account)}
										className="rounded-lg bg-card p-4 text-left shadow-border outline-none transition-transform hover:-translate-y-0.5 focus-visible:shadow-focus"
									>
										<div className="flex items-start justify-between gap-3">
											<strong className="font-heading">{account.name}</strong>
											<Score value={account.score} />
										</div>
										<p className="mt-3 text-muted-foreground text-xs">
											{account.signal}
										</p>
										<div className="mt-4 flex items-center justify-between text-xs">
											<span>{account.region}</span>
											<span className="text-muted-foreground">
												{account.owner}
											</span>
										</div>
									</button>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function AccountSheet({
	account,
	stage,
	onOpenChange,
	onAdvance,
}: {
	account: IntelligenceAccount | null;
	stage?: PipelineStage;
	onOpenChange: (open: boolean) => void;
	onAdvance: (account: IntelligenceAccount) => void;
}) {
	const canAdvance = stage && stage !== "Handoff";
	return (
		<Sheet open={Boolean(account)} onOpenChange={onOpenChange}>
			<SheetContent size="lg">
				<SheetHeader>
					{account ? (
						<>
							<div className="mb-2 flex items-center gap-2">
								<Score value={account.score} />
								<StageBadge stage={stage ?? account.stage} />
							</div>
							<SheetTitle size="lg">{account.name}</SheetTitle>
							<SheetDescription>
								{account.segment} · {account.region} · owned by {account.owner}
							</SheetDescription>
						</>
					) : null}
				</SheetHeader>
				{account ? (
					<div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-2">
						<section className="rounded-lg bg-foreground p-5 text-background">
							<span className="text-background/55 text-xs uppercase tracking-widest">
								Recommended action
							</span>
							<p className="mt-3 font-heading font-semibold text-xl">
								{account.nextAction}
							</p>
							<p className="mt-3 text-background/60 text-sm">
								{account.signal}
							</p>
						</section>
						<DetailSection icon={SparklesIcon} title="Why ETG fits">
							{account.fit.map((item) => (
								<EvidenceLine key={item} text={item} />
							))}
						</DetailSection>
						<DetailSection icon={FileTextIcon} title="Evidence on record">
							{account.evidence.map((item) => (
								<EvidenceLine key={item} text={item} />
							))}
						</DetailSection>
						<DetailSection icon={TriangleAlertIcon} title="Commercial risk">
							<p className="rounded-md bg-status-warning/10 p-3 text-sm text-status-warning-text">
								{account.risk}
							</p>
						</DetailSection>
						<div className="grid grid-cols-2 gap-3">
							<Metric
								icon={UserRoundIcon}
								label="Owner"
								value={account.owner}
							/>
							<Metric
								icon={Clock3Icon}
								label="Signal age"
								value={`${account.age} days`}
							/>
							<Metric icon={Globe2Icon} label="Region" value={account.region} />
							<Metric
								icon={Building2Icon}
								label="Segment"
								value={account.segment}
							/>
						</div>
					</div>
				) : null}
				<SheetFooter>
					<div className="flex w-full items-center justify-between gap-3">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Close
						</Button>
						<Button
							disabled={!canAdvance || !account}
							onClick={() => account && onAdvance(account)}
						>
							{canAdvance ? "Advance stage" : "Manager owned"}
							<ArrowRightIcon aria-hidden />
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function DetailSection({
	icon: Icon,
	title,
	children,
}: {
	icon: typeof SparklesIcon;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section>
			<div className="mb-3 flex items-center gap-2">
				<Icon aria-hidden className="size-4 text-brand" />
				<h3 className="font-heading font-semibold">{title}</h3>
			</div>
			<div className="space-y-2">{children}</div>
		</section>
	);
}

function EvidenceLine({ text }: { text: string }) {
	return (
		<div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
			<CheckCircle2Icon aria-hidden className="size-4 text-brand" />
			<span>{text}</span>
		</div>
	);
}

function Metric({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof UserRoundIcon;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-md bg-muted p-3">
			<Icon aria-hidden className="size-4 text-muted-foreground" />
			<span className="mt-3 block text-muted-foreground text-xs">{label}</span>
			<strong className="mt-1 block text-sm">{value}</strong>
		</div>
	);
}

function Score({ value }: { value: number }) {
	return (
		<span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 font-mono font-semibold text-brand text-xs">
			<span className="sr-only">ETG fit score </span>
			<span>{value}</span>
		</span>
	);
}

function StageBadge({ stage }: { stage: PipelineStage }) {
	const icon =
		stage === "Handoff"
			? BriefcaseBusinessIcon
			: stage === "Engaged"
				? CircleDotIcon
				: stage === "Qualified"
					? CheckCircle2Icon
					: RadarIcon;
	const Icon = icon;
	return (
		<Badge variant={stage === "Handoff" ? "default" : "secondary"}>
			<Icon aria-hidden />
			{stage}
		</Badge>
	);
}

function SourceBar({
	companiesHref,
	sourceTotals,
}: {
	companiesHref?: string;
	sourceTotals: SourceTotals;
}) {
	return (
		<section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-border @2xl/page-content:flex-row @2xl/page-content:items-center @2xl/page-content:justify-between">
			<div className="flex items-start gap-3">
				<div className="rounded-md bg-brand/10 p-2 text-brand">
					<FileTextIcon aria-hidden className="size-5" />
				</div>
				<div>
					<h3 className="font-heading font-semibold">Intelligence coverage</h3>
					<p className="mt-1 text-muted-foreground text-sm">
						{sourceTotals.discoveryTargets} travel targets ·{" "}
						{sourceTotals.managedAccounts} managed accounts ·{" "}
						{sourceTotals.preCallReports} pre-call reports
					</p>
					<p className="mt-1 text-muted-foreground text-xs">
						Updated {snapshot.updatedAt} from SalesIntelligence research and
						account summaries.
					</p>
				</div>
			</div>
			{companiesHref ? (
				<Button asChild variant="outline">
					<Link href={companiesHref}>
						Open all companies
						<ChevronRightIcon aria-hidden />
					</Link>
				</Button>
			) : null}
		</section>
	);
}
