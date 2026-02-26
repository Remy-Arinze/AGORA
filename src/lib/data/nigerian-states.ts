/**
 * Nigerian states (36 + FCT) for dropdowns.
 * Reusable across student admission, profile, etc.
 */
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

/**
 * Common nationalities for dropdown (optional; can allow free text elsewhere).
 */
export const COMMON_NATIONALITIES = [
  'Nigerian', 'Ghanaian', 'Kenyan', 'South African', 'Egyptian', 'Ethiopian',
  'Tanzanian', 'Ugandan', 'British', 'American', 'Indian', 'Canadian', 'Other',
] as const;
