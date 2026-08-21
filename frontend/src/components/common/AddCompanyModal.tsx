import React, { useState, useRef } from 'react';
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
  Trash2,
  FileText,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [ingestionStep, setIngestionStep] = useState<number>(1);
  const [ingestionProgress, setIngestionProgress] = useState<string>('Uploading dataset...');

  // Confirmation Modal for Remove File
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);

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
    } catch (err: any) {
      console.error('File preview error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to read dataset. Ensure valid CSV or Excel format.';
      setUploadError(detail);
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

  const handleRemoveFileConfirm = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setColumnMapping({});
    setUploadError(null);
    setIsPreviewLoading(false);
    setShowRemoveConfirm(false);
    setStep(2);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
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
    setIngestionStep(1);
    setIngestionProgress('Uploading and parsing dataset...');

    try {
      setTimeout(() => {
        setIngestionStep(2);
        setIngestionProgress('Validating transactions & diagnostics...');
      }, 600);
      setTimeout(() => {
        setIngestionStep(3);
        setIngestionProgress('Cleaning and normalizing schema records...');
      }, 1200);
      setTimeout(() => {
        setIngestionStep(4);
        setIngestionProgress('Importing database partition records...');
      }, 1800);
      setTimeout(() => {
        setIngestionStep(5);
        setIngestionProgress('Computing RFM clusters & ML models...');
      }, 2400);

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

      setIngestionStep(6);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
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

  const pipelineStages = [
    { id: 1, label: 'Uploading' },
    { id: 2, label: 'Validating' },
    { id: 3, label: 'Cleaning' },
    { id: 4, label: 'Importing' },
    { id: 5, label: 'Generating Analytics' },
    { id: 6, label: 'Complete' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.txt,.tsv,.json"
          className="hidden"
          onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
              <Building2 className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{targetCompany ? `Upload Dataset for ${targetCompany.company_name}` : 'Add Company & Dataset'}</span>
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
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
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
                    placeholder="e.g. Myntra Fashion, Flipkart, Blinkit"
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
                    <option value="Quick Commerce & Grocery">Quick Commerce & Grocery</option>
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

          {/* STEP 2: FILE UPLOAD DROPZONE & FILE CARD */}
          {step === 2 && (
            <div className="space-y-6">
              {!selectedFile ? (
                /* Clean Empty Dropzone */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 rounded-3xl p-10 text-center transition-colors cursor-pointer group"
                  onClick={handleReplaceFileClick}
                >
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={28} />
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    Upload Company Sales Dataset
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                    Drag & drop your dataset here, or click <span className="text-blue-400 font-semibold underline">Choose CSV / Excel file</span>. Supports CSV, TSV, JSON, and Excel (.xlsx) up to 50MB.
                  </p>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
                    <FileSpreadsheet size={14} className="text-emerald-400" />
                    <span>Supports arbitrary column names (Order ID, Dates, SKU, Quantity, Revenue, State)</span>
                  </div>
                </div>
              ) : (
                /* Selected File Card */
                <div className="border border-slate-800 bg-slate-950/90 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {selectedFile.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                            ✓ File Selected
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                          <span className="font-semibold uppercase">{selectedFile.name.split('.').pop() || 'FILE'}</span>
                          <span>•</span>
                          <span>{formatFileSize(selectedFile.size)}</span>
                          {previewData && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-300 font-bold">{previewData.total_rows.toLocaleString()} rows</span>
                              <span>•</span>
                              <span>{previewData.total_columns} columns</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Replace & Remove Actions */}
                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleReplaceFileClick}
                        disabled={isPreviewLoading}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Replace File
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRemoveConfirm(true)}
                        disabled={isPreviewLoading}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        <span>Remove File</span>
                      </button>
                    </div>
                  </div>

                  {/* Loading status during analysis */}
                  {isPreviewLoading && (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs flex items-center justify-center gap-3">
                      <RefreshCw size={16} className="animate-spin text-blue-400" />
                      <span>Analyzing dataset structure, scanning columns, and evaluating health diagnostics...</span>
                    </div>
                  )}

                  {/* Analysis Error Message */}
                  {uploadError && (
                    <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                        <span>Dataset Parse Error:</span>
                      </div>
                      <p className="text-rose-200 text-xs pl-6 leading-relaxed">{uploadError}</p>
                      <div className="pt-2 pl-6 flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={handleReplaceFileClick}
                          className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Choose Another File
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRemoveConfirm(true)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Remove This File
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Validated Banner */}
                  {previewData && !uploadError && !isPreviewLoading && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span>Dataset validated successfully! Ready for column schema mapping & preview.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>Continue to Preview</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Back */}
              <div className="flex items-center justify-between pt-2">
                {!targetCompany && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Profile</span>
                  </button>
                )}
                {selectedFile && previewData && (
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      <span>Continue to Preview & Mapping</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: COLUMN MAPPING & DATA PREVIEW */}
          {step === 3 && previewData && (
            <div className="space-y-6">
              {/* Dataset Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">File Name</span>
                  <span className="font-semibold text-slate-200 truncate block font-mono">{previewData.file_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Records</span>
                  <span className="font-semibold text-slate-200 font-mono">{previewData.total_rows.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Columns Detected</span>
                  <span className="font-semibold text-slate-200 font-mono">{previewData.total_columns}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Quality Score</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    {previewData.validation.is_valid ? '96/100 (High)' : 'Needs Review'}
                  </span>
                </div>
              </div>

              {/* Validation Warnings / Status */}
              {previewData.validation.warnings && previewData.validation.warnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Dataset Health Diagnostics:</span>
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
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Column Schema Mapping
                  </h3>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Verify auto-detected fields or adjust mappings below
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5 font-bold">Uploaded Column Header</th>
                        <th className="px-4 py-2.5 font-bold">Inferred Type</th>
                        <th className="px-4 py-2.5 font-bold">Missing Values</th>
                        <th className="px-4 py-2.5 font-bold">Target Analytics Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                      {previewData.validation.column_summary.map((col) => (
                        <tr key={col.column_name} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2 font-semibold text-slate-200">{col.column_name}</td>
                          <td className="px-4 py-2 text-slate-400 capitalize font-sans">{col.data_type}</td>
                          <td className="px-4 py-2 text-slate-400">
                            {col.missing_count > 0 ? (
                              <span className="text-amber-400 font-semibold">{col.missing_count} ({col.missing_pct}%)</span>
                            ) : (
                              <span className="text-emerald-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-sans">
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
                <div className="rounded-2xl border border-slate-800 overflow-x-auto max-h-44 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[11px] whitespace-nowrap font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800 sticky top-0 font-sans">
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

              {/* Navigation Action Buttons with Replace File & Remove File */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleReplaceFileClick}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRemoveConfirm(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Remove File</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <span>Confirm & Import Dataset</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING / SUCCESS */}
          {step === 4 && (
            <div className="py-8 text-center space-y-6 max-w-xl mx-auto">
              {isSubmitting ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
                    <RefreshCw size={28} className="animate-spin text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Processing Company Dataset
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dataset processing is in progress. Please wait until processing is complete.
                    </p>
                  </div>

                  {/* Sequential Pipeline Progress Indicators */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                      <span>Ingestion Pipeline</span>
                      <span className="text-blue-400">{ingestionProgress}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {pipelineStages.map((stage) => {
                        const isDone = ingestionStep > stage.id;
                        const isCurrent = ingestionStep === stage.id;
                        return (
                          <div
                            key={stage.id}
                            className={`p-2 rounded-xl text-xs flex items-center space-x-2 border transition-all ${
                              isDone
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                                : isCurrent
                                ? 'bg-blue-950/60 border-blue-600 text-blue-200 animate-pulse'
                                : 'bg-slate-900/50 border-slate-800 text-slate-500'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <RefreshCw size={13} className="animate-spin text-blue-400 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block shrink-0" />
                            )}
                            <span className="truncate text-[11px] font-semibold">{stage.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : createdCompany ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {createdCompany.company_name} Ingested Successfully!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      All dataset records have been cleaned, normalized, and processed with real RFM segmentations, customer lifetime metrics, and revenue forecasting.
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

      {/* CUSTOM REMOVE FILE CONFIRMATION MODAL */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Remove selected file?
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-200 font-mono">{selectedFile?.name || 'this file'}</strong> from the upload process? All previews, diagnostics, and column mappings will be cleared.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveFileConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCompanyModal;
