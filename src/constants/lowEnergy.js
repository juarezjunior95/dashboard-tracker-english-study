export const LOW_ENERGY_SESSION_MINUTES = 10

export const SPEAKING_TASKS = [
  'Record a 1-minute voice memo about your day.',
  'Describe what you see around you for 60 seconds.',
  'Explain a recipe or routine step by step out loud.',
  'Summarize a short article or video in your own words.',
  'Practice a short phone-style greeting and closing.',
]

export const VOCAB_WORDS = [
  { word: 'consistent', hint: 'doing something regularly' },
  { word: 'nuance', hint: 'a subtle difference in meaning' },
  { word: 'reluctant', hint: 'hesitant or unwilling' },
  { word: 'straightforward', hint: 'simple and clear' },
  { word: 'outcome', hint: 'the result of something' },
  { word: 'assumption', hint: 'something accepted as true without proof' },
  { word: 'feedback', hint: 'comments to improve performance' },
  { word: 'deadline', hint: 'the latest time to finish' },
]

export const REVIEW_TASKS = [
  'Skim yesterday’s notes for 2 minutes.',
  'Redo 3 flashcards you almost got wrong.',
  'Read one short paragraph aloud twice.',
  'List 5 words you learned this week and use one in a sentence.',
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

/** @returns {{ speaking: string, vocab: { word: string, hint: string }[], review: string }} */
export function sampleLowEnergyPlan() {
  const speaking = SPEAKING_TASKS[Math.floor(Math.random() * SPEAKING_TASKS.length)]
  const vocab = shuffle(VOCAB_WORDS).slice(0, 2)
  const review = REVIEW_TASKS[Math.floor(Math.random() * REVIEW_TASKS.length)]
  return { speaking, vocab, review }
}
