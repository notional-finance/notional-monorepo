import sanitizeHTML from 'sanitize-html';
export interface Frame {
  tag: string;
  attrs: { [key: string]: string };
  text: string;
  mediaChildren: Frame[];
  tagPosition: number;
}
/* eslint-disable-next-line */
export interface SanitizedHtmlProps {
  allowProtocolRelative: boolean;
  allowedAttributes: Record<string, string[]>;
  allowedClasses: Record<string, string[]>;
  allowedSchemes: string[];
  allowedSchemesByTag: Record<string, string[]>;
  allowedTags: string[];
  exclusiveFilter: (Frame) => boolean;
  html: string;
  nonTextTags: string[];
  parser: unknown;
  selfClosing: string[];
  transformTags: Record<string, (tagName: string, attribs: Record<string, string>) => string>;
  className: string;
  id: string;
  style: React.CSSProperties;
}

const SUPPORTED_SANITIZER_OPTIONS = [
  'allowProtocolRelative',
  'allowedAttributes',
  'allowedClasses',
  'allowedSchemes',
  'allowedSchemesByTag',
  'allowedTags',
  'exclusiveFilter',
  'nonTextTags',
  'parser',
  'selfClosing',
  'transformTags',
];

export function SanitizedHtml(props: SanitizedHtmlProps) {
  const sanitizerOptions = SUPPORTED_SANITIZER_OPTIONS.reduce((options, name) => {
    const value = props[name];

    if (typeof value !== 'undefined') {
      options[name] = value;
    }

    return options;
  }, {});

  const sanitizedHTML = sanitizeHTML(props.html, sanitizerOptions);

  return (
    <div
      className={props.className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      id={props.id}
      style={props.style}
    />
  );
}

export default SanitizedHtml;
