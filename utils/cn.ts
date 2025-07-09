// utils/cn.ts - Class name utilities using clsx and tailwind-merge
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with clsx and merge Tailwind classes with tailwind-merge
 * This prevents Tailwind class conflicts and ensures proper class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class names helper
 * Usage: conditionalClass('base-class', condition, 'conditional-class')
 */
export function conditionalClass(
  baseClass: string,
  condition: boolean,
  conditionalClass: string
): string {
  return cn(baseClass, condition && conditionalClass);
}

/**
 * Variant class builder
 * Usage: buildVariantClass('btn', { size: 'lg', variant: 'primary' }, variants)
 */
export function buildVariantClass<
  T extends Record<string, Record<string, string>>,
>(base: string, props: Record<string, string>, variants: T): string {
  const variantClasses = Object.entries(props).map(([key, value]) => {
    return variants[key]?.[value] || '';
  });

  return cn(base, ...variantClasses);
}
