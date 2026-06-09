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
  const hasQuiz = quizQuestions.length > 0;

  const completedRef = useRef<HTMLInputElement | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

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
    if (!hasQuiz) return null;
    if (!checked) return null;
    let correct = 0;
    for (let i = 0; i < quizQuestions.length; i += 1) {
      const q = quizQuestions[i]!;
      if (answers[i] === q.answerIndex) correct += 1;
    }
    return { correct, total: quizQuestions.length };
  }, [answers, checked, hasQuiz, quizQuestions]);

  const statusFor = (idx: number): Status => {
    if (!checked) return "unanswered";
    if (typeof answers[idx] !== "number") return "unanswered";
    const q = quizQuestions[idx];
    if (!q) return "unanswered";
    return answers[idx] === q.answerIndex ? "correct" : "incorrect";
  };

  const totalQuestions = quizQuestions.length;
  const currentQuestionIndex = totalQuestions
    ? Math.max(0, Math.min(activeIdx, totalQuestions - 1))
    : 0;
  const currentQuestion = totalQuestions ? quizQuestions[currentQuestionIndex] : null;
  const currentAnswer = answers[currentQuestionIndex];
  const currentStatus = totalQuestions ? statusFor(currentQuestionIndex) : "unanswered";
  const canGoPrev = currentQuestionIndex > 0;
  const canGoNext =
    currentQuestionIndex < totalQuestions - 1 && typeof currentAnswer === "number";

  return (
    <section className="border border-border bg-panel p-6" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-light uppercase font-sans">
            {hasQuiz ? "Quiz" : "Study tools"}
          </p>
          <p className="mt-1 text-sm text-muted leading-relaxed" style={{ fontWeight: 300 }}>
            {hasQuiz
              ? "A few quick questions based on this unit. Mark it complete when you are done."
              : "Mark this unit complete when you finish it."}
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

      {hasQuiz ? (
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
              className="btn-slide btn-primary inline-flex items-center justify-center border border-border px-5 py-2.5 text-xs font-medium tracking-wide font-sans"
            >
              Check answers
            </button>
            <button
              type="button"
              onClick={() => {
                setChecked(false);
                setAnswers({});
                setActiveIdx(0);
              }}
              className="btn-slide inline-flex items-center justify-center border border-border bg-background px-5 py-2.5 text-xs font-medium tracking-wide font-sans"
            >
              Reset
            </button>
          </div>

          {currentQuestion ? (
            <div className="mt-6">
              <p className="text-xs text-muted-light">
                Question{" "}
                <span className="font-semibold text-foreground">{currentQuestionIndex + 1}</span>{" "}
                / {totalQuestions}
              </p>

              <div className="mt-4 border-t border-border pt-6">
                <p className="text-sm font-semibold tracking-tight">{currentQuestion.prompt}</p>

                <div className="mt-4 grid gap-2">
                  {currentQuestion.choices.map((choice, choiceIdx) => {
                    const name = `${moduleId}-unit-${unitId}-quiz-${currentQuestionIndex}`;

                    return (
                      <label
                        key={choiceIdx}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm leading-relaxed hover:border-foreground"
                      >
                        <input
                          type="radio"
                          name={name}
                          checked={currentAnswer === choiceIdx}
                          onChange={() => setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: choiceIdx }))}
                          className="mt-1 h-4 w-4 accent-[var(--foreground)]"
                        />
                        <span className="text-foreground">{choice}</span>
                      </label>
                    );
                  })}
                </div>

                {checked && currentStatus !== "unanswered" ? (
                  <div className="mt-4">
                    <p
                      className={
                        currentStatus === "correct"
                          ? "text-xs font-medium text-foreground"
                          : "text-xs font-medium text-muted-light"
                      }
                    >
                      {currentStatus === "correct" ? "Correct" : "Not quite"}
                    </p>
                    <p className="mt-2 text-xs text-muted-light leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
                  disabled={!canGoPrev}
                  aria-label="Previous question"
                  className="btn-slide inline-flex items-center justify-center border border-border bg-background px-4 py-2 text-xs font-medium tracking-wide font-sans disabled:opacity-40"
                >
                  <span aria-hidden>←</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={!canGoNext}
                  aria-label="Next question"
                  className="btn-slide btn-primary inline-flex items-center justify-center px-4 py-2 text-xs font-medium tracking-wide font-sans disabled:opacity-40"
                >
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
