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

import { join } from 'path';
import {
  promises as fs,
  readFileSync,
  readdirSync,
  lstatSync,
} from 'fs';

import {
  DsSideNavContent,
} from '../types';

const distDir = './dist/next-data';

/** add the sidenav to each page */
function addSidenavToPages(
  files: string[],
  sidenavContent: DsSideNavContent,
  path: string,
): void {
  for (const file of files) {
    const filepath = join(path, file);
    if (!lstatSync(filepath).isDirectory()) {
      const content = JSON.parse(readFileSync(filepath).toString());

      // add sidenav to the json file
      content.sidenav = sidenavContent;
      fs.writeFile(join(path, file), JSON.stringify(content, null, 2), {
        flag: 'w', // "w" -> Create file if it does not exist
        encoding: 'utf8',
      });
    }
  }
}

function addNavSection(sideNav: DsSideNavContent, navGroup: string) {
  for (const section of sideNav.sections) {
    if(section.title && navGroup == section.title){
      return sideNav;
    }
  }

  sideNav.sections.push({title: navGroup, items: []});
  return sideNav;
}

/** Check if given path is a directory within distDir. */
function isDirectory(path: string): boolean {
  try {
    return lstatSync(join(distDir, path)).isDirectory();
  } catch {
    return false;
  }
}

/** Builds navigation */
export const navigationBuilder = async () => {
  const allDirectories = readdirSync(distDir).filter((dirPath) =>
    isDirectory(dirPath),
  );

  const pages = allDirectories.map(async (directory) => {
    const path = join(distDir, directory);
    const files = readdirSync(path);

    let sideNav: DsSideNavContent = {
      sections: [],
    };

    for (const file of files) {
      const content = JSON.parse(readFileSync(join(path, file)).toString());

      sideNav = addNavSection(sideNav, content.navGroup);

      for (const section of sideNav.sections) {
        const filepath = join(directory, file.replace(/\.[^/.]+$/, ''));

        if(content.navGroup == section.title) {
          section.items.push(
            {
              title: content.title,
              link: `/${filepath}`,
            });
        }
      }
    }

    addSidenavToPages(files, sideNav, path);
  });

  return Promise.all(pages);
};
