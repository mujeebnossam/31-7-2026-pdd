import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_typography.dart';
import '../core/utils/date_formatter.dart';
import '../models/transaction_model.dart';
import '../providers/currency_provider.dart';

class TransactionTile extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const TransactionTile({
    super.key,
    required this.transaction,
    this.onTap,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final currency = context.watch<CurrencyProvider>();
    final formattedAmount = currency.format(transaction.amount, showSign: false);
    final catColor = AppColors.getCategoryColor(transaction.category);

    return Dismissible(
      key: Key(transaction.id),
      direction: onDelete != null ? DismissDirection.endToStart : DismissDirection.none,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppColors.expense,
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      onDismissed: (_) => onDelete?.call(),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: catColor.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Text(
            transaction.icon.isNotEmpty ? transaction.icon : '💳',
            style: const TextStyle(fontSize: 20),
          ),
        ),
        title: Text(
          transaction.title,
          style: AppTypography.bodyMedium(fontWeight: FontWeight.w600),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Row(
          children: [
            Text(
              transaction.category,
              style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
            ),
            const SizedBox(width: 6),
            const Text('•', style: TextStyle(color: AppColors.textDarkSecondary, fontSize: 10)),
            const SizedBox(width: 6),
            Text(
              DateFormatter.formatDisplay(transaction.date),
              style: AppTypography.bodySmall(color: AppColors.textDarkSecondary),
            ),
            if (transaction.source != 'manual') ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  transaction.source.toUpperCase(),
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.primaryLight),
                ),
              ),
            ],
          ],
        ),
        trailing: Text(
          transaction.isExpense ? '-$formattedAmount' : '+$formattedAmount',
          style: AppTypography.monoNumber(
            color: transaction.isExpense ? AppColors.expense : AppColors.income,
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
