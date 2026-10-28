import 'package:flutter/material.dart';

class AppColors {
  // Brand Primaries
  static const Color primary = Color(0xFF6366F1); // Indigo
  static const Color primaryDark = Color(0xFF4F46E5);
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color secondary = Color(0xFF8B5CF6); // Violet

  // Financial Semantics
  static const Color income = Color(0xFF10B981); // Emerald Green
  static const Color expense = Color(0xFFEF4444); // Crimson Red
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color info = Color(0xFF3B82F6); // Blue
  static const Color healthScore = Color(0xFF8B5CF6);

  // Dark Theme Surfaces
  static const Color darkBackground = Color(0xFF0B0F19);
  static const Color darkSurface = Color(0xFF111827);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);

  // Light Theme Surfaces
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFF1F5F9);
  static const Color lightBorder = Color(0xFFE2E8F0);

  // Text Colors
  static const Color textLightPrimary = Color(0xFF0F172A);
  static const Color textLightSecondary = Color(0xFF64748B);
  static const Color textDarkPrimary = Color(0xFFF8FAFC);
  static const Color textDarkSecondary = Color(0xFF94A3B8);

  // Category Colors
  static const Map<String, Color> categoryColors = {
    'Food & Drink': Color(0xFFF59E0B),
    'Housing': Color(0xFF6366F1),
    'Utilities': Color(0xFF06B6D4),
    'Transportation': Color(0xFF3B82F6),
    'Groceries': Color(0xFF10B981),
    'Entertainment': Color(0xFFEC4899),
    'Shopping': Color(0xFF8B5CF6),
    'Health & Medical': Color(0xFFEF4444),
    'Insurance': Color(0xFF64748B),
    'Salary': Color(0xFF22C55E),
    'Investments': Color(0xFF84CC16),
    'Subscriptions': Color(0xFFA855F7),
    'Other': Color(0xFF94A3B8),
  };

  static Color getCategoryColor(String category) {
    return categoryColors[category] ?? const Color(0xFF64748B);
  }
}
