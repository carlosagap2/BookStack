/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$createRangeSelection, $getRoot, ParagraphNode} from 'lexical';
import {initializeUnitTest} from 'lexical/__tests__/utils';
import {$createQuoteNode, QuoteNode} from "@lexical/rich-text/LexicalQuoteNode";

const editorConfig = Object.freeze({
  namespace: '',
  theme: {
    quote: 'my-quote-class',
  },
});

describe('LexicalQuoteNode tests', () => {
  initializeUnitTest((testEnv) => {
    test('QuoteNode.constructor', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        expect(quoteNode.getType()).toBe('quote');
        expect(quoteNode.getTextContent()).toBe('');
      });
      expect(() => $createQuoteNode()).toThrow();
    });

    test('QuoteNode.createDOM()', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        expect(quoteNode.createDOM(editorConfig).outerHTML).toBe(
          '<blockquote class="my-quote-class"></blockquote>',
        );
        expect(
          quoteNode.createDOM({
            namespace: '',
            theme: {},
          }).outerHTML,
        ).toBe('<blockquote></blockquote>');
      });
    });

    test('QuoteNode.updateDOM()', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        const domElement = quoteNode.createDOM(editorConfig);
        expect(domElement.outerHTML).toBe(
          '<blockquote class="my-quote-class"></blockquote>',
        );
        const newQuoteNode = $createQuoteNode();
        const result = newQuoteNode.updateDOM(quoteNode, domElement);
        expect(result).toBe(false);
        expect(domElement.outerHTML).toBe(
          '<blockquote class="my-quote-class"></blockquote>',
        );
      });
    });

    test('QuoteNode.insertNewAfter()', async () => {
      const {editor} = testEnv;
      let quoteNode: QuoteNode;
      await editor.update(() => {
        const root = $getRoot();
        quoteNode = $createQuoteNode();
        root.append(quoteNode);
      });
      expect(testEnv.outerHTML).toBe(
        '<div contenteditable="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"><blockquote><br></blockquote></div>',
      );
      await editor.update(() => {
        const result = quoteNode.insertNewAfter($createRangeSelection());
        expect(result).toBeInstanceOf(ParagraphNode);
        expect(result.getDirection()).toEqual(quoteNode.getDirection());
      });
      expect(testEnv.outerHTML).toBe(
        '<div contenteditable="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"><blockquote><br></blockquote><p><br></p></div>',
      );
    });

    test('$createQuoteNode()', async () => {
      const {editor} = testEnv;
      await editor.update(() => {
        const quoteNode = $createQuoteNode();
        const createdQuoteNode = $createQuoteNode();
        expect(quoteNode.__type).toEqual(createdQuoteNode.__type);
        expect(quoteNode.__parent).toEqual(createdQuoteNode.__parent);
        expect(quoteNode.__key).not.toEqual(createdQuoteNode.__key);
      });
    });
  });
});
