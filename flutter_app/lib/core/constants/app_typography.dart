import 'package:flutter/material.dart';

class AppTypography {
  static const String fontFamily = 'Inter';

  static TextStyle heading1({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontSize: 28,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
        color: color,
      );

  static TextStyle heading2({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
        color: color,
      );

  static TextStyle heading3({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: color,
      );

  static TextStyle bodyLarge({Color? color, FontWeight? fontWeight}) => TextStyle(
        fontFamily: fontFamily,
        fontSize: 16,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color,
      );

  static TextStyle bodyMedium({Color? color, FontWeight? fontWeight}) => TextStyle(
        fontFamily: fontFamily,
        fontSize: 14,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color,
      );

  static TextStyle bodySmall({Color? color, FontWeight? fontWeight}) => TextStyle(
        fontFamily: fontFamily,
        fontSize: 12,
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color,
      );

  static TextStyle monoNumber({Color? color, double fontSize = 16, FontWeight fontWeight = FontWeight.w600}) => TextStyle(
        fontFamily: 'monospace',
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
      );
}
