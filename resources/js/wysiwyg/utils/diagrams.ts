import {LexicalEditor, LexicalNode} from "lexical";
import {HttpError} from "../../services/http";
import {EditorUiContext} from "../ui/framework/core";
import * as DrawIO from "../../services/drawio";
import {DiagramNode} from "../nodes/diagram";

export function $isDiagramNode(node: LexicalNode | null | undefined): node is DiagramNode {
    return node instanceof DiagramNode;
}

function handleUploadError(error: HttpError, context: EditorUiContext): void {
    if (error.status === 413) {
        window.$events.emit('error', context.options.translations.serverUploadLimitText || '');
    } else {
        window.$events.emit('error', context.options.translations.imageUploadErrorText || '');
    }
    console.error(error);
}

async function loadDiagramIdFromNode(editor: LexicalEditor, node: DiagramNode): Promise<string> {
    const drawingId = await new Promise<string>((res, rej) => {
        editor.getEditorState().read(() => {
            const {id: drawingId} = node.getDrawingIdAndUrl();
            res(drawingId);
        });
    });

    return drawingId || '';
}

async function updateDrawingNodeFromData(context: EditorUiContext, node: DiagramNode, pngData: string, isNew: boolean): Promise<void> {
    DrawIO.close();

    if (isNew) {
        const loadingImage: string = window.baseUrl('/loading.gif');
        context.editor.update(() => {
            node.setDrawingIdAndUrl('', loadingImage);
        });
    }

    try {
        const img = await DrawIO.upload(pngData, context.options.pageId);
        context.editor.update(() => {
            node.setDrawingIdAndUrl(String(img.id), img.url);
        });
    } catch (err) {
        if (err instanceof HttpError) {
            handleUploadError(err, context);
        }

        if (isNew) {
            context.editor.update(() => {
                node.remove();
            });
        }

        throw new Error(`Failed to save image with error: ${err}`);
    }
}

export function $openDrawingEditorForNode(context: EditorUiContext, node: DiagramNode): void {
    let isNew = false;
    DrawIO.show(context.options.drawioUrl, async () => {
        const drawingId = await loadDiagramIdFromNode(context.editor, node);
        isNew = !drawingId;
        return isNew ? '' : DrawIO.load(drawingId);
    }, async (pngData: string) => {
        return updateDrawingNodeFromData(context, node, pngData, isNew);
    });
}