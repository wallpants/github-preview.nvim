import { type Root } from "@wooorm/starry-night";

export function starryNightGutter(tree: Root) {
    const replacement: Root["children"] = [];
    const search = /\r?\n|\r/g;
    let index = -1;
    let start = 0;
    let startTextRemainder = "";
    let lineNumber = 0;

    while (++index < tree.children.length) {
        const child = tree.children[index];

        if (child.type === "text") {
            let textStart = 0;
            let match = search.exec(child.value);

            while (match) {
                // Nodes in this line.
                const line = tree.children.slice(start, index);

                // Prepend text from a partial matched earlier text.
                if (startTextRemainder) {
                    line.unshift({ type: "text", value: startTextRemainder });
                    startTextRemainder = "";
                }

                // Append text from this text.
                if (match.index > textStart) {
                    line.push({
                        type: "text",
                        value: child.value.slice(textStart, match.index),
                    });
                }

                // Add a line, and the eol.
                lineNumber += 1;
                console.log("index: ", index);
                console.log("lineNumber: ", lineNumber);
                replacement.push(createLine(line, lineNumber), {
                    type: "text",
                    value: match[0],
                });

                start = index + 1;
                textStart = match.index + match[0].length;
                match = search.exec(child.value);
            }

            // If we matched, make sure to not drop the text after the last line ending.
            if (start === index + 1) {
                startTextRemainder = child.value.slice(textStart);
            }
        }
    }

    const line = tree.children.slice(start);
    // Prepend text from a partial matched earlier text.
    if (startTextRemainder) {
        line.unshift({ type: "text", value: startTextRemainder });
        startTextRemainder = "";
    }

    if (line.length > 0) {
        lineNumber += 1;
        console.log("index: ", index);
        console.log("lineNumber: ", lineNumber);
        replacement.push(createLine(line, lineNumber));
    }

    // Replace children with new array.
    tree.children = replacement;

    return tree;
}

function createLine(children: Root["children"], line: number): Root["children"][number] {
    return {
        type: "element",
        tagName: "span",
        properties: { className: "codeblock-line", dataLineNumber: line },
        // eslint-disable-next-line
        children: children as any,
    };
}
