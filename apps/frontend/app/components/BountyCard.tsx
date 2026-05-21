import Link from "next/link";

export type BountyCardData = {
  id: string | number;
  title: string;
  reward?: string | number | null;
  deadline?: string | null;
  status?: string | null;
};

type BountyCardProps = {
  bounty: BountyCardData;
};

function formatReward(reward: BountyCardData["reward"]) {
  if (reward === null || reward === undefined || reward === "") {
    return "Reward TBD";
  }

  return typeof reward === "number" ? `${reward.toLocaleString()} XLM` : reward;
}

function formatDeadline(deadline: BountyCardData["deadline"]) {
  if (!deadline) {
    return "No deadline";
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return deadline;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function BountyCard({ bounty }: BountyCardProps) {
  const status = bounty.status ?? "open";

  return (
    <Link
      href={`/bounties/${bounty.id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 text-lg font-semibold text-slate-100 group-hover:text-yellow-100">
          {bounty.title}
        </h2>
        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium capitalize text-emerald-300">
          {status}
        </span>
      </div>

      <div className="mt-6 flex flex-1 items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reward</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{formatReward(bounty.reward)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
          <p className="mt-1 text-sm text-slate-300">{formatDeadline(bounty.deadline)}</p>
        </div>
      </div>
    </Link>
  );
}
