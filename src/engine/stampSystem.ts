import { StationStampData, CandyType, StampCandyCount, LoyaltyBonusResult } from '@/types';
import { STATIONS, GAME_CONFIG } from '@/data/config';

export function createEmptyStampData(): StationStampData {
  return { consecutiveCompletions: 0, stampCount: 0 };
}

export function updateStampOnDispatch(
  stationStamps: Record<string, StationStampData>,
  stationId: string,
  dispatchSuccess: boolean
): Record<string, StationStampData> {
  const newStamps = { ...stationStamps };
  const current = newStamps[stationId] || createEmptyStampData();

  if (dispatchSuccess) {
    const newConsecutive = current.consecutiveCompletions + 1;
    let newStampCount = current.stampCount;

    if (newConsecutive >= GAME_CONFIG.STAMP_CONSECUTIVE_THRESHOLD) {
      newStampCount += 1;
    }

    newStamps[stationId] = {
      consecutiveCompletions: newConsecutive,
      stampCount: newStampCount,
    };
  } else {
    newStamps[stationId] = {
      ...current,
      consecutiveCompletions: 0,
    };
  }

  return newStamps;
}

export function getStampStationForSpawn(
  stationStamps: Record<string, StationStampData>
): string | null {
  const stationsWithStamps = Object.entries(stationStamps)
    .filter(([, data]) => data.stampCount > 0)
    .map(([stationId, data]) => ({ stationId, weight: data.stampCount }));

  if (stationsWithStamps.length === 0) return null;
  if (Math.random() >= GAME_CONFIG.STAMP_CANDY_SPAWN_RATE) return null;

  const totalWeight = stationsWithStamps.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const station of stationsWithStamps) {
    random -= station.weight;
    if (random <= 0) {
      return station.stationId;
    }
  }

  return stationsWithStamps[0].stationId;
}

export function calculateStampCandyCounts(
  candyCounts: Record<CandyType, number>,
  stampCandyInfo: Record<CandyType, StampCandyCount>,
  currentStationId: string
): Record<CandyType, number> {
  const adjustedCounts: Record<string, number> = {};

  for (const candyType of Object.keys(candyCounts) as CandyType[]) {
    const baseCount = candyCounts[candyType];
    const stampInfo = stampCandyInfo[candyType];

    if (stampInfo && stampInfo.stampCandyCounts[currentStationId]) {
      const stampForCurrentStation = stampInfo.stampCandyCounts[currentStationId];
      const regularCount = baseCount - stampInfo.totalCount;
      const bonusCount = stampForCurrentStation * GAME_CONFIG.STAMP_CANDY_PRIORITY_BONUS;
      const otherStampCount = stampInfo.totalCount - stampForCurrentStation;
      adjustedCounts[candyType] = regularCount + bonusCount + otherStampCount;
    } else {
      adjustedCounts[candyType] = baseCount;
    }
  }

  return adjustedCounts as Record<CandyType, number>;
}

export function checkLoyaltyBonus(
  stationStamps: Record<string, StationStampData>,
  stampCandyInfo: Record<CandyType, StampCandyCount>,
  currentStationId: string
): LoyaltyBonusResult | null {
  const stampData = stationStamps[currentStationId];
  if (!stampData || stampData.stampCount <= 0) return null;

  let totalStampsForCurrentStation = 0;
  for (const info of Object.values(stampCandyInfo)) {
    if (info.stampCandyCounts[currentStationId]) {
      totalStampsForCurrentStation += info.stampCandyCounts[currentStationId];
    }
  }

  if (totalStampsForCurrentStation >= GAME_CONFIG.LOYALTY_BONUS_THRESHOLD) {
    const station = STATIONS.find(s => s.id === currentStationId);
    return {
      stationId: currentStationId,
      stationName: station?.name || currentStationId,
      stampCount: totalStampsForCurrentStation,
      bonusReward: GAME_CONFIG.LOYALTY_BONUS_REWARD * Math.floor(totalStampsForCurrentStation / GAME_CONFIG.LOYALTY_BONUS_THRESHOLD),
      bonusReputation: GAME_CONFIG.LOYALTY_BONUS_REPUTATION * Math.floor(totalStampsForCurrentStation / GAME_CONFIG.LOYALTY_BONUS_THRESHOLD),
    };
  }

  return null;
}

export function getStationStampProgress(
  stationStamps: Record<string, StationStampData>,
  stationId: string
): { consecutive: number; required: number; stampCount: number } {
  const data = stationStamps[stationId] || createEmptyStampData();
  return {
    consecutive: data.consecutiveCompletions,
    required: GAME_CONFIG.STAMP_CONSECUTIVE_THRESHOLD,
    stampCount: data.stampCount,
  };
}
