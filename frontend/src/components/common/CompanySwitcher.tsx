import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronDown, Check, Building2, ExternalLink } from 'lucide-react';
import { fetchCompanies } from '../../services/api';
import type { CompanyMetadata } from '../../types';

interface CompanySwitcherProps {
  currentCompanyId?: string;
  onCompanyChange?: (company: CompanyMetadata) => void;
}

export const CompanySwitcher: React.FC<CompanySwitcherProps> = ({ currentCompanyId, onCompanyChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ companyId?: string }>();
  const [companies, setCompanies] = useState<CompanyMetadata[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeId = currentCompanyId || params.companyId || 'company-1';

  useEffect(() => {
    fetchCompanies()
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(data);
        } else {
          console.error('API returned non-array data:', data);
          setCompanies([]);
        }
      })
      .catch((err) => console.error('Failed to load companies in switcher:', err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCompany = companies.find(
    (c) => c.company_id === activeId || c.company_slug === activeId
  ) || companies[0] || {
    company_id: 'company-1',
    company_name: 'Company 1 (OmniStore Retail)',
    company_slug: 'company-1',
    logo_badge: '🛍️',
    industry: 'Retail',
    brand_color: '#3b82f6',
    dataset_status: 'Active',
  };

  const handleSelectCompany = (comp: CompanyMetadata) => {
    setIsOpen(false);
    if (onCompanyChange) {
      onCompanyChange(comp);
    }
    
    // Maintain active submodule path (e.g. /company/company-1/customers -> /company/company-2/customers)
    const pathParts = location.pathname.split('/').filter(Boolean);
    let subModule = '';
    if (pathParts.length >= 3 && pathParts[0] === 'company') {
      subModule = `/${pathParts.slice(2).join('/')}`;
    }
    
    navigate(`/company/${comp.company_id}${subModule}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm"
        aria-label="Switch Company"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-inner"
          style={{ backgroundColor: `${currentCompany.brand_color || '#3b82f6'}25` }}
        >
          {currentCompany.logo_badge || '🏢'}
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-xs font-bold block leading-tight truncate max-w-[140px] md:max-w-[180px]">
            {currentCompany.company_name}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
            {currentCompany.industry}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 size={12} className="text-blue-500" />
              Switch Analytics Company
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/');
              }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Catalog</span>
              <ExternalLink size={10} />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto py-1.5 space-y-1 custom-scrollbar">
            {companies.map((comp) => {
              const isSelected = comp.company_id === currentCompany.company_id;
              const color = comp.brand_color || '#3b82f6';
              return (
                <button
                  key={comp.company_id}
                  onClick={() => handleSelectCompany(comp)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-inner"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {comp.logo_badge || '🏢'}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'}`}>
                        {comp.company_name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {comp.industry} • {comp.dataset_status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check size={16} className="text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySwitcher;
