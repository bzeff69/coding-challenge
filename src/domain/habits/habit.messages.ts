import type { MessageContext } from './habit.types';

const progressMessages = [
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Keep moving.`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Almost respectable.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget}. The bare minimum approaches.`,
  (ctx: MessageContext) => `${ctx.count} down, ${ctx.dailyTarget - ctx.count} to go. You can do math, right?`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Momentum detected.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget}. Not bad for someone who almost didn't start.`,
  (ctx: MessageContext) => `Progress: ${ctx.count}/${ctx.dailyTarget}. Technically moving forward.`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Partial credit noted.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget}. Your therapist would call this progress.`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Wow, you're really doing it. Slowly.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget}. The participation trophy is being polished.`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Bold of you to start this late.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget}. This isn't even your final form.`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. The app believes in you. No one else was asked.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget}. Your couch misses you but keep going.`,
  (ctx: MessageContext) => `${ctx.count} of ${ctx.dailyTarget}. Somewhere, a motivational poster sheds a single tear of pride.`,
];

const completeMessages = [
  (_ctx: MessageContext) => `Daily target reached. Suspiciously competent.`,
  (_ctx: MessageContext) => `Done. The universe is mildly impressed.`,
  (_ctx: MessageContext) => `Complete. Try not to let it go to your head.`,
  (ctx: MessageContext) => `${ctx.dailyTarget}/${ctx.dailyTarget}. Nailed it. Don't get used to it.`,
  (_ctx: MessageContext) => `Target hit. Your future self just exhaled.`,
  (_ctx: MessageContext) => `Finished. Gold star energy, without the star.`,
  (ctx: MessageContext) =>
    ctx.currentStreak > 3
      ? `Done. ${ctx.currentStreak}-day streak. That's almost a personality trait.`
      : `Done. A streak begins. Or continues. Hard to tell.`,
  (_ctx: MessageContext) => `Complete. You may now feel briefly superior.`,
  (_ctx: MessageContext) => `Look at you. Crushing goals like they owe you money.`,
  (_ctx: MessageContext) => `Done. Screenshot this before the motivation wears off.`,
  (_ctx: MessageContext) => `Finished. Your ancestors are confused but proud.`,
  (_ctx: MessageContext) => `Target smashed. This is your villain origin story.`,
  (ctx: MessageContext) =>
    ctx.currentStreak > 7
      ? `${ctx.currentStreak} days. At this point it's muscle memory, not willpower.`
      : `Done. Let's see if tomorrow-you shows up too.`,
  (_ctx: MessageContext) => `Complete. Go ahead, tell someone. They won't care, but you should.`,
  (_ctx: MessageContext) => `You actually did it. The algorithm didn't think you would.`,
  (_ctx: MessageContext) => `Habit complete. Main character energy detected.`,
];

const undoMessages = [
  (ctx: MessageContext) => `Back to ${ctx.count}. Commitment had a brief career.`,
  (ctx: MessageContext) => `${ctx.count}/${ctx.dailyTarget} now. The undo of shame.`,
  (_ctx: MessageContext) => `Rolled back. No judgment. Okay, some judgment.`,
  (_ctx: MessageContext) => `Undone. Your past self is disappointed.`,
  (ctx: MessageContext) => `Now at ${ctx.count}. Gravity always wins.`,
  (_ctx: MessageContext) => `Progress reversed. The app saw that.`,
  (_ctx: MessageContext) => `Undo accepted. We'll pretend this didn't happen.`,
  (_ctx: MessageContext) => `One step back. Technically still standing.`,
  (_ctx: MessageContext) => `Ctrl+Z energy. Classic.`,
  (_ctx: MessageContext) => `And just like that, history was rewritten. Poorly.`,
  (_ctx: MessageContext) => `Undone. Your future biographer will skip this part.`,
  (_ctx: MessageContext) => `Plot twist: it didn't happen. Character development deleted.`,
  (_ctx: MessageContext) => `Undo noted. The streak is taking this personally.`,
  (ctx: MessageContext) => `Back to ${ctx.count}. The app forgives but it definitely remembers.`,
  (_ctx: MessageContext) => `Reversed. Somewhere a progress bar just cried.`,
  (_ctx: MessageContext) => `Undo? In this economy? Bold choice.`,
];

const missedMessages = [
  (_ctx: MessageContext) => `Your streak expired quietly. No one was notified.`,
  (_ctx: MessageContext) => `Missed day detected. The streak has been reset to its natural state: zero.`,
  (_ctx: MessageContext) => `A day was skipped. Streaks don't forgive.`,
  (_ctx: MessageContext) => `You blinked. The streak didn't survive.`,
  (_ctx: MessageContext) => `Streak broken. It happens to the best of us. And also to you.`,
  (_ctx: MessageContext) => `Yesterday called. You didn't answer. Streak reset.`,
  (_ctx: MessageContext) => `The chain broke. But chains can be reforged. Dramatically.`,
  (_ctx: MessageContext) => `Missed it. New streak starts now. Or whenever you're ready.`,
  (_ctx: MessageContext) => `Your streak died alone. No funeral will be held.`,
  (_ctx: MessageContext) => `Streak: gone. Dignity: negotiable. Retry: available.`,
  (_ctx: MessageContext) => `You ghosted your own habit. It's filing for emotional damages.`,
  (_ctx: MessageContext) => `The streak is gone. It wanted you to know it didn't go gently.`,
  (_ctx: MessageContext) => `Day missed. Your habit waited up all night. It's fine. It's totally fine.`,
  (_ctx: MessageContext) => `Streak obliterated. The leaderboard sends its condolences.`,
  (_ctx: MessageContext) => `Gone. Vanished. Like your motivation, apparently.`,
  (_ctx: MessageContext) => `Missed day. The app isn't angry, just disappointed. Actually no, it's angry.`,
];

const messagePools = {
  progress: progressMessages,
  complete: completeMessages,
  undo: undoMessages,
  missed: missedMessages,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const streakMilestones: Record<number, string> = {
  7: "A WHOLE WEEK?! Who ARE you?!",
  14: "Two weeks strong. You're scaring the other habits.",
  21: "21 days. Scientists say it's a habit now. The app says prove it.",
  30: "30-day streak. That's not discipline, that's an obsession. Respect.",
  50: "50 DAYS. You're no longer a person, you're a machine.",
  100: "100 DAYS. Legend. Icon. Possibly unhinged. We salute you.",
  365: "A FULL YEAR. The app is not worthy. We bow.",
};

export function getMessage(ctx: MessageContext): string {
  // Check for streak milestones on completion
  if (ctx.category === 'complete' && streakMilestones[ctx.currentStreak]) {
    return streakMilestones[ctx.currentStreak];
  }
  const pool = messagePools[ctx.category];
  const template = pickRandom(pool);
  return template(ctx);
}
