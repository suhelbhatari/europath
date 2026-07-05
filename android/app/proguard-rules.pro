# EuroPath ProGuard rules
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable

# Keep Compose runtime
-keep class androidx.compose.** { *; }

# Keep data classes
-keep class com.europath.app.data.** { *; }

# Keep ViewModel
-keep class * extends androidx.lifecycle.ViewModel { *; }
