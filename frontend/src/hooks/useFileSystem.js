import { useState, useEffect } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { toast } from "react-toastify";

export const useFileSystem = (roomId) => {
    const [fileTree, setFileTree] = useState({});
    const [activeFile, setActiveFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));

    // Helper functions for Firebase-safe keys
    const toFirebaseKey = (name) => {
        return name.replace(/\./g, '_DOT_')
                  .replace(/#/g, '_HASH_')
                  .replace(/\$/g, '_DOLLAR_')
                  .replace(/\//g, '_SLASH_')
                  .replace(/\[/g, '_LBRACKET_')
                  .replace(/\]/g, '_RBRACKET_');
    };

    const fromFirebaseKey = (key) => {
        return key.replace(/_DOT_/g, '.')
                 .replace(/_HASH_/g, '#')
                 .replace(/_DOLLAR_/g, '$')
                 .replace(/_SLASH_/g, '/')
                 .replace(/_LBRACKET_/g, '[')
                 .replace(/_RBRACKET_/g, ']');
    };

    // Load file system from Firebase
    useEffect(() => {
        if (!roomId) return;

        const fileSystemRef = ref(database, `rooms/${roomId}/fileSystem`);
        const unsubscribe = onValue(fileSystemRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setFileTree(data);
                // If no active file and there are files, set the first one as active
                if (!activeFile && Object.keys(data).length > 0) {
                    const firstFile = findFirstFile(data);
                    if (firstFile) {
                        setActiveFile(firstFile);
                        setOpenFiles([firstFile]);
                    }
                }
            } else {                // Initialize with a default file structure
                const defaultStructure = {
                    root: {
                        type: 'folder',
                        name: 'workspace',
                        children: {
                            'main_DOT_js': {
                                type: 'file',
                                name: 'main.js',
                                content: '// Welcome to InkCode!\nconsole.log("Hello, World!");',
                                language: 'javascript'
                            }
                        }
                    }
                };
                setFileTree(defaultStructure);
                setActiveFile('root/main_DOT_js');
                setOpenFiles(['root/main_DOT_js']);
                saveFileSystem(defaultStructure);
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    // Helper function to find the first file in the tree
    const findFirstFile = (tree, parentPath = '') => {
        for (const [key, node] of Object.entries(tree)) {
            const currentPath = parentPath ? `${parentPath}/${key}` : key;
            if (node.type === 'file') {
                return currentPath;
            } else if (node.type === 'folder' && node.children) {
                const found = findFirstFile(node.children, currentPath);
                if (found) return found;
            }
        }
        return null;
    };

    // Save file system to Firebase
    const saveFileSystem = async (tree = fileTree) => {
        if (!roomId) return;
        
        try {
            const fileSystemRef = ref(database, `rooms/${roomId}/fileSystem`);
            await set(fileSystemRef, tree);
        } catch (error) {
            console.error("Error saving file system:", error);
            toast.error("Failed to save file system");
        }
    };    // Get file content by path
    const getFileContent = (path) => {
        const pathParts = path.split('/');
        let current = fileTree;
        
        for (const part of pathParts) {
            if (current[part]) {
                current = current[part];
                if (current.type === 'folder' && current.children) {
                    current = current.children;
                }
            } else {
                return null;
            }
        }
        
        return current.type === 'file' ? current.content : null;
    };

    // Get file object by path (includes metadata like original name, language, etc.)
    const getFileObject = (path) => {
        const pathParts = path.split('/');
        let current = fileTree;
        
        for (const part of pathParts) {
            if (current[part]) {
                current = current[part];
                if (current.type === 'folder' && current.children) {
                    current = current.children;
                }
            } else {
                return null;
            }
        }
        
        return current.type === 'file' ? current : null;
    };

    // Update file content
    const updateFileContent = async (path, content) => {
        const pathParts = path.split('/');
        const newTree = JSON.parse(JSON.stringify(fileTree));
        let current = newTree;
        
        // Navigate to the file
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children || {};
            }
        }
        
        const fileName = pathParts[pathParts.length - 1];
        if (current[fileName] && current[fileName].type === 'file') {
            current[fileName].content = content;
            current[fileName].lastModified = Date.now();
            current[fileName].modifiedBy = {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || "Anonymous"
            };
            
            setFileTree(newTree);
            await saveFileSystem(newTree);
        }
    };    // Create a new file
    const createFile = async (parentPath, fileName, content = '') => {
        if (!fileName) return;
        
        const pathParts = parentPath.split('/');
        const newTree = JSON.parse(JSON.stringify(fileTree));
        let current = newTree;
        
        // Navigate to parent folder
        for (const part of pathParts) {
            if (current[part] && current[part].type === 'folder') {
                if (!current[part].children) {
                    current[part].children = {};
                }
                current = current[part].children;
            }
        }
        
        // Convert filename to Firebase-safe key
        const firebaseKey = toFirebaseKey(fileName);
        
        // Check if file already exists
        if (current[firebaseKey]) {
            toast.error("File already exists");
            return;
        }
        
        // Determine language from file extension
        const extension = fileName.split('.').pop();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown'
        };
        
        const language = languageMap[extension] || 'text';
        
        // Create new file
        current[firebaseKey] = {
            type: 'file',
            name: fileName, // Store the original filename
            content: content,
            language: language,
            createdAt: Date.now(),
            createdBy: {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || "Anonymous"
            }
        };
        
        setFileTree(newTree);
        await saveFileSystem(newTree);
        
        const newFilePath = parentPath === 'root' ? `root/${firebaseKey}` : `${parentPath}/${firebaseKey}`;
        toast.success(`File created: ${fileName}`);
        
        return newFilePath;
    };    // Create a new folder
    const createFolder = async (parentPath, folderName) => {
        if (!folderName) return;
        
        const pathParts = parentPath.split('/');
        const newTree = JSON.parse(JSON.stringify(fileTree));
        let current = newTree;
        
        // Navigate to parent folder
        for (const part of pathParts) {
            if (current[part] && current[part].type === 'folder') {
                if (!current[part].children) {
                    current[part].children = {};
                }
                current = current[part].children;
            }
        }
        
        // Convert folder name to Firebase-safe key
        const firebaseKey = toFirebaseKey(folderName);
        
        // Check if folder already exists
        if (current[firebaseKey]) {
            toast.error("Folder already exists");
            return;
        }
        
        // Create new folder
        current[firebaseKey] = {
            type: 'folder',
            name: folderName, // Store the original folder name
            children: {},
            createdAt: Date.now(),
            createdBy: {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || "Anonymous"
            }
        };
        
        setFileTree(newTree);
        await saveFileSystem(newTree);
        toast.success(`Folder created: ${folderName}`);
        
        const newFolderPath = parentPath === 'root' ? `root/${firebaseKey}` : `${parentPath}/${firebaseKey}`;
        return newFolderPath;
    };

    // Delete file or folder
    const deleteItem = async (path) => {
        const pathParts = path.split('/');
        const newTree = JSON.parse(JSON.stringify(fileTree));
        
        if (pathParts.length === 1) {
            // Can't delete root
            toast.error("Cannot delete root folder");
            return;
        }
        
        let current = newTree;
        const itemName = pathParts.pop();
        
        // Navigate to parent
        for (const part of pathParts) {
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children || {};
            }
        }
        
        if (current[itemName]) {
            delete current[itemName];
            setFileTree(newTree);
            await saveFileSystem(newTree);
            
            // Remove from open files if it was open
            setOpenFiles(prev => prev.filter(file => !file.startsWith(path)));
            
            // If active file was deleted, switch to another file
            if (activeFile && activeFile.startsWith(path)) {
                const remainingFiles = openFiles.filter(file => !file.startsWith(path));
                setActiveFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
            }
            
            toast.success("Item deleted successfully");
        }
    };    // Rename file or folder
    const renameItem = async (path, newName) => {
        if (!newName) return;
        
        const pathParts = path.split('/');
        const newTree = JSON.parse(JSON.stringify(fileTree));
        
        if (pathParts.length === 1) {
            // Can't rename root
            toast.error("Cannot rename root folder");
            return;
        }
        
        let current = newTree;
        const oldKey = pathParts.pop();
        
        // Navigate to parent
        for (const part of pathParts) {
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children || {};
            }
        }
        
        const newKey = toFirebaseKey(newName);
        
        if (current[oldKey] && !current[newKey]) {
            current[newKey] = { ...current[oldKey], name: newName };
            delete current[oldKey];
            
            setFileTree(newTree);
            await saveFileSystem(newTree);
            
            // Update paths in open files
            const newPath = [...pathParts, newKey].join('/');
            setOpenFiles(prev => prev.map(file => 
                file === path ? newPath : file.startsWith(path + '/') ? 
                file.replace(path, newPath) : file
            ));
            
            if (activeFile === path) {
                setActiveFile(newPath);
            }
            
            toast.success(`Renamed to: ${newName}`);
            return newPath;
        } else {
            toast.error("Item with that name already exists");
        }
    };

    // Toggle folder expansion
    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    // Open file in editor
    const openFile = (path) => {
        setActiveFile(path);
        setOpenFiles(prev => {
            if (!prev.includes(path)) {
                return [...prev, path];
            }
            return prev;
        });
    };

    // Close file
    const closeFile = (path) => {
        setOpenFiles(prev => {
            const newFiles = prev.filter(file => file !== path);
            if (activeFile === path) {
                setActiveFile(newFiles.length > 0 ? newFiles[newFiles.length - 1] : null);
            }
            return newFiles;
        });
    };    return {
        fileTree,
        activeFile,
        openFiles,
        expandedFolders,
        getFileContent,
        getFileObject,
        updateFileContent,
        createFile,
        createFolder,
        deleteItem,
        renameItem,
        toggleFolder,
        openFile,
        closeFile,
        setActiveFile
    };
};
