import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/bill_model.dart';
import '../../providers/bill_provider.dart';
import '../../providers/currency_provider.dart';
import '../../widgets/bill_tile.dart';
import '../../widgets/empty_state_view.dart';
import 'bill_form_sheet.dart';
import 'pay_bill_sheet.dart';

class BillsScreen extends StatefulWidget {
  const BillsScreen({super.key});

  @override
  State<BillsScreen> createState() => _BillsScreenState();
}

class _BillsScreenState extends State<BillsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final billProvider = context.watch<BillProvider>();
    final currency = context.watch<CurrencyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bills & Subscriptions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const BillFormSheet(),
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: 'Upcoming (${billProvider.upcomingBills.length})'),
            Tab(text: 'Overdue (${billProvider.overdueBills.length})'),
            Tab(text: 'Paid (${billProvider.paidBills.length})'),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => billProvider.fetchBills(),
        child: Column(
          children: [
            // Outflow Header
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.warning.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Monthly Recurring Outflow', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  Text(
                    currency.format(billProvider.monthlyRecurringOutflow),
                    style: AppTypography.heading3(color: AppColors.warning),
                  ),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildBillList(billProvider.upcomingBills, 'No upcoming bills due soon.'),
                  _buildBillList(billProvider.overdueBills, 'No overdue bills. Great job!'),
                  _buildBillList(billProvider.paidBills, 'No paid bills recorded for this cycle.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBillList(List<BillModel> list, String emptyMessage) {
    final billProvider = context.read<BillProvider>();

    if (billProvider.isLoading && billProvider.bills.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (list.isEmpty) {
      return EmptyStateView(
        title: 'All Clear',
        description: emptyMessage,
        icon: Icons.check_circle_outline,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: list.length,
      itemBuilder: (ctx, i) {
        final bill = list[i];
        return BillTile(
          bill: bill,
          onPay: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              builder: (_) => PayBillSheet(bill: bill),
            );
          },
          onEdit: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              builder: (_) => BillFormSheet(billToEdit: bill),
            );
          },
          onDelete: () => billProvider.deleteBill(bill.id),
        );
      },
    );
  }
}
