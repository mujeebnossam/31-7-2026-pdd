import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../models/transaction_model.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/transaction_tile.dart';
import 'transaction_form_sheet.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final _searchController = TextEditingController();

  final List<String> _categories = [
    'All',
    'Food & Drink',
    'Housing',
    'Utilities',
    'Transportation',
    'Groceries',
    'Entertainment',
    'Shopping',
    'Health & Medical',
    'Salary',
    'Subscriptions',
    'Other',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final txProvider = context.watch<TransactionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction Ledger'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const TransactionFormSheet(),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => txProvider.setSearchQuery(val),
              decoration: InputDecoration(
                hintText: 'Search merchant, title or notes...',
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          txProvider.setSearchQuery('');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // 2. Type Selector Tabs (All, Expense, Income)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Row(
              children: [
                _buildTypeChip(context, 'All', 'all'),
                const SizedBox(width: 8),
                _buildTypeChip(context, 'Expenses', 'expense'),
                const SizedBox(width: 8),
                _buildTypeChip(context, 'Income', 'income'),
              ],
            ),
          ),

          // 3. Category Horizontal Filter Pills
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              itemCount: _categories.length,
              itemBuilder: (ctx, i) {
                final cat = _categories[i];
                final isSelected = txProvider.selectedCategory.toLowerCase() == cat.toLowerCase();
                return Padding(
                  padding: const EdgeInsets.only(right: 6.0),
                  child: FilterChip(
                    label: Text(cat, style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : null)),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    onSelected: (_) => txProvider.setFilterCategory(cat),
                  ),
                );
              },
            ),
          ),

          const Divider(height: 1),

          // 4. Ledger List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => txProvider.fetchTransactions(),
              child: txProvider.isLoading && txProvider.allTransactions.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : txProvider.transactions.isEmpty
                      ? EmptyStateView(
                          title: 'No Transactions Found',
                          description: 'No transactions match your current search or filter criteria.',
                          icon: Icons.receipt_long_outlined,
                          actionButtonText: 'Add Transaction',
                          onAction: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              builder: (_) => const TransactionFormSheet(),
                            );
                          },
                        )
                      : ListView.separated(
                          itemCount: txProvider.transactions.length,
                          separatorBuilder: (_, __) => const Divider(height: 1),
                          itemBuilder: (ctx, i) {
                            final tx = txProvider.transactions[i];
                            return TransactionTile(
                              transaction: tx,
                              onTap: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  builder: (_) => TransactionFormSheet(transactionToEdit: tx),
                                );
                              },
                              onDelete: () => txProvider.deleteTransaction(tx.id),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeChip(BuildContext context, String label, String value) {
    final txProvider = context.watch<TransactionProvider>();
    final isSelected = txProvider.selectedType == value;

    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      selected: isSelected,
      selectedColor: AppColors.primary,
      onSelected: (_) => txProvider.setFilterType(value),
    );
  }
}
