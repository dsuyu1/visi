"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PracticeQuestion } from "@/lib/academy/types";

function completedKey(certId: string) {
  return `visi.academy.completed.v2:${certId}`;
}

function unitKey(moduleId: string, unitId: string) {
  return `${moduleId}::${unitId}`;
}

type Status = "unanswered" | "correct" | "incorrect";

export function StudyToolsClient(props: {
  certId: string;
  moduleId: string;
  unitId: string;
  quizQuestions: PracticeQuestion[];
}) {
  const { certId, moduleId, unitId, quizQuestions } = props;

  const completedRef = useRef<HTMLInputElement | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(completedKey(certId));
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      const key = unitKey(moduleId, unitId);
      if (completedRef.current) completedRef.current.checked = !!parsed[key];
    } catch {}
  }, [certId, moduleId, unitId]);

  const toggleCompleted = (next: boolean) => {
    try {
      const raw = localStorage.getItem(completedKey(certId));
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      parsed[unitKey(moduleId, unitId)] = next;
      localStorage.setItem(completedKey(certId), JSON.stringify(parsed));
    } catch {}
    try {
      window.dispatchEvent(new Event("visi-academy-progress"));
    } catch {}
  };

  const score = useMemo(() => {
    if (!checked) return null;
    let correct = 0;
    for (let i = 0; i < quizQuestions.length; i += 1) {
      const q = quizQuestions[i]!;
      if (answers[i] === q.answerIndex) correct += 1;
    }
    return { correct, total: quizQuestions.length };
  }, [answers, checked, quizQuestions]);

  const statusFor = (idx: number): Status => {
    if (!checked) return "unanswered";
    const q = quizQuestions[idx]!;
    return answers[idx] === q.answerIndex ? "correct" : "incorrect";
  };

  return (
    <section className="border border-border bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">Quiz</p>
          <p className="mt-1 text-sm text-muted leading-relaxed" style={{ fontWeight: 300 }}>
            A few quick questions based on this unit. Mark it complete when you’re done.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-muted-light select-none">
          <input
            type="checkbox"
            ref={completedRef}
            defaultChecked={false}
            onChange={(e) => toggleCompleted(e.target.checked)}
            className="h-4 w-4 accent-[var(--foreground)]"
          />
          Completed
        </label>
      </div>

      {quizQuestions.length ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-3">
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

          <div className="mt-6 space-y-8">
            {quizQuestions.map((q, idx) => {
              const status = statusFor(idx);
              const chosen = answers[idx];
              const name = `${moduleId}-unit-${unitId}-quiz-${idx}`;

              return (
                <div key={idx} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                  <p className="text-sm font-semibold tracking-tight">
                    {idx + 1}. {q.prompt}
                  </p>

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
                      <p className="mt-2 text-xs text-muted-light leading-relaxed">{q.explanation}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted leading-relaxed" style={{ fontWeight: 300 }}>
          Quiz questions are coming soon.
        </p>
      )}
    </section>
  );
}
