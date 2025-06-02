// Enhanced CodeMirror extensions for additional features
import { autocompletion, completionKeymap, closeBrackets } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { 
    EditorView, 
    keymap, 
    lineNumbers, 
    highlightActiveLineGutter,
    drawSelection,
    dropCursor,
    highlightActiveLine
} from "@codemirror/view";
import { 
    EditorState
} from "@codemirror/state";
import { 
    defaultHighlightStyle, 
    syntaxHighlighting, 
    indentOnInput, 
    bracketMatching
} from "@codemirror/language";
import { 
    defaultKeymap, 
    history, 
    historyKeymap,
    indentWithTab 
} from "@codemirror/commands";
import { formatCode } from "../utils/codeFormatter";

// Minimap extension (simplified version)
const minimapExtension = EditorView.theme({
    ".cm-editor": {
        position: "relative"
    },
    ".cm-minimap": {
        position: "absolute",
        right: "0",
        top: "0",
        width: "120px",
        height: "100%",
        background: "#1a1a1a",
        border: "1px solid #333",
        fontSize: "2px",
        overflow: "hidden",
        zIndex: "10"
    }
});

// Create enhanced autocomplete configuration
export const createAutocompleteExtension = () => {
    return autocompletion({
        override: [
            // Basic JavaScript/TypeScript completions
            (context) => {
                const word = context.matchBefore(/\w*/);
                if (!word) return null;
                
                const completions = [
                    // Common JavaScript keywords and methods
                    { label: "console.log", type: "function", info: "Log to console" },
                    { label: "function", type: "keyword", info: "Function declaration" },
                    { label: "const", type: "keyword", info: "Constant declaration" },
                    { label: "let", type: "keyword", info: "Variable declaration" },
                    { label: "var", type: "keyword", info: "Variable declaration" },
                    { label: "if", type: "keyword", info: "Conditional statement" },
                    { label: "else", type: "keyword", info: "Else clause" },
                    { label: "for", type: "keyword", info: "For loop" },
                    { label: "while", type: "keyword", info: "While loop" },
                    { label: "return", type: "keyword", info: "Return statement" },
                    { label: "try", type: "keyword", info: "Try block" },
                    { label: "catch", type: "keyword", info: "Catch block" },
                    { label: "finally", type: "keyword", info: "Finally block" },
                    { label: "async", type: "keyword", info: "Async function" },
                    { label: "await", type: "keyword", info: "Await expression" },
                    { label: "import", type: "keyword", info: "Import statement" },
                    { label: "export", type: "keyword", info: "Export statement" },
                    { label: "class", type: "keyword", info: "Class declaration" },
                    { label: "extends", type: "keyword", info: "Class inheritance" },
                    { label: "static", type: "keyword", info: "Static method/property" },
                    { label: "constructor", type: "method", info: "Class constructor" },
                    
                    // Common methods
                    { label: "getElementById", type: "method", info: "Get element by ID" },
                    { label: "querySelector", type: "method", info: "Query selector" },
                    { label: "addEventListener", type: "method", info: "Add event listener" },
                    { label: "removeEventListener", type: "method", info: "Remove event listener" },
                    { label: "createElement", type: "method", info: "Create element" },
                    { label: "appendChild", type: "method", info: "Append child element" },
                    { label: "removeChild", type: "method", info: "Remove child element" },
                    { label: "setAttribute", type: "method", info: "Set attribute" },
                    { label: "getAttribute", type: "method", info: "Get attribute" },
                    { label: "classList.add", type: "method", info: "Add CSS class" },
                    { label: "classList.remove", type: "method", info: "Remove CSS class" },
                    { label: "classList.toggle", type: "method", info: "Toggle CSS class" },
                    
                    // Array methods
                    { label: "push", type: "method", info: "Add to end of array" },
                    { label: "pop", type: "method", info: "Remove from end of array" },
                    { label: "shift", type: "method", info: "Remove from start of array" },
                    { label: "unshift", type: "method", info: "Add to start of array" },
                    { label: "slice", type: "method", info: "Extract section of array" },
                    { label: "splice", type: "method", info: "Change array contents" },
                    { label: "map", type: "method", info: "Transform array elements" },
                    { label: "filter", type: "method", info: "Filter array elements" },
                    { label: "reduce", type: "method", info: "Reduce array to single value" },
                    { label: "forEach", type: "method", info: "Execute function for each element" },
                    { label: "find", type: "method", info: "Find first matching element" },
                    { label: "includes", type: "method", info: "Check if array includes value" },
                    
                    // String methods
                    { label: "length", type: "property", info: "String/Array length" },
                    { label: "charAt", type: "method", info: "Character at index" },
                    { label: "substring", type: "method", info: "Extract substring" },
                    { label: "substr", type: "method", info: "Extract substring" },
                    { label: "indexOf", type: "method", info: "Find index of substring" },
                    { label: "lastIndexOf", type: "method", info: "Find last index of substring" },
                    { label: "replace", type: "method", info: "Replace substring" },
                    { label: "split", type: "method", info: "Split string into array" },
                    { label: "toLowerCase", type: "method", info: "Convert to lowercase" },
                    { label: "toUpperCase", type: "method", info: "Convert to uppercase" },
                    { label: "trim", type: "method", info: "Remove whitespace" }
                ];
                
                return {
                    from: word.from,
                    options: completions.filter(c => 
                        c.label.toLowerCase().startsWith(word.text.toLowerCase())
                    )
                };
            }
        ]
    });
};

// Create the format command
export const formatCommand = (language) => ({
    key: "Shift-Alt-f",
    run: (view) => {
        const code = view.state.doc.toString();
        formatCode(code, language).then(formatted => {
            if (formatted !== code) {
                view.dispatch({
                    changes: {
                        from: 0,
                        to: view.state.doc.length,
                        insert: formatted
                    }
                });
            }
        });
        return true;
    }
});

// Create enhanced editor extensions
export const createEnhancedExtensions = (language = 'javascript') => {
    return [
        // Basic editor features
        lineNumbers(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        
        // Search and replace
        highlightSelectionMatches(),
        
        // History and undo/redo
        history(),
        
        // Enhanced autocomplete
        createAutocompleteExtension(),
        
        // Syntax highlighting
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        
        // Key mappings
        keymap.of([
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...completionKeymap,
            indentWithTab,
            formatCommand(language)
        ]),
        
        // Minimap (basic implementation)
        minimapExtension,
        
        // Enhanced editor theme
        EditorView.theme({
            "&": {
                fontSize: "14px",
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace"
            },
            ".cm-content": {
                padding: "16px",
                minHeight: "200px",
                lineHeight: "1.6"
            },
            ".cm-focused": {
                outline: "none"
            },
            ".cm-editor": {
                borderRadius: "8px"
            },
            ".cm-scroller": {
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace"
            },
            ".cm-searchMatch": {
                backgroundColor: "#ffd70040",
                border: "1px solid #ffd700"
            },
            ".cm-searchMatch.cm-searchMatch-selected": {
                backgroundColor: "#ffd70080"
            },
            ".cm-tooltip.cm-tooltip-autocomplete": {
                backgroundColor: "#1e1e1e",
                border: "1px solid #404040",
                borderRadius: "4px"
            },
            ".cm-tooltip.cm-tooltip-autocomplete > ul": {
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                fontSize: "13px"
            },
            ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
                padding: "4px 8px"
            },
            ".cm-completionLabel": {
                color: "#e0e0e0"
            },
            ".cm-completionDetail": {
                color: "#888888"
            }
        }, { dark: true })
    ];
};

// Search and replace functionality
export const createSearchReplaceExtension = () => {
    return EditorView.theme({
        ".cm-panels": {
            backgroundColor: "#1a1a1a",
            border: "1px solid #333"
        },
        ".cm-panel.cm-search": {
            padding: "8px",
            backgroundColor: "#1a1a1a"
        },
        ".cm-panel.cm-search input": {
            backgroundColor: "#2a2a2a",
            color: "#ffffff",
            border: "1px solid #555",
            borderRadius: "4px",
            padding: "4px 8px",
            marginRight: "8px"
        },
        ".cm-panel.cm-search button": {
            backgroundColor: "#7c3aed",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            padding: "4px 12px",
            marginRight: "4px",
            cursor: "pointer"
        },
        ".cm-panel.cm-search button:hover": {
            backgroundColor: "#8b5cf6"
        }
    }, { dark: true });
};
