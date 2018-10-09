import { Component, OnInit, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  MqttService,
  IMqttServiceOptions,
  IMqttMessage
} from "ngx-mqtt";
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';



@Component({
  selector: "app-home-content",
  templateUrl: "./home-content.component.html",
  styleUrls: ["./home-content.component.css"]
})
export class HomeContentComponent implements OnInit {
  private swal: SweetAlert = _swal as any;
  private connOption: IMqttServiceOptions;
  private measurement = 0;
  public successfullConnection: boolean;
  private topic = "SYMulation/DataLogger/sensori";
  private topicTest = "mytest/digit";
  private formTopic;

  constructor(private _mqttService: MqttService) {
    this.successfullConnection = false;
  }

  ngOnInit() {}

  saveConnectionOptions(connectionForm: NgForm) {
    if (connectionForm.valid) {
      const formValue = connectionForm.value;

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

  subscribeTopic(topicForm: NgForm) {
    if (topicForm.valid) {
      const topic = topicForm.value;

      if (this.successfullConnection) {
        this._mqttService.observe(topic.topicField).subscribe((message: IMqttMessage) => {
          console.log(`Sottoscritto topic: ${message.topic}`);
          this.measurement = JSON.parse(message.payload.toString());
          console.dir(this.measurement);
        });
        swal("SUBSCRIBED!", `You have subscribed the topic ${topic.topicField}`, "info");
      }
    }
  }

  manageConnection() {
    this._mqttService.onConnect.subscribe(() => {
      console.warn("Connesso al broker");
      this.successfullConnection = true;
      swal("CONNECTED!", `Connected to broker`, "success");
    });

    this._mqttService.onMessage.subscribe(() => {
      console.warn("Ricevuto messaggio");
    });

    this._mqttService.onError.subscribe(error => {
      console.log("Errore di connesione.");
      swal("CONNECTION ERROR!", `Check the broker or the connection option`, "error");
    });

    this._mqttService.onError.subscribe(error => {
      console.log("Errore di connesione.");
    });
  }
}
