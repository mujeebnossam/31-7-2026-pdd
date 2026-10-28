import '../models/transaction_model.dart';
import '../services/transaction_service.dart';

class FinancialReportData {
  final double totalIncomeYTD;
  final double totalExpensesYTD;
  final double netSavingsYTD;
  final double savingsRateYTD;
  final List<Map<String, dynamic>> monthlyTrends;
  final List<Map<String, dynamic>> categoryBreakdown;

  FinancialReportData({
    required this.totalIncomeYTD,
    required this.totalExpensesYTD,
    required this.netSavingsYTD,
    required this.savingsRateYTD,
    required this.monthlyTrends,
    required this.categoryBreakdown,
  });
}

class ReportRepository {
  final TransactionService _txService;

  ReportRepository({TransactionService? txService}) : _txService = txService ?? TransactionService();

  Future<FinancialReportData> generateReport() async {
    final transactions = await _txService.getTransactions(limit: 500);

    final now = DateTime.now();
    final currentYear = now.year;

    double incYTD = 0.0;
    double expYTD = 0.0;
    final Map<String, double> catMap = {};
    final Map<String, Map<String, double>> monthMap = {};

    // Initialize last 6 calendar months
    for (int i = 5; i >= 0; i--) {
      final d = DateTime(now.year, now.month - i, 1);
      final key = '${d.year}-${d.month.toString().padLeft(2, '0')}';
      monthMap[key] = {'income': 0.0, 'expenses': 0.0};
    }

    for (final tx in transactions) {
      DateTime? txDate;
      try {
        txDate = DateTime.parse(tx.date);
      } catch (_) {
        txDate = now;
      }

      final isCurYear = txDate.year == currentYear;
      final monthKey = '${txDate.year}-${txDate.month.toString().padLeft(2, '0')}';
      final amt = tx.amount.abs();

      if (tx.isExpense) {
        if (isCurYear) expYTD += amt;
        catMap[tx.category] = (catMap[tx.category] ?? 0.0) + amt;
        if (monthMap.containsKey(monthKey)) {
          monthMap[monthKey]!['expenses'] = (monthMap[monthKey]!['expenses'] ?? 0.0) + amt;
        }
      } else {
        if (isCurYear) incYTD += amt;
        if (monthMap.containsKey(monthKey)) {
          monthMap[monthKey]!['income'] = (monthMap[monthKey]!['income'] ?? 0.0) + amt;
        }
      }
    }

    final netYTD = incYTD - expYTD;
    final rateYTD = incYTD > 0 ? ((netYTD / incYTD) * 100).clamp(0.0, 100.0) : 0.0;

    final monthlyTrends = monthMap.entries.map((e) {
      final parts = e.key.split('-');
      final monthNum = int.tryParse(parts[1]) ?? 1;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        'month': monthNames[monthNum - 1],
        'income': e.value['income'] ?? 0.0,
        'expenses': e.value['expenses'] ?? 0.0,
      };
    }).toList();

    final totalCatExp = catMap.values.fold(0.0, (a, b) => a + b);
    final categoryBreakdown = catMap.entries.map((e) {
      return {
        'name': e.key,
        'amount': e.value,
        'percent': totalCatExp > 0 ? (e.value / totalCatExp) * 100 : 0.0,
      };
    }).toList();

    categoryBreakdown.sort((a, b) => (b['amount'] as double).compareTo(a['amount'] as double));

    return FinancialReportData(
      totalIncomeYTD: incYTD,
      totalExpensesYTD: expYTD,
      netSavingsYTD: netYTD,
      savingsRateYTD: rateYTD,
      monthlyTrends: monthlyTrends,
      categoryBreakdown: categoryBreakdown,
    );
  }

  String exportLedgerToCsv(List<TransactionModel> transactions) {
    final buffer = StringBuffer();
    buffer.writeln('Date,Title,Merchant,Category,Type,Amount,Status,Notes');
    for (final tx in transactions) {
      buffer.writeln(
        '${tx.date},"${tx.title}","${tx.merchant}","${tx.category}",${tx.type},${tx.amount},${tx.status},"${tx.notes}"',
      );
    }
    return buffer.toString();
  }
}
