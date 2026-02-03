"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  CircleDot,
  Square,
  MessageSquare,
} from "lucide-react"
import type { QuizData, QuizQuestion, QuizQuestionType } from "@/types"

// ─── Types ───────────────────────────────────────────────

type Answers = Record<string, string | string[]>

interface QuestionResult {
  isCorrect: boolean
  earnedPoints: number
  maxPoints: number
}

interface QuizResults {
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  questions: Record<string, QuestionResult>
}

// ─── Helpers ─────────────────────────────────────────────

function parseQuizContent(content: string | null): QuizData | null {
  if (!content?.trim()) return null
  try {
    const parsed = JSON.parse(content)
    if (parsed.version === 1 && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed as QuizData
    }
  } catch {
    // Invalid JSON
  }
  return null
}

function gradeQuiz(quiz: QuizData, answers: Answers): QuizResults {
  let score = 0
  let maxScore = 0
  const questions: Record<string, QuestionResult> = {}

  for (const question of quiz.questions) {
    maxScore += question.points
    const answer = answers[question.id]
    let isCorrect = false

    if (question.type === "multiple_choice") {
      const correctOption = question.options.find((o) => o.isCorrect)
      isCorrect = !!correctOption && answer === correctOption.id
    } else if (question.type === "multiple_select") {
      const correctIds = new Set(question.options.filter((o) => o.isCorrect).map((o) => o.id))
      const selectedIds = new Set(Array.isArray(answer) ? answer : [])
      isCorrect =
        correctIds.size === selectedIds.size &&
        [...correctIds].every((id) => selectedIds.has(id))
    } else if (question.type === "open_ended") {
      // Open-ended questions are always counted as answered (no auto-grading)
      isCorrect = typeof answer === "string" && answer.trim().length > 0
    }

    const earnedPoints = isCorrect ? question.points : 0
    score += earnedPoints
    questions[question.id] = { isCorrect, earnedPoints, maxPoints: question.points }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const passed = quiz.passingScore != null ? percentage >= quiz.passingScore : true

  return { score, maxScore, percentage, passed, questions }
}

// ─── Question type icons ─────────────────────────────────

const typeIcons: Record<QuizQuestionType, typeof CircleDot> = {
  multiple_choice: CircleDot,
  multiple_select: Square,
  open_ended: MessageSquare,
}

const typeLabels: Record<QuizQuestionType, string> = {
  multiple_choice: "Single answer",
  multiple_select: "Select all that apply",
  open_ended: "Written response",
}

// ─── QuestionView ────────────────────────────────────────

interface QuestionViewProps {
  question: QuizQuestion
  index: number
  answer: string | string[] | undefined
  result?: QuestionResult
  submitted: boolean
  onAnswer: (questionId: string, value: string | string[]) => void
}

function QuestionView({
  question,
  index,
  answer,
  result,
  submitted,
  onAnswer,
}: QuestionViewProps) {
  const Icon = typeIcons[question.type]

  const handleMultipleChoiceSelect = (optionId: string) => {
    if (submitted) return
    onAnswer(question.id, optionId)
  }

  const handleMultipleSelectToggle = (optionId: string) => {
    if (submitted) return
    const current = Array.isArray(answer) ? answer : []
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]
    onAnswer(question.id, next)
  }

  const handleTextChange = (text: string) => {
    if (submitted) return
    onAnswer(question.id, text)
  }

  return (
    <Card className={cn(
      submitted && result && (result.isCorrect ? "border-green-200" : "border-red-200")
    )}>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Badge variant="secondary" className="shrink-0 text-xs font-mono mt-0.5">
            {index + 1}
          </Badge>
          <div className="flex-1 space-y-1">
            <p className="font-medium">{question.text}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              <span>{typeLabels[question.type]}</span>
              <span className="mx-1">&middot;</span>
              <span>{question.points} {question.points === 1 ? "point" : "points"}</span>
            </div>
          </div>
          {submitted && result && (
            result.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            )
          )}
        </div>

        {/* Options (MC / MS) */}
        {question.type !== "open_ended" && (
          <div className="space-y-2 pl-1">
            {question.options.map((option) => {
              const isSelected = question.type === "multiple_choice"
                ? answer === option.id
                : Array.isArray(answer) && answer.includes(option.id)

              const showCorrect = submitted && option.isCorrect
              const showWrong = submitted && isSelected && !option.isCorrect

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    question.type === "multiple_choice"
                      ? handleMultipleChoiceSelect(option.id)
                      : handleMultipleSelectToggle(option.id)
                  }
                  disabled={submitted}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors",
                    !submitted && isSelected && "border-primary bg-primary/5",
                    !submitted && !isSelected && "hover:bg-muted/50",
                    showCorrect && "border-green-300 bg-green-50 dark:bg-green-950/20",
                    showWrong && "border-red-300 bg-red-50 dark:bg-red-950/20",
                    submitted && "cursor-default"
                  )}
                >
                  {/* Selection indicator */}
                  <div
                    className={cn(
                      "h-4 w-4 shrink-0 border-2 flex items-center justify-center",
                      question.type === "multiple_choice" ? "rounded-full" : "rounded-sm",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30",
                      showCorrect && "border-green-500 bg-green-500",
                      showWrong && "border-red-500 bg-red-500"
                    )}
                  >
                    {isSelected && (
                      <div className={cn(
                        "bg-white",
                        question.type === "multiple_choice"
                          ? "h-1.5 w-1.5 rounded-full"
                          : "h-2 w-2 rounded-[1px]"
                      )} />
                    )}
                  </div>
                  <span className="flex-1">{option.text}</span>
                  {showCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Open ended */}
        {question.type === "open_ended" && (
          <Textarea
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer..."
            disabled={submitted}
            rows={4}
            className="text-sm"
          />
        )}

        {/* Explanation (shown after submit) */}
        {submitted && question.explanation && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-medium text-xs text-muted-foreground mb-1">Explanation</p>
            <p>{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── QuizPlayer (main export) ────────────────────────────

interface QuizPlayerProps {
  content: string | null
  onComplete: () => void
}

export function QuizPlayer({ content, onComplete }: QuizPlayerProps) {
  const quiz = useMemo(() => parseQuizContent(content), [content])
  const [answers, setAnswers] = useState<Answers>({})
  const [results, setResults] = useState<QuizResults | null>(null)

  if (!quiz) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-muted-foreground">
        This quiz has no questions yet.
      </div>
    )
  }

  const submitted = results !== null
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)
  const answeredCount = quiz.questions.filter((q) => {
    const a = answers[q.id]
    if (q.type === "open_ended") return typeof a === "string" && a.trim().length > 0
    if (q.type === "multiple_select") return Array.isArray(a) && a.length > 0
    return !!a
  }).length

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const quizResults = gradeQuiz(quiz, answers)
    setResults(quizResults)
    if (quizResults.passed) {
      onComplete()
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setResults(null)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Quiz header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
            {" "}&middot; {totalPoints} point{totalPoints !== 1 ? "s" : ""} total
          </p>
          {quiz.passingScore != null && (
            <Badge variant="outline">Pass: {quiz.passingScore}%</Badge>
          )}
        </div>
        {!submitted && (
          <Progress
            value={(answeredCount / quiz.questions.length) * 100}
            className="h-1.5"
          />
        )}
      </div>

      {/* Results banner */}
      {submitted && results && (
        <Card className={cn(
          "border-2",
          results.passed ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "border-red-300 bg-red-50 dark:bg-red-950/20"
        )}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {results.passed ? (
                <Trophy className="h-10 w-10 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500 shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {results.passed ? "Quiz Passed!" : "Quiz Not Passed"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  You scored {results.score}/{results.maxScore} ({results.percentage}%)
                  {quiz.passingScore != null && !results.passed && (
                    <> &middot; Need {quiz.passingScore}% to pass</>
                  )}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <QuestionView
            key={question.id}
            question={question}
            index={index}
            answer={answers[question.id]}
            result={results?.questions[question.id]}
            submitted={submitted}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      <Separator />

      {/* Actions */}
      {!submitted ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {quiz.questions.length} answered
          </p>
          <Button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
          >
            Submit Quiz
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Take Again
          </Button>
        </div>
      )}
    </div>
  )
}
