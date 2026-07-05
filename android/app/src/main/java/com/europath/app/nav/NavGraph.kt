package com.europath.app.nav

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.europath.app.data.CompareViewModel
import com.europath.app.data.CountryRepository
import com.europath.app.ui.screens.*

@Composable
fun EuroPathNavGraph() {
    val navController = rememberNavController()
    val compareVm: CompareViewModel = viewModel()

    NavHost(navController = navController, startDestination = Screen.Explorer.route) {

        // ── Explorer (home) ──────────────────────────────────────
        composable(Screen.Explorer.route) {
            MainScaffold(
                navController = navController,
                currentRoute = Screen.Explorer.route,
                compareCount = compareVm.selectedIds.size
            ) {
                ExplorerScreen(
                    onCountryClick = { country ->
                        navController.navigate(Screen.CountryDetail.build(country.id))
                    },
                    onPathwaysClick = { country ->
                        navController.navigate(Screen.Pathways.build(country.id))
                    },
                    compareIds = compareVm.selectedIds.toList(),
                    onCompareToggle = { country -> compareVm.toggle(country.id) },
                    onCompareClick = { navController.navigate(Screen.Compare.route) }
                )
            }
        }

        // ── Country Detail ───────────────────────────────────────
        composable(
            route = Screen.CountryDetail.route,
            arguments = listOf(navArgument("countryId") { type = NavType.StringType })
        ) { backStack ->
            val id = backStack.arguments?.getString("countryId") ?: return@composable
            val country = CountryRepository.countries.find { it.id == id } ?: return@composable
            CountryDetailScreen(
                country = country,
                isComparing = compareVm.isSelected(id),
                onBack = { navController.popBackStack() },
                onCompareToggle = { compareVm.toggle(id) },
                onPathwaysClick = { anchor ->
                    navController.navigate(Screen.Pathways.build(id, anchor))
                }
            )
        }

        // ── Pathways (with optional anchor) ─────────────────────
        composable(
            route = Screen.Pathways.route,
            arguments = listOf(
                navArgument("countryId") { type = NavType.StringType },
                navArgument("anchor") {
                    type = NavType.StringType
                    defaultValue = ""
                    nullable = true
                }
            )
        ) { backStack ->
            val id = backStack.arguments?.getString("countryId") ?: return@composable
            val anchor = backStack.arguments?.getString("anchor")?.takeIf { it.isNotBlank() }
            PathwaysScreen(
                countryId = id,
                anchor = anchor,
                onBack = { navController.popBackStack() },
                onJump = { type ->
                    // Re-navigate to same screen with new anchor (replaces top)
                    navController.navigate(Screen.Pathways.build(id, type.ifBlank { null })) {
                        popUpTo(Screen.Pathways.build(id)) { inclusive = true }
                    }
                }
            )
        }

        // ── Compare ──────────────────────────────────────────────
        composable(Screen.Compare.route) {
            MainScaffold(
                navController = navController,
                currentRoute = Screen.Compare.route,
                compareCount = compareVm.selectedIds.size
            ) {
                CompareScreen(
                    selectedIds = compareVm.selectedIds.toList(),
                    onRemove = { compareVm.remove(it) },
                    onCountryClick = { country ->
                        navController.navigate(Screen.CountryDetail.build(country.id))
                    },
                    onGoToExplorer = {
                        navController.navigate(Screen.Explorer.route) {
                            popUpTo(Screen.Explorer.route) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
