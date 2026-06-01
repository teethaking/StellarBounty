"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signMessage } from "@stellar/freighter-api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import { useWallet } from "@/components/WalletContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_STORAGE_KEY = "stellar-bounty.auth-token";

const createBountySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  reward: z
    .string()
    .trim()
    .min(1, "Reward amount is required.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Reward must be a positive number."),
  deadline: z.string().min(1, "Deadline is required."),
});

type CreateBountyFormValues = z.infer<typeof createBountySchema>;

type AuthTokenResponse = {
  accessToken: string;
};

type CreateBountyResponse = {
  id: string;
};

function formatErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create bounty.";
}

async function getAccessToken(publicKey: string): Promise<string> {
  const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);

  if (savedToken) {
    return savedToken;
  }

  const challengeResponse = await fetch(`${API_URL}/auth/challenge?address=${encodeURIComponent(publicKey)}`);
  if (!challengeResponse.ok) {
    throw new Error("Failed to request wallet challenge.");
  }

  const { nonce } = (await challengeResponse.json()) as { nonce?: string };
  if (!nonce) {
    throw new Error("Challenge response was missing a nonce.");
  }

  const signed = await signMessage(nonce, { address: publicKey });
  if (signed.error || !signed.signedMessage) {
    throw new Error(signed.error?.message || "Wallet signature was cancelled.");
  }

  const verifyResponse = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: publicKey,
      signature: signed.signedMessage,
      nonce,
    }),
  });

  if (!verifyResponse.ok) {
    throw new Error("Wallet verification failed.");
  }

  const { accessToken } = (await verifyResponse.json()) as AuthTokenResponse;
  if (!accessToken) {
    throw new Error("Verification did not return an access token.");
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  return accessToken;
}

export default function CreateBountyPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateBountyFormValues>({
    resolver: zodResolver(createBountySchema),
    defaultValues: {
      title: "",
      description: "",
      reward: "",
      deadline: "",
    },
  });

  const description = watch("description");

  useEffect(() => {
    if (!publicKey) {
      router.replace("/");
    }
  }, [publicKey, router]);

  const fieldErrorClass = useMemo(
    () => "mt-1 text-sm text-red-300",
    [],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!publicKey) {
      router.replace("/");
      return;
    }

    setSubmitError(null);

    try {
      const accessToken = await getAccessToken(publicKey);
      const response = await fetch(`${API_URL}/bounties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          rewardAmount: values.reward.trim(),
          ownerAddress: publicKey,
          deadline: new Date(values.deadline).toISOString(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
        const message = Array.isArray(payload?.message) ? payload?.message.join(" ") : payload?.message;

        if (message?.toLowerCase().includes("title")) {
          setError("title", { message });
          return;
        }
        if (message?.toLowerCase().includes("description")) {
          setError("description", { message });
          return;
        }
        if (message?.toLowerCase().includes("reward")) {
          setError("reward", { message });
          return;
        }
        if (message?.toLowerCase().includes("deadline")) {
          setError("deadline", { message });
          return;
        }

        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }

        throw new Error(message || "Unable to create bounty.");
      }

      const created = (await response.json()) as CreateBountyResponse;
      router.push(`/bounties/${created.id}`);
    } catch (error) {
      setSubmitError(formatErrorMessage(error));
    }
  });

  if (!publicKey) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Create a New Bounty</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Build a bounty listing page"
            />
            {errors.title ? <p className={fieldErrorClass}>{errors.title.message}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reward" className="mb-1 block text-sm font-medium text-slate-300">
                Reward (XLM)
              </label>
              <input
                id="reward"
                type="text"
                inputMode="decimal"
                {...register("reward")}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. 500"
              />
              {errors.reward ? <p className={fieldErrorClass}>{errors.reward.message}</p> : null}
            </div>
            <div>
              <label htmlFor="deadline" className="mb-1 block text-sm font-medium text-slate-300">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                {...register("deadline")}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
              {errors.deadline ? <p className={fieldErrorClass}>{errors.deadline.message}</p> : null}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Description (supports Markdown)
            </label>

            <div className="mb-0 flex border-b border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "write"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "border-b-2 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "preview"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "border-b-2 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Preview
              </button>
            </div>

            {activeTab === "write" ? (
              <textarea
                rows={12}
                {...register("description")}
                className="w-full resize-y rounded-b-lg border border-t-0 border-slate-700 bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                placeholder="Write your bounty requirements in markdown..."
              />
            ) : (
              <div className="min-h-[200px] rounded-b-lg border border-t-0 border-slate-700 bg-slate-900 p-4">
                {description ? (
                  <MarkdownRenderer content={description} />
                ) : (
                  <p className="text-sm italic text-slate-500">Nothing to preview yet...</p>
                )}
              </div>
            )}
            {errors.description ? <p className={fieldErrorClass}>{errors.description.message}</p> : null}
          </div>

          {submitError ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {submitError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Bounty"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
