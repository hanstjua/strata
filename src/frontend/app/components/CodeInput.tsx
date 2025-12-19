import { closeBrackets } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { FunctionComponent, useEffect, useRef } from "react";
import { coolGlow } from "thememirror";

export const CodeInput: FunctionComponent<{
    defaultCode: string
}> = ({ defaultCode }) => {
    console.log('PythonEditor rendered.')
    const editorRef = useRef(null);

    useEffect(() => {
        if (!window.editorView) {
            const state = EditorState.create({
                doc: defaultCode,
                extensions: [
                    lineNumbers(),
                    bracketMatching(),
                    closeBrackets(),
                    python(),
                    keymap.of([indentWithTab]),
                    coolGlow
                ]
            })
            const editor = new EditorView({
                state: state,
                parent: editorRef.current!
            });
            window.editorView = editor;
        }
    }, [editorRef]);

    return (<div className="m-3 d-flex flex-column flex-grow-1">
        <div id="py-editor" className="d-flex flex-column flex-grow-1" style={{ overflow: "scroll", borderRadius: "10px", fontSize: "10pt" }} ref={ editorRef }>
            <style>
                {`.cm-editor {
                    flex-grow: 1;
                    height: 0px;
    }
    .cm-scroller {
      overflow: auto;
    }`}
            </style>
        </div>
    </div>)
}
