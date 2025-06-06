import React, { useState } from 'react';
import { 
    FolderIcon, 
    PlusIcon, 
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline';
import FileNode from './FileNode';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

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
    const { preferences, updatePreferences } = useUserPreferences();
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
    };    // Handle toggling sidebar collapsed state and save preference
    const handleToggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        onToggleCollapse();
        updatePreferences({ sidebarCollapsed: newCollapsedState });
    };    if (isCollapsed) {
        return (
            <div className="bg-[#0A0A0A] border-r border-[#242424] h-full w-0 overflow-hidden transition-all duration-200">
                {/* Collapsed state is handled by parent container width */}
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0A] border-r border-[#242424] h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#242424]">
                <div className="flex items-center gap-2">
                    <FolderIcon className="w-5 h-5 text-[#FFFFFF]" />
                    <span className="text-sm font-medium text-[#FFFFFF]">EXPLORER</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowNewFileInput(true)}
                        className="p-1.5 hover:bg-[#242424] rounded-md transition-colors"
                        title="New File"
                    >
                        <PlusIcon className="w-4 h-4 text-[#FFFFFF]/60 hover:text-[#FFFFFF]" />
                    </button>
                    <button
                        onClick={() => setShowNewFolderInput(true)}
                        className="p-1.5 hover:bg-[#242424] rounded-md transition-colors"
                        title="New Folder"
                    >
                        <FolderIcon className="w-4 h-4 text-[#FFFFFF]/60 hover:text-[#FFFFFF]" />
                    </button>
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto">
                {/* New File Input */}
                {showNewFileInput && (
                    <div className="flex items-center px-4 py-2 bg-[#000000] border-b border-[#242424]">
                        <div className="w-6 h-4 mr-2"></div>
                        <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            <div className="w-3 h-3 bg-[#FFFFFF] rounded-sm"></div>
                        </div>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onBlur={() => handleCreateItem('file')}
                            onKeyDown={(e) => handleKeyPress(e, 'file')}
                            placeholder="Enter file name..."
                            className="bg-[#0A0A0A] text-[#FFFFFF] text-sm px-2 py-1 rounded border border-[#242424] flex-1 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                            autoFocus
                        />
                    </div>
                )}

                {/* New Folder Input */}
                {showNewFolderInput && (
                    <div className="flex items-center px-4 py-2 bg-[#000000] border-b border-[#242424]">
                        <div className="w-6 h-4 mr-2"></div>
                        <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            <FolderIcon className="w-4 h-4 text-[#FFFFFF]/60" />
                        </div>
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onBlur={() => handleCreateItem('folder')}
                            onKeyDown={(e) => handleKeyPress(e, 'folder')}
                            placeholder="Enter folder name..."
                            className="bg-[#0A0A0A] text-[#FFFFFF] text-sm px-2 py-1 rounded border border-[#242424] flex-1 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
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
                                    expandedFolders={expandedFolders}
                                    activeFile={activeFile}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {(!fileTree.root || !fileTree.root.children || Object.keys(fileTree.root.children).length === 0) && (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-[#242424] rounded-lg flex items-center justify-center">
                            <FolderIcon className="w-6 h-6 text-[#FFFFFF]/60" />
                        </div>
                        <h3 className="text-sm font-medium text-[#FFFFFF] mb-2">No files yet</h3>
                        <p className="text-xs text-[#FFFFFF]/60">Create your first file or folder to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplorer;