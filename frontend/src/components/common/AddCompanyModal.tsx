import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Database,
  RefreshCw,
  Sparkles,
  Layers,
  Coins,
} from 'lucide-react';
import { previewDatasetFile, createCompanyWithDataset, uploadCompanyDataset } from '../../services/api';
import type { DatasetPreviewResponse, CompanyMetadata } from '../../types';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: (company: CompanyMetadata) => void;
  targetCompany?: CompanyMetadata | null;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onCompanyCreated,
  targetCompany,
}) => {
  const navigate = useNavigate();

  // Wizard Steps: 1 = Profile, 2 = Upload, 3 = Preview & Mapping, 4 = Ingestion/Success
  const [step, setStep] = useState<number>(targetCompany ? 2 : 1);

  // Step 1: Company Profile Form
  const [companyName, setCompanyName] = useState<string>(targetCompany?.company_name || '');
  const [companySlug, setCompanySlug] = useState<string>(targetCompany?.company_slug || '');
  const [industry, setIndustry] = useState<string>(targetCompany?.industry || 'E-Commerce');
  const [baseCurrency, setBaseCurrency] = useState<'INR' | 'USD'>(targetCompany?.base_currency || 'INR');
  const [logoBadge, setLogoBadge] = useState<string>(targetCompany?.logo_badge || '🏢');
  const [description, setDescription] = useState<string>(targetCompany?.description || '');

  // Step 2: File Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 3: Column Mapping State
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Step 4: Submission & Ingestion State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdCompany, setCreatedCompany] = useState<CompanyMetadata | null>(null);
  const [ingestionProgress, setIngestionProgress] = useState<string>('Uploading dataset...');

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCompanyName(val);
    if (!companySlug || companySlug === companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      setCompanySlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    setIsPreviewLoading(true);

    try {
      const preview = await previewDatasetFile(file);
      setPreviewData(preview);
      setColumnMapping(preview.validation.suggested_mapping || {});
      setStep(3);
    } catch (err: any) {
      console.error('File preview error:', err);
      setUploadError(err.response?.data?.detail || 'Failed to read dataset. Ensure valid CSV or Excel format.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleMappingChange = (colName: string, targetField: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [colName]: targetField,
    }));
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setStep(4);
    setIngestionProgress('Uploading and parsing dataset...');

    try {
      setTimeout(() => setIngestionProgress('Validating transactions & normalizing schema...'), 600);
      setTimeout(() => setIngestionProgress('Computing RFM clusters & customer lifetime values...'), 1400);
      setTimeout(() => setIngestionProgress('Generating ARIMA models & updating dashboard...'), 2200);

      let resCompany: CompanyMetadata;
      if (targetCompany) {
        const res = await uploadCompanyDataset(targetCompany.company_id, selectedFile, columnMapping);
        resCompany = res.company;
      } else {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('company_name', companyName.trim() || 'Custom Enterprise');
        formData.append('company_slug', companySlug.trim() || 'custom-company');
        formData.append('industry', industry);
        formData.append('description', description.trim() || `Enterprise analytics dataset for ${companyName}.`);
        formData.append('base_currency', baseCurrency);
        formData.append('logo_badge', logoBadge);
        formData.append('brand_color', '#3b82f6');
        formData.append('column_mapping', JSON.stringify(columnMapping));

        const res = await createCompanyWithDataset(formData);
        resCompany = res.company;
      }

      setCreatedCompany(resCompany);
      onCompanyCreated(resCompany);
    } catch (err: any) {
      console.error('Company creation / upload error:', err);
      setUploadError(err.response?.data?.detail || 'Failed to import dataset. Please check column mappings.');
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logoOptions = ['🛍️', '⚡', '✨', '🌿', '🍇', '💄', '👟', '📱', '🏢', '🛒', '📦', '🚀'];

  const targetFieldOptions = [
    { value: 'order_id', label: 'Order ID (Required)' },
    { value: 'customer_id', label: 'Customer ID' },
    { value: 'order_date', label: 'Order Date (Required)' },
    { value: 'total_amount', label: 'Total Revenue / Amount' },
    { value: 'product_id', label: 'Product ID / SKU' },
    { value: 'product_name', label: 'Product Name' },
    { value: 'category', label: 'Category' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'unit_price', label: 'Unit Price' },
    { value: 'unit_cost', label: 'Unit Cost (COGS)' },
    { value: 'discount', label: 'Discount' },
    { value: 'shipping_state', label: 'Shipping Region / State' },
    { value: 'acquisition_channel', label: 'Acquisition Channel' },
    { value: 'order_status', label: 'Order Status' },
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'email', label: 'Customer Email' },
    { value: 'ignore', label: '— Ignore Column —' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
              <Building2 className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Add Company & Dataset</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60">
                  Step {step} of 4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Upload custom e-commerce sales datasets for automated RFM, Churn AI, and Revenue Intelligence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* STEP 1: COMPANY PROFILE FORM */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Company / Brand Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Myntra Fashion, Flipkart, Tata Neu"
                    value={companyName}
                    onChange={handleNameChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Company Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    URL Identifier (Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. myntra-fashion"
                    value={companySlug}
                    onChange={(e) => setCompanySlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="E-Commerce">E-Commerce & Retail</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Food & Beverage Organics">Food & Beverage Organics</option>
                    <option value="Home & Modern Living">Home & Modern Living</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Multi-Category Retail">Multi-Category Retail</option>
                  </select>
                </div>

                {/* Base Currency */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Company Base Currency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBaseCurrency('INR')}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        baseCurrency === 'INR'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-600 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Coins size={14} className="text-amber-400" />
                      <span>₹ INR (Indian Rupee)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBaseCurrency('USD')}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        baseCurrency === 'USD'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-600 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>$ USD (US Dollar)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Badge Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Brand Icon / Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {logoOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setLogoBadge(emoji)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                        logoBadge === emoji
                          ? 'bg-blue-600/30 border-blue-500 scale-110 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Business Description / Profile
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of company business model, regional reach, or product catalog."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!companyName.trim()}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <span>Continue to Upload Dataset</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FILE UPLOAD DROPZONE */}
          {step === 2 && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 rounded-3xl p-10 text-center transition-colors cursor-pointer group"
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                />

                <div className="w-16 h-16 rounded-3xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  Upload Company Sales Dataset
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Drag and drop your file here, or click to browse. Supports <strong className="text-slate-200">CSV</strong> and <strong className="text-slate-200">Excel (.xlsx)</strong> up to 50MB.
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
                  <FileSpreadsheet size={13} className="text-emerald-400" />
                  <span>Supports arbitrary columns (Order ID, Dates, SKU, Quantity, Revenue, State)</span>
                </div>
              </div>

              {isPreviewLoading && (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs flex items-center justify-center gap-3">
                  <RefreshCw size={16} className="animate-spin text-blue-400" />
                  <span>Parsing dataset, checking columns, and generating health preview...</span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: COLUMN MAPPING & DATA PREVIEW */}
          {step === 3 && previewData && (
            <div className="space-y-6">
              {/* Dataset Summary Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">File</span>
                  <span className="font-semibold text-slate-200 truncate block">{previewData.file_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Rows</span>
                  <span className="font-semibold text-slate-200">{previewData.total_rows.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Columns</span>
                  <span className="font-semibold text-slate-200">{previewData.total_columns}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Duplicates</span>
                  <span className="font-semibold text-slate-200">{previewData.validation.duplicate_rows}</span>
                </div>
              </div>

              {/* Validation Warnings / Status */}
              {previewData.validation.warnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Dataset Diagnostics:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                    {previewData.validation.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Column Mapping Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Column Schema Mapping</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Verify auto-detected fields or adjust mappings below
                  </span>
                </h3>

                <div className="rounded-2xl border border-slate-800 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5 font-bold">Uploaded Header</th>
                        <th className="px-4 py-2.5 font-bold">Data Type</th>
                        <th className="px-4 py-2.5 font-bold">Missing</th>
                        <th className="px-4 py-2.5 font-bold">Target Schema Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {previewData.validation.column_summary.map((col) => (
                        <tr key={col.column_name} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2 font-semibold text-slate-200">{col.column_name}</td>
                          <td className="px-4 py-2 text-slate-400 capitalize">{col.data_type}</td>
                          <td className="px-4 py-2 text-slate-400">
                            {col.missing_count > 0 ? (
                              <span className="text-amber-400 font-semibold">{col.missing_count} ({col.missing_pct}%)</span>
                            ) : (
                              <span className="text-emerald-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={columnMapping[col.column_name] || 'ignore'}
                              onChange={(e) => handleMappingChange(col.column_name, e.target.value)}
                              className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {targetFieldOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Preview Table (First 10 Rows) */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  First 10 Data Rows Preview
                </h3>
                <div className="rounded-2xl border border-slate-800 overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800 sticky top-0">
                      <tr>
                        {previewData.columns.map((c) => (
                          <th key={c} className="px-3 py-2 font-bold">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {previewData.preview_rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/30">
                          {previewData.columns.map((c) => (
                            <td key={c} className="px-3 py-1.5 text-slate-300">{String(row[c] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Choose Another File</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <span>Confirm & Import Dataset</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING / SUCCESS */}
          {step === 4 && (
            <div className="py-12 text-center space-y-6">
              {isSubmitting ? (
                <div>
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw size={28} className="animate-spin text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Processing Company Dataset
                  </h3>
                  <p className="text-xs text-blue-400 font-semibold">{ingestionProgress}</p>
                </div>
              ) : createdCompany ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {createdCompany.company_name} Added Successfully!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All datasets have been cleaned, normalized, and precomputed with RFM segmentations, churn risk scores, and revenue forecasting.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      Back to Catalog
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/company/${createdCompany.company_id}`);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      <span>Explore Analytics Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;
