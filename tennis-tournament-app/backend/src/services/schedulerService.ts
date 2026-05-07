import prisma from '../lib/prisma';

/**
 * Marks tournaments as FINISHED when their endDate has passed
 * and they are still in an active state.
 */
export async function autoFinishExpiredTournaments(): Promise<void> {
  const now = new Date();
  const expired = await prisma.tournament.findMany({
    where: {
      endDate: { lte: now },
      status: { in: ['OPEN', 'FULL', 'IN_PROGRESS'] },
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  if (expired.length === 0) return;

  await prisma.tournament.updateMany({
    where: { id: { in: expired.map((t) => t.id) } },
    data: { status: 'FINISHED' },
  });

  console.log(`[scheduler] Auto-finished ${expired.length} tournament(s):`, expired.map((t) => t.name).join(', '));
}
