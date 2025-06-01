import { hoverTooltip } from "@codemirror/view";

export const createLineBlameTooltipExtension = (lineBlameData) => {
    return hoverTooltip((view, pos) => {
        const line = view.state.doc.lineAt(pos);
        const lineIndex = line.number - 1;

        if (!lineBlameData[lineIndex]) return null;

        const lineInfo = lineBlameData[lineIndex];

        return {
            pos: line.from,
            end: line.to,
            above: true,
            create() {
                const dom = document.createElement("div");

                dom.style.backgroundColor = "#1e293b";
                dom.style.color = "white";
                dom.style.padding = "8px 12px";
                dom.style.borderRadius = "6px";
                dom.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                dom.style.display = "flex";
                dom.style.alignItems = "center";
                dom.style.gap = "10px";
                dom.style.zIndex = "9999";
                dom.style.fontFamily = "system-ui, -apple-system, sans-serif";
                dom.style.fontSize = "14px";

                dom.innerHTML = `
                    <img src="${lineInfo.userPhoto}" alt="${lineInfo.userName}" 
                        style="width: 24px; height: 24px; border-radius: 50%;" />
                    <div>
                        <div style="font-weight: 500;">${lineInfo.userName}</div>
                        <div style="font-size: 11px; color: #cbd5e0;">
                            Line ${lineIndex + 1} • Edited ${new Date(lineInfo.timestamp).toLocaleString()}
                        </div>
                    </div>
                `;
                return { dom };
            }
        };
    });
};
