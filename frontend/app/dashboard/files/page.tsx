'use client';

import { useEffect, useState, useRef } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { formatFileSize, formatDate } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FiUpload, FiEye, FiDownload, FiShare2, FiTrash2, FiX,
  FiFile, FiImage, FiVideo, FiMusic, FiFileText,
  FiGrid, FiList, FiSearch, FiClock,
  FiCheck, FiCopy, FiZap, FiFolder, FiUser,
  FiChevronDown, FiChevronUp, FiBarChart2, FiHardDrive, FiExternalLink
} from 'react-icons/fi';

interface FileMetadata {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string;
  category: string;
  uploadedAt: string;
  deleted?: boolean;
  userId?: number;
  uploaderName?: string;
}

interface PublicShare {
  id: number;
  shareToken: string;
  shareUrl: string;
  expiresAt?: string;
  maxAccessCount?: number;
  accessCount: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'date-asc' | 'date-desc';

export default function FilesPage() {
  const { user } = useAuth();
  const { success, error, warning, info } = useNotification();
  const { confirm } = useConfirmDialog();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'processing'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [shareInfo, setShareInfo] = useState<PublicShare | null>(null);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [uploadZoneExpanded, setUploadZoneExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFiles();
    
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [filterCategory, user]);

  useEffect(() => {
    if (previewFile) {
      loadPreview(previewFile.id);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      setPreviewText('');
    }
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewFile]);

  // Helper function to check if file is text/code
  const isTextFile = (file: FileMetadata): boolean => {
    // Check MIME type
    if (file.fileType.startsWith('text/') || 
        file.fileType.includes('json') ||
        file.fileType.includes('xml') ||
        file.fileType.includes('javascript') ||
        file.fileType.includes('typescript')) {
      return true;
    }
    
    // Check file extensions for code files
    const codeExtensions = [
      '.txt', '.md', '.markdown',
      // Programming languages
      '.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.c', '.cpp', '.h', '.hpp',
      '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.r',
      // Web
      '.html', '.htm', '.css', '.scss', '.sass', '.less',
      // Config & Data
      '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.conf', '.config',
      // Shell & Scripts
      '.sh', '.bash', '.zsh', '.fish', '.bat', '.ps1', '.cmd',
      // Build & Package
      '.gradle', '.maven', '.pom', '.dockerfile', 'Dockerfile', 'Makefile',
      '.gitignore', '.env', '.properties',
      // Documentation
      '.sql', '.graphql', '.proto', '.thrift'
    ];
    
    return codeExtensions.some(ext => file.fileName.toLowerCase().endsWith(ext));
  };

  // Helper function to check if file is audio
  const isAudioFile = (file: FileMetadata): boolean => {
    return file.fileType.startsWith('audio/') ||
           file.fileName.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i) !== null;
  };

  // Helper function to check if file is Office document
  const isOfficeDocument = (file: FileMetadata): boolean => {
    const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp'];
    return officeExtensions.some(ext => file.fileName.toLowerCase().endsWith(ext)) ||
           file.fileType.includes('word') ||
           file.fileType.includes('excel') ||
           file.fileType.includes('powerpoint') ||
           file.fileType.includes('spreadsheet') ||
           file.fileType.includes('presentation');
  };

  // Get file language for syntax highlighting
  const getFileLanguage = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const langMap: {[key: string]: string} = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp', 'h': 'c', 'hpp': 'cpp',
      'cs': 'csharp', 'go': 'go', 'rs': 'rust', 'rb': 'ruby', 'php': 'php',
      'html': 'html', 'htm': 'html', 'xml': 'xml', 'css': 'css', 'scss': 'scss',
      'json': 'json', 'yaml': 'yaml', 'yml': 'yaml', 'md': 'markdown',
      'sql': 'sql', 'sh': 'bash', 'bash': 'bash', 'zsh': 'bash', 'bat': 'batch'
    };
    return langMap[ext] || 'plaintext';
  };

  const loadPreview = async (fileId: number) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      
      if (!token) {
        error('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại');
        return;
      }
      
      const response = await fetch(`${apiUrl}/files/${fileId}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Load text content for code/text files
        if (previewFile && isTextFile(previewFile)) {
          const text = await blob.text();
          setPreviewText(text);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Preview error:', response.status, errorText);
        error('Không thể xem trước', 'Loại file này không được hỗ trợ');
      }
    } catch (err) {
      console.error('❌ Preview failed:', err);
      error('Lỗi xem trước', 'Không thể tải nội dung file');
    }
  };

  const loadFiles = async () => {
    try {
      let data;
      if (user?.role === 'ADMIN') {
        data = await apiService.getAllFiles(filterCategory || undefined);
      } else {
        data = await apiService.getMyFiles();
      }
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadZoneExpanded(true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      setUploadZoneExpanded(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadZoneExpanded(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadPhase('uploading');

    try {
      const uploadedFile = await apiService.uploadFile(
        selectedFile,
        description,
        (progress) => {
          setUploadProgress(progress);
          if (progress >= 100) {
            setUploadPhase('processing');
          }
        }
      );
      
      await loadFiles();
      setSelectedFile(null);
      setDescription('');
      setCategory('OTHER');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      success('Upload thành công', 'File đã được tải lên và lưu trữ thành công!');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg?.includes('max_allowed_packet')) {
        error('Upload thất bại', 'File quá lớn so với cấu hình MySQL của server.');
      } else if (serverMsg) {
        error('Upload thất bại', serverMsg);
      } else {
        error('Upload thất bại', 'Không thể tải file lên');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadPhase('idle');
    }
  };

  const handleCreateShare = async (fileId: number) => {
    try {
      const share = await apiService.createPublicShare(fileId);
      setShareInfo(share);
    } catch (err: any) {
      error('Tạo link thất bại', err.response?.data?.message || 'Không thể tạo link chia sẻ');
    }
  };

  const handleDelete = async (fileId: number) => {
    const confirmed = await confirm({
      title: 'Xóa file',
      message: 'Bạn có chắc chắn muốn xóa file này?',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      if (user?.role === 'ADMIN') {
        await apiService.adminDeleteFile(fileId);
      } else {
        await apiService.deleteFile(fileId);
      }
      await loadFiles();
      success('Xóa thành công', 'File đã được xóa!');
    } catch (err: any) {
      error('Xóa thất bại', err.response?.data?.message || 'Không thể xóa file');
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api';
      
      const response = await fetch(`${apiUrl}/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        success('Tải xuống thành công', fileName);
      }
    } catch (err) {
      error('Tải xuống thất bại', 'Không thể tải file');
    }
  };

  const handleCopyLink = () => {
    if (shareInfo) {
      navigator.clipboard.writeText(shareInfo.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeRef.current) return;
    
    const svg = qrCodeRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 360;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 25, 20, 250, 250);

      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PixShare', canvas.width / 2, 300);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Arial';
      ctx.fillText('Chia sẻ file dễ dàng', canvas.width / 2, 330);

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = 'pixshare-qr-code.png';
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      });

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopyQR = async () => {
    if (!qrCodeRef.current) return;
    
    const svg = qrCodeRef.current.querySelector('svg');
    if (!svg) return;

    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        handleDownloadQR();
        info('Đã tải về máy', 'Trình duyệt không hỗ trợ copy ảnh.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 300;
      canvas.height = 360;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = async () => {
        ctx.drawImage(img, 25, 20, 250, 250);

        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PixShare', canvas.width / 2, 300);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Arial';
        ctx.fillText('Chia sẻ file dễ dàng', canvas.width / 2, 330);

        try {
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => {
              if (b) resolve(b);
            }, 'image/png');
          });

          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          
          success('Copy thành công', 'QR code đã được sao chép!');
        } catch (clipErr) {
          handleDownloadQR();
          info('Đã tải về máy', 'QR code đã được tải về máy!');
        }

        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        error('Lỗi tải ảnh', 'Không thể tải QR code');
      };
      
      img.src = url;
    } catch (error) {
      handleDownloadQR();
      info('Đã tải về máy', 'QR code đã được tải về máy!');
    }
  };

  const getFileIcon = (fileType: string, size?: number) => {
    const iconSize = size || 24;
    if (fileType.startsWith('image/')) return <FiImage size={iconSize} />;
    if (fileType.startsWith('video/')) return <FiVideo size={iconSize} />;
    if (fileType.startsWith('audio/')) return <FiMusic size={iconSize} />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FiFileText size={iconSize} />;
    return <FiFile size={iconSize} />;
  };

  const getFileGradient = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'from-blue-500 to-cyan-600';
    if (fileType.startsWith('video/')) return 'from-purple-500 to-pink-600';
    if (fileType.startsWith('audio/')) return 'from-yellow-500 to-orange-600';
    if (fileType.includes('pdf') || fileType.includes('document')) return 'from-green-500 to-emerald-600';
    return 'from-gray-500 to-slate-600';
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'IMAGE': 'bg-blue-100 text-blue-700',
      'VIDEO': 'bg-purple-100 text-purple-700',
      'DOCUMENT': 'bg-green-100 text-green-700',
      'AUDIO': 'bg-yellow-100 text-yellow-700',
      'OTHER': 'bg-gray-100 text-gray-700',
    };
    return colors[cat] || colors['OTHER'];
  };

  // Calculate statistics
  const stats = {
    total: files.length,
    totalSize: files.reduce((acc, f) => acc + f.fileSize, 0),
    byCategory: {
      IMAGE: files.filter(f => f.category === 'IMAGE').length,
      VIDEO: files.filter(f => f.category === 'VIDEO').length,
      DOCUMENT: files.filter(f => f.category === 'DOCUMENT').length,
      AUDIO: files.filter(f => f.category === 'AUDIO').length,
      OTHER: files.filter(f => f.category === 'OTHER').length,
    }
  };

  // Sort files
  const sortFiles = (files: FileMetadata[]) => {
    const sorted = [...files];
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.fileName.localeCompare(b.fileName));
      case 'name-desc':
        return sorted.sort((a, b) => b.fileName.localeCompare(a.fileName));
      case 'size-asc':
        return sorted.sort((a, b) => a.fileSize - b.fileSize);
      case 'size-desc':
        return sorted.sort((a, b) => b.fileSize - a.fileSize);
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      default:
        return sorted;
    }
  };

  const filteredFiles = sortFiles(files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  }));

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiFolder className="w-8 h-8" />
              {user?.role === 'ADMIN' ? 'Quản lý tất cả File' : 'File của tôi'}
            </h1>
            {user?.role === 'ADMIN' && (
              <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                ADMIN MODE
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FiBarChart2 className="w-4 h-4" />
              <span>Tổng file</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FiHardDrive className="w-4 h-4" />
              <span>Dung lượng</span>
            </div>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FiImage className="w-4 h-4" />
              <span>Hình ảnh</span>
            </div>
            <div className="text-2xl font-bold">{stats.byCategory.IMAGE}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FiVideo className="w-4 h-4" />
              <span>Video</span>
            </div>
            <div className="text-2xl font-bold">{stats.byCategory.VIDEO}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <FiFileText className="w-4 h-4" />
              <span>Tài liệu</span>
            </div>
            <div className="text-2xl font-bold">{stats.byCategory.DOCUMENT}</div>
          </div>
        </div>
      </div>

      {/* Upload Zone - Compact */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <button
          onClick={() => setUploadZoneExpanded(!uploadZoneExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">Upload file mới</h2>
              {selectedFile && !uploadZoneExpanded && (
                <p className="text-sm text-gray-600">{selectedFile.name} - {formatFileSize(selectedFile.size)}</p>
              )}
            </div>
          </div>
          {uploadZoneExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
        </button>

        {uploadZoneExpanded && (
          <div className="p-6 border-t border-gray-100">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <FiUpload className="w-12 h-12 mx-auto mb-3 text-primary-600" />
              <p className="font-semibold text-gray-900 mb-1">
                {selectedFile ? selectedFile.name : 'Kéo thả file vào đây hoặc click để chọn'}
              </p>
              {selectedFile && (
                <p className="text-sm text-primary-600 font-medium">{formatFileSize(selectedFile.size)}</p>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Mô tả (tùy chọn)..."
                  />
                  
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="IMAGE">Hình ảnh</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Tài liệu</option>
                    <option value="AUDIO">Audio</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <span>
                      {uploadPhase === 'uploading' ? `Đang tải lên... ${uploadProgress}%` : 'Đang xử lý...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiUpload className="w-5 h-5" />
                      Upload ngay
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả</option>
            <option value="IMAGE">Hình ảnh</option>
            <option value="VIDEO">Video</option>
            <option value="DOCUMENT">Tài liệu</option>
            <option value="AUDIO">Audio</option>
            <option value="OTHER">Khác</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="date-desc">Mới nhất</option>
            <option value="date-asc">Cũ nhất</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="size-desc">Lớn nhất</option>
            <option value="size-asc">Nhỏ nhất</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có file</h3>
          <p className="text-gray-600">
            {searchQuery || filterCategory ? 'Không tìm thấy file phù hợp' : 'Upload file đầu tiên của bạn'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group bg-white rounded-xl shadow hover:shadow-xl transition-all border border-gray-100 hover:border-primary-300 overflow-hidden"
            >
              {/* Thumbnail */}
              <div className={`relative h-40 bg-gradient-to-br ${getFileGradient(file.fileType)} flex items-center justify-center`}>
                <div className="w-16 h-16 text-white/90">
                  {getFileIcon(file.fileType)}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate mb-2" title={file.fileName}>
                  {file.fileName}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
                {user?.role === 'ADMIN' && file.uploaderName && (
                  <div className="mb-2 text-xs text-blue-600 flex items-center gap-1">
                    <FiUser className="w-3 h-3" />
                    {file.uploaderName}
                  </div>
                )}
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(file.category)}`}>
                  {file.category}
                </span>
                
                {/* Quick Actions */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium"
                    title="Xem trước"
                  >
                    <FiEye className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDownload(file.id, file.fileName)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                    title="Tải xuống"
                  >
                    <FiDownload className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleCreateShare(file.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                    title="Chia sẻ"
                  >
                    <FiShare2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
                    title="Xóa"
                  >
                    <FiTrash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="divide-y divide-gray-100">
            {filteredFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 bg-gradient-to-br ${getFileGradient(file.fileType)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <div className="w-6 h-6 text-white">
                    {getFileIcon(file.fileType)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{file.fileName}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                    {user?.role === 'ADMIN' && file.uploaderName && (
                      <span className="text-blue-600">👤 {file.uploaderName}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Xem trước"
                  >
                    <FiEye className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDownload(file.id, file.fileName)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Tải xuống"
                  >
                    <FiDownload className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleCreateShare(file.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Chia sẻ"
                  >
                    <FiShare2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Chia sẻ file</h3>
              <button onClick={() => setShareInfo(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div ref={qrCodeRef} className="p-4 bg-white rounded-xl border-2 border-gray-100">
                <QRCodeSVG value={shareInfo.shareUrl} size={180} level="H" includeMargin />
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopyQR}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <FiCopy className="w-4 h-4 inline mr-1" />
                  Copy QR
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <FiDownload className="w-4 h-4 inline mr-1" />
                  Tải QR
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={shareInfo.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <span>Lượt truy cập: <b>{shareInfo.accessCount}</b></span>
                {shareInfo.expiresAt && (
                  <span>Hết hạn: {formatDate(shareInfo.expiresAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
            <div className="flex items-center justify-between text-white max-w-7xl mx-auto">
              <h3 className="text-lg font-semibold truncate pr-4">{previewFile.fileName}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-20">
            {/* PDF */}
            {previewFile.fileType.includes('pdf') && previewUrl && (
              <div className="w-full h-full max-w-6xl flex flex-col">
                {isMobile ? (
                  // Mobile: Show download option (iframe doesn't work well on mobile)
                  <div className="flex flex-col items-center justify-center text-white text-center p-6">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-8 mb-6 shadow-2xl">
                      <FiFileText className="w-24 h-24 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{previewFile.fileName}</h3>
                      <p className="text-white/90 text-sm mb-4">PDF Document</p>
                      <div className="text-white/80 text-xs">
                        {formatFileSize(previewFile.fileSize)}
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6 max-w-md">
                      <p className="text-sm text-blue-200 mb-2">
                        📱 <strong>Trên Mobile:</strong> PDF viewer không hoạt động tốt trên trình duyệt mobile.
                      </p>
                      <p className="text-xs text-blue-300">
                        Vui lòng tải xuống để xem đầy đủ nội dung PDF.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                      <button
                        onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
                      >
                        <FiDownload className="inline mr-2" size={20} />
                        Tải xuống PDF
                      </button>
                      
                      <button
                        onClick={() => {
                          // Open in new tab with Google Docs Viewer
                          const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + previewUrl)}&embedded=true`;
                          window.open(googleDocsUrl, '_blank');
                        }}
                        className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 font-semibold"
                      >
                        <FiExternalLink className="inline mr-2" size={20} />
                        Xem qua Google
                      </button>
                    </div>
                  </div>
                ) : (
                  // Desktop: Show iframe viewer
                  <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                    <iframe 
                      src={previewUrl} 
                      title="PDF Preview" 
                      className="w-full flex-1 bg-white rounded-xl shadow-2xl" 
                    />
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                      >
                        <FiDownload className="inline mr-2" size={16} />
                        Tải xuống để xem offline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Office Documents (Word, Excel, PowerPoint) */}
            {isOfficeDocument(previewFile) && previewUrl && (
              <div className="w-full h-full max-w-6xl flex flex-col">
                {isMobile ? (
                  // Mobile: Show download option
                  <div className="flex flex-col items-center justify-center text-white text-center p-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 mb-6 shadow-2xl">
                      <FiFileText className="w-24 h-24 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{previewFile.fileName}</h3>
                      <p className="text-white/90 text-sm mb-4">Office Document</p>
                      <div className="text-white/80 text-xs">
                        {formatFileSize(previewFile.fileSize)}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 mb-6 max-w-md">
                      <p className="text-sm text-yellow-200 mb-2">
                        📱 <strong>Trên Mobile:</strong> Office document viewer không hỗ trợ tốt trên mobile.
                      </p>
                      <p className="text-xs text-yellow-300">
                        Vui lòng tải xuống và mở bằng app Word/Excel/PowerPoint.
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                      className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all transform hover:scale-105 shadow-lg font-semibold"
                    >
                      <FiDownload className="inline mr-2" size={20} />
                      Tải xuống để xem
                    </button>
                  </div>
                ) : (
                  // Desktop: Try Office viewer
                  <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                    <iframe 
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                      title="Office Document Preview" 
                      className="w-full flex-1 bg-white rounded-xl shadow-2xl"
                    />
                    <div className="mt-4 text-center">
                      <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 mb-3 max-w-2xl mx-auto">
                        <p className="text-yellow-200 text-sm">
                          ⚠️ Preview Office documents có thể không hoạt động với file local. Tải xuống để xem đầy đủ.
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                      >
                        <FiDownload className="inline mr-2" size={16} />
                        Tải xuống
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Text/Code với syntax highlighting */}
            {previewText && (
              <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-6xl w-full max-h-[80vh] flex flex-col">
                {/* Header with file info */}
                <div className="bg-gray-800 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FiFileText className="text-blue-400" size={isMobile ? 16 : 20} />
                    <span className="text-gray-300 text-xs sm:text-sm font-medium">
                      {getFileLanguage(previewFile.fileName).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[10px] sm:text-xs">
                    {previewText.split('\n').length} lines • {formatFileSize(previewText.length)}
                  </span>
                </div>
                {/* Code content */}
                <div className="flex-1 overflow-auto p-3 sm:p-6">
                  <pre className={`${isMobile ? 'text-xs' : 'text-sm'} font-mono`}>
                    {previewText.split('\n').map((line, i) => (
                      <div key={i} className="flex hover:bg-gray-800/50">
                        <span className={`select-none text-gray-500 text-right pr-2 sm:pr-4 ${isMobile ? 'w-8' : 'w-12'} flex-shrink-0`}>
                          {i + 1}
                        </span>
                        <code className="text-gray-300 flex-1 whitespace-pre-wrap break-all">
                          {line || ' '}
                        </code>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Image */}
            {previewFile.fileType.startsWith('image/') && previewUrl && !previewText && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img 
                  src={previewUrl} 
                  alt={previewFile.fileName} 
                  className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-xl shadow-2xl" 
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                />
              </div>
            )}
            
            {/* Video */}
            {previewFile.fileType.startsWith('video/') && previewFile.id && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <video 
                  controls 
                  className="max-w-full max-h-[calc(100vh-200px)] rounded-xl shadow-2xl"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                  preload="metadata"
                >
                  <source 
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://113.170.159.180:8086/api'}/video/${previewFile.id}/stream?token=${localStorage.getItem('token')}`}
                    type={previewFile.fileType}
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            {/* Audio */}
            {isAudioFile(previewFile) && previewUrl && (
              <div className="text-white text-center max-w-md w-full">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 mb-6 shadow-2xl">
                  <FiMusic className="w-20 h-20 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold mb-2">{previewFile.fileName}</h3>
                  <p className="text-white/80 text-sm">Audio File</p>
                </div>
                <audio 
                  controls 
                  className="w-full rounded-xl shadow-lg"
                  preload="metadata"
                >
                  <source src={previewUrl} type={previewFile.fileType} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
            
            {/* Unsupported */}
            {!previewFile.fileType.startsWith('image/') &&
              !previewFile.fileType.startsWith('video/') &&
              !previewFile.fileType.includes('pdf') &&
              !isAudioFile(previewFile) &&
              !isOfficeDocument(previewFile) &&
              !previewText && (
                <div className="text-white text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    {getFileIcon(previewFile.fileType, 48)}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Không hỗ trợ xem trước</h3>
                  <p className="text-gray-400 mb-6">
                    File loại <span className="text-white font-semibold">{previewFile.fileType}</span> không thể xem trước trên trình duyệt
                  </p>
                  <button
                    onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <FiDownload className="inline mr-2" size={20} />
                    Tải xuống để xem
                  </button>
                </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleDownload(previewFile.id, previewFile.fileName)}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
              >
                <FiDownload className="inline mr-2" />
                Tải xuống
              </button>
              <button
                onClick={() => {
                  handleCreateShare(previewFile.id);
                  setPreviewFile(null);
                }}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all"
              >
                <FiShare2 className="inline mr-2" />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="60" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="60"
                  stroke="url(#gradient)" strokeWidth="8" fill="none"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - uploadProgress / 100)}`}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {uploadPhase === 'uploading' ? (
                  <span className="text-3xl font-bold">{uploadProgress}%</span>
                ) : (
                  <span className="text-lg font-semibold">Xử lý...</span>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {uploadPhase === 'uploading' ? 'Đang tải lên...' : 'Đang xử lý...'}
            </h3>
            <p className="text-sm text-gray-600 truncate">{selectedFile?.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
