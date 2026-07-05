package com.europath.app.nav

sealed class Screen(val route: String) {
    data object Explorer : Screen("explorer")
    data object Compare : Screen("compare")
    data object CountryDetail : Screen("country/{countryId}") {
        fun build(countryId: String) = "country/$countryId"
    }
    data object Pathways : Screen("pathways/{countryId}?anchor={anchor}") {
        fun build(countryId: String, anchor: String? = null) =
            if (anchor != null) "pathways/$countryId?anchor=$anchor" else "pathways/$countryId?anchor="
    }
}
