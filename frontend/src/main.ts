/*
 *  Protractor support is deprecated in Angular.
 *  Protractor is used in this example for compatibility with Angular documentation tools.
 */
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {App} from './app/app';
import {appConfig} from './app/app.config';
import routeConfig from './app/routes';

bootstrapApplication(App, {
  providers: [
    ...appConfig.providers,
    provideProtractorTestingSupport(),
    provideRouter(routeConfig),
  ],
}).catch((err) => console.error(err));
