import { Children, cloneElement, Fragment, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { renderRichText } from '@/lib/rich-text';

const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [
        'p',
        'br',
        'strong',
        'em',
        'del',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'a',
    ],
    attributes: {
        ...defaultSchema.attributes,
        a: ['href', 'title'],
        code: [...(defaultSchema.attributes?.code ?? []), 'className'],
        pre: [...(defaultSchema.attributes?.pre ?? []), 'className'],
    },
    protocols: {
        ...defaultSchema.protocols,
        href: ['http', 'https'],
    },
};

function enrichTextNodes(node: ReactNode): ReactNode {
    return Children.map(node, (child) => {
        if (typeof child === 'string') {
            // Explicit Fragment so Children.map can attach a unique key
            // (short-syntax <>...</> cannot accept keys → duplicate key "0").
            return <Fragment>{renderRichText(child)}</Fragment>;
        }

        if (isValidElement(child)) {
            const element = child as ReactElement<{ children?: ReactNode }>;

            if (element.props.children == null) {
                return child;
            }

            return cloneElement(element, {
                children: enrichTextNodes(element.props.children),
            });
        }

        return child;
    });
}

function SafeLink({
    href,
    children,
    title,
}: {
    href?: string;
    children?: ReactNode;
    title?: string;
}) {
    if (!href || !/^https?:\/\//i.test(href)) {
        return <>{enrichTextNodes(children)}</>;
    }

    return (
        <a
            href={href}
            title={title}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
        >
            {enrichTextNodes(children)}
        </a>
    );
}

const components: Components = {
    p: ({ children }) => <p>{enrichTextNodes(children)}</p>,
    li: ({ children }) => <li>{enrichTextNodes(children)}</li>,
    blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-muted-foreground/40 pl-3 text-muted-foreground">
            {enrichTextNodes(children)}
        </blockquote>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold">{enrichTextNodes(children)}</strong>
    ),
    em: ({ children }) => <em>{enrichTextNodes(children)}</em>,
    del: ({ children }) => (
        <del className="line-through">{enrichTextNodes(children)}</del>
    ),
    code: ({ children, className }) => (
        <code
            className={
                className ??
                'rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]'
            }
        >
            {children}
        </code>
    ),
    pre: ({ children }) => (
        <pre className="max-w-full overflow-x-auto rounded-md bg-muted p-2 text-sm">
            {children}
        </pre>
    ),
    a: SafeLink,
    ul: ({ children }) => (
        <ul className="list-disc space-y-0.5 pl-5">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal space-y-0.5 pl-5">{children}</ol>
    ),
};

type Props = {
    body: string;
    className?: string;
};

export function PostMarkdown({ body, className }: Props) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                components={components}
            >
                {body}
            </ReactMarkdown>
        </div>
    );
}
