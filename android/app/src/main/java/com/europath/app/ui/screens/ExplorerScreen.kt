package com.europath.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.indication
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.ripple
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.europath.app.data.Country
import com.europath.app.data.CountryRepository
import com.europath.app.ui.components.*
import com.europath.app.ui.theme.*

enum class SortOption(val label: String) {
    NAME("A–Z"), PR("Fastest PR"), CITIZENSHIP("Fastest Citizenship"),
    SAFETY("Safety"), HEALTHCARE("Healthcare")
}

data class ExplorerFilters(
    val eu: String = "All",
    val schengen: String = "All",
    val dual: String = "All",
    val nomad: String = "All",
    val pr: String = "All",
    val citizenship: String = "All"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExplorerScreen(
    onCountryClick: (Country) -> Unit,
    onPathwaysClick: (Country) -> Unit,
    compareIds: List<String>,
    onCompareToggle: (Country) -> Unit,
    onCompareClick: () -> Unit
) {
    var search by remember { mutableStateOf("") }
    var sort by remember { mutableStateOf(SortOption.NAME) }
    var filters by remember { mutableStateOf(ExplorerFilters()) }
    var showFilters by remember { mutableStateOf(false) }

    val filtered = remember(search, sort, filters) {
        CountryRepository.countries.filter { c ->
            val matchesSearch = search.isBlank() ||
                c.name.contains(search, ignoreCase = true) ||
                c.capital.contains(search, ignoreCase = true)
            val matchesEu = when (filters.eu) { "EU" -> c.eu; "Non-EU" -> !c.eu; else -> true }
            val matchesSchengen = when (filters.schengen) { "Schengen" -> c.schengen; "Non-Schengen" -> !c.schengen; else -> true }
            val matchesDual = when (filters.dual) { "Allows Dual" -> c.dualCitizenship; "No Dual" -> !c.dualCitizenship; else -> true }
            val matchesNomad = when (filters.nomad) { "Has Nomad Visa" -> c.digitalNomad; "No Nomad Visa" -> !c.digitalNomad; else -> true }
            val matchesPr = when (filters.pr) {
                "≤3 yrs" -> c.prYears <= 3
                "4-5 yrs" -> c.prYears in 4..5
                "6-10 yrs" -> c.prYears in 6..10
                "10+ yrs" -> c.prYears > 10
                else -> true
            }
            val matchesCit = when (filters.citizenship) {
                "≤5 yrs" -> c.citizenshipYears <= 5
                "6-10 yrs" -> c.citizenshipYears in 6..10
                "11+ yrs" -> c.citizenshipYears > 10
                else -> true
            }
            matchesSearch && matchesEu && matchesSchengen && matchesDual && matchesNomad && matchesPr && matchesCit
        }.let { list ->
            when (sort) {
                SortOption.NAME -> list.sortedBy { it.name }
                SortOption.PR -> list.sortedBy { it.prYears }
                SortOption.CITIZENSHIP -> list.sortedBy { it.citizenshipYears }
                SortOption.SAFETY -> list.sortedByDescending { it.safety }
                SortOption.HEALTHCARE -> list.sortedByDescending { it.healthcare }
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(Bg)) {
        // Hero header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(Surface, Bg)))
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(PrimaryGlow)
                    .padding(horizontal = 14.dp, vertical = 5.dp)
            ) {
                Text(
                    "${CountryRepository.countries.size} EUROPEAN COUNTRIES",
                    color = Primary, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 0.8.sp
                )
            }
            Spacer(Modifier.height(12.dp))
            Text(
                "Your European\nImmigration Guide",
                color = TextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                lineHeight = 32.sp
            )
            Spacer(Modifier.height(6.dp))
            Text(
                "Every PR pathway, every citizenship route — for all 45 European countries.",
                color = TextMuted, fontSize = 13.sp
            )
        }

        // Search row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = search,
                onValueChange = { search = it },
                placeholder = { Text("Search countries or capitals…", fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Card, unfocusedContainerColor = Card,
                    focusedBorderColor = Primary, unfocusedBorderColor = BorderColor,
                    focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary,
                    cursorColor = Primary
                )
            )
            FilledTonalIconButton(
                onClick = { showFilters = !showFilters },
                colors = IconButtonDefaults.filledTonalIconButtonColors(
                    containerColor = if (showFilters) PrimaryGlow else Card
                )
            ) {
                Icon(
                    Icons.Default.FilterList,
                    contentDescription = "Filters",
                    tint = if (showFilters) Primary else TextSubtle
                )
            }
        }

        // Sort row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            SortOption.values().forEach { opt ->
                PillButton(text = opt.label, selected = sort == opt, onClick = { sort = opt })
            }
        }

        if (showFilters) {
            FilterPanel(filters = filters, onChange = { filters = it })
        }

        Spacer(Modifier.height(8.dp))

        // Results header
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "${filtered.size} ${if (filtered.size == 1) "Country" else "Countries"}",
                color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold
            )
            if (compareIds.isNotEmpty()) {
                Button(
                    onClick = onCompareClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Primary),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("Compare ${compareIds.size} →", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        if (filtered.isEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔍", fontSize = 36.sp)
                    Spacer(Modifier.height(8.dp))
                    Text("No countries found", color = TextSubtle, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Text("Try adjusting your search or filters", color = TextMuted, fontSize = 12.sp)
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(1),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(filtered, key = { it.id }) { country ->
                    CountryCard(
                        country = country,
                        isComparing = compareIds.contains(country.id),
                        onClick = { onCountryClick(country) },
                        onCompareToggle = { onCompareToggle(country) },
                        onPathwaysClick = { onPathwaysClick(country) }
                    )
                }
            }
        }
    }
}


@Composable
private fun FilterPanel(filters: ExplorerFilters, onChange: (ExplorerFilters) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Card)
            .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        FilterRow("EU Status", filters.eu, listOf("All", "EU", "Non-EU")) { onChange(filters.copy(eu = it)) }
        FilterRow("Schengen", filters.schengen, listOf("All", "Schengen", "Non-Schengen")) { onChange(filters.copy(schengen = it)) }
        FilterRow("Dual Citizenship", filters.dual, listOf("All", "Allows Dual", "No Dual")) { onChange(filters.copy(dual = it)) }
        FilterRow("Digital Nomad", filters.nomad, listOf("All", "Has Nomad Visa", "No Nomad Visa")) { onChange(filters.copy(nomad = it)) }
        FilterRow("PR Timeline", filters.pr, listOf("All", "≤3 yrs", "4-5 yrs", "6-10 yrs", "10+ yrs")) { onChange(filters.copy(pr = it)) }
        FilterRow("Citizenship", filters.citizenship, listOf("All", "≤5 yrs", "6-10 yrs", "11+ yrs")) { onChange(filters.copy(citizenship = it)) }
    }
}

@Composable
private fun FilterRow(label: String, selected: String, options: List<String>, onSelect: (String) -> Unit) {
    Column {
        Text(label, color = TextMuted, fontSize = 11.sp, modifier = Modifier.padding(bottom = 4.dp))
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            options.forEach { opt ->
                PillButton(text = opt, selected = selected == opt, onClick = { onSelect(opt) })
            }
        }
    }
}

@Composable
private fun CountryCard(
    country: Country,
    isComparing: Boolean,
    onClick: () -> Unit,
    onCompareToggle: () -> Unit,
    onPathwaysClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Card)
            .border(1.dp, BorderColor, RoundedCornerShape(14.dp))
            .clickableNoRipple(onClick)
            .padding(18.dp)
    ) {
        // Header row: flag/name on left, badges on right
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(country.flag, fontSize = 34.sp)
                Spacer(Modifier.height(2.dp))
                Text(country.name, color = TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                Text("${country.capital} · ${country.population}", color = TextMuted, fontSize = 11.sp)
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (country.eu) Chip("EU", Primary)
                if (country.schengen) Chip("Schengen", Blue)
                if (country.digitalNomad) Chip("🌐 Nomad", Green)
            }
        }

        Spacer(Modifier.height(14.dp))

        // PR / Citizenship quick stats
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(9.dp))
                    .background(Surface)
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Text("PR ELIGIBILITY", color = TextMuted, fontSize = 9.sp, letterSpacing = 0.5.sp)
                Text(country.prYearsLabel, color = Green, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(9.dp))
                    .background(Surface)
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Text("CITIZENSHIP", color = TextMuted, fontSize = 9.sp, letterSpacing = 0.5.sp)
                Text(country.citizenshipYearsLabel, color = Primary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(Modifier.height(14.dp))

        // Score bars
        MetricRow("Safety", country.safety, Green)
        Spacer(Modifier.height(8.dp))
        MetricRow("Healthcare", country.healthcare, Blue)
        Spacer(Modifier.height(8.dp))
        MetricRow("Education", country.education, Amber)

        Spacer(Modifier.height(12.dp))

        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                if (country.dualCitizenship) "✓ Dual OK" else "✗ No Dual",
                color = if (country.dualCitizenship) Green else Red,
                fontSize = 11.sp, fontWeight = FontWeight.Bold
            )
            Text("·", color = BorderColor)
            Text(country.taxRate, color = TextSubtle, fontSize = 11.sp)
        }

        Spacer(Modifier.height(12.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedButton(
                onClick = onCompareToggle,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = if (isComparing) Primary else Color.Transparent,
                    contentColor = if (isComparing) Color.White else TextSubtle
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isComparing) Primary else BorderColor),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                Text(if (isComparing) "✓ Comparing" else "+ Compare", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            OutlinedButton(
                onClick = onPathwaysClick,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Primary),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderColor),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                Text("All Pathways", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

/** A clickable modifier without the default ripple bounds clipping issues on custom shapes. */
@Composable
private fun Modifier.clickableNoRipple(onClick: () -> Unit): Modifier {
    val interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    return this.then(
        Modifier.clickable(
            interactionSource = interactionSource,
            indication = ripple(color = Primary),
            onClick = onClick
        )
    )
}

