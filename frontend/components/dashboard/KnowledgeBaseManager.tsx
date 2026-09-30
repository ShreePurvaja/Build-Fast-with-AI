'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Workflow
} from 'lucide-react';

interface VectorItem {
  id: string;
  workflow_id?: string;
  name: string;
  vertical?: string;
  description?: string;
  embedding_preview?: number[];
  embedding_dim?: number;
  dimensions?: number;
  engine?: string;
  status: string;
  nodes_count?: number;
  created_at?: number;
  similarity_score?: number;
}

export const KnowledgeBaseManager: React.FC = () => {
  const [vectorItems, setVectorItems] = useState<VectorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VectorItem[] | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [newDocText, setNewDocText] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Fetch all items from MongoDB Atlas Vector Store
  const fetchVectorStore = () => {
    setIsLoading(true);
    fetch('http://localhost:8000/api/vector/store')
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data && data.items) {
          setVectorItems(data.items);
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.error("Failed to fetch vector store:", err);
      });
  };

  useEffect(() => {
    fetchVectorStore();
  }, []);

  // Perform live semantic cosine similarity vector search
  const handleVectorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    fetch('http://localhost:8000/api/vector/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery, limit: 8 })
    })
      .then(res => res.json())
      .then(data => {
        setIsSearching(false);
        if (data && data.top_matches) {
          setSearchResults(data.top_matches);
        }
      })
      .catch(err => {
        setIsSearching(false);
        console.error("Vector search failed:", err);
      });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Add document to vector store
  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    setIsAddingDoc(true);
    fetch('http://localhost:8000/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newDocName,
        vertical: 'Policy / Knowledge Document',
        description: newDocText || `Indexed organizational policy document: ${newDocName}`,
        status: 'Active',
        nodes: []
      })
    })
      .then(res => res.json())
      .then(() => {
        setIsAddingDoc(false);
        setNewDocName('');
        setNewDocText('');
        fetchVectorStore();
      })
      .catch(() => {
        setIsAddingDoc(false);
      });
  };

  const displayList = searchResults !== null ? searchResults : vectorItems;

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#2B2826] pb-12">
      
      {/* 1. Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#E6F4F1] text-[#0F766E] text-xs font-extrabold px-2.5 py-1 rounded-lg border border-[#99F6E4] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
              <span>MongoDB Atlas Vector Search</span>
            </span>
            <span className="text-xs text-[#9B9488] font-bold">384-dim Dense Embeddings • Cosine Similarity</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2B2826] mt-2">
            Vector Database & Knowledge Store
          </h1>
          <p className="text-xs sm:text-sm text-[#6E685E] mt-1">
            Every created workflow and document is automatically tokenized, embedded into high-dimensional dense vectors, and persisted in MongoDB Atlas Vector Search.
          </p>
        </div>

        <button 
          onClick={fetchVectorStore}
          disabled={isLoading}
          className="bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#2B2826] border border-[#E6E1D7] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D97757]' : 'text-[#6E685E]'}`} />
          <span>Refresh Vectors</span>
        </button>
      </div>

      {/* 2. Interactive Semantic Vector Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-[#2B2826]">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D97757]" />
            <span>Semantic Vector Similarity Search</span>
          </span>
          <span className="text-[11px] text-[#9B9488] font-medium">
            Queries are embedded into 384-dim vectors and ranked by Cosine Similarity
          </span>
        </div>

        <form onSubmit={handleVectorSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9488]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by meaning... (e.g. 'doctor appointment', 'refund order', 'fleet logistics', 'loan credit score')"
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl focus:outline-none focus:border-[#D97757] font-medium"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-[#D97757] hover:bg-[#C56646] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Vector Search</span>
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-[#FAF8F5] hover:bg-[#EFEAE1] text-[#6E685E] px-3.5 py-2.5 rounded-xl text-xs font-bold border border-[#E6E1D7] transition-all cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>

        {searchResults !== null && (
          <div className="text-[11px] font-bold text-[#0F766E] bg-[#E6F4F1] px-3 py-1.5 rounded-lg border border-[#99F6E4] flex items-center justify-between">
            <span>Found {searchResults.length} matching vector records for "{searchQuery}"</span>
            <span className="text-[10px] text-[#0F766E] uppercase tracking-wide">Ranked by Cosine Score</span>
          </div>
        )}
      </div>

      {/* 3. Vector Database Records Table */}
      <div className="bg-white rounded-2xl border border-[#E6E1D7] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E6E1D7] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#D97757]" />
            <h3 className="font-extrabold text-xs text-[#2B2826] uppercase tracking-wider">
              Vector Database Records ({displayList.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#6E685E] bg-white px-2.5 py-0.5 rounded-md border border-[#E6E1D7]">
            Collection: vector_store
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-[#9B9488]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D97757]" />
            <span className="text-xs font-medium">Querying MongoDB Atlas Vector Store...</span>
          </div>
        ) : displayList.length === 0 ? (
          <div className="py-12 text-center text-[#9B9488] space-y-1">
            <Layers className="w-8 h-8 mx-auto text-[#D6CFBF] mb-2" />
            <p className="text-xs font-bold text-[#2B2826]">No Vector Records Found</p>
            <p className="text-[11px]">Create a new workflow in the dashboard or upload a document to generate embeddings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E6E1D7] text-[#6E685E] font-extrabold text-[11px]">
                  <th className="p-3.5">Record / Workflow</th>
                  <th className="p-3.5">Vector ID</th>
                  <th className="p-3.5">Dimensions</th>
                  {searchResults !== null && <th className="p-3.5">Similarity Score</th>}
                  <th className="p-3.5">Nodes / Chunks</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1] text-[#2B2826]">
                {displayList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#FDF3E9] text-[#D97757] flex items-center justify-center shrink-0 border border-[#E6E1D7]">
                          {item.workflow_id ? <Workflow className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#2B2826]">{item.name}</div>
                          <div className="text-[10.5px] text-[#9B9488] truncate max-w-xs">{item.vertical || item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[10.5px] text-[#6E685E]">
                      <span className="bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E6E1D7]">
                        {item.id}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#2B2826]">
                      <span className="bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded font-extrabold text-[10.5px] border border-[#C7D2FE]">
                        {item.dimensions || item.embedding_dim || 384}d float32
                      </span>
                    </td>
                    {searchResults !== null && (
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                          (item.similarity_score || 0) > 0.3 
                            ? 'bg-[#E6F4F1] text-[#0F766E] border-[#99F6E4]' 
                            : 'bg-[#FAF8F5] text-[#6E685E] border-[#E6E1D7]'
                        }`}>
                          {((item.similarity_score || 0) * 100).toFixed(1)}% match
                        </span>
                      </td>
                    )}
                    <td className="p-3.5 text-[#6E685E] font-medium text-[11px]">
                      {item.nodes_count ? `${item.nodes_count} canvas nodes` : 'Indexed Chunk'}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-[#E6F4F1] text-[#0F766E] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#99F6E4] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
                        <span>{item.status || 'Indexed & Vectorized'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Document Vectorizer Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-3">
        <h3 className="font-extrabold text-xs text-[#2B2826] uppercase tracking-wider flex items-center gap-2">
          <span>📄</span>
          <span>Index Custom Knowledge Document into Vector Store</span>
        </h3>
        <form onSubmit={handleUploadDoc} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="Document title (e.g. clinic_sop_2026.pdf)..."
              className="text-xs p-2.5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl focus:outline-none focus:border-[#D97757] font-medium"
            />
            <input
              type="text"
              value={newDocText}
              onChange={(e) => setNewDocText(e.target.value)}
              placeholder="Key policies, keywords, or summary..."
              className="text-xs p-2.5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl focus:outline-none focus:border-[#D97757] font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={isAddingDoc || !newDocName.trim()}
            className="bg-[#2B2826] hover:bg-[#1C1A18] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isAddingDoc ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />}
            <span>+ Embed & Store in Vector DB</span>
          </button>
        </form>
      </div>

      {/* 5. Security & Architecture Guardrail */}
      <div className="bg-[#E6F4F1] border border-[#99F6E4] p-4 rounded-2xl text-xs text-[#0F766E] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm mb-0.5">MongoDB Atlas Vector Search Active</h4>
          <p className="text-[#0E6059] leading-relaxed">
            All workflows and knowledge items are projected into a normalized 384-dimensional dense vector space. Semantic retrieval across user queries is scoped securely to your organization with prompt-injection filtering.
          </p>
        </div>
      </div>

    </div>
  );
};
