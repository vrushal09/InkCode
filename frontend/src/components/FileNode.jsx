import React, { useState } from 'react';
import { 
    ChevronRightIcon, 
    ChevronDownIcon, 
    DocumentIcon, 
    FolderIcon, 
    FolderOpenIcon,
    EllipsisVerticalIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const FileNode = ({ 
    node, 
    path, 
    isExpanded, 
    isActive, 
    onToggle, 
    onSelect, 
    onCreateFile,
    onCreateFolder,
    onDelete,
    onRename,
    level = 0,
    expandedFolders,
    activeFile
}) => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(node.name);
    const [showCreateInput, setShowCreateInput] = useState(null); // 'file' or 'folder'
    const [createName, setCreateName] = useState('');

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        const iconColors = {
            'js': 'text-yellow-400',
            'jsx': 'text-violet-400',
            'ts': 'text-violet-500',
            'tsx': 'text-violet-500',
            'py': 'text-green-400',
            'java': 'text-orange-500',
            'cpp': 'text-blue-600',
            'c': 'text-blue-600',
            'html': 'text-orange-400',
            'css': 'text-violet-300',
            'json': 'text-yellow-300',
            'md': 'text-gray-300',
            'txt': 'text-gray-400'
        };

        return iconColors[extension] || 'text-gray-400';
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setShowContextMenu({
            x: e.clientX,
            y: e.clientY,
            nodeRect: rect
        });
    };

    const handleRename = () => {
        if (!newName || newName === node.name) {
            setIsRenaming(false);
            setShowContextMenu(false);
            return;
        }
        
        try {
            onRename(path, newName);
            setIsRenaming(false);
            setShowContextMenu(false);
        } catch (error) {
            console.error("Error renaming item:", error);
            toast.error(`Failed to rename: ${error.message}`);
        }
    };

    const handleCreate = (type) => {
        if (!createName.trim()) return;
        
        try {
            // Ensure file has extension if creating a file
            const finalName = type === 'file' && !createName.includes('.') 
                ? `${createName}.js` 
                : createName;
                
            if (type === 'file') {
                onCreateFile(path, finalName);
            } else {
                onCreateFolder(path, finalName);
            }
            setCreateName('');
            setShowCreateInput(null);
        } catch (error) {
            console.error("Error creating item:", error);
            toast.error(`Failed to create ${type}: ${error.message}`);
        }
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            if (action === 'rename') {
                handleRename();
            } else if (action === 'create') {
                handleCreate(showCreateInput);
            }
        } else if (e.key === 'Escape') {
            if (action === 'rename') {
                setIsRenaming(false);
                setNewName(node.name);
            } else if (action === 'create') {
                setShowCreateInput(null);
                setCreateName('');
            }
        }
    };

    return (
        <div className="relative">            {/* Main Node */}
            <div
                className={`
                    flex items-center px-3 py-2 rounded-lg cursor-pointer select-none group transition-colors
                    ${isActive 
                        ? 'bg-[#FFFFFF]/10 text-[#FFFFFF] border-l-2 border-l-[#FFFFFF]' 
                        : 'text-[#FFFFFF]/70 hover:bg-[#242424] hover:text-[#FFFFFF]'
                    }
                `}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onContextMenu={handleRightClick}
                onClick={() => {
                    if (node.type === 'folder') {
                        onToggle(path);
                    } else {
                        onSelect(path);
                    }
                }}
            >
                {/* Expand/Collapse Icon for folders */}
                {node.type === 'folder' && (
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                        {isExpanded ? (
                            <ChevronDownIcon className="w-3 h-3 text-[#FFFFFF]/60" />
                        ) : (
                            <ChevronRightIcon className="w-3 h-3 text-[#FFFFFF]/60" />
                        )}
                    </div>
                )}                {/* File/Folder Icon */}
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    {node.type === 'folder' ? (
                        isExpanded ? (
                            <FolderOpenIcon className="w-4 h-4 text-[#FFFFFF]" />
                        ) : (
                            <FolderIcon className="w-4 h-4 text-[#FFFFFF]" />
                        )
                    ) : (
                        <DocumentIcon className={`w-4 h-4 ${getFileIcon(node.name)}`} />
                    )}
                </div>

                {/* Name */}
                {isRenaming ? (
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => handleKeyPress(e, 'rename')}
                        className="bg-[#000000] text-[#FFFFFF] text-sm px-2 py-1 rounded border border-[#242424] flex-1 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                        autoFocus
                    />
                ) : (
                    <span className="text-sm flex-1 truncate">
                        {node.displayName || node.name}
                    </span>
                )}

                {/* Context Menu Button */}
                <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#FFFFFF]/10 rounded transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowContextMenu(!showContextMenu);
                    }}
                >
                    <EllipsisVerticalIcon className="w-3 h-3 text-[#FFFFFF]/60" />
                </button>
            </div>

            {/* Context Menu */}
            {showContextMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowContextMenu(false)} />
                    <div 
                        className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-32"
                        style={{
                            left: `${showContextMenu.x}px`,
                            top: `${showContextMenu.y}px`,
                            transform: showContextMenu.x + 200 > window.innerWidth ? 
                                'translateX(-100%)' : 'none'
                        }}
                    >
                        {node.type === 'folder' && (
                            <>
                                <button
                                    className="w-full text-left px-3 py-1 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCreateInput('file');
                                        setShowContextMenu(false);
                                    }}
                                >
                                    <PlusIcon className="w-3 h-3" />
                                    New File
                                </button>
                                <button
                                    className="w-full text-left px-3 py-1 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCreateInput('folder');
                                        setShowContextMenu(false);
                                    }}
                                >
                                    <PlusIcon className="w-3 h-3" />
                                    New Folder
                                </button>
                                <hr className="border-gray-600 my-1" />
                            </>
                        )}
                        <button
                            className="w-full text-left px-3 py-1 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(true);
                                setShowContextMenu(false);
                            }}
                        >
                            <PencilIcon className="w-3 h-3" />
                            Rename
                        </button>
                        {path !== 'root' && (
                            <button
                                className="w-full text-left px-3 py-1 text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                    onDelete(path);
                                } catch (error) {
                                    console.error("Error deleting item:", error);
                                    toast.error(`Failed to delete: ${error.message}`);
                                }
                                setShowContextMenu(false);
                                }}
                            >
                                <TrashIcon className="w-3 h-3" />
                                Delete
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Create Input */}
            {showCreateInput && (
                <div 
                    className="flex items-center px-2 py-1 bg-gray-800/80"
                    style={{ paddingLeft: `${(level + 1) * 12 + 32}px` }}
                >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                        {showCreateInput === 'folder' ? (
                            <FolderIcon className="w-4 h-4 text-violet-400" />
                        ) : (
                            <DocumentIcon className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    <input
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        onBlur={() => handleCreate(showCreateInput)}
                        onKeyDown={(e) => handleKeyPress(e, 'create')}
                        placeholder={showCreateInput === 'folder' ? 'Folder name' : 'File name (e.g. file.js)'}
                        className="bg-gray-700 text-white text-sm px-1 rounded flex-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        autoFocus
                    />
                </div>
            )}

            {/* Render Children */}
            {node.type === 'folder' && isExpanded && node.children && (
                <div>
                    {Object.entries(node.children).map(([key, child]) => {
                        const childPath = path === 'root' ? `root/${key}` : `${path}/${key}`;
                        return (
                            <FileNode
                                key={childPath}
                                node={child}
                                path={childPath}
                                isExpanded={expandedFolders?.has(childPath)}
                                isActive={activeFile === childPath}
                                onToggle={onToggle}
                                onSelect={onSelect}
                                onCreateFile={onCreateFile}
                                onCreateFolder={onCreateFolder}
                                onDelete={onDelete}
                                onRename={onRename}
                                level={level + 1}
                                expandedFolders={expandedFolders}
                                activeFile={activeFile}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FileNode;
