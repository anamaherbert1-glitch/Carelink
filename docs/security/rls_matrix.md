# Matrice de Sécurité & Droits d’Accès (RLS) — CareLink

Toutes les tables bénéficient de `ROW LEVEL SECURITY` (RLS). Ce document décrit la matrice des droits d'accès par rôle utilisateur.

## Règles d'Or de Sécurité

1. **Pas d'accès libre entre médecins** : Un médecin ne dispose d'aucun accès universel aux dossiers des patients.
2. **Cloisonnement officinal étanche** : Une pharmacie ne peut en aucun cas inspecter les stocks, marges, volumes de vente ou mouvements d'une autre pharmacie.
3. **Impossibilité de transfert passif d'ordonnance** : Une ordonnance n'est jamais diffusée publiquement sur le réseau de pharmacies. Seul le patient choisit explicitement et individuellement l'officine destinataire.
4. **Agrément obligatoire des praticiens** : Aucun médecin non vérifié ne peut publier de créneaux ou émettre d'ordonnances opposables.
5. **Vérification d'officine** : Seules les pharmacies officiellement vérifiées apparaissent dans les résultats publics du marketplace multi-officines.
