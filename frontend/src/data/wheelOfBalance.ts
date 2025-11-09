// Колесо баланса для подростков
export interface BalanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  questions: BalanceQuestion[];
}

export interface BalanceQuestion {
  id: string;
  question: string;
  category: string;
}

export interface BalanceAssessment {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'initial' | 'final';
  scores: Record<string, number>; // categoryId -> score (1-10)
  answers: Record<string, string>; // questionId -> answer
}

export const BALANCE_CATEGORIES: BalanceCategory[] = [
  {
    id: 'personal_boundaries',
    name: 'Личные границы',
    icon: '🛡️',
    color: '#9b59b6',
    description: 'Насколько ты умеешь защищать свои границы',
    questions: [
      {
        id: 'pb-1',
        question: 'Насколько легко тебе сказать "нет" когда тебе некомфортно?',
        category: 'personal_boundaries'
      },
      {
        id: 'pb-2',
        question: 'Как часто другие нарушают твои личные границы?',
        category: 'personal_boundaries'
      },
      {
        id: 'pb-3',
        question: 'Насколько ты понимаешь свои личные границы?',
        category: 'personal_boundaries'
      }
    ]
  },
  {
    id: 'relationship_parents',
    name: 'Отношения с родителями',
    icon: '👨‍👩‍👧',
    color: '#e74c3c',
    description: 'Качество общения с родителями',
    questions: [
      {
        id: 'rp-1',
        question: 'Насколько ты можешь открыто говорить с родителями о своих чувствах?',
        category: 'relationship_parents'
      },
      {
        id: 'rp-2',
        question: 'Как часто родители понимают тебя и поддерживают?',
        category: 'relationship_parents'
      },
      {
        id: 'rp-3',
        question: 'Насколько комфортно тебе дома с родителями?',
        category: 'relationship_parents'
      }
    ]
  },
  {
    id: 'relationship_friends',
    name: 'Дружба',
    icon: '👫',
    color: '#3498db',
    description: 'Отношения с друзьями',
    questions: [
      {
        id: 'rf-1',
        question: 'Насколько крепкие и здоровые твои дружеские отношения?',
        category: 'relationship_friends'
      },
      {
        id: 'rf-2',
        question: 'Как часто ты чувствуешь поддержку от друзей?',
        category: 'relationship_friends'
      },
      {
        id: 'rf-3',
        question: 'Насколько ты можешь быть собой рядом с друзьями?',
        category: 'relationship_friends'
      }
    ]
  },
  {
    id: 'self_confidence',
    name: 'Уверенность в себе',
    icon: '💪',
    color: '#f39c12',
    description: 'Вера в свои способности',
    questions: [
      {
        id: 'sc-1',
        question: 'Насколько ты веришь в свои способности?',
        category: 'self_confidence'
      },
      {
        id: 'sc-2',
        question: 'Как часто ты чувствуешь себя уверенно?',
        category: 'self_confidence'
      },
      {
        id: 'sc-3',
        question: 'Насколько легко тебе выражать свое мнение?',
        category: 'self_confidence'
      }
    ]
  },
  {
    id: 'emotions',
    name: 'Эмоции',
    icon: '💙',
    color: '#1abc9c',
    description: 'Понимание и управление эмоциями',
    questions: [
      {
        id: 'em-1',
        question: 'Насколько ты понимаешь свои эмоции?',
        category: 'emotions'
      },
      {
        id: 'em-2',
        question: 'Как часто ты можешь справиться со сложными эмоциями?',
        category: 'emotions'
      },
      {
        id: 'em-3',
        question: 'Насколько комфортно тебе выражать свои чувства?',
        category: 'emotions'
      }
    ]
  },
  {
    id: 'school_study',
    name: 'Учеба',
    icon: '📚',
    color: '#9b59b6',
    description: 'Отношение к учебе и успехи',
    questions: [
      {
        id: 'ss-1',
        question: 'Насколько комфортно тебе в школе?',
        category: 'school_study'
      },
      {
        id: 'ss-2',
        question: 'Как часто ты чувствуешь стресс из-за учебы?',
        category: 'school_study'
      },
      {
        id: 'ss-3',
        question: 'Насколько ты доволен своими учебными результатами?',
        category: 'school_study'
      }
    ]
  },
  {
    id: 'hobbies',
    name: 'Хобби и увлечения',
    icon: '🎨',
    color: '#e67e22',
    description: 'Время для любимых занятий',
    questions: [
      {
        id: 'hb-1',
        question: 'Насколько у тебя есть время для хобби?',
        category: 'hobbies'
      },
      {
        id: 'hb-2',
        question: 'Как часто ты занимаешься тем, что тебе нравится?',
        category: 'hobbies'
      },
      {
        id: 'hb-3',
        question: 'Насколько твои хобби приносят тебе радость?',
        category: 'hobbies'
      }
    ]
  },
  {
    id: 'health',
    name: 'Здоровье',
    icon: '❤️',
    color: '#e74c3c',
    description: 'Физическое и ментальное здоровье',
    questions: [
      {
        id: 'ht-1',
        question: 'Насколько хорошо ты себя чувствуешь физически?',
        category: 'health'
      },
      {
        id: 'ht-2',
        question: 'Как часто ты высыпаешься?',
        category: 'health'
      },
      {
        id: 'ht-3',
        question: 'Насколько ты заботишься о своем здоровье?',
        category: 'health'
      }
    ]
  }
];

export const getAllQuestions = (): BalanceQuestion[] => {
  return BALANCE_CATEGORIES.flatMap(cat => cat.questions);
};

export const calculateCategoryScore = (
  categoryId: string, 
  answers: Record<string, string>
): number => {
  const category = BALANCE_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return 0;
  
  const categoryAnswers = category.questions
    .map(q => parseInt(answers[q.id] || '0'))
    .filter(score => !isNaN(score));
  
  if (categoryAnswers.length === 0) return 0;
  
  const sum = categoryAnswers.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / categoryAnswers.length);
};

export const calculateOverallScore = (scores: Record<string, number>): number => {
  const values = Object.values(scores).filter(v => v > 0);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};
