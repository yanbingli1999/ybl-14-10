import { Carriage } from '@/types';
import { CANDY_CONFIG, STATIONS } from '@/data/config';
import { getLoadPercentage } from '@/engine/loadingSystem';

interface CarriageCardProps {
  carriage: Carriage;
  stampStationId?: string | null;
}

export default function CarriageCard({ carriage, stampStationId }: CarriageCardProps) {
  const config = CANDY_CONFIG[carriage.candyType];
  const loadPercent = getLoadPercentage(carriage);
  const isFull = loadPercent >= 100;
  const stampStation = stampStationId
    ? STATIONS.find(s => s.id === stampStationId)
    : null;

  return (
    <div
      className="relative flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-gray-100 to-gray-200 shadow-md border-2 border-gray-300 min-w-[70px] sm:min-w-[80px]"
      style={{
        borderColor: stampStation
          ? stampStation.themeColor + '80'
          : config.color + '40',
      }}
    >
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-400"
        style={{ backgroundColor: config.color }}
      />
      <div
        className="absolute -top-1 left-1/4 -translate-x-1/2 w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <div
        className="absolute -top-1 right-1/4 translate-x-1/2 w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />

      <div className="text-2xl sm:text-3xl mb-1">{config.emoji}</div>

      <div className="text-xs font-bold text-gray-700 mb-1">
        {carriage.currentLoad}/{carriage.capacity}
      </div>

      <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(loadPercent, 100)}%`,
            backgroundColor: stampStation ? stampStation.themeColor : config.color,
            boxShadow: isFull ? `0 0 8px ${stampStation ? stampStation.themeColor : config.color}` : 'none',
          }}
        />
      </div>

      {isFull && (
        <div className="absolute -top-2 -right-2 text-lg animate-bounce">✨</div>
      )}

      {stampStation && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow-sm border border-white"
          style={{ backgroundColor: stampStation.themeColor }}
          title={stampStation.name + '印章糖'}
        >
          📮
        </div>
      )}
    </div>
  );
}
