import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MqttService, IMqttServiceOptions, IMqttMessage, IOnErrorEvent } from 'ngx-mqtt';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css']
})
export class HomeContentComponent implements OnInit {


  private connOption: IMqttServiceOptions;
  private measurement = 0;

  private topic = "SYMulation/DataLogger/sensori";
  private topicTest = "mytest/digit";
  private formTopic;

  constructor(private _mqttService: MqttService) { }

  ngOnInit() {
  }

  saveConnectionOptions(connectionForm: NgForm) {
    if (connectionForm.valid) {
      const formValue = connectionForm.value;
      this.formTopic = formValue.topic;
      console.log(this.formTopic);
      this.connOption = {
          hostname: formValue.hostname,
          port: 3001,
          path: "",
          username: formValue.username, //admin
          password: formValue.password, //secret
          clientId: formValue.clientId,
          protocol: "wss"
      };

      this._mqttService.connect(this.connOption);
      this.manageConnection();
    }
  }

  manageConnection() {
    this._mqttService.onConnect.subscribe(() => {
      console.warn("Connesso al broker");

      this._mqttService.observe(this.formTopic).subscribe((message: IMqttMessage) => {
        console.log(`Sottoscritto topic: ${message.topic}`);
        this.measurement = JSON.parse(message.payload.toString());
         console.dir(this.measurement);
      });

    });

    this._mqttService.onMessage.subscribe(() => {
      console.warn("Ricevuto messaggio");
    });

    this._mqttService.onError.subscribe((error) => {
      console.log("Errore di connesione.");
    });

    this._mqttService.onError.subscribe((error) => {
      console.log("Errore di connesione.");
    });
  }


}
