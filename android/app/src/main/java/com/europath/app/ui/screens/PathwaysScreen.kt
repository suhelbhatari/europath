package com.europath.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.europath.app.data.Country
import com.europath.app.data.CountryRepository
import com.europath.app.data.Pathway
import com.europath.app.data.colorForType
import com.europath.app.data.pathwayMeta
import com.europath.app.ui.components.*
import com.europath.app.ui.theme.*

// ─────────────────────────────────────────────────────────────
// PATHWAYS SCREEN — standalone deep-linkable page
// ─────────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PathwaysScreen(
    countryId: String,
    anchor: String?,
    onBack: () -> Unit,
    onJump: (String) -> Unit
) {
    val country = CountryRepository.countries.find { it.id == countryId } ?: return
    val anchorInPR = anchor != null && country.prPathways.any { it.type == anchor }
    val anchorInCit = anchor != null && country.citizenshipPathways.any { it.type == anchor }
    var activeSection by remember {
        mutableStateOf(if (anchorInCit && !anchorInPR) "citizenship" else "pr")
    }

    Scaffold(
        containerColor = Bg,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("${country.flag} All Pathways", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text(
                            "${country.prPathways.size} PR routes · ${country.citizenshipPathways.size} citizenship routes",
                            fontSize = 11.sp, color = TextMuted
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Surface, titleContentColor = TextPrimary)
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Anchor banner
            if (anchor != null) {
                val meta = pathwayMeta(anchor)
                val color = colorForType(meta.colorHex)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(color.copy(alpha = 0.12f))
                        .border(1.dp, color.copy(alpha = 0.35f), RoundedCornerShape(0.dp))
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(meta.emoji, fontSize = 16.sp)
                        Text("Showing: ${meta.label} routes", color = color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = { onJump("") }) {
                        Text("Clear ✕", color = TextMuted, fontSize = 11.sp)
                    }
                }
            }

            // Quick-stats row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val fastestPR = country.prPathways.minOfOrNull { it.years }
                val fastestCit = country.citizenshipPathways.minOfOrNull { it.years }
                val hasHeritage = country.citizenshipPathways.any { it.type == "heritage" }
                val hasInvestment = (country.prPathways + country.citizenshipPathways).any { it.type == "investment" }
                if (fastestPR != null) StatBox("Fastest PR", formatYears(fastestPR), Green)
                if (fastestCit != null) StatBox("Fastest Citizenship", formatYears(fastestCit), Primary)
                StatBox("Ancestry Route", if (hasHeritage) "✓ Available" else "✗ None", if (hasHeritage) Green else TextMuted)
                StatBox("Investment Route", if (hasInvestment) "✓ Available" else "✗ None", if (hasInvestment) Amber else TextMuted)
                StatBox("Dual Citizenship", if (country.dualCitizenship) "✓ Allowed" else "✗ Restricted", if (country.dualCitizenship) Green else Red)
            }

            // Jump-to type chips
            val allTypes = remember(country) {
                ((country.prPathways + country.citizenshipPathways).map { it.type }).distinct()
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text("Jump to:", color = TextMuted, fontSize = 10.sp,
                    modifier = Modifier.align(Alignment.CenterVertically))
                allTypes.forEach { type ->
                    val meta = pathwayMeta(type)
                    val color = colorForType(meta.colorHex)
                    val isActive = anchor == type
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(color.copy(alpha = if (isActive) 0.25f else 0.12f))
                            .border(1.dp, color.copy(alpha = if (isActive) 1f else 0.3f), RoundedCornerShape(50))
                            .clickable { onJump(type) }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(meta.emoji, fontSize = 11.sp)
                            Text(meta.label, color = color, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Section toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("pr" to "🏠 Permanent Residency", "citizenship" to "🎖 Citizenship").forEach { (key, label) ->
                    Surface(
                        onClick = { activeSection = key },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        color = if (activeSection == key) Primary else Card,
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (activeSection == key) Primary else BorderColor)
                    ) {
                        Box(modifier = Modifier.padding(11.dp), contentAlignment = Alignment.Center) {
                            Text(label, color = if (activeSection == key) Color.White else TextSubtle,
                                fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Pathway cards list
            val pathways = if (activeSection == "pr") country.prPathways else country.citizenshipPathways
            val accent = if (activeSection == "pr") Green else Primary
            PathwaysList(
                pathways = pathways,
                accent = accent,
                activeAnchor = anchor,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────
// PATHWAYS TAB — used inside CountryDetailScreen
// ─────────────────────────────────────────────────────────────
@Composable
fun PathwaysTab(
    pathways: List<Pathway>,
    accent: Color,
    onJump: (String) -> Unit
) {
    PathwaysList(pathways = pathways, accent = accent, activeAnchor = null, modifier = Modifier.fillMaxSize())
}

@Composable
private fun PathwaysList(
    pathways: List<Pathway>,
    accent: Color,
    activeAnchor: String?,
    modifier: Modifier = Modifier
) {
    if (pathways.isEmpty()) {
        Box(modifier = modifier.padding(30.dp), contentAlignment = Alignment.Center) {
            Text("No pathway data available", color = TextMuted, fontSize = 13.sp)
        }
        return
    }
    val listState = rememberLazyListState()
    // Scroll to first highlighted item when anchor is set
    val anchorIndex = activeAnchor?.let { a -> pathways.indexOfFirst { it.type == a }.takeIf { it >= 0 } }
    LaunchedEffect(activeAnchor) {
        anchorIndex?.let { listState.animateScrollToItem(it) }
    }

    LazyColumn(
        state = listState,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = modifier
    ) {
        itemsIndexed(pathways) { idx, pathway ->
            PathwayCard(
                pathway = pathway,
                index = idx + 1,
                accent = accent,
                highlighted = activeAnchor != null && pathway.type == activeAnchor
            )
        }
    }
}

@Composable
private fun PathwayCard(
    pathway: Pathway,
    index: Int,
    accent: Color,
    highlighted: Boolean
) {
    var expanded by remember { mutableStateOf(highlighted) }
    val meta = pathwayMeta(pathway.type)
    val typeColor = colorForType(meta.colorHex)
    val isInstant = pathway.years == 0.0
    val isNA = pathway.years >= 999.0

    // Update expanded when highlight state changes
    LaunchedEffect(highlighted) { if (highlighted) expanded = true }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(13.dp))
            .background(Card)
            .border(
                width = if (highlighted) 2.dp else 1.dp,
                color = if (highlighted) typeColor else BorderColor,
                shape = RoundedCornerShape(13.dp)
            )
            .clickable { expanded = !expanded }
    ) {
        // Header row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Icon badge
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(9.dp))
                    .background(typeColor.copy(alpha = 0.18f))
                    .border(1.dp, typeColor.copy(alpha = 0.35f), RoundedCornerShape(9.dp)),
                contentAlignment = Alignment.Center
            ) { Text(meta.emoji, fontSize = 16.sp) }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(pathway.name, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    if (highlighted) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(50))
                                .background(typeColor)
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        ) { Text("LINKED", color = Color.White, fontSize = 8.sp, fontWeight = FontWeight.Black) }
                    }
                }
                Spacer(Modifier.height(3.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(typeColor.copy(alpha = 0.15f))
                        .border(1.dp, typeColor.copy(alpha = 0.25f), RoundedCornerShape(50))
                        .padding(horizontal = 7.dp, vertical = 2.dp)
                ) { Text("${meta.emoji} ${meta.label}", color = typeColor, fontSize = 9.sp, fontWeight = FontWeight.Bold) }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    when { isInstant -> "INSTANT"; isNA -> "N/A"; else -> "${formatYears(pathway.years)}" },
                    color = when { isInstant -> Amber; isNA -> TextMuted; else -> accent },
                    fontSize = if (isInstant || isNA) 10.sp else 17.sp,
                    fontWeight = FontWeight.Black
                )
                if (!isInstant && !isNA) Text("years", color = TextMuted, fontSize = 9.sp)
                Text(if (expanded) "▲" else "▼", color = TextMuted, fontSize = 13.sp)
            }
        }

        // Expanded detail
        AnimatedVisibility(visible = expanded) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Surface)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Column {
                    Text("REQUIREMENTS", color = TextMuted, fontSize = 9.sp, letterSpacing = 0.5.sp)
                    Spacer(Modifier.height(5.dp))
                    Text(pathway.requirements, color = TextPrimary, fontSize = 13.sp, lineHeight = 19.sp)
                }
                if (pathway.notes.isNotBlank()) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(typeColor.copy(alpha = 0.08f))
                            .border(1.dp, typeColor.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Text("💡 KEY NOTE", color = typeColor, fontSize = 9.sp, letterSpacing = 0.5.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(4.dp))
                        Text(pathway.notes, color = TextSubtle, fontSize = 12.sp, lineHeight = 17.sp)
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Card)
                            .border(1.dp, BorderColor, RoundedCornerShape(8.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Text("TIMELINE", color = TextMuted, fontSize = 9.sp, letterSpacing = 0.5.sp)
                        Text(
                            when { isInstant -> "Immediate / 0 years"; isNA -> "Not applicable"; else -> "${formatYears(pathway.years)} from arrival" },
                            color = if (isInstant) Amber else accent, fontSize = 12.sp, fontWeight = FontWeight.Bold
                        )
                    }
                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Card)
                            .border(1.dp, BorderColor, RoundedCornerShape(8.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Text("CATEGORY", color = TextMuted, fontSize = 9.sp, letterSpacing = 0.5.sp)
                        Text(meta.label, color = typeColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

fun formatYears(years: Double): String = if (years == years.toLong().toDouble()) "${years.toLong()}" else "$years"
