import { useEffect, useRef, useState } from 'react';

interface TouchCoords {
  x: number;
  y: number;
}

interface MobileGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minSwipeDistance?: number;
  enableTouch?: boolean;
}

export function useMobileGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  minSwipeDistance = 50,
  enableTouch = true
}: MobileGesturesOptions) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<TouchCoords | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchCoords | null>(null);

  useEffect(() => {
    if (!enableTouch) return;

    const element = elementRef.current;
    if (!element) return;

    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
      });
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;

      const distanceX = touchStart.x - touchEnd.x;
      const distanceY = touchStart.y - touchEnd.y;
      
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;
      const isUpSwipe = distanceY > minSwipeDistance;
      const isDownSwipe = distanceY < -minSwipeDistance;

      // Priorize horizontal swipes over vertical
      if (Math.abs(distanceX) > Math.abs(distanceY)) {
        if (isLeftSwipe) {
          onSwipeLeft?.();
        }
        if (isRightSwipe) {
          onSwipeRight?.();
        }
      } else {
        if (isUpSwipe) {
          onSwipeUp?.();
        }
        if (isDownSwipe) {
          onSwipeDown?.();
        }
      }
    };

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance, enableTouch]);

  return elementRef;
}