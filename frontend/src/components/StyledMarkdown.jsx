import React from 'react';
import ReactMarkdown from 'react-markdown';
import { styled } from '@mui/material/styles';
import { Typography, Link } from '@mui/material';

const MarkdownContainer = styled('div')(({ theme }) => ({
  '& p': {
    marginBottom: theme.spacing(2),
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.grey[300]}`,
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    marginRight: 0,
    fontStyle: 'italic',
  },
}));

const StyledMarkdown = ({ children }) => {
  return (
    <MarkdownContainer>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
          h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
          h3: ({ node, ...props }) => <Typography variant="h6" gutterBottom {...props} />,
          p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
          a: ({ node, ...props }) => <Link {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default StyledMarkdown;