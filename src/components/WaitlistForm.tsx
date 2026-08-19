"use client";

import { useId, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const inputId = useId();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setMessage("That doesn't look like a real email — double-check it.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: trimmed.toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        setStatus("success");
        setMessage("You're already on the list. We'll be in touch.");
        return;
      }
      setStatus("error");
      setMessage("Something went wrong on our end. Try again in a moment.");
      return;
    }

    setStatus("success");
    setMessage("You're in. We'll email you before the doors open.");
    setEmail("");
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-sm border border-amber-500/40 bg-amber-500/[0.06] px-5 py-4"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-noir-950 text-xs font-bold">
          ✓
        </span>
        <p className="text-sm text-noir-100">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div
        className={`flex flex-col gap-3 ${compact ? "sm:flex-row" : "sm:flex-row"}`}
      >
        <div className="flex-1">
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? `${inputId}-error` : undefined}
            className="w-full rounded-sm border border-noir-700 bg-noir-900/60 px-4 py-3.5 text-[15px] text-noir-050 placeholder:text-noir-400 outline-none transition-colors duration-200 focus:border-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="group relative shrink-0 overflow-hidden rounded-sm bg-amber-500 px-7 py-3.5 text-[15px] font-semibold text-noir-950 transition-colors duration-200 hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading" ? "Joining…" : "Join the Waitlist"}
        </button>
      </div>
      {status === "error" && message && (
        <p id={`${inputId}-error`} className="mt-2.5 text-sm text-amber-400">
          {message}
        </p>
      )}
    </form>
  );
}
