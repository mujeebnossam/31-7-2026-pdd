import 'package:intl/intl.dart';

enum CurrencyType { usd, inr, eur }

class CurrencyFormatter {
  static const Map<CurrencyType, double> exchangeRates = {
    CurrencyType.usd: 1.0,
    CurrencyType.inr: 83.0,
    CurrencyType.eur: 0.92,
  };

  static String format(double amountUSD, {CurrencyType currency = CurrencyType.usd, bool showSign = false}) {
    final rate = exchangeRates[currency] ?? 1.0;
    final converted = amountUSD * rate;

    String formatted;
    switch (currency) {
      case CurrencyType.inr:
        final formatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
        formatted = formatter.format(converted.abs());
        break;
      case CurrencyType.eur:
        final formatter = NumberFormat.currency(locale: 'en_IE', symbol: '€', decimalDigits: 2);
        formatted = formatter.format(converted.abs());
        break;
      case CurrencyType.usd:
      default:
        final formatter = NumberFormat.currency(locale: 'en_US', symbol: '\$', decimalDigits: 2);
        formatted = formatter.format(converted.abs());
        break;
    }

    if (showSign) {
      if (amountUSD > 0) return '+$formatted';
      if (amountUSD < 0) return '-$formatted';
    } else if (amountUSD < 0) {
      return '-$formatted';
    }

    return formatted;
  }

  static double convert(double amountUSD, CurrencyType currency) {
    final rate = exchangeRates[currency] ?? 1.0;
    return amountUSD * rate;
  }

  static CurrencyType fromString(String code) {
    switch (code.toUpperCase()) {
      case 'INR':
        return CurrencyType.inr;
      case 'EUR':
        return CurrencyType.eur;
      case 'USD':
      default:
        return CurrencyType.usd;
    }
  }

  static String toCode(CurrencyType type) {
    switch (type) {
      case CurrencyType.inr:
        return 'INR';
      case CurrencyType.eur:
        return 'EUR';
      case CurrencyType.usd:
      default:
        return 'USD';
    }
  }
}
