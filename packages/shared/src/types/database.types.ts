/**
 * Typed Supabase schema contract for CareLink.
 * The concrete PostgreSQL schema is enforced by the Supabase migrations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = 'patient' | 'doctor' | 'pharmacy_admin' | 'pharmacy_staff' | 'platform_admin';
export type GenderType = 'male' | 'female' | 'other' | 'unspecified';
export type BloodGroupType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
export type DoctorVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type AccessLevelType = 'read_only' | 'read_write' | 'full';
export type AccessStatusType = 'active' | 'revoked' | 'expired';
export type SlotStatusType = 'available' | 'booked' | 'blocked' | 'cancelled';
export type ConsultationModeType = 'in_person' | 'teleconsultation' | 'home_visit';
export type AppointmentStatusType = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'transferred';
export type ConsultationStatusType = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type PrescriptionStatusType = 'active' | 'partially_dispensed' | 'dispensed' | 'expired' | 'cancelled';
export type TransferStatusType = 'pending' | 'accepted' | 'rejected' | 'dispensing' | 'completed' | 'cancelled';
export type StockMovementType = 'entry' | 'sale' | 'adjustment' | 'reservation' | 'release_reservation' | 'return' | 'loss' | 'expiry';
export type OrderStatusType = 'pending' | 'confirmed' | 'processing' | 'partially_fulfilled' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';
export type InsuranceFormFieldType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'signature' | 'file' | 'currency';
export type InsuranceFormVersionStatus = 'draft' | 'published' | 'archived';
export type InsuranceFormSubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'cancelled';
export type FulfillmentStatusType = 'pending' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'completed' | 'rejected' | 'cancelled';
export type DeliveryModeType = 'pickup' | 'standard_delivery' | 'express_delivery';
export type PaymentMethodType = 'tmoney' | 'yas' | 'moov_money' | 'gozem' | 'card' | 'paypal' | 'cash_on_delivery' | 'cash_in_person';
export type PaymentStatusType = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
export type ClaimStatusType = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
export type NotificationType = 'appointment' | 'prescription' | 'order' | 'stock' | 'access_request' | 'system';

type TableDef = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships: any[];
};

type FunctionDef = { Args: Record<string, any>; Returns: any };

export interface Database {
  public: {
    Tables: Record<string, TableDef>;
    Views: Record<string, TableDef>;
    Functions: Record<string, FunctionDef>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, any>>;
  };
}
