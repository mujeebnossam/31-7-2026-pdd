import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../providers/currency_provider.dart';

class InvestmentsScreen extends StatefulWidget {
  const InvestmentsScreen({super.key});

  @override
  State<InvestmentsScreen> createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen> {
  final List<Map<String, dynamic>> _simulatedPositions = [
    {'ticker': 'VOO', 'name': 'Vanguard S&P 500 ETF', 'shares': 12.5, 'price': 510.40, 'gain': '+12.4%'},
    {'ticker': 'QQQ', 'name': 'Invesco QQQ Trust', 'shares': 8.0, 'price': 480.25, 'gain': '+16.8%'},
    {'ticker': 'AAPL', 'name': 'Apple Inc.', 'shares': 15.0, 'price': 224.20, 'gain': '+8.2%'},
    {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'shares': 6.0, 'price': 440.80, 'gain': '+10.5%'},
  ];

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();

    double totalSimValue = 0;
    for (final pos in _simulatedPositions) {
      totalSimValue += (pos['shares'] as double) * (pos['price'] as double);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Investment Simulator'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Clear Sandbox Disclaimer Badge
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF84CC16).withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF84CC16).withOpacity(0.35)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Color(0xFF84CC16), size: 22),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'PORTFOLIO SIMULATOR (SANDBOX)\nSimulated asset allocation and estimated returns. Not connected to a real brokerage.',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF84CC16), height: 1.3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Total Simulated Value Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Simulated Portfolio Value', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(
                    currency.format(totalSimValue),
                    style: AppTypography.heading1(color: const Color(0xFF84CC16)),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.income.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('+11.8% Simulated All-Time', style: TextStyle(color: AppColors.income, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          Text('Simulated Holdings', style: AppTypography.heading3()),
          const SizedBox(height: 8),
          ..._simulatedPositions.map((p) {
            final val = (p['shares'] as double) * (p['price'] as double);
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(p['ticker'].toString().substring(0, 1), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryLight)),
                ),
                title: Text('${p['ticker']} • ${p['name']}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                subtitle: Text('${p['shares']} shares @ \$${(p['price'] as double).toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, color: AppColors.textDarkSecondary)),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(currency.format(val), style: AppTypography.monoNumber(fontSize: 14)),
                    Text(p['gain'].toString(), style: const TextStyle(color: AppColors.income, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
