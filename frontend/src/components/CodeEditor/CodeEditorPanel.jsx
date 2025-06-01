import CodeMirror from "@uiw/react-codemirror";
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
    setActiveComment
}) => {
    // Create CodeMirror extensions
    const blameTooltipExtension = createBlameTooltipExtension(codeBlame);
    const lineBlameTooltipExtension = createLineBlameTooltipExtension(lineBlameData);
    const commentGutter = createCommentGutterExtension(
        comments,
        handleStartComment,
        setActiveComment
    );

    return (
        <div className="flex-1 bg-[#111119] border border-gray-800 rounded-lg overflow-hidden relative">
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold flex items-center">
                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Code Editor
                </h3>
            </div>
            <div className="h-[400px] overflow-y-auto">
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
