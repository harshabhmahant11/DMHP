import { Component, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar-top',
  templateUrl: './nav-bar-top.component.html',
  styleUrls: ['./nav-bar-top.component.css']
})
export class NavBarTopComponent implements OnInit {
  constructor(private auth:AuthService,private router:Router) { }

  ngOnInit() {
  }

  Capture() {

    //let element = document.querySelector("#"+"this.dataType");
    // let element :string = "#"+"this.dataType";
    html2canvas(document.body).then(function (canvas) {
      // Convert the canvas to blob
      canvas.toBlob(function (blob) {
        // To download directly on browser default 'downloads' location
        let link = document.createElement("a");
        link.download = "image.png";
        link.href = URL.createObjectURL(blob);
        link.click();

        // To save manually somewhere in file explorer
        //FileSaver.saveAs(blob, 'image.png');

      }, 'image/png');
    });
  }

  LogOut(){
    this.auth.logout();
    this.router.navigate(['login']);
  }
}
