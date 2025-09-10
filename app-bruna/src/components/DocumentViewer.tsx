import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document } from '../types/document';
import { DocumentsService } from '../services/supabase/documents';

interface DocumentViewerProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  password?: string;
}

export function DocumentViewer({ document, isOpen, onClose, password }: DocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && document) {
      loadDocument();
    }
  }, [isOpen, document]);

  const loadDocument = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Tentando carregar documento:', {
        id: document.id,
        title: document.title,
        storage_path: document.storage_path,
        file_path: document.file_path,
        encrypted: document.encrypted
      });

      // Verificar se o documento está criptografado
      if (document.encrypted && !password) {
        setError('Este documento está criptografado. Forneça a senha para visualizar.');
        setLoading(false);
        return;
      }

      // Baixar o documento
      const blob = await DocumentsService.downloadDocument(document.id, password);
      
      // Criar URL para o blob
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
      
    } catch (error: any) {
      console.error('Erro ao carregar documento:', error);
      setError(error.message || 'Erro ao carregar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadSuccess(false);
      const blob = await DocumentsService.downloadDocument(document.id, password);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name || 'documento';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Mostrar feedback de sucesso
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Erro ao baixar documento');
    }
  };

  const getFileType = (mimeType: string | undefined) => {
    if (!mimeType) return 'unknown';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    return 'unknown';
  };

  const isSupportedFormat = (mimeType: string | undefined) => {
    const fileType = getFileType(mimeType);
    return ['pdf', 'image', 'doc'].includes(fileType);
  };

  const renderDocument = () => {
    const fileType = getFileType(document.mime_type);
    
    if (!isSupportedFormat(document.mime_type)) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <File className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Formato não suportado
          </h3>
          <p className="text-gray-600 mb-4">
            Este tipo de arquivo não pode ser visualizado no navegador.
          </p>
          <p className="text-sm text-gray-500">
            Formatos suportados: PDF, imagens (JPG, PNG, GIF) e documentos (DOC, DOCX)
          </p>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
            title={document.title || 'Documento PDF'}
          />
        );
      
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={documentUrl}
              alt={document.title || 'Imagem'}
              className="max-w-full max-h-full object-contain"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        );
      
      case 'doc':
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Documento Word
            </h3>
            <p className="text-gray-600 mb-4">
              Documentos Word não podem ser visualizados diretamente no navegador.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Clique em "Baixar" para abrir o documento no seu computador.
            </p>
            <Button
              onClick={handleDownload}
              className={`transition-all duration-300 ${
                downloadSuccess 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Baixado com Sucesso!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Documento
                </>
              )}
            </Button>
            {downloadSuccess && (
              <p className="text-sm text-green-600 mt-2 animate-pulse">
                ✓ Arquivo baixado para sua pasta de Downloads
              </p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <File className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Formato desconhecido
            </h3>
            <p className="text-gray-600">
              Não foi possível determinar o tipo de arquivo.
            </p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {document.mime_type?.includes('pdf') && <FileText className="h-6 w-6 text-red-600" />}
            {document.mime_type?.includes('image') && <Image className="h-6 w-6 text-blue-600" />}
            {document.mime_type?.includes('word') && <FileText className="h-6 w-6 text-blue-600" />}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {document.title || 'Documento'}
              </h2>
              <p className="text-sm text-gray-500">
                {document.file_name || 'arquivo'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controles de zoom e rotação */}
            {document.mime_type?.includes('image') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(300, zoom + 25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className={`flex items-center space-x-1 transition-all duration-300 ${
                downloadSuccess 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : ''
              }`}
            >
              {downloadSuccess ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Baixar</span>
                </>
              )}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {downloadSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Arquivo baixado com sucesso!</span>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando documento...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Erro ao carregar documento
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadDocument} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : documentUrl ? (
            <div className="h-full overflow-auto">
              {renderDocument()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
