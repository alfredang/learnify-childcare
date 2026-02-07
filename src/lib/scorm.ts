/**
 * SCORM-compatible tracking library
 *
 * Maps internal progress data to the SCORM 2.0 (SCORM 1.2) CMI data model.
 * Reference: https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
 *
 * Key SCORM 2.0 CMI elements mapped:
 * - cmi.core.lesson_status: "not attempted" | "incomplete" | "completed" | "passed" | "failed"
 * - cmi.core.score.raw: 0-100
 * - cmi.core.session_time: HHHH:MM:SS
 * - cmi.core.total_time: HHHH:MM:SS (accumulated across sessions)
 */

export type ScormLessonStatus =
  | "not attempted"
  | "incomplete"
  | "completed"
  | "passed"
  | "failed"

/**
 * Calculates the SCORM lesson status based on progress, quiz score, and passing score.
 *
 * Logic follows SCORM 2.0 CMI data model rules:
 * - 0% progress => "not attempted"
 * - Has quiz score and score >= passing score => "passed"
 * - Has quiz score and score < passing score => "failed"
 * - 100% progress (no quiz or no passing score) => "completed"
 * - Otherwise => "incomplete"
 *
 * @param progress - Completion progress percentage (0-100)
 * @param quizScore - Optional quiz score (0-100)
 * @param passingScore - Optional passing score threshold (0-100), defaults to 80
 * @returns ScormLessonStatus
 */
export function calculateScormStatus(
  progress: number,
  quizScore?: number,
  passingScore?: number
): ScormLessonStatus {
  if (progress <= 0) {
    return "not attempted"
  }

  // If there is a quiz score, evaluate pass/fail
  if (quizScore !== undefined && quizScore !== null) {
    const threshold = passingScore ?? 80

    if (quizScore >= threshold) {
      return "passed"
    }

    return "failed"
  }

  // No quiz involved: check if content is fully completed
  if (progress >= 100) {
    return "completed"
  }

  return "incomplete"
}

/**
 * Formats a duration in seconds to SCORM 2.0 time format (HHHH:MM:SS).
 *
 * SCORM 2.0 uses the format HHHH:MM:SS.SS for cmi.core.session_time
 * and cmi.core.total_time. This implementation outputs HHHH:MM:SS
 * (whole seconds) which is the most commonly used format.
 *
 * @param seconds - Duration in seconds (non-negative integer)
 * @returns Formatted time string in HHHH:MM:SS format
 */
export function formatScormTime(seconds: number): string {
  if (seconds < 0) {
    seconds = 0
  }

  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const hh = hours.toString().padStart(4, "0")
  const mm = minutes.toString().padStart(2, "0")
  const ss = secs.toString().padStart(2, "0")

  return `${hh}:${mm}:${ss}`
}

/**
 * Parses a SCORM 2.0 time string (HHHH:MM:SS or HH:MM:SS) back to seconds.
 *
 * Handles both standard SCORM formats:
 * - HHHH:MM:SS (e.g., "0001:30:00" for 1 hour 30 minutes)
 * - HH:MM:SS (e.g., "01:30:00")
 * - H:MM:SS or other hour-length variations
 *
 * @param timeStr - SCORM-formatted time string
 * @returns Duration in seconds, or 0 if the string is invalid
 */
export function parseScormTime(timeStr: string): number {
  if (!timeStr || typeof timeStr !== "string") {
    return 0
  }

  const parts = timeStr.split(":")

  if (parts.length !== 3) {
    return 0
  }

  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  const seconds = parseFloat(parts[2])

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return 0
  }

  if (hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    return 0
  }

  return hours * 3600 + minutes * 60 + Math.floor(seconds)
}

/**
 * Adds two SCORM 2.0 time strings together and returns the result
 * in SCORM time format.
 *
 * This is useful for accumulating cmi.core.total_time across multiple
 * sessions by adding cmi.core.session_time to the running total.
 *
 * @param time1 - First SCORM time string (HHHH:MM:SS)
 * @param time2 - Second SCORM time string (HHHH:MM:SS)
 * @returns Combined time in HHHH:MM:SS format
 */
export function addScormTimes(time1: string, time2: string): string {
  const seconds1 = parseScormTime(time1)
  const seconds2 = parseScormTime(time2)

  return formatScormTime(seconds1 + seconds2)
}

/**
 * Calculates a SCORM-compatible score (0-100) from quiz results.
 *
 * Maps to cmi.core.score.raw in the SCORM 2.0 CMI data model.
 * The score is rounded to 2 decimal places.
 *
 * @param correctAnswers - Number of correctly answered questions
 * @param totalQuestions - Total number of questions in the quiz
 * @returns Score from 0 to 100, or 0 if totalQuestions is 0
 */
export function calculateScormScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions <= 0) {
    return 0
  }

  if (correctAnswers < 0) {
    correctAnswers = 0
  }

  if (correctAnswers > totalQuestions) {
    correctAnswers = totalQuestions
  }

  const score = (correctAnswers / totalQuestions) * 100

  return Math.round(score * 100) / 100
}
