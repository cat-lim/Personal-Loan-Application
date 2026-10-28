import { Routes } from '@angular/router';

import { OfficerQueueComponent } from './officer/officer-home/officer-home';
import { OfficerReviewComponent} from './officer/offcer-review/offcer-review';
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