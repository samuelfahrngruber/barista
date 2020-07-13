// Used to launch the application under Bazel development mode.
import { platformBrowser } from '@angular/platform-browser';
import { DtE2EAppModule } from './app/app.module';
import { VERSION } from '@angular/core';
console.log(VERSION);

// platformBrowser().bootstrapModule(DtE2EAppModule).catch(err => {
//   console.log('CANNOT LOAD AOT MODULE')
//   console.dir(AppModule);
//   console.error(err)
//   });
