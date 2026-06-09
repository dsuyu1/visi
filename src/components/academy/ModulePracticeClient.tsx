"use client";

import { useMemo, useState } from "react";

import type { PracticeQuestion } from "@/lib/academy/types";

type Status = "unanswered" | "correct" | "incorrect";

export function ModulePracticeClient({
  moduleId,
  questions,
  title = "Practice questions",
}: {
  moduleId: string;
  questions: PracticeQuestion[];
  title?: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const score = useMemo(() => {
    if (!checked) return null;
    let correct = 0;
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i]!;
      if (answers[i] === q.answerIndex) correct += 1;
    }
    return { correct, total: questions.length };
  }, [answers, checked, questions]);

  const statusFor = (idx: number): Status => {
    if (!checked) return "unanswered";
    const q = questions[idx]!;
    return answers[idx] === q.answerIndex ? "correct" : "incorrect";
  };

  if (!questions.length) {
    return (
      <section className="border border-border bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
        <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">{title}</p>
        <p className="mt-3 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
          Practice questions are coming soon.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-border bg-panel p-8" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">{title}</p>
          <p className="mt-2 text-sm leading-[1.9] text-muted" style={{ fontWeight: 300 }}>
            Generated directly from the notes for this module.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {score ? (
            <p className="text-xs text-muted-light">
              Score: <span className="font-semibold text-foreground">{score.correct}/{score.total}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="btn-slide btn-primary inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium tracking-wide font-sans"
          >
            Check answers
          </button>
          <button
            type="button"
            onClick={() => {
              setChecked(false);
              setAnswers({});
            }}
            className="btn-slide inline-flex items-center justify-center border border-border bg-background px-5 py-2.5 text-xs font-medium tracking-wide font-sans"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {questions.map((q, idx) => {
          const status = statusFor(idx);
          const chosen = answers[idx];
          const name = `${moduleId}-practice-${idx}`;

          return (
            <div key={idx} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
              <p className="text-sm font-semibold tracking-tight">{idx + 1}. {q.prompt}</p>

              <div className="mt-4 grid gap-2">
                {q.choices.map((choice, choiceIdx) => (
                  <label
                    key={choiceIdx}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm leading-relaxed hover:border-foreground"
                  >
                    <input
                      type="radio"
                      name={name}
                      checked={chosen === choiceIdx}
                      onChange={() => setAnswers((prev) => ({ ...prev, [idx]: choiceIdx }))}
                      className="mt-1 h-4 w-4 accent-[var(--foreground)]"
                    />
                    <span className="text-foreground">{choice}</span>
                  </label>
                ))}
              </div>

              {checked ? (
                <div className="mt-4">
                  <p
                    className={
                      status === "correct"
                        ? "text-xs font-medium text-foreground"
                        : "text-xs font-medium text-muted-light"
                    }
                  >
                    {status === "correct" ? "Correct" : "Not quite"}
                  </p>
                  <p className="mt-2 text-xs text-muted-light leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
