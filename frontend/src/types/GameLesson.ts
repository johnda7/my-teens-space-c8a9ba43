// frontend/src/types/GameLesson.ts
export interface GameLesson {
  id: string
  title: string
  storyline: {
    intro: string
    character: 'katya' | 'guard' | 'friend'
    setting: string // "castle-gate" | "bridge" | "tower"
    background: string // URL или gradient
  }
  gameplay: {
    type: 'quest' | 'puzzle' | 'dialogue' | 'exploration'
    objective: string
    rewards: {
      xp: number
      gems: number
      unlock?: string // Что разблокируется
    }
  }
  stages: GameStage[]
}

export interface GameStage {
  id: string
  type: 'story' | 'question' | 'minigame' | 'choice'
  content: StageContent
}

// Типы контента для разных стадий
export type StageContent = 
  | StoryContent 
  | QuestionContent 
  | MinigameContent 
  | ChoiceContent

export interface StoryContent {
  character: string
  text: string
  animation?: 'talking' | 'thinking' | 'celebrating'
  audio?: string
}

export interface QuestionContent {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface MinigameContent {
  type: 'boundary-builder' | 'emotion-match' | 'dialogue-tree'
  instructions: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ChoiceContent {
  scenario: string
  choices: Array<{
    text: string
    consequence: string
    points: number
  }>
}
