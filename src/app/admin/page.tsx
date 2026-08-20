"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type WaitlistRow = {
  id: string;
  email: string;
  created_at: string;
};

/**
 * Waitlist admin.
 *
 * The password is never checked in the browser and never lives in this repo.
 * It is submitted to a SECURITY DEFINER Postgres function, which compares it
 * against a bcrypt hash and only then reads the table. The anon key on its own
 * has no read access to either the waitlist or the credential row, so the
 * password is the whole gate.
 *
 * It is held in component state for the session only. A refresh asks again,
 * which is deliberate: nothing lands in localStorage for a stray script to find.
 */
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<WaitlistRow[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load(pw: string) {
    setStatus("loading");
    setMessage(null);

    const { data, error } = await supabase.rpc("admin_list_waitlist", {
      pw,
    });

    if (error) {
      setStatus("error");
      setRows(null);
      setMessage(
        error.message === "unauthorized"
          ? "That password is not right."
          : "Could not reach the waitlist. Try again in a moment."
      );
      return;
    }

    setStatus("idle");
    setRows((data as WaitlistRow[]) ?? []);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) return;
    void load(password);
  }

  function signOut() {
    setPassword("");
    setRows(null);
    setStatus("idle");
    setMessage(null);
  }

  async function copyEmails() {
    if (!rows) return;
    await navigator.clipboard.writeText(rows.map((r) => r.email).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCsv() {
    if (!rows) return;
    const csv = [
      "email,signed_up_at",
      ...rows.map((r) => `${r.email},${r.created_at}`),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockio-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Password gate
  if (!rows) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-noir-950 px-6">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-3 text-amber-500">Stockio</p>
          <h1 className="font-display text-4xl font-extrabold uppercase text-noir-050">
            Waitlist admin
          </h1>
          <p className="mt-3 text-base leading-relaxed text-noir-300">
            Enter the admin password to view signups.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label htmlFor="admin-password" className="sr-only">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              aria-invalid={status === "error"}
              placeholder="Password"
              className="w-full rounded-sm border border-noir-700 bg-noir-900/60 px-4 py-3.5 text-base text-noir-050 placeholder:text-noir-400 outline-none transition-colors duration-200 focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={status === "loading" || !password}
              className="mt-3 w-full rounded-sm bg-amber-500 px-7 py-3.5 text-base font-semibold text-noir-950 transition-colors duration-200 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Checking..." : "Unlock"}
            </button>
            {message && (
              <p role="alert" className="mt-3 text-sm text-amber-400">
                {message}
              </p>
            )}
          </form>
        </div>
      </main>
    );
  }

  // Authenticated view
  return (
    <main className="min-h-screen bg-noir-950">
      <header className="border-b border-noir-800">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <p className="eyebrow text-amber-500">Stockio</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold uppercase text-noir-050">
              Waitlist
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void load(password)}
              className="rounded-sm border border-noir-700 px-4 py-2.5 text-sm font-medium text-noir-100 transition-colors duration-200 hover:border-amber-500/60 hover:text-amber-400"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void copyEmails()}
              disabled={rows.length === 0}
              className="rounded-sm border border-noir-700 px-4 py-2.5 text-sm font-medium text-noir-100 transition-colors duration-200 hover:border-amber-500/60 hover:text-amber-400 disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy emails"}
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={rows.length === 0}
              className="rounded-sm border border-noir-700 px-4 py-2.5 text-sm font-medium text-noir-100 transition-colors duration-200 hover:border-amber-500/60 hover:text-amber-400 disabled:opacity-40"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={signOut}
              className="rounded-sm px-4 py-2.5 text-sm font-medium text-noir-400 transition-colors duration-200 hover:text-noir-100"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex items-baseline gap-3">
          <span className="font-display text-6xl font-extrabold leading-none text-amber-500">
            {rows.length}
          </span>
          <span className="eyebrow text-noir-300">
            {rows.length === 1 ? "signup" : "signups"}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-sm border border-noir-800 px-6 py-16 text-center">
            <p className="text-base text-noir-200">No signups yet.</p>
            <p className="mt-2 text-sm text-noir-400">
              Emails land here the moment someone joins from the landing page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-noir-800">
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-noir-800 bg-noir-900/60">
                  <th className="eyebrow px-5 py-3.5 text-noir-300">#</th>
                  <th className="eyebrow px-5 py-3.5 text-noir-300">Email</th>
                  <th className="eyebrow px-5 py-3.5 text-noir-300">
                    Signed up
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-noir-800/70 last:border-0"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-noir-400">
                      {rows.length - i}
                    </td>
                    <td className="px-5 py-3.5 text-base text-noir-050">
                      {row.email}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-noir-300">
                      {new Date(row.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {message && (
          <p role="alert" className="mt-4 text-sm text-amber-400">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
