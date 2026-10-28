import { Routes } from '@angular/router';

import { OfficerQueueComponent } from './officer/officer-home/officer-home';
import { OfficerReviewComponent} from './officer/officer-review/officer-review';
import { Home } from './home/home';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'officer/queue',
        component: OfficerQueueComponent
    },
    {
        path: 'officer/applications/:id',
        component: OfficerReviewComponent
    }
];