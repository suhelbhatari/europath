package com.europath.app.data

import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel

/**
 * Lightweight app-wide ViewModel that just tracks which country IDs are
 * currently selected for the side-by-side Compare screen (max 4, mirroring
 * the web app's behavior).
 */
class CompareViewModel : ViewModel() {
    val selectedIds = mutableStateListOf<String>()

    fun toggle(countryId: String) {
        if (selectedIds.contains(countryId)) {
            selectedIds.remove(countryId)
        } else if (selectedIds.size < 4) {
            selectedIds.add(countryId)
        }
    }

    fun remove(countryId: String) {
        selectedIds.remove(countryId)
    }

    fun isSelected(countryId: String): Boolean = selectedIds.contains(countryId)
}
