import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Plus, Trash2, List, X, CheckSquare, Square } from 'lucide-react';
import { parseExcelFile, parseCSVFile } from '../utils/fileParser';
import { generateWheelList } from '../services/geminiService';
import { FileType } from '../types';

interface InputControlsProps {
  onUpdateSegments: (items: string[]) => void;
  currentItems: string[];
  isSpinning: boolean;
}

const InputControls: React.FC<InputControlsProps> = ({ onUpdateSegments, currentItems, isSpinning }) => {
  const [inputText, setInputText] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QUAN TRỌNG: Tự động reset lựa chọn mỗi khi danh sách thay đổi (thêm, xóa, upload)
  // Điều này đảm bảo các index trong selectedIndices luôn hợp lệ so với danh sách hiện tại
  useEffect(() => {
    setSelectedIndices(new Set());
  }, [currentItems]);

  const handleManualAdd = () => {
    if (!inputText.trim() || isSpinning) return;
    const newItemsInput = inputText.split('\n').map(s => s.trim()).filter(Boolean);
    onUpdateSegments([...currentItems, ...newItemsInput]);
    setInputText("");
  };

  const handleClearAll = () => {
    if (isSpinning) return;
    if (window.confirm("Bạn có chắc muốn xóa tất cả danh sách không?")) {
      onUpdateSegments([]);
    }
  };

  const handleDeleteItem = (index: number) => {
    if (isSpinning) return;
    // Tạo mảng mới loại bỏ phần tử tại index
    const newItems = currentItems.filter((_, i) => i !== index);
    onUpdateSegments(newItems);
  };

  const toggleSelection = (index: number) => {
    if (isSpinning) return;
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const toggleSelectAll = () => {
    if (isSpinning) return;
    if (selectedIndices.size === currentItems.length) {
      setSelectedIndices(new Set());
    } else {
      const allIndices = new Set(currentItems.map((_, i) => i));
      setSelectedIndices(allIndices);
    }
  };

  const handleDeleteSelected = () => {
    if (isSpinning || selectedIndices.size === 0) return;
    
    if (window.confirm(`Xác nhận xóa ${selectedIndices.size} mục đã chọn?`)) {
      // Logic lọc: Giữ lại những item có index KHÔNG nằm trong tập đã chọn
      const newItems = currentItems.filter((_, index) => !selectedIndices.has(index));
      onUpdateSegments(newItems);
      // useEffect ở trên sẽ tự động clear selection sau khi currentItems thay đổi
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSpinning) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let items: string[] = [];
      if (file.type === FileType.CSV || file.name.endsWith('.csv')) {
        items = await parseCSVFile(file);
      } else {
        items = await parseExcelFile(file);
      }

      if (items.length > 0) {
        onUpdateSegments([...currentItems, ...items]);
        alert(`Đã nhập thành công ${items.length} mục!`);
      } else {
        alert("Không tìm thấy dữ liệu trong file.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi đọc file. Vui lòng đảm bảo file đúng định dạng.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiGenerate = async () => {
    if (isSpinning) return;
    if (!aiTopic.trim()) {
      alert("Vui lòng nhập chủ đề!");
      return;
    }

    setIsAiLoading(true);
    try {
      const items = await generateWheelList(aiTopic);
      if (items.length > 0) {
        onUpdateSegments([...currentItems, ...items]);
        setAiTopic(""); 
      } else {
        alert("Không tạo được danh sách. Vui lòng thử lại.");
      }
    } catch (error) {
      alert("Lỗi kết nối Gemini API. Vui lòng kiểm tra API Key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-xl h-full flex flex-col border border-slate-200 ${isSpinning ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Header */}
      <h2 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
        <List className="w-6 h-6 text-blue-700" /> 
        Danh sách quay
      </h2>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg mb-4 shadow-inner">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            activeTab === 'manual' 
              ? 'bg-white text-blue-800 shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Thủ công / Excel
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ai' 
              ? 'bg-white text-purple-800 shadow-sm ring-1 ring-slate-200' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Gemini AI
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="flex flex-col gap-3 flex-none mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
              Thêm tên mới
            </label>
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 min-h-[80px] p-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-0 transition-colors outline-none resize-none text-sm font-medium placeholder:text-slate-400"
                placeholder="Nhập tên (mỗi dòng 1 tên)..."
                disabled={isSpinning}
              />
              <button 
                onClick={handleManualAdd}
                disabled={!inputText.trim() || isSpinning}
                className="w-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex flex-col items-center justify-center gap-1 transition-colors shadow-sm font-bold"
                title="Thêm vào danh sách"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px]">THÊM</span>
              </button>
            </div>
          </div>

          <div>
             <input 
              type="file" 
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
              className="hidden" 
              id="file-upload"
              disabled={isSpinning}
            />
            <label 
              htmlFor="file-upload"
              className={`w-full py-2 border border-slate-300 bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isSpinning ? 'cursor-not-allowed opacity-50' : 'hover:bg-white hover:border-blue-500 hover:text-blue-700 cursor-pointer shadow-sm'}`}
            >
              <Upload className="w-4 h-4" /> Nhập từ Excel / CSV
            </label>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-none mb-4">
          <div>
            <label className="block text-xs font-bold text-purple-800 uppercase mb-1">
              Chủ đề vòng quay
            </label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-purple-100 bg-purple-50 text-purple-900 focus:border-purple-500 focus:bg-white transition-all outline-none text-sm font-medium"
              placeholder="VD: Món ăn, Tên nhân viên..."
              disabled={isSpinning}
            />
          </div>
          <button 
            onClick={handleAiGenerate}
            disabled={isAiLoading || !aiTopic.trim() || isSpinning}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isAiLoading ? (
               <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isAiLoading ? 'Đang suy nghĩ...' : 'Tạo danh sách'}
          </button>
        </div>
      )}

      {/* List Header & Actions */}
      <div className="flex flex-col flex-1 min-h-0 border-t-2 border-slate-100 pt-3">
        <div className="flex justify-between items-center mb-2 shrink-0 h-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              Tổng: {currentItems.length}
            </span>
            {currentItems.length > 0 && (
              <button 
                onClick={toggleSelectAll}
                disabled={isSpinning}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              >
                {selectedIndices.size === currentItems.length ? 'Bỏ chọn' : 'Chọn hết'}
              </button>
            )}
          </div>

          {selectedIndices.size > 0 ? (
            <button 
              onClick={handleDeleteSelected}
              disabled={isSpinning}
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md animate-in fade-in zoom-in duration-200"
            >
              <Trash2 className="w-3 h-3" /> Xóa ({selectedIndices.size})
            </button>
          ) : (
             currentItems.length > 0 && (
              <button 
                onClick={handleClearAll}
                disabled={isSpinning}
                className="text-xs font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1"
              >
                <Trash2 className="w-3 h-3" /> Xóa hết
              </button>
            )
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-hidden bg-white rounded-lg border border-slate-200 relative">
           {currentItems.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <List className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Danh sách trống</p>
             </div>
           ) : (
             <ul className="absolute inset-0 overflow-y-auto custom-scrollbar">
               {currentItems.map((item, idx) => {
                 const isSelected = selectedIndices.has(idx);
                 return (
                   <li 
                      key={`${idx}-${item}`}
                      onClick={() => toggleSelection(idx)}
                      className={`
                        group flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 cursor-pointer select-none transition-colors
                        ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}
                        ${isSpinning ? 'cursor-not-allowed opacity-60' : ''}
                      `}
                   >
                      <div className={`shrink-0 transition-transform duration-200 ${isSelected ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 fill-blue-50" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                      
                      <span className="text-slate-400 text-xs w-6 shrink-0 text-right font-mono font-medium">{idx + 1}.</span>
                      <span className={`flex-1 truncate text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`} title={item}>
                        {item}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(idx);
                        }}
                        disabled={isSpinning}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all focus:outline-none"
                        title="Xóa mục này"
                      >
                        <X size={18} />
                      </button>
                   </li>
                 );
               })}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
};

export default InputControls;