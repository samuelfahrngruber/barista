/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { load } from 'cheerio';
import * as prettier from 'prettier';
import { relative, join } from 'path';

type ElementAttributes = ({ [key: string]: string } | string)[];

interface Chunk {
  name?: string;
  dir: string;
  fileName: string;
}

export interface Style extends Chunk {
  type: 'style';
}

export interface Script extends Chunk {
  type: 'script';
  module: boolean;
}

export type HtmlInsertion = Style | Script;

export function htmlInsertAsset(
  html: string,
  basePath: string,
  assets: HtmlInsertion[],
): string {
  const $ = load(html);

  assets.forEach((asset) => {
    switch (asset.type) {
      case 'script':
        $('body').append(generateScriptTag(basePath, asset));
        break;
      case 'style':
        $('head').append(generateLinkTag(basePath, asset));
        break;
    }
  });

  return prettier.format($.html(), { parser: 'html' });
}

/** Generates a link tag out of the asset definition */
export function generateLinkTag(basePath: string, style: Style): string {
  // Get the relative path to the index.html
  const relativePath = relative(basePath, style.dir);
  const attributes: ElementAttributes = [
    { rel: 'stylesheet' },
    { href: join(relativePath, style.fileName) },
  ];

  return generateElement('link', attributes, '', true);
}

/** Generates a script tag out of a script definition */
export function generateScriptTag(basePath: string, script: Script): string {
  // Get the relative path to the index.html
  const relativePath = relative(basePath, script.dir);
  const attributes: ElementAttributes = [
    { src: join(relativePath, script.fileName) },
  ];

  if (script.module) {
    attributes.push({ type: 'module' });
  } else {
    attributes.push('nomodule', 'defer');
  }

  return generateElement('script', attributes);
}

export function generateElement(
  element: string,
  attributes: ElementAttributes,
  content = '',
  selfClosing = false,
): string {
  const parsedAttributes = attributes
    .map((attribute) =>
      typeof attribute === 'string'
        ? attribute
        : Object.entries(attribute)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' '),
    )
    .join(' ');

  const head = `<${element} ${parsedAttributes}`;
  const tail = selfClosing ? `/>` : `>${content}</${element}>`;
  return `${head}${tail}`;
}
