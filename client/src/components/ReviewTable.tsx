import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tag
} from 'lucide-react';
import type { AnalyzedReview, SentimentType } from '../types';

interface ReviewTableProps {
  reviews: AnalyzedReview[];
}

export const ReviewTable: React.FC<ReviewTableProps> = ({ reviews }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<'All' | SentimentType>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique topics and products for filters
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => r.detectedTopics.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [reviews]);

  const allProducts = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => {
      if (r.product_name) set.add(r.product_name);
    });
    return Array.from(set).sort();
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Sentiment filter
      if (selectedSentiment !== 'All' && r.sentiment !== selectedSentiment) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== 'All' && !r.detectedTopics.includes(selectedTopic)) {
        return false;
      }
      // Product filter
      if (selectedProduct !== 'All' && r.product_name !== selectedProduct) {
        return false;
      }
      // Rating filter
      if (selectedRating !== 'All') {
        if (selectedRating === 'none') {
          if (r.rating !== null) return false;
        } else {
          const num = parseInt(selectedRating, 10);
          if (r.rating === null || Math.round(r.rating) !== num) return false;
        }
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesText = r.review_text.toLowerCase().includes(q);
        const matchesTitle = r.review_title?.toLowerCase().includes(q) ?? false;
        const matchesProduct = r.product_name?.toLowerCase().includes(q) ?? false;
        const matchesTopics = r.detectedTopics.some((t) => t.toLowerCase().includes(q));
        if (!matchesText && !matchesTitle && !matchesProduct && !matchesTopics) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, selectedSentiment, selectedTopic, selectedProduct, selectedRating, searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedSentiment, selectedTopic, selectedProduct, selectedRating, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReviews.length / pageSize) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Header & Filter Bar */}
      <div className="p-5 border-b border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Analyzed Customer Reviews
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredReviews.length} of {reviews.length} total reviews
            </p>
          </div>

          {/* Quick Sentiment Pills */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/60 self-start sm:self-auto">
            {(['All', 'Positive', 'Neutral', 'Negative'] as const).map((sent) => (
              <button
                key={sent}
                onClick={() => setSelectedSentiment(sent)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedSentiment === sent
                    ? sent === 'Positive'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : sent === 'Negative'
                      ? 'bg-[#ED1C24] text-white shadow-xs'
                      : sent === 'Neutral'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sent}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search keyword or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:bg-white transition"
            />
          </div>

          {/* Topic Filter */}
          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer"
            >
              <option value="All">All Topics ({allTopics.length})</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Product Filter */}
          <div className="relative">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer"
            >
              <option value="All">All Products ({allProducts.length})</option>
              {allProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none cursor-pointer"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars (Excellent)</option>
              <option value="4">4 Stars (Good)</option>
              <option value="3">3 Stars (Average)</option>
              <option value="2">2 Stars (Poor)</option>
              <option value="1">1 Star (Critical)</option>
              <option value="none">No Rating Given</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Review Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-5/12">Review Content</th>
              <th className="py-3 px-4 w-2/12">Product & Date</th>
              <th className="py-3 px-4 w-1/12 text-center">Rating</th>
              <th className="py-3 px-4 w-2/12 text-center">Sentiment</th>
              <th className="py-3 px-4 w-2/12">Detected Topics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No reviews match your filters</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing the search term or switching sentiment/topic filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedReviews.map((rev) => (
                <tr key={rev.review_id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Review Text */}
                  <td className="py-3.5 px-4 align-top">
                    {rev.review_title && (
                      <div className="font-bold text-slate-900 mb-1 leading-snug">
                        {rev.review_title}
                      </div>
                    )}
                    <p className="text-slate-700 leading-relaxed break-words">
                      {rev.review_text}
                    </p>
                    {/* Keyword Chips */}
                    {rev.matchedKeywords && rev.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        <span className="text-[10px] text-slate-400 font-medium">Signals:</span>
                        {rev.matchedKeywords.slice(0, 4).map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Product & Date */}
                  <td className="py-3.5 px-4 align-top text-slate-600">
                    <div className="font-semibold text-slate-900 truncate max-w-[160px]" title={rev.product_name ?? 'Unspecified'}>
                      {rev.product_name ?? <span className="text-slate-400 italic">Unspecified</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {rev.review_date ?? 'No date'}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4 align-top text-center">
                    {rev.rating !== null ? (
                      <div className="inline-flex items-center gap-1 font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{rev.rating}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">N/A</span>
                    )}
                  </td>

                  {/* Sentiment & Confidence */}
                  <td className="py-3.5 px-4 align-top text-center">
                    <div className="inline-block text-left">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          rev.sentiment === 'Positive'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rev.sentiment === 'Negative'
                            ? 'bg-rose-50 text-[#ED1C24] border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {rev.sentiment}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 text-center font-medium">
                        Conf: {Math.round(rev.confidence * 100)}%
                      </div>
                    </div>
                  </td>

                  {/* Detected Topics */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-wrap gap-1">
                      {rev.detectedTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          {topic}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredReviews.length > pageSize && (
        <div className="p-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredReviews.length)} of {filteredReviews.length}{' '}
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-semibold text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
