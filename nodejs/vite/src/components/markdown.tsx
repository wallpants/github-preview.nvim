import { Container } from "./container";

type Props = {
    className?: string;
};

export const Markdown = ({ className }: Props) => {
    const filename = "README.md";

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold">{filename}</p>
            <div id="markdown-content" className="p-11" />
        </Container>
    );
};
