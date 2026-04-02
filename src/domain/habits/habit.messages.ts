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

export function getMessage(ctx: MessageContext): string {
  const pool = messagePools[ctx.category];
  const template = pickRandom(pool);
  return template(ctx);
}
