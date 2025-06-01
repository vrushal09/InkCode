import React, { useState } from 'react';
import { 
    FolderIcon, 
    PlusIcon, 
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline';
import FileNode from './FileNode';

const FileExplorer = ({ 
    fileTree, 
    activeFile, 
    expandedFolders, 
    onToggleFolder, 
    onSelectFile, 
    onCreateFile, 
    onCreateFolder, 
    onDeleteItem, 
    onRenameItem,
    isCollapsed,
    onToggleCollapse
}) => {
    const [showNewFileInput, setShowNewFileInput] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    const handleCreateItem = (type) => {
        if (newItemName.trim()) {
            if (type === 'file') {
                onCreateFile('root', newItemName);
            } else {
                onCreateFolder('root', newItemName);
            }
            setNewItemName('');
            setShowNewFileInput(false);
            setShowNewFolderInput(false);
        }
    };

    const handleKeyPress = (e, type) => {
        if (e.key === 'Enter') {
            handleCreateItem(type);
        } else if (e.key === 'Escape') {
            setNewItemName('');
            setShowNewFileInput(false);
            setShowNewFolderInput(false);
        }
    };

    if (isCollapsed) {
        return (
            <div className="bg-gray-900 border-r border-gray-700 h-full w-12 flex flex-col items-center py-4">
                <button
                    onClick={onToggleCollapse}
                    className="p-2 hover:bg-gray-800 rounded transition-colors"
                    title="Expand Explorer"
                >
                    <ChevronDoubleRightIcon className="w-5 h-5 text-gray-400" />
                </button>
                <div className="mt-4">
                    <FolderIcon className="w-6 h-6 text-blue-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border-r border-gray-700 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <FolderIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">EXPLORER</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowNewFileInput(true)}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                        title="New File"
                    >
                        <PlusIcon className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        onClick={() => setShowNewFolderInput(true)}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                        title="New Folder"
                    >
                        <FolderIcon className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        onClick={onToggleCollapse}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                        title="Collapse Explorer"
                    >
                        <ChevronDoubleLeftIcon className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto">
                {/* New File Input */}
                {showNewFileInput && (
                    <div className="flex items-center px-2 py-1 bg-gray-800/50 border-b border-gray-700">
                        <div className="w-6 h-4 mr-2"></div>
                        <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                        </div>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onBlur={() => handleCreateItem('file')}
                            onKeyDown={(e) => handleKeyPress(e, 'file')}
                            placeholder="Enter file name..."
                            className="bg-gray-700 text-white text-sm px-2 py-1 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                )}

                {/* New Folder Input */}
                {showNewFolderInput && (
                    <div className="flex items-center px-2 py-1 bg-gray-800/50 border-b border-gray-700">
                        <div className="w-6 h-4 mr-2"></div>
                        <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            <FolderIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onBlur={() => handleCreateItem('folder')}
                            onKeyDown={(e) => handleKeyPress(e, 'folder')}
                            placeholder="Enter folder name..."
                            className="bg-gray-700 text-white text-sm px-2 py-1 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                )}

                {/* Render File Tree */}
                {fileTree.root && (
                    <div className="py-2">
                        {Object.entries(fileTree.root.children || {}).map(([key, node]) => {
                            const path = `root/${key}`;
                            return (
                                <FileNode
                                    key={path}
                                    node={node}
                                    path={path}
                                    isExpanded={expandedFolders.has(path)}
                                    isActive={activeFile === path}
                                    onToggle={onToggleFolder}
                                    onSelect={onSelectFile}
                                    onCreateFile={onCreateFile}
                                    onCreateFolder={onCreateFolder}
                                    onDelete={onDeleteItem}
                                    onRename={onRenameItem}
                                    level={0}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {(!fileTree.root || !fileTree.root.children || Object.keys(fileTree.root.children).length === 0) && (
                    <div className="p-4 text-center text-gray-500">
                        <FolderIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm">No files yet</p>
                        <p className="text-xs">Create your first file or folder</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplorer;