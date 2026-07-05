package com.europath.app.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.europath.app.data.Country
import com.europath.app.data.CountryRepository
import com.europath.app.ui.components.Chip
import com.europath.app.ui.components.ScoreBar
import com.europath.app.ui.theme.*

@Composable
fun CompareScreen(
    selectedIds: List<String>,
    onRemove: (String) -> Unit,
    onCountryClick: (Country) -> Unit,
    onGoToExplorer: () -> Unit
) {
    val countries = remember(selectedIds) {
        selectedIds.mapNotNull { id -> CountryRepository.countries.find { it.id == id } }
    }

    if (countries.size < 2) {
        Box(modifier = Modifier.fillMaxSize().background(Bg), contentAlignment = Alignment.Center) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.padding(32.dp)
            ) {
                Text("⚖️", fontSize = 52.sp)
                Text("Select Countries to Compare",
                    color = TextSubtle, fontSize = 18.sp,
                    fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                Text(
                    "Go to the Explorer, open any country card, and tap \"+ Compare\" to add up to 4 countries.",
                    color = TextMuted, fontSize = 13.sp,
                    textAlign = TextAlign.Center, lineHeight = 18.sp
                )
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = onGoToExplorer,
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) { Text("Go to Explorer →", fontWeight = FontWeight.Bold) }
            }
        }
        return
    }

    val hScroll = rememberScrollState()

    Column(modifier = Modifier.fillMaxSize().background(Bg)) {
        // Title bar
        Column(
            modifier = Modifier.fillMaxWidth()
                .background(Surface)
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Text("Country Comparison", color = TextPrimary,
                fontSize = 20.sp, fontWeight = FontWeight.Black)
            Text("⭐ = best in class · ${countries.size} countries selected",
                color = TextMuted, fontSize = 12.sp)
        }
        HorizontalDivider(color = BorderColor, thickness = 1.dp)

        // Fixed country header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Surface)
                .horizontalScroll(hScroll)
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Spacer(Modifier.width(130.dp))
            countries.forEach { c ->
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.width(130.dp)
                ) {
                    Text(c.flag, fontSize = 28.sp)
                    Text(c.name, color = TextPrimary, fontSize = 13.sp,
                        fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        TextButton(
                            onClick = { onCountryClick(c) },
                            colors = ButtonDefaults.textButtonColors(contentColor = Primary),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                        ) { Text("Details", fontSize = 10.sp, fontWeight = FontWeight.Bold) }
                        TextButton(
                            onClick = { onRemove(c.id) },
                            colors = ButtonDefaults.textButtonColors(contentColor = TextMuted),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                        ) { Text("Remove", fontSize = 10.sp) }
                    }
                }
            }
        }
        HorizontalDivider(color = BorderColor, thickness = 1.dp)

        // Scrollable data rows
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            // Section: Membership
            item { SectionHeader("Membership") }
            item {
                DataRow("EU Member", countries, hScroll) { c ->
                    if (c.eu) Chip("Yes", Primary) else Chip("No", TextMuted)
                }
            }
            item {
                DataRow("Schengen Area", countries, hScroll) { c ->
                    if (c.schengen) Chip("Yes", Blue) else Chip("No", TextMuted)
                }
            }

            // Section: Immigration timelines
            item { SectionHeader("Immigration") }
            item {
                val best = countries.filter { it.prYears < 999 }.minOfOrNull { it.prYears }
                DataRow("PR Eligibility (yrs)", countries, hScroll) { c ->
                    val isBest = c.prYears == best && c.prYears < 999
                    NumericCell(if (c.prYears >= 999) "N/A" else "${c.prYears}", isBest)
                }
            }
            item {
                val best = countries.filter { it.citizenshipYears < 999 }.minOfOrNull { it.citizenshipYears }
                DataRow("Citizenship (yrs)", countries, hScroll) { c ->
                    val isBest = c.citizenshipYears == best && c.citizenshipYears < 999
                    NumericCell(if (c.citizenshipYears >= 999) "N/A" else "${c.citizenshipYears}", isBest)
                }
            }
            item {
                DataRow("Dual Citizenship", countries, hScroll) { c ->
                    if (c.dualCitizenship) Chip("✓ Allowed", Green) else Chip("✗ Restricted", Red)
                }
            }
            item {
                DataRow("Digital Nomad Visa", countries, hScroll) { c ->
                    if (c.digitalNomad) Chip("Available", Green) else Chip("None", TextMuted)
                }
            }
            item {
                val best = countries.maxOfOrNull { it.prPathways.size }
                DataRow("PR Routes #", countries, hScroll) { c ->
                    NumericCell("${c.prPathways.size}", c.prPathways.size == best && best != null)
                }
            }
            item {
                val best = countries.maxOfOrNull { it.citizenshipPathways.size }
                DataRow("Citizenship Routes #", countries, hScroll) { c ->
                    NumericCell("${c.citizenshipPathways.size}", c.citizenshipPathways.size == best && best != null)
                }
            }
            item {
                DataRow("Ancestry Route", countries, hScroll) { c ->
                    if (c.citizenshipPathways.any { it.type == "heritage" })
                        Chip("✓ Yes", Green) else Chip("No", TextMuted)
                }
            }
            item {
                DataRow("Investment Route", countries, hScroll) { c ->
                    if ((c.prPathways + c.citizenshipPathways).any { it.type == "investment" })
                        Chip("✓ Yes", Amber) else Chip("No", TextMuted)
                }
            }

            // Section: Economy
            item { SectionHeader("Economy") }
            item {
                DataRow("Avg Salary", countries, hScroll) { c ->
                    Text(c.avgSalary, color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            item {
                DataRow("Cost of Living", countries, hScroll) { c ->
                    Text(c.costOfLiving, color = TextPrimary, fontSize = 12.sp)
                }
            }
            item {
                DataRow("Tax Rate", countries, hScroll) { c ->
                    Text(c.taxRate, color = Amber, fontSize = 11.sp)
                }
            }

            // Section: Quality of Life scores
            item { SectionHeader("Quality of Life") }
            listOf(
                "Safety" to { c: Country -> c.safety },
                "Healthcare" to { c: Country -> c.healthcare },
                "Education" to { c: Country -> c.education },
                "Startup Scene" to { c: Country -> c.startupScore }
            ).forEach { (label, getter) ->
                item {
                    val best = countries.maxOfOrNull { getter(it) }
                    DataRow(label, countries, hScroll) { c ->
                        val isBest = getter(c) == best
                        Column(modifier = Modifier.width(100.dp)) {
                            Text(
                                "${getter(c)}/10",
                                color = if (isBest) Green else TextPrimary,
                                fontSize = 13.sp, fontWeight = FontWeight.Bold
                            )
                            if (isBest) Text("⭐ Best", color = Green, fontSize = 9.sp)
                            Spacer(Modifier.height(4.dp))
                            ScoreBar(getter(c), color = if (isBest) Green else Blue, modifier = Modifier.width(90.dp))
                        }
                    }
                }
            }

            // Section: Passport
            item { SectionHeader("Passport") }
            item {
                val best = countries.minOfOrNull { it.passportRank }
                DataRow("Passport Rank (#)", countries, hScroll) { c ->
                    NumericCell("#${c.passportRank}", c.passportRank == best)
                }
            }
            item {
                DataRow("Languages", countries, hScroll) { c ->
                    Text(c.languages.joinToString(", "), color = TextMuted, fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        title.uppercase(),
        color = TextMuted,
        fontSize = 10.sp,
        letterSpacing = 0.6.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .fillMaxWidth()
            .background(Surface)
            .padding(horizontal = 16.dp, vertical = 10.dp)
    )
}

@Composable
private fun DataRow(
    label: String,
    countries: List<Country>,
    hScroll: ScrollState,
    content: @Composable (Country) -> Unit
) {
    HorizontalDivider(color = BorderColor, thickness = 0.5.dp)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(hScroll)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            label, color = TextSubtle, fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.width(130.dp)
        )
        countries.forEach { c ->
            Box(modifier = Modifier.width(130.dp), contentAlignment = Alignment.Center) {
                content(c)
            }
        }
    }
}

@Composable
private fun NumericCell(value: String, isBest: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = if (isBest) Green else TextPrimary,
            fontSize = 15.sp, fontWeight = FontWeight.Bold)
        if (isBest) Text("⭐ Best", color = Green, fontSize = 9.sp)
    }
}
