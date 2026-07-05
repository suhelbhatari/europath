package com.europath.app.ui.theme

import androidx.compose.ui.graphics.Color

// Matches the EuroPath web app's dark theme palette
val Bg = Color(0xFF080E1A)
val Surface = Color(0xFF0F1A2E)
val Card = Color(0xFF131F35)
val BorderColor = Color(0xFF1E3050)

val TextPrimary = Color(0xFFE2E8F0)
val TextMuted = Color(0xFF64748B)
val TextSubtle = Color(0xFF94A3B8)

val Primary = Color(0xFF6366F1)
val PrimaryGlow = Color(0x306366F1)

val Green = Color(0xFF22C55E)
val Blue = Color(0xFF0EA5E9)
val Amber = Color(0xFFF59E0B)
val Red = Color(0xFFEF4444)
val Purple = Color(0xFFA855F7)
val Cyan = Color(0xFF06B6D4)

fun colorForType(hex: String): Color {
    return try { Color(android.graphics.Color.parseColor(hex)) } catch (e: Exception) { TextSubtle }
}
