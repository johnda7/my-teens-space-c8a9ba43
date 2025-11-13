import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import WebApp from "@twa-dev/sdk";
import { CheckCircle2, Clock, Loader2, PartyPopper, Shield, Sparkles, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export type UltraLessonMode = "story" | "challenge" | "reflection";
export type UltraAction = "set-boundary" | "self-talk" | "ask-for-help";

interface MiniChallenge {
	id: string;
	title: string;
	type: "timer" | "multistep" | "reflection";
	prompt: string;
	positiveResponse: string;
	boundaryTip: string;
	defaultSeconds?: number;
}

interface ReflectionPrompt {
	id: string;
	question: string;
	hint: string;
	badge: string;
}

interface PlayerProfile {
	username: string;
	level: number;
	streak: number;
	xp: number;
	avatarMood: "default" | "celebrate" | "thinking" | "support";
}

interface GameLessonUltraProps {
	onComplete?: (summary: {
		xpEarned: number;
		actionsTaken: UltraAction[];
		reflections: string[];
		timeRemaining: number;
	}) => void;
	onExit?: () => void;
	className?: string;
}

const MINI_CHALLENGES: MiniChallenge[] = [
	{
		id: "boundary-blitz",
		title: "Boundary Blitz",
		type: "timer",
		prompt:
			"Ты на вечеринке, и одноклассник тэгает тебя в сторис, хотя ты не хочешь. За 25 секунд придумай фразу, которая сохранит дружбу и твоё пространство.",
		positiveResponse:
			"Сорри, сегодня хочу оффлайн, давай без камеры. Я рядом, просто наслажусь моментом!",
		boundaryTip: "Сообщи, что ощущаешь, и предложи альтернативу — так граница звучит мягко, но уверенно.",
		defaultSeconds: 25,
	},
	{
		id: "ally-signal",
		title: "Ally Signal",
		type: "multistep",
		prompt:
			"В школьном чате жаркий спор. Ты понимаешь, что эмоции накрывают. Составь три шага, чтобы сделать паузу и не выгореть.",
		positiveResponse:
			"1) Напомнить себе, что моя стабильность важна. 2) Написать: 'Ребят, я вернусь к разговору позже'. 3) Черкануть близкому другу и выговориться.",
		boundaryTip: "Пауза — это ответ. Объясни людям, что тебе нужно время, и договорись о продолжении позже.",
	},
	{
		id: "sos-beacon",
		title: "SOS Beacon",
		type: "reflection",
		prompt:
			"Лучший друг обиделся: ты сорвал созвон. Придумай сообщение, где признаешь его чувства и оставишь свою границу на месте.",
		positiveResponse:
			"Мне жаль, что ты почувствовал себя брошенным. Я правда устал(а) и беру паузу вечером. Давай перенесём на завтра — буду внимательнее.",
		boundaryTip: "Три части идеального ответа: признаём чувство, честно говорим о своём ресурсе, предлагаем следующий шаг.",
	},
];

const REFLECTION_PROMPTS: ReflectionPrompt[] = [
	{
		id: "pulse-check",
		question: "Что в сегодняшней ситуации больше всего тревожит тебя?",
		hint: "Подумай про эмоции, тело и мысли. Что дергает сильнее?",
		badge: "Эмоциональный сканер",
	},
	{
		id: "boundary-meter",
		question: "Какую границу ты готов поставить прямо сейчас, если сценарий повторится?",
		hint: "Запиши фразу или действие, которое защитит тебя.",
		badge: "Границы на максимум",
	},
	{
		id: "ally-call",
		question: "Кого из своих людей ты позовёшь, если станет слишком жарко?",
		hint: "Вспомни друзей, кураторов, взрослых, онлайн-комьюнити.",
		badge: "Сигнал другу",
	},
];

const ACTION_BADGES: Record<UltraAction, { label: string; description: string }> = {
	"set-boundary": {
		label: "Граница-Про",
		description: "Ты чётко защищаешь личное пространство, даже если давление высокое.",
	},
	"self-talk": {
		label: "Внутренний коуч",
		description: "Ты умеешь говорить с собой бережно и держать фокус.",
	},
	"ask-for-help": {
		label: "Команда на связи",
		description: "Ты не тащишь всё в одиночку и зовёшь своих людей.",
	},
};

const MODE_THEMES: Record<UltraLessonMode, { label: string; gradient: string; accent: string }> = {
	story: {
		label: "Story Dive",
		gradient: "bg-gradient-to-r from-[#5961F9] via-[#EE9AE5] to-[#F5576C]",
		accent: "text-[#F5576C]",
	},
	challenge: {
		label: "Boss Fight",
		gradient: "bg-gradient-to-r from-[#3a1c71] via-[#d76d77] to-[#ffaf7b]",
		accent: "text-[#ffaf7b]",
	},
	reflection: {
		label: "Zen Mode",
		gradient: "bg-gradient-to-r from-[#141E30] via-[#243B55] to-[#5433FF]",
		accent: "text-[#40C9FF]",
	},
};

const INITIAL_PROFILE: PlayerProfile = {
	username: "katya",
	level: 7,
	streak: 4,
	xp: 3280,
	avatarMood: "default",
};

const storyBeats = [
	{
		title: "Сцена 1 — Ток-шоу",
		body: "Ты ведущий шоу \"Границы без драмы\". Зрители пишут лайв, а ты реагируешь.",
	},
	{
		title: "Сцена 2 — Команда поддержки",
		body: "Рядом Катя Карпенко, друг Тимур и куратор Настя. Они подсказывают, но решение за тобой.",
	},
	{
		title: "Сцена 3 — Личный дневник",
		body: "В финале фиксируешь 3 шага, чтобы не сгореть в похожей ситуации в реале.",
	},
];

const useTelegramEffects = () => {
	useEffect(() => {
		WebApp?.ready();
		WebApp?.expand();
	}, []);

	return {
		notifySuccess: (message: string) => {
			try {
				WebApp?.showPopup({ title: "🔥 Буст!", message });
				WebApp?.HapticFeedback?.notificationOccurred("success");
			} catch (error) {
				console.warn("Telegram feedback error", error);
			}
		},
		notifyInfo: (message: string) => {
			try {
				WebApp?.showPopup({ title: "👀 Подсказка", message });
				WebApp?.HapticFeedback?.impactOccurred("medium");
			} catch (error) {
				console.warn("Telegram feedback error", error);
			}
		},
	};
};

const xpCurve = (mode: UltraLessonMode, reflections: number) => {
	const base = mode === "story" ? 120 : mode === "challenge" ? 150 : 100;
	const bonus = reflections * 25;
	return base + bonus;
};

const getInitialTimer = (mode: UltraLessonMode) => {
	switch (mode) {
		case "challenge":
			return 180;
		case "story":
			return 210;
		case "reflection":
			return 240;
		default:
			return 120;
	}
};

export function GameLessonUltra({ onComplete, onExit, className }: GameLessonUltraProps) {
	const [mode, setMode] = useState<UltraLessonMode>("story");
	const [activeChallenge, setActiveChallenge] = useState<MiniChallenge | null>(MINI_CHALLENGES[0]);
	const [timer, setTimer] = useState(() => getInitialTimer("story"));
	const [timerRunning, setTimerRunning] = useState(true);
	const [actionsTaken, setActionsTaken] = useState<UltraAction[]>([]);
	const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
	const [profile, setProfile] = useState<PlayerProfile>(INITIAL_PROFILE);
	const [completionState, setCompletionState] = useState<"idle" | "animating" | "done">("idle");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const controls = useAnimationControls();
	const { toast } = useToast();
	const { notifySuccess, notifyInfo } = useTelegramEffects();

	useEffect(() => {
		if (!timerRunning) return;
		const interval = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					setTimerRunning(false);
					notifyInfo("Время вышло! Сохраняем инсайты.");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [timerRunning, notifyInfo]);

	const handleModeChange = (newMode: UltraLessonMode) => {
		setMode(newMode);
		setTimer(getInitialTimer(newMode));
		setTimerRunning(true);
		notifyInfo(`Переключаемся в ${MODE_THEMES[newMode].label}!`);
	};

	const handleAction = (action: UltraAction) => {
		setActionsTaken((prev) => (prev.includes(action) ? prev : [...prev, action]));
		controls.start({
			scale: [1, 1.12, 1.02, 1],
			rotate: [0, -3, 3, -1, 0],
			transition: { duration: 0.6 },
		});
		toast({
			title: ACTION_BADGES[action].label,
			description: ACTION_BADGES[action].description,
		});
		notifySuccess(`Ты активировал ${ACTION_BADGES[action].label}!`);
	};

	const handleReflectionChange = (id: string, value: string) => {
		setReflectionAnswers((prev) => ({ ...prev, [id]: value }));
	};

	const reflectionsCompleted = useMemo(
		() =>
			REFLECTION_PROMPTS.filter((prompt) => (reflectionAnswers[prompt.id] ?? "").trim().length > 20),
		[reflectionAnswers],
	);

	const totalXP = useMemo(
		() => xpCurve(mode, reflectionsCompleted.length) + actionsTaken.length * 35,
		[mode, reflectionsCompleted.length, actionsTaken.length],
	);

	const handleComplete = async () => {
		setIsSubmitting(true);
		setTimerRunning(false);
		setProfile((prev) => ({
			...prev,
			xp: prev.xp + totalXP,
			streak: prev.streak + 1,
			avatarMood: "celebrate",
		}));
		setCompletionState("animating");
		notifySuccess("Границы закреплены! Записываю прогресс.");

		await controls.start({
			scale: [1, 1.14, 1.04, 1],
			rotate: [0, 2, -2, 0],
			transition: { duration: 1.1 },
		});

		setCompletionState("done");
		setIsSubmitting(false);

		onComplete?.({
			xpEarned: totalXP,
			actionsTaken,
			reflections: reflectionsCompleted.map((prompt) => prompt.question),
			timeRemaining: timer,
		});
	};

	const timerPercent = useMemo(() => {
		const initial = getInitialTimer(mode);
		return (timer / initial) * 100;
	}, [timer, mode]);

	const resetLesson = () => {
		setMode("story");
		setActiveChallenge(MINI_CHALLENGES[0]);
		setTimer(getInitialTimer("story"));
		setTimerRunning(true);
		setActionsTaken([]);
		setReflectionAnswers({});
		setCompletionState("idle");
		setProfile(INITIAL_PROFILE);
		notifyInfo("Рестартуем миссию. Погнали!");
	};

	return (
		<div
			className={cn(
				"relative mx-auto flex w-full max-w-3xl flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-[#070811]/90 p-6 shadow-[0_25px_80px_-20px_rgba(67,56,202,0.45)] backdrop-blur-lg",
				className,
			)}
		>
			<motion.div
				className={cn("absolute inset-0 -z-10 opacity-60 blur-2xl", MODE_THEMES[mode].gradient)}
				animate={{ opacity: [0.4, 0.85, 0.6], scale: [1, 1.05, 1] }}
				transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
			/>

			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-semibold text-white sm:text-3xl">Миссия «Границы без драмы»</h2>
					<p className="mt-1 max-w-xl text-sm text-white/70 sm:text-base">
						Формат шоу: тестируешь границы, прокачиваешь реакцию и собираешь трофеи поддержки.
					</p>
				</div>
				<motion.div
					animate={{
						y: [0, -4, 0],
						rotate: [-2, 2, -2],
						boxShadow: [
							"0 0 0 rgba(255,255,255,0.35)",
							"0 0 20px rgba(99,102,241,0.45)",
							"0 0 10px rgba(245,87,108,0.35)",
						],
					}}
					transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
					className="flex items-center gap-3 rounded-full bg-white/8 px-4 py-2"
				>
					<Sparkles className="h-5 w-5 text-[#EE9AE5]" />
					<span className="text-sm font-medium text-white">XP буст {totalXP}</span>
				</motion.div>
			</header>

			<section className="grid gap-4 sm:grid-cols-[2fr_1fr]">
				<Card className="border-white/10 bg-white/5">
					<CardHeader className="flex flex-row items-center justify-between gap-3">
						<CardTitle className="text-lg text-white">Пульт ведущего</CardTitle>
						<Badge className="flex items-center gap-1 bg-white/10 text-xs text-white">
							<Clock className="h-4 w-4" />
							{timer}s
						</Badge>
					</CardHeader>
					<CardContent className="space-y-4">
						<Tabs value={mode} onValueChange={(value) => handleModeChange(value as UltraLessonMode)}>
							<TabsList className="grid w-full grid-cols-3 bg-white/10">
								{Object.entries(MODE_THEMES).map(([key, { label }]) => (
									<TabsTrigger
										key={key}
										value={key}
										className="data-[state=active]:bg-white data-[state=active]:text-[#070811]"
									>
										{label}
									</TabsTrigger>
								))}
							</TabsList>
							<TabsContent value="story" className="space-y-3 text-white/80">
								{storyBeats.map((beat) => (
									<motion.div
										key={beat.title}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4 }}
										className="rounded-2xl border border-white/10 bg-white/5 p-4"
									>
										<h3 className="text-white">{beat.title}</h3>
										<p className="text-sm text-white/70">{beat.body}</p>
									</motion.div>
								))}
							</TabsContent>
							<TabsContent value="challenge" className="space-y-4">
								<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
									<h3 className="text-white">Мини-челлендж</h3>
									<p className="mt-2 text-sm text-white/70">{activeChallenge?.prompt}</p>

									<div className="mt-3 flex flex-wrap items-center gap-2">
										{MINI_CHALLENGES.map((challenge) => (
											<Button
												key={challenge.id}
												variant={challenge.id === activeChallenge?.id ? "default" : "outline"}
												className={cn(
													"border-white/20 bg-white/10 text-white hover:bg-white/20",
													challenge.id === activeChallenge?.id && "bg-white text-[#070811]",
												)}
												onClick={() => setActiveChallenge(challenge)}
											>
												{challenge.title}
											</Button>
										))}
									</div>

									<div className="mt-4 rounded-xl border border-white/10 bg-[#070811]/70 p-4">
										<h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
											<Shield className="h-4 w-4" /> Anti-Drama Boost
										</h4>
										<p className="mt-2 text-xs text-white/60">{activeChallenge?.boundaryTip}</p>
									</div>
								</div>
								<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
									<h3 className="text-white">Катя реагирует</h3>
									<p className="text-sm text-white/70">
										«Если давят со всех сторон, выбирай стратегию: граница, self-talk или сигнал другу. Это тренажёр — ошибаться безопасно.»
									</p>
									<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
										<Button
											className="bg-[#F5576C] text-white hover:bg-[#F5576C]/80"
											onClick={() => handleAction("set-boundary")}
										>
											<Shield className="mr-2 h-4 w-4" /> Граница
										</Button>
										<Button
											className="bg-[#EE9AE5] text-white hover:bg-[#EE9AE5]/80"
											onClick={() => handleAction("self-talk")}
										>
											<Star className="mr-2 h-4 w-4" /> Self-talk
										</Button>
										<Button
											className="bg-[#40C9FF] text-white hover:bg-[#40C9FF]/80"
											onClick={() => handleAction("ask-for-help")}
										>
											<PartyPopper className="mr-2 h-4 w-4" /> SOS
										</Button>
									</div>
								</div>
							</TabsContent>
							<TabsContent value="reflection" className="space-y-4">
								{REFLECTION_PROMPTS.map((prompt) => (
									<motion.div
										key={prompt.id}
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										className="rounded-2xl border border-white/10 bg-white/5 p-4"
									>
										<div className="flex items-center justify-between gap-3">
											<h3 className="text-white">{prompt.question}</h3>
											<Badge className="bg-white/10 text-white">{prompt.badge}</Badge>
										</div>
										<p className="mt-1 text-xs text-white/60">{prompt.hint}</p>
										<Input
											className="mt-3 border-white/10 bg-[#070811]/70 text-white placeholder:text-white/40"
											placeholder="Расскажи свои мысли..."
											value={reflectionAnswers[prompt.id] ?? ""}
											onChange={(event) => handleReflectionChange(prompt.id, event.target.value)}
										/>
									</motion.div>
								))}
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				<Card className="border-white/10 bg-white/5">
					<CardHeader>
						<CardTitle className="text-lg text-white">Профиль стримера</CardTitle>
						<p className="text-xs text-white/60">Зрители: 1.2K • Связь стабильна</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-2xl border border-white/10 bg-[#070811]/70 p-4">
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between text-white">
									<span>@{profile.username}</span>
									<Badge className="bg-white/10 text-white">Lvl {profile.level}</Badge>
								</div>
								<Progress value={(profile.xp % 500) / 5} className="h-2" />
								<div className="flex items-center justify-between text-xs text-white/70">
									<span>Streak {profile.streak} 🔥</span>
									<span>{profile.xp} XP</span>
								</div>
							</div>
						</div>

						<motion.div
							animate={{ opacity: [0.8, 1, 0.8], scale: [0.98, 1.02, 1] }}
							transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
							className="rounded-2xl border border-white/10 bg-[#070811]/60 p-4 text-white"
						>
							<h3 className="flex items-center gap-2 text-sm font-semibold">
								<Sparkles className="h-4 w-4 text-[#EE9AE5]" /> Катя поддерживает
							</h3>
							<p className="mt-2 text-xs text-white/70">
								«Я рядом! Формула: чувство → граница → договор. Люди слышат тебя, когда ты говоришь спокойно и уверенно.»
							</p>
						</motion.div>

						<div className="space-y-2">
							<h4 className="text-xs font-semibold uppercase tracking-wide text-white/60">Суперсилы активированы</h4>
							<div className="flex flex-wrap gap-2">
								{actionsTaken.length === 0 && (
									<Badge className="bg-white/10 text-white">Выбери стратегию 💪</Badge>
								)}
								{actionsTaken.map((action) => (
									<Badge key={action} className="bg-white text-[#070811]">
										{ACTION_BADGES[action].label}
									</Badge>
								))}
							</div>
						</div>

						<div className="rounded-2xl border border-white/10 bg-[#070811]/70 p-4 text-white/80">
							<h4 className="flex items-center gap-2 text-sm font-semibold text-white/90">
								<Clock className="h-4 w-4" /> Хронометр
							</h4>
							<Progress value={timerPercent} className="mt-2 h-2" />
							<p className="mt-2 text-xs text-white/60">Когда таймер просядет до нуля — фиксируем инсайты и закрываем эфир.</p>
						</div>

						<div className="flex flex-col gap-2">
							{completionState !== "done" ? (
								<Button className="bg-white text-[#070811]" onClick={handleComplete} disabled={isSubmitting}>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<>
											<CheckCircle2 className="mr-2 h-4 w-4" /> Зафиксировать прогресс
										</>
									)}
								</Button>
							) : (
								<Button className="bg-[#1DE9B6] text-[#070811]" onClick={resetLesson}>
									<PartyPopper className="mr-2 h-4 w-4" /> Перезапустить миссию
								</Button>
							)}
							<Button variant="ghost" className="text-white/80 hover:bg-white/10" onClick={onExit}>
								Выйти в хаб
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>

			<AnimatePresence>
				{completionState === "done" && (
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.5 }}
						className="mt-2 rounded-3xl border border-[#1DE9B6]/30 bg-[#1DE9B6]/10 p-6 text-white"
					>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h3 className="text-xl font-semibold text-[#1DE9B6]">Миссия выполнена!</h3>
								<p className="mt-1 text-sm text-white/80">
									Ты зафиксировал границы, усилил эмпатию и собрал команду поддержки. Катя уже кидает конфетти! 🎉
								</p>
							</div>
							<motion.div
								initial={{ rotate: -6 }}
								animate={{ rotate: [6, -6, 6] }}
								transition={{ repeat: Infinity, duration: 6 }}
								className="rounded-2xl border-white/10 bg-white/10 px-4 py-3 text-center"
							>
								<p className="text-sm font-semibold text-white">+{totalXP} XP</p>
								<span className="text-xs text-white/60">Streak x{profile.streak}</span>
							</motion.div>
						</div>
						<div className="mt-4 grid gap-3 sm:grid-cols-3">
							{reflectionsCompleted.map((prompt) => (
								<div key={prompt.id} className="rounded-2xl border-white/10 bg-[#070811]/70 p-3">
									<p className="text-xs font-semibold uppercase tracking-wide text-[#1DE9B6]">{prompt.badge}</p>
									<p className="mt-2 text-xs text-white/70">{prompt.question}</p>
									<p className="mt-1 text-xs text-white/50">Ответ сохранён</p>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default GameLessonUltra;
