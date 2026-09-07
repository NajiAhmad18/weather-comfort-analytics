export interface ComfortCategory {
  label: string;
  className: string;
}

export function getComfortCategory(score: number): ComfortCategory {
  if (score >= 90) {
    return { label: 'Excellent', className: 'badge-excellent' };
  }
  if (score >= 75) {
    return { label: 'Very Comfortable', className: 'badge-comfortable' };
  }
  if (score >= 60) {
    return { label: 'Comfortable', className: 'badge-comfortable' };
  }
  if (score >= 40) {
    return { label: 'Moderate', className: 'badge-moderate' };
  }
  return { label: 'Low Comfort', className: 'badge-low' };
}

export function formatWeatherDescription(description: string): string {
  if (!description) return '';
  return description.charAt(0).toUpperCase() + description.slice(1);
}
