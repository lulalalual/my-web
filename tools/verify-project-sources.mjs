import assert from 'node:assert/strict';
import {resolveEmbedURL} from '../source/portfolio-assets/project-sources.mjs';

for (const value of ['/demos/interview/?mode=demo', '/portfolio-assets/diagrams/', 'https://app-lchslh9t6cds.cxiagents.com/', 'https://app-8mamzv6m988t.cxiagents.com/', 'https://app-c9z4iiiaftls.cxiagents.com/roadmap']) assert.ok(resolveEmbedURL(value));
for (const value of ['javascript:alert(1)', '//evil.example/', 'https://evil.example/', 'https://app-lchslh9t6cds.cxiagents.com.evil.example/', 'https://user:password@app-lchslh9t6cds.cxiagents.com/', '/\\evil.example/']) assert.equal(resolveEmbedURL(value), null);
console.log('Project source allowlist: 11 checks passed.');
