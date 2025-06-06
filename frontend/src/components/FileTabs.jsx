import React from 'react';
import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

const FileTabs = ({ openFiles, activeFile, onSelectFile, onCloseFile, getFileIcon }) => {
    if (openFiles.length === 0) {
        return null;
    }

    const getFileName = (path) => {
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
        <div className="flex items-center bg-[#0A0A0A] border-b border-[#242424] overflow-x-auto">
            <div className="flex items-center h-10">
                {openFiles.map((filePath) => {
                    const fileName = getFileName(filePath);
                    const isActive = activeFile === filePath;
                    
                    return (
                        <div
                            key={filePath}
                            className={`group flex items-center px-4 h-full border-r border-[#242424] cursor-pointer transition-colors ${
                                isActive 
                                    ? 'bg-[#000000] text-[#FFFFFF] border-b-2 border-[#FFFFFF]' 
                                    : 'bg-[#0A0A0A] text-[#FFFFFF]/70 hover:bg-[#242424] hover:text-[#FFFFFF]'
                            }`}
                            onClick={() => onSelectFile(filePath)}
                        >
                            <div className="w-4 h-4 mr-2">
                                <DocumentIcon className={`w-4 h-4 ${getFileIconColor(fileName)}`} />
                            </div>
                            <span className="text-sm font-medium max-w-32 truncate">
                                {fileName}
                            </span>                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseFile(filePath);
                                }}
                                className="ml-2 p-1 rounded hover:bg-[#FFFFFF]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Close file"
                            >
                                <XMarkIcon className="w-3 h-3 text-[#FFFFFF]/60 hover:text-[#FFFFFF]" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FileTabs;
