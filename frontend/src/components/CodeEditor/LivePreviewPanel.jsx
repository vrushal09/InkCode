import React, { useRef, useEffect } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, LinkIcon, EyeIcon } from '@heroicons/react/24/outline';

const LivePreviewPanel = ({
    isOpen,
    previewContent,
    connectedFiles,
    openFiles,
    getFileObject,
    connectFile,
    disconnectFile,
    onClose
}) => {
    const iframeRef = useRef(null);

    // Update iframe content when preview content changes
    useEffect(() => {
        if (iframeRef.current && previewContent) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            
            doc.open();
            doc.write(previewContent);
            doc.close();
        }
    }, [previewContent]);

    // Get available files for connection
    const getAvailableFiles = (fileType) => {
        if (!openFiles || !getFileObject) return [];

        const languageMap = {
            html: 'html',
            css: 'css',
            js: 'javascript'
        };

        return openFiles.filter(filePath => {
            const fileObj = getFileObject(filePath);
            return fileObj && fileObj.language === languageMap[fileType];
        });
    };

    const getFileName = (filePath) => {
        if (!filePath || !getFileObject) return '';
        const fileObj = getFileObject(filePath);
        return fileObj ? fileObj.name : '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0d15] border border-gray-700 rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <EyeIcon className="w-6 h-6 text-violet-400" />
                        <h2 className="text-lg font-semibold text-white">Live Preview</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            {connectedFiles.html && (
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                                    HTML: {getFileName(connectedFiles.html)}
                                </span>
                            )}
                            {connectedFiles.css && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                    CSS: {getFileName(connectedFiles.css)}
                                </span>
                            )}
                            {connectedFiles.js && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                    JS: {getFileName(connectedFiles.js)}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Close Preview"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex">
                    {/* Connection Panel - Left Sidebar */}
                    <div className="w-64 border-r border-gray-700 p-4 bg-[#111119]">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-violet-400" />
                            File Connections
                        </h3>

                        {/* HTML Connection */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-orange-400 mb-2">HTML File</label>
                            <select
                                value={connectedFiles.html || ''}
                                onChange={(e) => e.target.value ? connectFile('html', e.target.value) : disconnectFile('html')}
                                className="w-full bg-[#09090f] border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            >
                                <option value="">Select HTML file</option>
                                {getAvailableFiles('html').map(filePath => (
                                    <option key={filePath} value={filePath}>
                                        {getFileName(filePath)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* CSS Connection */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-blue-400 mb-2">CSS File (Optional)</label>
                            <select
                                value={connectedFiles.css || ''}
                                onChange={(e) => e.target.value ? connectFile('css', e.target.value) : disconnectFile('css')}
                                className="w-full bg-[#09090f] border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            >
                                <option value="">Select CSS file</option>
                                {getAvailableFiles('css').map(filePath => (
                                    <option key={filePath} value={filePath}>
                                        {getFileName(filePath)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* JS Connection */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-yellow-400 mb-2">JavaScript File (Optional)</label>
                            <select
                                value={connectedFiles.js || ''}
                                onChange={(e) => e.target.value ? connectFile('js', e.target.value) : disconnectFile('js')}
                                className="w-full bg-[#09090f] border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            >
                                <option value="">Select JS file</option>
                                {getAvailableFiles('js').map(filePath => (
                                    <option key={filePath} value={filePath}>
                                        {getFileName(filePath)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 p-3 bg-gray-800/30 rounded-lg">
                            <h4 className="text-xs font-medium text-violet-400 mb-2">How it works:</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Connect your HTML, CSS, and JS files</li>
                                <li>• CSS is injected into the HTML head</li>
                                <li>• JS is injected before the closing body tag</li>
                                <li>• Preview updates automatically when you edit files</li>
                            </ul>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Preview Toolbar */}
                        <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-[#111119]">
                            <div className="text-sm text-gray-400">
                                Preview will update automatically as you edit your files
                            </div>
                            <button
                                onClick={() => {
                                    if (iframeRef.current) {
                                        iframeRef.current.contentWindow.location.reload();
                                    }
                                }}
                                className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs transition-colors"
                            >
                                Refresh
                            </button>
                        </div>

                        {/* Preview Iframe */}
                        <div className="flex-1 bg-white">
                            {connectedFiles.html ? (
                                <iframe
                                    ref={iframeRef}
                                    className="w-full h-full border-0"
                                    title="Live Preview"
                                    sandbox="allow-scripts allow-same-origin allow-forms"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-900">
                                    <div className="text-center text-gray-400">
                                        <EyeIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                        <h3 className="text-lg font-medium mb-2">No HTML File Connected</h3>
                                        <p className="text-sm">Select an HTML file from the sidebar to start previewing</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePreviewPanel;
