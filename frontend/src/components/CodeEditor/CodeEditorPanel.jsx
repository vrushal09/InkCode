import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";
import { languageExtensions } from "../../config/languages";
import { createBlameTooltipExtension } from "../../extensions/blameTooltipExtension";
import { createLineBlameTooltipExtension } from "../../extensions/lineBlameTooltipExtension";
import { createCommentGutterExtension } from "../../extensions/commentGutterExtension";

const CodeEditorPanel = ({
    code,
    language,
    codeBlame,
    lineBlameData,
    comments,
    handleCodeChange,
    handleStartComment,
    setActiveComment,
    setEditorElement,
    activeFile
}) => {
    const editorContainerRef = useRef(null);    // Set up editor element reference for cursor tracking
    useEffect(() => {
        if (editorContainerRef.current && setEditorElement) {
            const editorElement = editorContainerRef.current.querySelector('.cm-editor');
            if (editorElement) {
                setEditorElement(editorElement);
            }
        }
    }, [setEditorElement, code]); // Re-run when code changes to ensure element is found

    // Create CodeMirror extensions
    const blameTooltipExtension = createBlameTooltipExtension(codeBlame);
    const lineBlameTooltipExtension = createLineBlameTooltipExtension(lineBlameData);
    const commentGutter = createCommentGutterExtension(
        comments,
        handleStartComment,
        setActiveComment
    );    return (
        <div className="flex-1 bg-[#111119] border border-gray-800 rounded-lg overflow-hidden relative">
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold flex items-center">
                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    {activeFile ? activeFile.split('/').pop() : 'Code Editor'}
                    {activeFile && (
                        <span className="ml-2 text-sm text-gray-400 font-normal">
                            ({language})
                        </span>
                    )}
                </h3>
                {activeFile && (
                    <p className="text-sm text-gray-500 mt-1">
                        {activeFile}
                    </p>
                )}
            </div><div className="h-[400px] overflow-y-auto" ref={editorContainerRef}>
                <CodeMirror
                    value={code}
                    height="100%"
                    theme="dark"
                    extensions={[
                        languageExtensions[language](),
                        blameTooltipExtension,
                        lineBlameTooltipExtension,
                        commentGutter
                    ]}
                    onChange={handleCodeChange}
                />
            </div>
        </div>
    );
};

export default CodeEditorPanel;
