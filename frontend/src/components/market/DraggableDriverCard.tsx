import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MarketDriverCard } from './MarketDriverCard';
import type { DriverWithOwnership } from '@/types/marketTypes';
import type { MarketDriverCardProps } from '@/types/marketTypes';

interface DraggableDriverCardProps extends Omit<MarketDriverCardProps, 'driver'> {
  driver: DriverWithOwnership;
  id: string;
  isReserve: boolean;
}

export const DraggableDriverCard = ({ 
  id,
  driver, 
  isReserve,
  ...rest 
}: DraggableDriverCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <MarketDriverCard
        driver={driver}
        reserveDriverId={isReserve ? driver.id : undefined}
        {...rest}
      />
    </div>
  );
};
