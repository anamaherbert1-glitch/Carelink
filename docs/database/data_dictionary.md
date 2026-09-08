# Dictionnaire de Données — Schéma CareLink (PostgreSQL / Supabase)

Ce document récapitule les 28 tables du schéma de données centralisé de CareLink.

## 1. Identités & Rôles
| Table | Description | Clé Primaire |
| :--- | :--- | :--- |
| **`profiles`** | Profil de base utilisateur | `id` (UUID) |
| **`patient_profiles`** | Données personnelles & d'urgence du patient | `id` (UUID) |
| **`doctor_profiles`** | Profil professionnel, spécialité, licence et tarifs | `id` (UUID) |
| **`pharmacies`** | Données d'officine (coordonnées GPS, quartier, horaires) | `id` (UUID) |
| **`pharmacy_staff`** | Affiliation des pharmaciens et préparateurs aux officines | `id` (UUID) |

## Fonctions transactionnelles et sécurité
Les fonctions sensibles sont exécutées côté PostgreSQL avec contrôles de rôle, de propriété et/ou de consentement selon le cas. Les opérations critiques de réservation et de stock sont transactionnelles.
