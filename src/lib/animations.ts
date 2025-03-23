
import { cn } from './utils';

export const fadeIn = (delay: number = 0) => 
  cn('animate-fade-in', {
    'animation-delay-100': delay === 1,
    'animation-delay-200': delay === 2,
    'animation-delay-300': delay === 3,
    'animation-delay-400': delay === 4,
    'animation-delay-500': delay === 5,
    'animation-delay-700': delay === 7,
    'animation-delay-1000': delay === 10,
  });

export const fadeUp = (delay: number = 0) => 
  cn('animate-fade-up', {
    'animation-delay-100': delay === 1,
    'animation-delay-200': delay === 2,
    'animation-delay-300': delay === 3,
    'animation-delay-400': delay === 4,
    'animation-delay-500': delay === 5,
    'animation-delay-700': delay === 7,
    'animation-delay-1000': delay === 10,
  });

export const scaleIn = (delay: number = 0) => 
  cn('animate-scale-in', {
    'animation-delay-100': delay === 1,
    'animation-delay-200': delay === 2,
    'animation-delay-300': delay === 3,
    'animation-delay-400': delay === 4,
    'animation-delay-500': delay === 5,
    'animation-delay-700': delay === 7,
    'animation-delay-1000': delay === 10,
  });

// Animation delays as Tailwind classes
export const animationDelay = {
  100: 'animation-delay-100',
  200: 'animation-delay-200',
  300: 'animation-delay-300',
  400: 'animation-delay-400',
  500: 'animation-delay-500',
  700: 'animation-delay-700',
  1000: 'animation-delay-1000',
};
