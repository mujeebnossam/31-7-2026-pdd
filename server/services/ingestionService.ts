import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { Budget } from '../models/Budget';
import { AIAdvisorService } from './aiAdvisorService';
import { FinancialAnalysisService } from './financialAnalysisService';

// ─── Provider Types & Interfaces ─────────────────────────────────────────────

export type ProviderType = 'MANUAL' | 'CSV_IMPORT' | 'BANK' | 'UPI' | 'DEMO';
export type ProviderStatus = 'ACTIVE' | 'PREPARED_DEMO' | 'PLANNED_FUTURE';

export interface DataProviderMetadata {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  description: string;
  capabilities: string[];
  isConfigured: boolean;
}

export interface NormalizedTransaction {
  id?: string;
  externalTransactionId?: string | null;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  title: string;
  category: string;
  rawDescription?: string | null;
  confidence: number;
  source: 'manual' | 'csv' | 'bank' | 'upi' | 'demo' | string;
  accountId?: string | null;
  isDuplicate: boolean;
  duplicateReason?: string | null;
  isValid: boolean;
  validationErrors: string[];
}

export interface CSVParseResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  totalIncome: number;
  totalExpense: number;
  detectedColumns: string[];
  columnMapping: Record<string, string>;
  rows: NormalizedTransaction[];
}

export interface BatchImportResult {
  totalRows: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  invalidCount: number;
  totalInflow: number;
  totalOutflow: number;
  importedTransactions: Transaction[];
  accountBalanceAfter: number;
  accountName: string;
}

export interface DemoIngestionPayload {
  merchant?: string;
  amount?: number;
  type?: 'expense' | 'income';
  rawDescription?: string;
  accountId?: string;
  source?: 'demo' | 'upi' | 'bank';
  category?: string;
}

export interface DemoIngestionResult {
  transaction: Transaction;
  merchant: string;
  category: string;
  confidence: number;
  accountName: string;
  balanceBefore: number;
  balanceAfter: number;
  budgetStatus?: {
    category: string;
    budgeted: number;
    spentBefore: number;
    spentAfter: number;
    percentUsed: number;
    isOverBudget: boolean;
  };
  notification: {
    type: 'transaction' | 'alert' | 'budget';
    title: string;
    message: string;
  };
  aiInsightRecommendation: string;
}

export class IngestionService {
  // ─── 1. Registered Data Providers ──────────────────────────────────────────
  public static getProviders(): DataProviderMetadata[] {
    return [
      {
        id: 'manual-provider',
        name: 'Manual Ledger Provider',
        type: 'MANUAL',
        status: 'ACTIVE',
        description: 'Direct transaction entry with instant dual-balance updates and AI category detection.',
        capabilities: ['Instant Balance Sync', 'Custom Category Assignment', 'Transfer Support'],
        isConfigured: true,
      },
      {
        id: 'csv-file-provider',
        name: 'CSV & Bank Statement Importer',
        type: 'CSV_IMPORT',
        status: 'ACTIVE',
        description: 'Flexible column-mapping CSV parser with automated duplicate detection and category prediction.',
        capabilities: ['Auto Header Detection', 'Fuzzy Duplicate Detection', 'Batch Verification', 'Multi-Bank Support'],
        isConfigured: true,
      },
      {
        id: 'demo-upi-feed-provider',
        name: 'Automated UPI Payment Feed (Simulation)',
        type: 'DEMO',
        status: 'PREPARED_DEMO',
        description: 'Simulates real-time automated UPI / webhook transaction stream through the production ingestion pipeline.',
        capabilities: ['Merchant Extraction', 'Real-time Budget Impact', 'Live Anomaly Checking', 'Instant Notification'],
        isConfigured: true,
      },
      {
        id: 'open-banking-provider',
        name: 'Open Banking / Bank API Adapter',
        type: 'BANK',
        status: 'PLANNED_FUTURE',
        description: 'Direct institutional bank connection via Open Banking API / Account Aggregator framework.',
        capabilities: ['Scheduled Polling', 'Direct Institution Auth', 'Multi-Account Aggregation'],
        isConfigured: false,
      },
      {
        id: 'upi-gateway-provider',
        name: 'UPI Webhook & SMS Parser',
        type: 'UPI',
        status: 'PLANNED_FUTURE',
        description: 'Production webhook listener and native SMS parsing gateway for zero-touch UPI recording.',
        capabilities: ['Instant Webhook Ingestion', 'SMS Regex Parsing', 'Deep Merchant Intelligence'],
        isConfigured: false,
      },
    ];
  }

  // ─── 2. Merchant Name Normalizer ───────────────────────────────────────────
  public static cleanMerchant(raw: string): string {
    if (!raw) return 'Unknown';
    let clean = raw.trim();

    // Strip common banking / UPI transaction prefixes
    clean = clean.replace(/^(upi\/|pos\/|imps\/|neft\/|rtgs\/|ach\/|e-transfer\/|dr\/|cr\/|transfer\s+to\s+|payment\s+to\s+|purchase\s+at\s+)/i, '');

    // Strip common UPI handles and bank suffixes
    clean = clean.replace(/(@okaxis|@okhdfcbank|@oksbi|@okicici|@paytm|@upi|@apl|@ybl|@ibl|@axl)/gi, '');

    // Strip trailing reference IDs, order numbers, or suffixes
    clean = clean.replace(/[*#][0-9a-z_-]+/gi, '');
    clean = clean.replace(/\s+(order|trip|ref|inv|txn|id|payment|bill)\b.*$/i, '');

    clean = clean.trim();
    if (clean.length === 0) return raw.trim();

    // Capitalize first letter of words
    return clean.replace(/\b\w/g, c => c.toUpperCase());
  }

  // ─── 3. Flexible CSV Parser & Normalizer ───────────────────────────────────
  public static async parseCSV(
    userId: string,
    csvContent: string,
    targetAccountId?: string
  ): Promise<CSVParseResult> {
    const lines = csvContent
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      throw new Error('CSV content is empty.');
    }

    // Split CSV line respecting quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += ch;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headerTokens = parseLine(lines[0]);
    const normalizedHeaders = headerTokens.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Detect column indexes
    let dateIdx = -1;
    let descIdx = -1;
    let amountIdx = -1;
    let debitIdx = -1;
    let creditIdx = -1;
    let typeIdx = -1;
    let categoryIdx = -1;
    let refIdx = -1;

    normalizedHeaders.forEach((h, idx) => {
      if (['date', 'txndate', 'transactiondate', 'valuedate', 'postingdate'].includes(h)) dateIdx = idx;
      else if (['description', 'narration', 'merchant', 'particulars', 'payee', 'title', 'remarks', 'details', 'name'].includes(h)) descIdx = idx;
      else if (['amount', 'txnamount', 'netamount', 'total'].includes(h)) amountIdx = idx;
      else if (['debit', 'withdrawal', 'dr', 'expenseamount'].includes(h)) debitIdx = idx;
      else if (['credit', 'deposit', 'cr', 'incomeamount'].includes(h)) creditIdx = idx;
      else if (['type', 'drcr', 'transactiontype', 'crdr'].includes(h)) typeIdx = idx;
      else if (['category', 'subcategory', 'tag'].includes(h)) categoryIdx = idx;
      else if (['ref', 'reference', 'refno', 'referencenumber', 'utr', 'txnid', 'transactionid', 'chequeno', 'id'].includes(h)) refIdx = idx;
    });

    // Fallbacks if header names are unconventional
    if (dateIdx === -1) dateIdx = 0;
    if (descIdx === -1) descIdx = Math.min(1, headerTokens.length - 1);
    if (amountIdx === -1 && debitIdx === -1 && creditIdx === -1) amountIdx = Math.min(2, headerTokens.length - 1);

    const columnMapping: Record<string, string> = {
      date: headerTokens[dateIdx] || 'Column ' + (dateIdx + 1),
      description: headerTokens[descIdx] || 'Column ' + (descIdx + 1),
      amount: amountIdx !== -1 ? headerTokens[amountIdx] : (debitIdx !== -1 && creditIdx !== -1 ? `${headerTokens[debitIdx]} / ${headerTokens[creditIdx]}` : 'Auto-detected'),
    };

    // Pre-fetch user's existing transactions for duplicate detection
    const existingTransactions = await Transaction.findAll({
      where: { userId },
      attributes: ['id', 'externalTransactionId', 'date', 'amount', 'type', 'merchant', 'title', 'source'],
    });

    const parsedRows: NormalizedTransaction[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    for (let r = 1; r < lines.length; r++) {
      const rowTokens = parseLine(lines[r]);
      if (rowTokens.length < 2 || rowTokens.every(t => t.trim() === '')) continue;

      const rawDate = rowTokens[dateIdx] || '';
      const rawDesc = rowTokens[descIdx] || '';
      const rawCategory = categoryIdx !== -1 ? rowTokens[categoryIdx] : '';
      const rawRef = refIdx !== -1 ? rowTokens[refIdx] : '';

      const validationErrors: string[] = [];

      // 1. Date Normalization (Supports YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY, DD/MM/YYYY)
      let normalizedDate = '';
      if (rawDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          normalizedDate = rawDate;
        } else {
          const parts = rawDate.split(/[-/.]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              // YYYY-MM-DD
              normalizedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            } else if (parts[2].length === 4) {
              // DD/MM/YYYY or MM/DD/YYYY (prefer DD-MM-YYYY if day > 12)
              const p1 = parseInt(parts[0], 10);
              const p2 = parseInt(parts[1], 10);
              const year = parts[2];
              if (p1 > 12) {
                // Definitely Day First
                normalizedDate = `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
              } else {
                // Default DD/MM/YYYY
                normalizedDate = `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
              }
            }
          }
        }
      }

      if (!normalizedDate || isNaN(new Date(normalizedDate).getTime())) {
        normalizedDate = new Date().toISOString().split('T')[0];
        validationErrors.push(`Unrecognized date format "${rawDate}", defaulted to today.`);
      }

      // 2. Amount & Type Normalization
      let amount = 0;
      let type: 'income' | 'expense' = 'expense';

      if (debitIdx !== -1 && creditIdx !== -1) {
        const rawDebit = (rowTokens[debitIdx] || '').replace(/[^0-9.-]/g, '');
        const rawCredit = (rowTokens[creditIdx] || '').replace(/[^0-9.-]/g, '');
        const debNum = parseFloat(rawDebit);
        const credNum = parseFloat(rawCredit);

        if (!isNaN(credNum) && credNum > 0) {
          amount = Math.abs(credNum);
          type = 'income';
        } else if (!isNaN(debNum) && debNum > 0) {
          amount = Math.abs(debNum);
          type = 'expense';
        }
      } else if (amountIdx !== -1) {
        const rawAmt = (rowTokens[amountIdx] || '').replace(/[^0-9.-]/g, '');
        const num = parseFloat(rawAmt);
        if (!isNaN(num)) {
          amount = Math.abs(num);
          if (typeIdx !== -1) {
            const rawType = (rowTokens[typeIdx] || '').toLowerCase();
            type = rawType.includes('cr') || rawType.includes('in') || rawType.includes('dep') ? 'income' : 'expense';
          } else {
            type = num < 0 ? 'expense' : 'expense'; // default expense unless positive keyword in description
            if (/salary|deposit|refund|interest|credit|dividend|received/i.test(rawDesc)) {
              type = 'income';
            }
          }
        }
      }

      if (amount <= 0) {
        validationErrors.push('Amount must be a positive number greater than 0.');
      }

      // 3. Merchant & Title Extraction
      const merchant = this.cleanMerchant(rawDesc);
      const title = merchant !== 'Unknown' ? merchant : (rawDesc || 'Imported Transaction');

      // 4. Category Prediction via Phase 4 Classifier
      let category = rawCategory.trim();
      let confidence = 0.95;

      if (!category) {
        const prediction = AIAdvisorService.suggestCategory(merchant || title);
        category = prediction.category;
        confidence = prediction.confidence;
      }

      // 5. Duplicate Detection
      let isDuplicate = false;
      let duplicateReason: string | null = null;

      if (rawRef && rawRef.trim().length > 0) {
        const matchedExternal = existingTransactions.find(
          t => t.externalTransactionId && t.externalTransactionId.trim() === rawRef.trim()
        );
        if (matchedExternal) {
          isDuplicate = true;
          duplicateReason = `Matched external reference ID: ${rawRef.trim()}`;
        }
      }

      if (!isDuplicate && amount > 0) {
        const matchedFuzzy = existingTransactions.find(
          t => t.date === normalizedDate && Math.abs(Number(t.amount) - amount) < 0.01 && t.type === type && (t.merchant?.toLowerCase() === merchant.toLowerCase() || t.title.toLowerCase() === title.toLowerCase())
        );
        if (matchedFuzzy) {
          isDuplicate = true;
          duplicateReason = `Existing transaction on ${normalizedDate} with identical amount (${amount}) and merchant (${merchant}).`;
        }
      }

      const isValid = validationErrors.length === 0 && amount > 0;

      if (isValid) validCount++;
      else invalidCount++;

      if (isDuplicate) duplicateCount++;

      if (isValid && !isDuplicate) {
        if (type === 'income') totalIncome += amount;
        else totalExpense += amount;
      }

      parsedRows.push({
        externalTransactionId: rawRef.trim() || null,
        date: normalizedDate,
        amount: Math.round(amount * 100) / 100,
        type,
        merchant,
        title,
        category,
        rawDescription: rawDesc.trim() || null,
        confidence,
        source: 'csv',
        accountId: targetAccountId || null,
        isDuplicate,
        duplicateReason,
        isValid,
        validationErrors,
      });
    }

    return {
      totalRows: parsedRows.length,
      validCount,
      invalidCount,
      duplicateCount,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      detectedColumns: headerTokens,
      columnMapping,
      rows: parsedRows,
    };
  }

  // ─── 4. Atomic Batch Confirm & Ingestion ───────────────────────────────────
  public static async confirmBatchImport(
    userId: string,
    transactionsToImport: NormalizedTransaction[],
    targetAccountId: string,
    skipDuplicates: boolean = true
  ): Promise<BatchImportResult> {
    if (!targetAccountId) {
      throw new Error('Target account ID is required for import.');
    }

    const account = await Account.findOne({
      where: { id: targetAccountId, userId },
    });

    if (!account) {
      throw new Error('Target account not found or does not belong to you.');
    }

    const dbTx = await sequelize.transaction();
    try {
      const createdList: Transaction[] = [];
      let importedCount = 0;
      let skippedDuplicatesCount = 0;
      let invalidCount = 0;
      let totalInflow = 0;
      let totalOutflow = 0;
      let balanceDelta = 0;

      for (const row of transactionsToImport) {
        if (!row.isValid || row.amount <= 0) {
          invalidCount++;
          continue;
        }

        if (row.isDuplicate && skipDuplicates) {
          skippedDuplicatesCount++;
          continue;
        }

        // Secondary DB level collision check if external ID is provided
        if (row.externalTransactionId) {
          const exists = await Transaction.findOne({
            where: {
              userId,
              externalTransactionId: row.externalTransactionId,
            },
            transaction: dbTx,
          });
          if (exists && skipDuplicates) {
            skippedDuplicatesCount++;
            continue;
          }
        }

        const tx = await Transaction.create(
          {
            userId,
            accountId: targetAccountId,
            title: row.title || row.merchant || 'Imported Transaction',
            merchant: row.merchant || row.title || 'Merchant',
            amount: Math.abs(row.amount),
            type: row.type,
            category: row.category || 'Other',
            date: row.date,
            icon: row.type === 'income' ? '💰' : '💳',
            source: row.source || 'csv',
            externalTransactionId: row.externalTransactionId || null,
            importedAt: new Date(),
            rawDescription: row.rawDescription || null,
            confidence: row.confidence || 1.0,
            ingestionStatus: 'processed',
          },
          { transaction: dbTx }
        );

        createdList.push(tx);
        importedCount++;

        if (row.type === 'income') {
          totalInflow += Math.abs(row.amount);
          balanceDelta += Math.abs(row.amount);
        } else {
          totalOutflow += Math.abs(row.amount);
          balanceDelta -= Math.abs(row.amount);
        }
      }

      // Atomically update account balance
      const currentBalance = parseFloat(account.balance as any) || 0;
      const newBalance = Math.round((currentBalance + balanceDelta) * 100) / 100;

      await account.update({ balance: newBalance }, { transaction: dbTx });
      await dbTx.commit();

      return {
        totalRows: transactionsToImport.length,
        importedCount,
        skippedDuplicatesCount,
        invalidCount,
        totalInflow: Math.round(totalInflow * 100) / 100,
        totalOutflow: Math.round(totalOutflow * 100) / 100,
        importedTransactions: createdList,
        accountBalanceAfter: newBalance,
        accountName: account.name,
      };
    } catch (err: any) {
      await dbTx.rollback();
      throw err;
    }
  }

  // ─── 5. Demo Simulated Automated Ingestion Event ───────────────────────────
  public static async simulateDemoIngestion(
    userId: string,
    payload: DemoIngestionPayload
  ): Promise<DemoIngestionResult> {
    // 1. Resolve Target Account
    let account: Account | null = null;
    if (payload.accountId) {
      account = await Account.findOne({ where: { id: payload.accountId, userId } });
    }
    if (!account) {
      account = await Account.findOne({ where: { userId }, order: [['createdAt', 'ASC']] });
    }
    if (!account) {
      account = await Account.create({
        userId,
        name: 'Primary Checking',
        type: 'checking',
        balance: 1000.0,
        bank: 'Chase',
        last4: '1001',
        color: '#6366f1',
      });
    }

    // 2. Resolve Transaction Details
    const rawDesc = payload.rawDescription || payload.merchant || 'UPI/Swiggy/Order#8912/P2M';
    const merchant = payload.merchant ? this.cleanMerchant(payload.merchant) : this.cleanMerchant(rawDesc);
    const amount = payload.amount && payload.amount > 0 ? payload.amount : 450.0;
    const type: 'income' | 'expense' = payload.type || 'expense';

    // 3. Category Prediction
    let category = payload.category;
    let confidence = 0.95;
    if (!category) {
      const pred = AIAdvisorService.suggestCategory(merchant);
      category = pred.category;
      confidence = pred.confidence;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const externalId = `DEMO-UPI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Ingest via Managed Database Transaction
    const dbTx = await sequelize.transaction();
    let createdTx: Transaction;
    const balanceBefore = parseFloat(account.balance as any) || 0;
    const balanceDelta = type === 'income' ? amount : -amount;
    const balanceAfter = Math.round((balanceBefore + balanceDelta) * 100) / 100;

    try {
      createdTx = await Transaction.create(
        {
          userId,
          accountId: account.id,
          title: merchant,
          merchant,
          amount,
          type,
          category,
          date: todayStr,
          icon: type === 'income' ? '💰' : '🍔',
          source: payload.source || 'demo',
          externalTransactionId: externalId,
          importedAt: new Date(),
          rawDescription: rawDesc,
          confidence,
          ingestionStatus: 'processed',
        },
        { transaction: dbTx }
      );

      await account.update({ balance: balanceAfter }, { transaction: dbTx });
      await dbTx.commit();
    } catch (err: any) {
      await dbTx.rollback();
      throw err;
    }

    // 5. Calculate Budget Impact for Feedback
    const currentMonthKey = todayStr.slice(0, 7);
    const budget = await Budget.findOne({
      where: {
        userId,
        category: { [Op.iLike]: category },
      },
    });

    let budgetStatus;
    if (budget) {
      const allExpenses = await Transaction.findAll({
        where: {
          userId,
          category: { [Op.iLike]: category },
          type: 'expense',
          date: {
            [Op.gte]: `${currentMonthKey}-01`,
            [Op.lte]: `${currentMonthKey}-31`,
          },
        },
      });

      const spentTotal = allExpenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      const budgeted = Number(budget.budgeted) || 1;
      const percentUsed = Math.round((spentTotal / budgeted) * 100);

      budgetStatus = {
        category,
        budgeted,
        spentBefore: Math.max(0, spentTotal - amount),
        spentAfter: spentTotal,
        percentUsed,
        isOverBudget: spentTotal > budgeted,
      };
    }

    // 6. Structured Notification & AI Recommendation
    const notification = {
      type: budgetStatus?.isOverBudget ? ('alert' as const) : ('transaction' as const),
      title: budgetStatus?.isOverBudget ? `⚠️ Budget Alert: ${category}` : `⚡ Ingested: ${merchant}`,
      message: budgetStatus?.isOverBudget
        ? `Automated transaction of $${amount.toFixed(2)} to ${merchant} put your ${category} budget at ${budgetStatus.percentUsed}%!`
        : `Simulated external payment of $${amount.toFixed(2)} recorded and categorized as ${category}.`,
    };

    const aiInsightRecommendation = budgetStatus?.isOverBudget
      ? `Your ${category} spending is now over budget by $${(budgetStatus.spentAfter - budgetStatus.budgeted).toFixed(2)}. Consider dining in for the rest of the week.`
      : `Transaction verified in PostgreSQL ledger. Account ${account.name} updated to $${balanceAfter.toFixed(2)}.`;

    return {
      transaction: createdTx,
      merchant,
      category,
      confidence,
      accountName: account.name,
      balanceBefore,
      balanceAfter,
      budgetStatus,
      notification,
      aiInsightRecommendation,
    };
  }
}
