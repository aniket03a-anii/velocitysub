import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { DataService, subscribeDataChanges } from '../services/dataService';
import { Transaction } from '../types';
import { BrandIcon } from '../components/common/BrandIcon';

interface TransactionsPageProps {
  onNavigate: (path: string) => void;
  initialSearch?: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onNavigate,
  initialSearch = ''
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [modeFilter, setModeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const pageSize = 20;

  const loadData = () => {
    setTransactions(DataService.getTransactions());
  };

  useEffect(() => {
    loadData();
    return subscribeDataChanges(loadData);
  }, []);

  const categories = Array.from(new Set(transactions.map((t) => t.category)));
  const modes = Array.from(new Set(transactions.map((t) => t.mode)));

  // Filter
  const filtered = transactions.filter((tx) => {
    const query = search.toLowerCase();
    const matchSearch =
      tx.merchant_original.toLowerCase().includes(query) ||
      tx.merchant_normalized.toLowerCase().includes(query) ||
      (tx.reference && tx.reference.toLowerCase().includes(query));

    const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchRecurring = !recurringOnly || tx.is_recurring;
    const matchMode = modeFilter === 'all' || tx.mode === modeFilter;

    return matchSearch && matchCategory && matchRecurring && matchMode;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this transaction record?')) {
      DataService.deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Banking & Passbook
          </span>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
            Passbook Ledger
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Raw bank descriptors normalized and audited by SubMate recurrence detection engine.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => DataService.exportTransactionsCSV()}
            className="px-3.5 py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5"
            title="Download passbook transactions as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('/import')}
            className="px-4 py-2 text-xs font-black text-black bg-white hover:bg-zinc-200 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Statement</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by merchant, UPI reference, or category..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-white text-white placeholder:text-zinc-600"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none font-medium"
          >
            <option value="all">All Payment Modes</option>
            {modes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs text-zinc-300 font-bold cursor-pointer select-none px-2 py-1">
            <input
              type="checkbox"
              checked={recurringOnly}
              onChange={(e) => {
                setRecurringOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded bg-zinc-950 border-zinc-700 text-white focus:ring-0"
            />
            <span>Recurring Mandates Only</span>
          </label>
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Showing {filtered.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Date</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Merchant (Normalized)</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Raw Statement String</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Category</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Payment Mode</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Recurrence</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-400">{tx.date}</td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      <div className="flex items-center gap-2.5">
                        <BrandIcon name={tx.merchant_normalized} size="sm" />
                        <span>{tx.merchant_normalized}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] truncate max-w-[200px]" title={tx.merchant_original}>
                      {tx.merchant_original}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{tx.category}</td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">{tx.mode}</td>
                    <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                      ₹{tx.amount.toLocaleString('en-IN')}/-
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.is_recurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" />
                          <span>Recurring</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">One-Time</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          title="View Details"
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          title="Delete"
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Page <span className="font-bold text-white font-mono">{currentPage}</span> of{' '}
              <span className="font-bold text-white font-mono">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Transaction Passbook Record
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Amount Debited</p>
                  <p className="text-2xl font-black text-white font-mono mt-0.5">
                    ₹{selectedTx.amount.toLocaleString('en-IN')}/-
                  </p>
                </div>
                <BrandIcon name={selectedTx.merchant_normalized} size="lg" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Normalized Merchant:</span>
                  <span className="font-extrabold text-white">{selectedTx.merchant_normalized}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Original Descriptor:</span>
                  <span className="font-mono text-zinc-300 text-right">{selectedTx.merchant_original}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Booking Date:</span>
                  <span className="font-mono text-zinc-300">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Category:</span>
                  <span className="text-zinc-300">{selectedTx.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Payment Mode:</span>
                  <span className="font-mono text-zinc-300">{selectedTx.mode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-500">Reference / RRN:</span>
                  <span className="font-mono text-zinc-300">{selectedTx.reference || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Recurrence Confidence:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedTx.recurrence_confidence}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-white text-black font-black rounded-xl text-xs hover:bg-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
