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
        <div className="flex items-center bg-[#111119] border-b border-gray-800 overflow-x-auto">
            <div className="flex items-center h-10">
                {openFiles.map((filePath) => {
                    const fileName = getFileName(filePath);
                    const isActive = activeFile === filePath;
                    
                    return (
                        <div
                            key={filePath}
                            className={`flex items-center px-3 h-full border-r border-gray-800 ${isActive ? 'bg-[#09090f]' : 'hover:bg-gray-800/30'}`}
                            onClick={() => onSelectFile(filePath)}
                        >
                            <div className="w-4 h-4 mr-2">
                                <DocumentIcon className={`w-4 h-4 ${getFileIconColor(fileName)}`} />
                            </div>
                            <span className="text-sm text-gray-300">{fileName}</span>
                            <button
                                className="ml-2 p-1 rounded-full hover:bg-violet-500/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseFile(filePath);
                                }}
                            >
                                <XMarkIcon className="w-3 h-3 text-violet-400" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FileTabs;
