import { hoverTooltip } from "@codemirror/view";

export const createBlameTooltipExtension = (codeBlame) => {
    return hoverTooltip((view, pos) => {
        if (!codeBlame.lastEditor) return null;

        return {
            pos,
            end: pos,
            above: true,
            create() {
                const dom = document.createElement("div");
                const { lastEditor } = codeBlame;

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
                    <img src="${lastEditor.userPhoto}" alt="${lastEditor.userName}" 
                        style="width: 24px; height: 24px; border-radius: 50%;" />
                    <div>
                        <div style="font-weight: 500;">${lastEditor.userName}</div>
                        <div style="font-size: 11px; color: #cbd5e0;">
                            Last edited: ${new Date(lastEditor.timestamp).toLocaleString()}
                        </div>
                    </div>
                `;
                return { dom };
            }
        };
    });
};
