package com.europath.app.data

/**
 * A single immigration route (either toward Permanent Residency or Citizenship).
 * `years` is a Double because some fast-track routes use fractional years (e.g. 2.5).
 * A value of 0.0 means "instant / no minimum wait", 999.0 means "not applicable".
 */
data class Pathway(
    val name: String,
    val years: Double,
    val type: String,
    val requirements: String,
    val notes: String
)

data class Country(
    val id: String,
    val name: String,
    val flag: String,
    val capital: String,
    val population: String,
    val gdp: String,
    val currency: String,
    val languages: List<String>,
    val eu: Boolean,
    val schengen: Boolean,
    val passportRank: Int,
    val avgSalary: String,
    val costOfLiving: String,
    val climate: String,
    val prYears: Int,
    val citizenshipYears: Int,
    val dualCitizenship: Boolean,
    val taxRate: String,
    val healthcare: Double,
    val safety: Double,
    val education: Double,
    val digitalNomad: Boolean,
    val startupScore: Double,
    val familyFriendly: Double,
    val retirementFriendly: Double,
    val visas: List<String>,
    val pros: List<String>,
    val cons: List<String>,
    val prPathways: List<Pathway>,
    val citizenshipPathways: List<Pathway>
) {
    val prYearsLabel: String get() = if (prYears >= 999) "N/A" else "$prYears yrs"
    val citizenshipYearsLabel: String get() = if (citizenshipYears >= 999) "N/A" else "$citizenshipYears yrs"
}

/** Metadata describing how each pathway "type" should be labeled and colored in the UI. */
data class PathwayTypeMeta(val label: String, val emoji: String, val colorHex: String)

val PATHWAY_TYPE_META: Map<String, PathwayTypeMeta> = mapOf(
    "residence" to PathwayTypeMeta("Residence", "🏠", "#6366F1"),
    "skilled" to PathwayTypeMeta("Skilled Worker", "💼", "#0EA5E9"),
    "business" to PathwayTypeMeta("Business/Entrepreneur", "🏢", "#F59E0B"),
    "investment" to PathwayTypeMeta("Investment", "💰", "#22C55E"),
    "family" to PathwayTypeMeta("Family", "👨‍👩‍👧", "#A855F7"),
    "heritage" to PathwayTypeMeta("Descent/Heritage", "🌳", "#EF4444"),
    "eu" to PathwayTypeMeta("EU/EEA Rights", "🇪🇺", "#0EA5E9"),
    "humanitarian" to PathwayTypeMeta("Humanitarian", "🕊️", "#06B6D4"),
    "birthright" to PathwayTypeMeta("Birthright", "👶", "#22C55E"),
    "special" to PathwayTypeMeta("Special/Discretionary", "⭐", "#F59E0B"),
    "adoption" to PathwayTypeMeta("Adoption", "❤️", "#A855F7"),
    "treaty" to PathwayTypeMeta("Treaty/Agreement", "🤝", "#06B6D4"),
    "integration" to PathwayTypeMeta("Exceptional Integration", "🏆", "#F59E0B"),
    "passive" to PathwayTypeMeta("Passive Income", "💵", "#22C55E"),
    "digital" to PathwayTypeMeta("Digital Nomad", "💻", "#6366F1"),
    "wealth" to PathwayTypeMeta("Wealth-Based", "💎", "#F59E0B"),
    "regularization" to PathwayTypeMeta("Regularization", "📋", "#94A3B8"),
    "research" to PathwayTypeMeta("Research/Academic", "🔬", "#0EA5E9")
)

fun pathwayMeta(type: String): PathwayTypeMeta =
    PATHWAY_TYPE_META[type] ?: PathwayTypeMeta(type.replaceFirstChar { it.uppercase() }, "📋", "#94A3B8")
