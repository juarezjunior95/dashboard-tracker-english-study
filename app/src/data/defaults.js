/**
 * Dados padrão do B2 Study Tracker (cronograma e tipos de atividade).
 */

export const defaultSchedule = {
  monday: [
    { id: 'mon-anki', time: '08:20-08:40', activity: 'Anki', type: 'anki', duration: 20, defaultPoints: 5 },
    { id: 'mon-interview', time: '08:40-09:00', activity: 'Interview Practice', type: 'structured', duration: 20, defaultPoints: 10 },
    { id: 'mon-class', time: '18:00-19:00', activity: 'English Class', type: 'speaking', duration: 60, defaultPoints: 15 }
  ],
  tuesday: [
    { id: 'tue-anki', time: '08:20-08:40', activity: 'Anki', type: 'anki', duration: 20, defaultPoints: 5 },
    { id: 'tue-grammar', time: '08:40-09:30', activity: 'Grammar', type: 'grammar', duration: 50, defaultPoints: 5 },
    { id: 'tue-listening', time: '18:40-19:10', activity: 'Listening + Summary', type: 'listening', duration: 30, defaultPoints: 10 }
  ],
  wednesday: [
    { id: 'wed-speaking', time: '08:20-08:50', activity: 'Speaking Practice', type: 'speaking', duration: 30, defaultPoints: 15 }
  ],
  thursday: [
    { id: 'thu-anki', time: '08:20-08:40', activity: 'Anki', type: 'anki', duration: 20, defaultPoints: 5 },
    { id: 'thu-tech', time: '08:40-09:30', activity: 'Technical Question', type: 'speaking', duration: 50, defaultPoints: 15 }
  ],
  friday: [
    { id: 'fri-review', time: '08:20-08:40', activity: 'Review', type: 'review', duration: 20, defaultPoints: 0 },
    { id: 'fri-improve', time: '08:40-09:30', activity: 'Improve 1 Answer', type: 'structured', duration: 50, defaultPoints: 10 },
    { id: 'fri-listening', time: '18:30-18:50', activity: 'Listening', type: 'listening', duration: 20, defaultPoints: 10 }
  ],
  saturday: [
    { id: 'sat-mock', time: '10:00-11:00', activity: 'Mock Interview', type: 'mock', duration: 60, defaultPoints: 25 }
  ],
  sunday: [
    { id: 'sun-rest', time: 'Rest Day', activity: 'Rest', type: 'rest', duration: 0, defaultPoints: 0 }
  ]
}

export const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
export const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export const defaultActivityTypes = [
  { value: 'anki', label: 'Anki', defaultPoints: 5 },
  { value: 'listening', label: 'Listening', defaultPoints: 10 },
  { value: 'grammar', label: 'Grammar', defaultPoints: 5 },
  { value: 'speaking', label: 'Speaking', defaultPoints: 15 },
  { value: 'structured', label: 'Resposta Estruturada', defaultPoints: 10 },
  { value: 'mock', label: 'Mock Interview', defaultPoints: 25 },
  { value: 'review', label: 'Review', defaultPoints: 0 },
  { value: 'rest', label: 'Descanso', defaultPoints: 0 }
]
