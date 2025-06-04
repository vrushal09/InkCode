import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useLivePreview = (openFiles, getFileContent, getFileObject, activeFile) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [connectedFiles, setConnectedFiles] = useState({
        html: null,
        css: null,
        js: null
    });
    const [previewContent, setPreviewContent] = useState('');

    // Auto-detect related files when opening HTML files
    useEffect(() => {
        if (!activeFile || !getFileObject) return;

        const fileObj = getFileObject(activeFile);
        if (fileObj && fileObj.language === 'html') {
            autoDetectConnectedFiles();
        }
    }, [activeFile, openFiles]);

    // Auto-detect related files based on file names
    const autoDetectConnectedFiles = useCallback(() => {
        if (!openFiles || !getFileObject) return;

        const htmlFiles = [];
        const cssFiles = [];
        const jsFiles = [];

        openFiles.forEach(filePath => {
            const fileObj = getFileObject(filePath);
            if (!fileObj) return;

            const fileName = fileObj.name.toLowerCase();
            const language = fileObj.language;

            if (language === 'html') {
                htmlFiles.push(filePath);
            } else if (language === 'css') {
                cssFiles.push(filePath);
            } else if (language === 'javascript') {
                jsFiles.push(filePath);
            }
        });

        // Smart matching - try to find related files
        const newConnectedFiles = { html: null, css: null, js: null };

        // Set HTML file (prefer active file if it's HTML, otherwise first HTML file)
        if (activeFile && getFileObject(activeFile)?.language === 'html') {
            newConnectedFiles.html = activeFile;
        } else if (htmlFiles.length > 0) {
            newConnectedFiles.html = htmlFiles[0];
        }

        // Auto-detect CSS and JS files
        if (newConnectedFiles.html) {
            const htmlFileName = getFileObject(newConnectedFiles.html)?.name;
            if (htmlFileName) {
                const baseName = htmlFileName.replace(/\.(html|htm)$/i, '');
                
                // Look for matching CSS file
                const matchingCss = cssFiles.find(cssPath => {
                    const cssFileName = getFileObject(cssPath)?.name;
                    return cssFileName && (
                        cssFileName.toLowerCase().includes(baseName.toLowerCase()) ||
                        cssFileName.toLowerCase() === 'style.css' ||
                        cssFileName.toLowerCase() === 'styles.css' ||
                        cssFileName.toLowerCase() === 'main.css'
                    );
                });
                
                // Look for matching JS file
                const matchingJs = jsFiles.find(jsPath => {
                    const jsFileName = getFileObject(jsPath)?.name;
                    return jsFileName && (
                        jsFileName.toLowerCase().includes(baseName.toLowerCase()) ||
                        jsFileName.toLowerCase() === 'script.js' ||
                        jsFileName.toLowerCase() === 'main.js' ||
                        jsFileName.toLowerCase() === 'app.js'
                    );
                });

                if (matchingCss) newConnectedFiles.css = matchingCss;
                if (matchingJs) newConnectedFiles.js = matchingJs;
            }
        }

        setConnectedFiles(newConnectedFiles);
    }, [openFiles, activeFile, getFileObject]);

    // Generate preview content
    const generatePreview = useCallback(() => {
        if (!connectedFiles.html || !getFileContent) {
            return '';
        }

        let htmlContent = getFileContent(connectedFiles.html) || '';
        let cssContent = connectedFiles.css ? getFileContent(connectedFiles.css) || '' : '';
        let jsContent = connectedFiles.js ? getFileContent(connectedFiles.js) || '' : '';

        // Inject CSS and JS into HTML
        let finalContent = htmlContent;

        // Add CSS
        if (cssContent) {
            const cssTag = `<style>\n${cssContent}\n</style>`;
            
            // Try to insert before closing head tag
            if (finalContent.includes('</head>')) {
                finalContent = finalContent.replace('</head>', `${cssTag}\n</head>`);
            } else {
                // If no head tag, add at the beginning
                finalContent = `${cssTag}\n${finalContent}`;
            }
        }

        // Add JavaScript
        if (jsContent) {
            const jsTag = `<script>\n${jsContent}\n</script>`;
            
            // Try to insert before closing body tag
            if (finalContent.includes('</body>')) {
                finalContent = finalContent.replace('</body>', `${jsTag}\n</body>`);
            } else {
                // If no body tag, add at the end
                finalContent = `${finalContent}\n${jsTag}`;
            }
        }

        return finalContent;
    }, [connectedFiles, getFileContent]);    // Update preview content when connected files change or their content changes
    useEffect(() => {
        if (isPreviewOpen && connectedFiles.html) {
            const content = generatePreview();
            setPreviewContent(content);
        }
    }, [connectedFiles, isPreviewOpen, generatePreview, openFiles]); // Added openFiles to dependencies to trigger on content changes

    // Manual file connection
    const connectFile = (fileType, filePath) => {
        if (!['html', 'css', 'js'].includes(fileType)) return;

        setConnectedFiles(prev => ({
            ...prev,
            [fileType]: filePath
        }));

        toast.success(`Connected ${fileType.toUpperCase()} file: ${getFileObject(filePath)?.name}`);
    };

    // Disconnect file
    const disconnectFile = (fileType) => {
        setConnectedFiles(prev => ({
            ...prev,
            [fileType]: null
        }));

        toast.info(`Disconnected ${fileType.toUpperCase()} file`);
    };

    // Toggle preview
    const togglePreview = () => {
        if (!connectedFiles.html) {
            toast.error('Please connect an HTML file first');
            return;
        }

        setIsPreviewOpen(prev => {
            const newState = !prev;
            if (newState) {
                const content = generatePreview();
                setPreviewContent(content);
                toast.success('Live preview opened');
            } else {
                toast.info('Live preview closed');
            }
            return newState;
        });
    };

    // Check if current file can be previewed
    const canPreview = () => {
        return !!connectedFiles.html;
    };

    // Check if current active file is HTML
    const isHTMLFile = () => {
        if (!activeFile || !getFileObject) return false;
        const fileObj = getFileObject(activeFile);
        return fileObj && fileObj.language === 'html';
    };

    return {
        isPreviewOpen,
        connectedFiles,
        previewContent,
        connectFile,
        disconnectFile,
        togglePreview,
        canPreview,
        isHTMLFile,
        autoDetectConnectedFiles
    };
};
