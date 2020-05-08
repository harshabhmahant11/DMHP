import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OperationalHomeComponent } from './Operational_Dashboard/operational-home-component/operational-home.component';
import { NavBarTopComponent } from './nav-bar-top/nav-bar-top.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { GroupMenuComponent } from './PA-GroupChart/group-menu/group-menu.component';


const routes: Routes = [
  {path:"home", component:NavBarTopComponent,canActivate: [AuthGuard], children:[
    {path:":year/:sideNavOption",component:OperationalHomeComponent},
    {path:"performance",component:GroupMenuComponent}
  ]},

  {path:"",component:LoginComponent},
  {path:"login",component:LoginComponent},
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{onSameUrlNavigation: 'reload',anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})  
export class AppRoutingModule { }
