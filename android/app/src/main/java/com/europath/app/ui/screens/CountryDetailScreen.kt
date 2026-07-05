package com.europath.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.europath.app.data.Country
import com.europath.app.data.pathwayMeta
import com.europath.app.ui.components.*
import com.europath.app.ui.theme.*

private enum class DetailTab(val label: String) {
    OVERVIEW("Overview"), VISAS("Visa Types"), PR("PR Pathways"),
    CITIZENSHIP("Citizenship"), PROSCONS("Pros & Cons"), TIMELINE("Timeline")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryDetailScreen(
    country: Country,
    isComparing: Boolean,
    onBack: () -> Unit,
    onCompareToggle: () -> Unit,
    onPathwaysClick: (anchorType: String?) -> Unit
) {
    var tab by remember { mutableStateOf(DetailTab.OVERVIEW) }

    Scaffold(
        containerColor = Bg,
        topBar = {
            TopAppBar(
                title = { Text("${country.flag} ${country.name}", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
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
            // Hero card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Surface, Card)))
                    .padding(20.dp)
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (country.eu) Chip("EU Member", Primary)
                    if (country.schengen) Chip("Schengen", Blue)
                    if (country.digitalNomad) Chip("Digital Nomad", Green)
                    if (country.dualCitizenship) Chip("Dual Citizenship ✓", Amber)
                }
                Spacer(Modifier.height(12.dp))
                Text(country.capital + " · " + country.population + " · " + country.currency, color = TextMuted, fontSize = 12.sp)
                Spacer(Modifier.height(14.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())
                ) {
                    StatBox("PR Eligibility", country.prYearsLabel, Green)
                    StatBox("Citizenship", country.citizenshipYearsLabel, Primary)
                    StatBox("Avg Salary", country.avgSalary, TextPrimary)
                    StatBox("Passport Rank", "#${country.passportRank}", Amber)
                }
                Spacer(Modifier.height(14.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { onPathwaysClick(null) },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary)
                    ) { Text("🛣 All Pathways Detail", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    OutlinedButton(
                        onClick = onCompareToggle,
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (isComparing) PrimaryGlow else androidx.compose.ui.graphics.Color.Transparent,
                            contentColor = Primary
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Primary)
                    ) { Text(if (isComparing) "✓ Comparing" else "+ Add to Compare", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                }
            }

            // Tab row
            ScrollableTabRow(
                selectedTabIndex = tab.ordinal,
                containerColor = Bg,
                contentColor = Primary,
                edgePadding = 16.dp,
                divider = {}
            ) {
                DetailTab.values().forEach { t ->
                    Tab(
                        selected = tab == t,
                        onClick = { tab = t },
                        text = { Text(t.label, fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                        selectedContentColor = Primary,
                        unselectedContentColor = TextSubtle
                    )
                }
            }
            HorizontalDivider(color = BorderColor, thickness = 1.dp)

            Box(modifier = Modifier.weight(1f)) {
                when (tab) {
                    DetailTab.OVERVIEW -> OverviewTab(country)
                    DetailTab.VISAS -> VisasTab(country)
                    DetailTab.PR -> PathwaysTab(
                        pathways = country.prPathways, accent = Green,
                        onJump = { type -> onPathwaysClick(type) }
                    )
                    DetailTab.CITIZENSHIP -> PathwaysTab(
                        pathways = country.citizenshipPathways, accent = Primary,
                        onJump = { type -> onPathwaysClick(type) }
                    )
                    DetailTab.PROSCONS -> ProsConsTab(country)
                    DetailTab.TIMELINE -> TimelineTab(country)
                }
            }
        }
    }
}

@Composable
private fun OverviewTab(country: Country) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Card)
                    .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                MetricRow("Healthcare", country.healthcare, Blue)
                MetricRow("Safety", country.safety, Green)
                MetricRow("Education", country.education, Amber)
                MetricRow("Startup Scene", country.startupScore, Purple)
                MetricRow("Family Friendly", country.familyFriendly, Green)
                MetricRow("Retirement Friendly", country.retirementFriendly, Cyan)
            }
        }
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Card)
                    .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Text("Country Facts", color = TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                FactRow("GDP", country.gdp)
                FactRow("Languages", country.languages.joinToString(", "))
                FactRow("Climate", country.climate)
                FactRow("Cost of Living", country.costOfLiving)
                FactRow("Tax Rate", country.taxRate)
                FactRow("Passport Rank", "#${country.passportRank} globally")
            }
        }
    }
}

@Composable
private fun FactRow(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = 6.dp)) {
        Text(label.uppercase(), color = TextMuted, fontSize = 9.sp, letterSpacing = 0.5.sp)
        Text(value, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun VisasTab(country: Country) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        itemsIndexed(country.visas) { i, visa ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(11.dp))
                    .background(Card)
                    .border(1.dp, BorderColor, RoundedCornerShape(11.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(9.dp))
                        .background(Surface)
                        .border(1.dp, BorderColor, RoundedCornerShape(9.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text((i + 1).toString().padStart(2, '0'), color = Primary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(visa, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text(visaDescription(visa, country.name), color = TextMuted, fontSize = 11.sp)
                }
                Chip("Active", Green)
            }
        }
    }
}

private fun visaDescription(visa: String, countryName: String): String = when (visa) {
    "Skilled Worker" -> "For professionals with job offers in $countryName. Employer sponsorship typically required."
    "EU Blue Card" -> "EU-wide permit for highly qualified non-EU nationals. Minimum salary thresholds apply."
    "Digital Nomad" -> "Work remotely for non-$countryName employers while residing here. Income proof required."
    "Student" -> "For enrolled students at recognised institutions. Limited work rights."
    "Family Reunification" -> "For family members of legal residents. Income and housing requirements apply."
    "Golden Visa" -> "Investment-based residency through real estate or capital investment."
    "Investor" -> "Business or capital investment residency pathway."
    "Entrepreneur" -> "For those establishing or running a business in the country."
    "Startup" -> "For founders of innovative startups with growth potential."
    "Research" -> "For academic researchers affiliated with recognised institutions."
    "Seasonal" -> "Temporary permits for agricultural and tourism sector workers."
    "Job Seeker" -> "Short-term permit to search for employment without prior job offer."
    else -> "Legal pathway for ${visa.lowercase()} activities in $countryName."
}

@Composable
private fun ProsConsTab(country: Country) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Card)
                    .border(1.dp, Green.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                    .padding(18.dp)
            ) {
                Text("✓ Advantages", color = Green, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                country.pros.forEach { item ->
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        Text("+", color = Green, fontSize = 13.sp, modifier = Modifier.padding(end = 8.dp))
                        Text(item, color = TextSubtle, fontSize = 13.sp, lineHeight = 18.sp)
                    }
                }
            }
        }
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Card)
                    .border(1.dp, Red.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                    .padding(18.dp)
            ) {
                Text("✗ Challenges", color = Red, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                country.cons.forEach { item ->
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        Text("−", color = Red, fontSize = 13.sp, modifier = Modifier.padding(end = 8.dp))
                        Text(item, color = TextSubtle, fontSize = 13.sp, lineHeight = 18.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun TimelineTab(country: Country) {
    if (country.prYears >= 999) {
        Box(modifier = Modifier.fillMaxSize().padding(30.dp), contentAlignment = Alignment.Center) {
            Text("Standard immigration timeline not applicable for ${country.name}", color = TextMuted, fontSize = 13.sp)
        }
        return
    }
    data class Milestone(val label: String, val year: Int, val color: androidx.compose.ui.graphics.Color, val detail: String)
    val milestones = buildList {
        add(Milestone("Arrival & Registration", 0, Primary, "Register with local authorities, obtain initial residence permit"))
        add(Milestone("First Permit Renewal", 1, Blue, "Annual or biennial renewal — maintain qualifying employment or income"))
        add(Milestone("Language Certification", minOf(2, country.prYears - 1).coerceAtLeast(0), Purple, "Obtain required language certification (typically A2-B1 or higher)"))
        add(Milestone("PR Eligibility", country.prYears, Green, "Apply for Permanent Residency after ${country.prYears} continuous years"))
        if (country.citizenshipYears < 999) {
            add(Milestone("Citizenship Eligibility", country.citizenshipYears, Amber, "Apply for naturalization after ${country.citizenshipYears} years from arrival"))
        }
    }.sortedBy { it.year }

    LazyColumn(contentPadding = PaddingValues(16.dp)) {
        item {
            Text("Immigration Timeline — ${country.name}", color = TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(16.dp))
        }
        itemsIndexed(milestones) { idx, m ->
            Row(modifier = Modifier.fillMaxWidth()) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(50.dp)) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(androidx.compose.foundation.shape.CircleShape)
                            .background(m.color.copy(alpha = 0.15f))
                            .border(2.dp, m.color, androidx.compose.foundation.shape.CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Y${m.year}", color = m.color, fontSize = 9.sp, fontWeight = FontWeight.Black)
                    }
                    if (idx < milestones.size - 1) {
                        Box(
                            modifier = Modifier
                                .width(2.dp)
                                .height(40.dp)
                                .background(BorderColor)
                        )
                    }
                }
                Spacer(Modifier.width(14.dp))
                Column(modifier = Modifier.padding(top = 8.dp, bottom = 20.dp)) {
                    Text(m.label, color = m.color, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(2.dp))
                    Text(m.detail, color = TextMuted, fontSize = 12.sp, lineHeight = 17.sp)
                }
            }
        }
    }
}

