import { gutter, GutterMarker } from "@codemirror/view";

export const createCommentGutterExtension = (comments, handleStartComment, setActiveComment) => {
    return gutter({
        class: "cm-comments-gutter",
        renderEmptyElements: true,
        lineMarker(view, line) {
            const lineInfo = view.state.doc.lineAt(line.from);
            const lineNo = lineInfo.number - 1;

            const marker = new class extends GutterMarker {
                toDOM() {
                    const element = document.createElement("div");
                    element.style.cursor = "pointer";
                    element.style.width = "100%";
                    element.style.height = "100%";
                    element.style.display = "flex";
                    element.style.alignItems = "center";
                    element.style.justifyContent = "center";

                    const lineComments = comments[lineNo] || {};
                    const hasComments = Object.keys(lineComments).length > 0;

                    if (hasComments) {
                        const indicator = document.createElement("div");
                        indicator.className = "comment-indicator";
                        indicator.textContent = Object.keys(lineComments).length;
                        indicator.style.backgroundColor = "#8b5cf6";
                        indicator.style.color = "white";
                        indicator.style.borderRadius = "50%";
                        indicator.style.width = "18px";
                        indicator.style.height = "18px";
                        indicator.style.display = "flex";
                        indicator.style.alignItems = "center";
                        indicator.style.justifyContent = "center";
                        indicator.style.fontSize = "12px";
                        element.appendChild(indicator);
                    } else {
                        element.className = "comment-gutter-empty";
                    }

                    element.addEventListener("click", () => {
                        if (hasComments) {
                            setActiveComment(lineNo);
                        } else {
                            handleStartComment(lineNo);
                        }
                    });

                    return element;
                }
            };

            return marker;
        },
        initialSpacer() {
            return new class extends GutterMarker {
                toDOM() {
                    const element = document.createElement("div");
                    return element;
                }
            };
        },
        width: "28px"
    });
};
