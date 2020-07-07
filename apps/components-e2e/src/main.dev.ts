// Used to launch the application under Bazel development mode.
import { platformBrowser } from '@angular/platform-browser';
import { DtE2EAppModule } from './app/app.module';

platformBrowser().bootstrapModule(DtE2EAppModule);
