package com.europath.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import android.app.Activity

private val EuroPathDarkScheme = darkColorScheme(
    primary = Primary,
    onPrimary = Color_White,
    secondary = Blue,
    background = Bg,
    onBackground = TextPrimary,
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = Card,
    onSurfaceVariant = TextSubtle,
    error = Red,
    outline = BorderColor
)

@Composable
fun EuroPathTheme(content: @Composable () -> Unit) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        val ctx = view.context
        if (ctx is Activity) {
            val window = ctx.window
            window.statusBarColor = Bg.toArgb()
            window.navigationBarColor = Bg.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }
    MaterialTheme(
        colorScheme = EuroPathDarkScheme,
        typography = EuroPathTypography,
        content = content
    )
}

// Re-export a plain white for legibility in the scheme builder above
private val Color_White = androidx.compose.ui.graphics.Color(0xFFFFFFFF)
