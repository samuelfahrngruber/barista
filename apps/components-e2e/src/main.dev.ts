// Used to launch the application under Bazel development mode.
import { platformBrowser } from '@angular/platform-browser';
import { DtE2EAppModule } from './app/app.module';
// @ts-ignore
import { DtE2EAppModuleNgFactory } from "./app/app.module.ngfactory";

platformBrowser().bootstrapModule(DtE2EAppModuleNgFactory);
