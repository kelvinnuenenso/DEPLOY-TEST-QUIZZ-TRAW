export type QuestionType = 
  | 'single' 
  | 'multiple' 
  | 'rating' 
  | 'nps' 
  | 'slider' 
  | 'short_text' 
  | 'long_text' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'file' 
  | 'consent' 
  | 'cta';

// Novos tipos de componentes para o construtor visual
export type ComponentType =
  | 'text'
  | 'title' 
  | 'image'
  | 'video'
  | 'button'
  | 'input'
  | 'faq'
  | 'testimonial'
  | 'carousel'
  | 'comparison'
  | 'chart'
  | 'confetti'
  | 'pricing'
  | 'marquee'
  | 'spacer'
  | 'terms'
  | 'multiple_choice'
  | 'level_slider'
  | 'rating';

export interface QuestionOption {
  id: string;
  label: string;
  value?: string;
  score?: number;
  // Ramificação específica para esta opção
  branch?: ResponseBranch;
}

export interface ResponseBranch {
  id: string;
  responseValue: string;
  actionType: 'next_step' | 'specific_step' | 'external_url' | 'outcome';
  targetStepId?: string;
  targetUrl?: string;
  outcomeKey?: string;
  conditions?: BranchCondition[];
}

export interface BranchCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string;
}

export interface Question {
  id: string;
  idx: number;
  type: QuestionType;
  title: string;
  description?: string;
  options?: QuestionOption[];
  required?: boolean;
  logic?: Record<string, unknown>;
  score_weight?: number;
  settings?: Record<string, unknown>;
}

export interface QuizTheme {
  primary: string;
  background: string;
  text: string;
  accent?: string;
  cardBackground?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  buttonStyle?: string;
  maxWidth?: string;
  gradient?: boolean;
  showProgress?: boolean;
  showQuestionNumbers?: boolean;
  centerAlign?: boolean;
  // Fake Progress Bar properties
  fakeProgress?: boolean;
  fakeProgressStyle?: 'linear' | 'stepped' | 'circular';
  fakeProgressSpeed?: 'slow' | 'normal' | 'fast';
  fakeProgressBehavior?: 'smooth' | 'jumpy' | 'realistic';
  fakeProgressStartPercent?: number;
  fakeProgressEndPercent?: number;
  fakeProgressAutoAdvance?: boolean;
  // Smart Progress System
  smartProgress?: boolean;
  // Intelligent Progress Configuration
  intelligentProgress?: boolean;
  intelligentProgressConfig?: IntelligentProgressConfig;
  progressMode?: 'simple' | 'smart' | 'intelligent' | 'custom';
  stepProgressConfig?: StepProgressConfig[];
  funnelProgressConfig?: FunnelProgressConfig;
  // Layout properties
  layout?: string;
  padding?: string;
  sectionHeight?: string;
  stickyNavigation?: boolean;
  mobileBehavior?: string;
  mobileScale?: string;
  mobileOptimized?: boolean;
  // Branding properties
  logo?: string;
  logoPosition?: string;
  logoSize?: string;
  favicon?: string;
  brandName?: string;
  brandSlogan?: string;
  brandDescription?: string;
  showWatermark?: boolean;
  watermarkPosition?: string;
  watermarkOpacity?: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  // Effects properties
  backgroundGradient?: string;
  useBackgroundGradient?: boolean;
  useVideoBackground?: boolean;
  videoBackgroundUrl?: string;
  videoOverlayOpacity?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoOverlayStyle?: string;
  defaultAnimation?: string;
  animationSpeed?: string;
  useParticleEffects?: boolean;
  completionEffect?: string;
  effectIntensity?: string;
  effectOnCorrectAnswer?: boolean;
  useSoundEffects?: boolean;
  soundVolume?: string;
  soundOnClick?: boolean;
  soundOnComplete?: boolean;
  shadow?: string;
  animation?: string;
  fontWeight?: string;
  // Animation properties
  respectMotionPreference?: boolean;
  entranceAnimation?: string;
  hoverAnimation?: string;
  transitionAnimation?: string;
  // Confetti properties
  useConfetti?: boolean;
  confettiPreset?: string;
  confettiColors?: string[];
  confettiIntensity?: string;
  confettiDuration?: number;
  confettiShapes?: string[];
  confettiTriggers?: string[];
  confettiAnimation?: string;
  confettiSpeed?: string;
  confettiGravity?: boolean;
  confettiWind?: boolean;
  confettiFade?: boolean;
  // Engagement features
  smartProgressEnabled?: boolean;
  smartProgressStyle?: string;
  smartProgressStartColor?: string;
  smartProgressStartSpeed?: number;
  smartProgressStartDuration?: number;
  smartProgressMiddleColor?: string;
  smartProgressMiddleSpeed?: number;
  smartProgressMiddleDuration?: number;
  smartProgressEndColor?: string;
  smartProgressEndSpeed?: number;
  smartProgressEndPulse?: boolean;
  smartProgressEndDuration?: number;
  // Emotional Analytics
  emotionalAnalyticsEnabled?: boolean;
  responseTimeTracking?: boolean;
  fastResponseThreshold?: number;
  slowResponseThreshold?: number;
  showEmotionalInsights?: boolean;
  realTimeEmotionalAlerts?: boolean;
  // Micro Rewards
  microRewardsEnabled?: boolean;
  microRewardsConfetti?: boolean;
  microRewardsIcons?: boolean;
  microRewardsAnimations?: boolean;
  microRewardsSounds?: boolean;
  microRewardsSoundVolume?: number;
  microRewardsAchievementSound?: string;
  microRewardsFinalScore?: boolean;
  microRewardsShowProfile?: boolean;
  microRewardsCustomProfiles?: Record<string, unknown>[];
  // Social Sharing
  socialSharingEnabled?: boolean;
  socialSharingWhatsApp?: boolean;
  socialSharingInstagram?: boolean;
  socialSharingFacebook?: boolean;
  socialSharingTwitter?: boolean;
  socialSharingLogo?: string;
  socialSharingCTA?: string;
  socialSharingRedirectUrl?: string;
  socialSharingCustomMessage?: string;
  // Conditional Progress
  conditionalProgressEnabled?: boolean;
  urgencyMessageEnabled?: boolean;
  urgencyMessageTemplate?: string;
  urgencyShowProgress?: boolean;
  urgencyMessageStyle?: string;
  exitIntentEnabled?: boolean;
  exitIntentType?: string;
  exitIntentTitle?: string;
  exitIntentMessage?: string;
  exitIntentCTA?: string;
  exitIntentOffer?: string;
}

// Smart Progress Configuration
export interface StepProgressConfig {
  stepId: string;
  stepIndex: number;
  progressWeight: number; // 0-100, how much this step contributes to total progress
  progressSpeed?: 'instant' | 'slow' | 'normal' | 'fast' | 'custom';
  customSpeed?: number; // milliseconds for custom speed
  progressStyle?: 'linear' | 'ease-in' | 'ease-out' | 'bounce';
  minProgressIncrease?: number; // minimum % to increase
  maxProgressIncrease?: number; // maximum % to increase
  dependsOnAnswers?: boolean; // if progress should depend on answer complexity/type
  complexityMultiplier?: number; // multiplier based on answer complexity
}

export interface FunnelProgressConfig {
  enabled: boolean;
  stages: FunnelStage[];
  adaptiveSpeed: boolean; // adjust speed based on user behavior
  userBehaviorTracking: boolean; // track how long users spend on each step
  intelligentPrediction: boolean; // predict user completion likelihood
  progressAcceleration?: ProgressAcceleration;
}

export interface FunnelStage {
  id: string;
  name: string;
  stepIds: string[]; // which steps belong to this stage
  stageWeight: number; // how much of total progress this stage represents
  progressBehavior: 'uniform' | 'accelerating' | 'decelerating' | 'smart';
  minimumTime?: number; // minimum time to spend in this stage (ms)
  expectedTime?: number; // expected time for average user (ms)
  complexityFactor?: number; // how complex this stage is (affects progress speed)
}

export interface ProgressAcceleration {
  enabled: boolean;
  easyAnswersMultiplier: number; // speed up for simple answers
  complexAnswersMultiplier: number; // slow down for complex answers
  quickUsersMultiplier: number; // adjust for users who answer quickly
  slowUsersMultiplier: number; // adjust for users who take time
  completionLikelihoodFactor: boolean; // adjust based on predicted completion
}

// Intelligent Progress Configuration
export interface IntelligentProgressConfig {
  enabled: boolean;
  animationSpeed: 'fast' | 'normal' | 'slow'; // 0.5s, 1s, 2s
  fastPhase: IntelligentProgressPhase;
  linearPhase: IntelligentProgressPhase;
  slowPhase: IntelligentProgressPhase;
}

export interface IntelligentProgressPhase {
  startPercent: number; // quando a fase começa (% do quiz)
  endPercent: number;   // quando a fase termina (% do quiz)
  progressMultiplier: number; // multiplicador da velocidade de progresso
}

export interface QuizOutcome {
  title: string;
  description: string;
  cta?: {
    label: string;
    href: string;
  };
  scoreRange?: {
    min: number;
    max: number;
  };
  color?: string;
  icon?: string;
  redirectUrl?: string; // Nova propriedade para redirecionamento específico por resultado
}

// Novo sistema de componentes visuais
export interface Component {
  id: string;
  type: ComponentType;
  content: Record<string, unknown>;
  style?: ComponentStyle;
  conditions?: ComponentCondition[];
  writtenResponse?: WrittenResponseConfig;
  properties?: ComponentProperties;
  animation?: ComponentAnimation;
  visible?: boolean;
  locked?: boolean;
  customClass?: string;
  customStyles?: string;
}

export interface ComponentProperties {
  title?: string;
  text?: string;
  placeholder?: string;
  options?: Array<{ id: string; label: string; value?: unknown }>;
  [key: string]: unknown;
}

export interface WrittenResponseConfig {
  enabled: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  validation?: 'text' | 'number' | 'email' | 'phone' | 'none';
  allowMultiline?: boolean;
}

export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: string;
  height?: string;
  color?: string;
  fontWeight?: string | number;
  borderWidth?: string;
  borderColor?: string;
  marginTop?: string;
  marginBottom?: string;
  paddingX?: string;
  paddingY?: string;
}

export interface ComponentAnimation {
  entrance?: 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'bounceIn';
  duration?: number;
  delay?: number;
}

export interface ComponentCondition {
  type: 'show_if' | 'hide_if';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

// Sistema de etapas
export interface QuizStep {
  id: string;
  name: string;
  title: string;
  components: Component[];
  logic?: StepLogic;
}

export interface StepLogic {
  type: 'conditional' | 'scoring' | 'calculation';
  rules: LogicRule[];
  defaultNextStep?: string;
}

export interface LogicRule {
  id: string;
  conditions: FlowCondition[];
  operator: 'AND' | 'OR';
  nextStepId: string;
  label?: string;
}

export interface FlowCondition {
  id: string;
  type: 'response' | 'score' | 'tag' | 'calculation';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: unknown;
  secondValue?: unknown; // for 'between' operator
}

// Fluxo visual
export interface FlowNode {
  id: string;
  type: 'step' | 'condition' | 'outcome' | 'calculation';
  position: { x: number; y: number };
  data: {
    stepId?: string;
    title: string;
    subtitle?: string;
    conditions?: FlowCondition[];
    calculation?: FlowCalculation;
    color?: string;
    icon?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'conditional' | 'calculation';
  style?: Record<string, unknown>;
  data?: {
    condition?: FlowCondition;
    color?: string;
  };
}

export interface FlowCalculation {
  id: string;
  name: string;
  type: 'sum' | 'average' | 'count' | 'custom';
  formula?: string;
  fields: string[];
  resultField: string;
}

// Gamificação
export interface GameSettings {
  enabled: boolean;
  showProgress: boolean;
  showScore: boolean;
  levels: GameLevel[];
  scoringRules: ScoringRule[];
  achievements?: Achievement[];
}

export interface GameLevel {
  id: string;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
  color: string;
  icon: string;
  rewards?: string[];
}

export interface ScoringRule {
  id: string;
  trigger: 'answer' | 'step_complete' | 'quiz_complete' | 'condition_met';
  condition?: FlowCondition;
  points: number;
  multiplier?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: FlowCondition;
  points: number;
}

// Sistema de simulação e IA
export interface FlowSimulation {
  id: string;
  name: string;
  persona: UserPersona;
  results: SimulationResult[];
  createdAt: string;
}

export interface UserPersona {
  name: string;
  age?: number;
  interests: string[];
  behavior: 'careful' | 'quick' | 'thorough' | 'random';
  responses: Record<string, unknown>;
}

export interface SimulationResult {
  stepId: string;
  response: unknown;
  score: number;
  path: string[];
  timestamp: number;
}

export interface FlowSuggestion {
  id: string;
  type: 'branch' | 'condition' | 'optimization' | 'gamification';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  suggestion: Record<string, unknown>;
}

export interface CustomEvent {
  id: string;
  name: string;
  parameters: { key: string; value: string }[];
  trigger: 'quiz_start' | 'question_answer' | 'quiz_complete' | 'result_specific';
  triggerValue?: string;
}

export interface QuizPixelSettings {
  facebook?: {
    enabled: boolean;
    pixelId: string;
    standardEvents?: {
      enabled: boolean;
      events: string[];
    };
    customMode?: {
      enabled: boolean;
      events: CustomEvent[];
    };
  };
  utm?: {
    enabled: boolean;
    source: string;
    medium: string;
    campaign: string;
    content?: string;
    term?: string;
  };
  custom?: {
    enabled: boolean;
    code: string;
    name?: string;
  };
}

export interface CustomDomainSettings {
  enabled: boolean;
  domain?: string;
  status: 'pending' | 'validating' | 'validated' | 'error';
  lastValidated?: string;
  errorMessage?: string;
}

export interface QuizSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  slug?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface Quiz {
  id: string;
  publicId: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  theme?: QuizTheme;
  settings?: Record<string, unknown>;
  steps?: QuizStep[]; // Novo sistema de etapas
  questions: Question[]; // Manter compatibilidade com sistema antigo
  outcomes?: Record<string, QuizOutcome>;
  flow?: QuizFlow; // Sistema de fluxo visual
  gameSettings?: GameSettings; // Configurações de gamificação
  pixelSettings?: QuizPixelSettings; // Configurações de pixels
  customDomain?: CustomDomainSettings; // Configurações de domínio personalizado
  redirectSettings?: QuizRedirectSettings; // Configurações de redirecionamento
  seo?: QuizSEO; // Configurações de SEO
  branching?: QuestionBranching[]; // Suporte a branching
  createdAt: string;
  updatedAt: string;
}

export interface QuizRedirectSettings {
  enabled: boolean;
  url?: string;
  overrideResults?: boolean; // Se true, substitui a exibição de resultados
}

export interface QuizFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
  calculations: FlowCalculation[];
  entryNodeId: string;
  viewport?: { x: number; y: number; zoom: number };
}

export interface QuizAnswer {
  questionId: string;
  value: unknown;
}

export interface Result {
  id: string;
  quizId: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  outcomeKey?: string;
  utm?: Record<string, string>;
  meta?: Record<string, unknown>;
  answers: QuizAnswer[];
}

export interface Lead {
  id: string;
  quizId: string;
  resultId: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  createdAt: string;
}