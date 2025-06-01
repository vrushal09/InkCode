import React from 'react';
import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

const FileTabs = ({ openFiles, activeFile, onSelectFile, onCloseFile, getFileIcon }) => {
    if (openFiles.length === 0) {
        return null;
    }    const getFileName = (path) => {
        const parts = path.split('/');
        const fileName = parts.pop();
        // Convert Firebase key back to display name
        return fileName.replace(/_DOT_/g, '.').replace(/_HASH_/g, '#').replace(/_DOLLAR_/g, '$').replace(/_SLASH_/g, '/').replace(/_LBRACKET_/g, '[').replace(/_RBRACKET_/g, ']');
    };

    const getFileIconColor = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        const iconColors = {
            'js': 'text-yellow-400',
            'jsx': 'text-blue-400',
            'ts': 'text-blue-500',
            'tsx': 'text-blue-500',
            'py': 'text-green-400',
            'java': 'text-orange-500',
            'cpp': 'text-blue-600',
            'c': 'text-blue-600',
            'html': 'text-orange-400',
            'css': 'text-blue-300',
            'json': 'text-yellow-300',
            'md': 'text-gray-300',
            'txt': 'text-gray-400'
        };

        return iconColors[extension] || 'text-gray-400';
    };

    return (
        <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
            {openFiles.map((filePath) => {
                const fileName = getFileName(filePath);
                const isActive = activeFile === filePath;
                
                return (
                    <div
                        key={filePath}
                        className={`
                            flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer
                            hover:bg-gray-700 transition-colors min-w-0 max-w-48
                            ${isActive ? 'bg-gray-900 border-t-2 border-t-blue-500' : 'bg-gray-800'}
                        `}
                        onClick={() => onSelectFile(filePath)}
                    >
                        <DocumentIcon className={`w-4 h-4 flex-shrink-0 ${getFileIconColor(fileName)}`} />
                        <span className="text-sm text-gray-200 truncate flex-1">
                            {fileName}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseFile(filePath);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                            <XMarkIcon className="w-3 h-3 text-gray-400" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default FileTabs;
