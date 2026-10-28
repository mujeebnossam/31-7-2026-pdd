import 'package:flutter/material.dart';
import '../core/utils/currency_formatter.dart';

class CurrencyProvider with ChangeNotifier {
  CurrencyType _currency = CurrencyType.usd;

  CurrencyType get currency => _currency;
  String get currencyCode => CurrencyFormatter.toCode(_currency);

  void setCurrency(CurrencyType type) {
    _currency = type;
    notifyListeners();
  }

  void setCurrencyFromCode(String code) {
    _currency = CurrencyFormatter.fromString(code);
    notifyListeners();
  }

  String format(double amountUSD, {bool showSign = false}) {
    return CurrencyFormatter.format(amountUSD, currency: _currency, showSign: showSign);
  }

  double convert(double amountUSD) {
    return CurrencyFormatter.convert(amountUSD, _currency);
  }
}
