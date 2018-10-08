import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MqttService, IMqttServiceOptions } from 'ngx-mqtt';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css']
})
export class HomeContentComponent implements OnInit {

  private connOption: IMqttServiceOptions;

  constructor(private _mqttService: MqttService) { }

  ngOnInit() {
  }

  saveConnectionOptions(connectionForm: NgForm) {
    if (connectionForm.valid) {
      const formValue = connectionForm.value;
      console.log(formValue.clientId);
      this.connOption = {
          hostname: formValue.hostname,
          port: formValue.port,
          path: "",
          username: formValue.username, //admin
          password: formValue.password, //secret
          clientId: formValue.clientId,
          protocol: "wss"
      };
      //console.log(this.connOption);

    this._mqttService.connect(this.connOption);

    }
  }
}
