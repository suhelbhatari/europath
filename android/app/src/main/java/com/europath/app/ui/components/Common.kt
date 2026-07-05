package com.europath.app.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.europath.app.ui.theme.*

@Composable
fun Chip(text: String, color: Color = Primary, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(color.copy(alpha = 0.15f))
            .border(1.dp, color.copy(alpha = 0.35f), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 3.dp)
    ) {
        Text(text, color = color, fontSize = 10.sp, fontWeight = MaterialTheme.typography.labelMedium.fontWeight)
    }
}

@Composable
fun ScoreBar(value: Double, max: Double = 10.0, color: Color = Primary, modifier: Modifier = Modifier) {
    val targetFraction = (value / max).toFloat().coerceIn(0f, 1f)
    val animated by animateFloatAsState(targetValue = targetFraction, animationSpec = tween(600), label = "scoreBar")
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(5.dp)
            .clip(RoundedCornerShape(50))
            .background(Color(0xFF1A2840))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(animated)
                .fillMaxHeight()
                .clip(RoundedCornerShape(50))
                .background(color)
        )
    }
}

@Composable
fun StatBox(label: String, value: String, color: Color = TextPrimary, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Card)
            .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Text(
            label.uppercase(),
            color = TextMuted,
            fontSize = 9.sp,
            letterSpacing = 0.5.sp
        )
        Spacer(Modifier.height(4.dp))
        Text(value, color = color, fontSize = 15.sp, fontWeight = MaterialTheme.typography.titleMedium.fontWeight)
    }
}

@Composable
fun SectionLabel(text: String, modifier: Modifier = Modifier) {
    Text(
        text.uppercase(),
        color = TextMuted,
        fontSize = 10.sp,
        letterSpacing = 0.6.sp,
        modifier = modifier.padding(bottom = 6.dp)
    )
}

@Composable
fun MetricRow(label: String, value: Double, color: Color, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(label, color = TextSubtle, fontSize = 13.sp)
            Text("$value/10", color = color, fontWeight = MaterialTheme.typography.titleSmall.fontWeight, fontSize = 13.sp)
        }
        Spacer(Modifier.height(8.dp))
        ScoreBar(value = value, color = color)
    }
}

@Composable
fun PillButton(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    androidx.compose.material3.Surface(
        onClick = onClick,
        shape = RoundedCornerShape(50),
        color = if (selected) Primary else Surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, if (selected) Primary else BorderColor),
        modifier = modifier
    ) {
        Text(
            text,
            color = if (selected) Color.White else TextSubtle,
            fontSize = 11.sp,
            fontWeight = MaterialTheme.typography.labelMedium.fontWeight,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
        )
    }
}

@Composable
fun Dot(color: Color, size: androidx.compose.ui.unit.Dp = 8.dp) {
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(color)
    )
}
