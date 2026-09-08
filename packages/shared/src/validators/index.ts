export interface ValidationResult<T> { isValid: boolean; data?: T; errors: Record<string, string>; }

export function validateEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }

export function validatePassword(password: string) {
  if (password.length < 8) return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
  return { isValid: true };
}

export interface PatientSignupPayload { email: string; password: string; firstName: string; lastName: string; phone?: string; }
export function validatePatientSignup(input: Partial<PatientSignupPayload>): ValidationResult<PatientSignupPayload> {
  const errors: Record<string, string> = {};
  if (!input.email || !validateEmail(input.email)) errors.email = 'Adresse email invalide.';
  if (!input.password || !validatePassword(input.password).isValid) errors.password = 'Mot de passe invalide.';
  if (!input.firstName?.trim()) errors.firstName = 'Le prénom est requis.';
  if (!input.lastName?.trim()) errors.lastName = 'Le nom est requis.';
  return { isValid: Object.keys(errors).length === 0, data: Object.keys(errors).length ? undefined : input as PatientSignupPayload, errors };
}

export interface DoctorSignupPayload extends PatientSignupPayload { licenseNumber: string; specialty: string; }
export function validateDoctorSignup(input: Partial<DoctorSignupPayload>): ValidationResult<DoctorSignupPayload> {
  const base = validatePatientSignup(input);
  const errors = { ...base.errors };
  if (!input.licenseNumber?.trim()) errors.licenseNumber = 'Le numéro de licence est requis.';
  if (!input.specialty?.trim()) errors.specialty = 'La spécialité est requise.';
  return { isValid: Object.keys(errors).length === 0, data: Object.keys(errors).length ? undefined : input as DoctorSignupPayload, errors };
}

export interface PrescriptionCreationPayload { patientId: string; doctorId: string; items: Array<Record<string, unknown>>; instructions?: string; }
export function validatePrescriptionCreation(input: Partial<PrescriptionCreationPayload>): ValidationResult<PrescriptionCreationPayload> {
  const errors: Record<string, string> = {};
  if (!input.patientId) errors.patientId = 'Le patient est requis.';
  if (!input.doctorId) errors.doctorId = 'Le médecin est requis.';
  if (!input.items?.length) errors.items = 'Au moins un médicament est requis.';
  return { isValid: Object.keys(errors).length === 0, data: Object.keys(errors).length ? undefined : input as PrescriptionCreationPayload, errors };
}
