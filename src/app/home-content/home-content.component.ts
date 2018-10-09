import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MqttService, IMqttServiceOptions, IMqttMessage } from "ngx-mqtt";
import * as _swal from "sweetalert";
import { SweetAlert } from "sweetalert/typings/core";
import { chart } from 'highcharts';
import { Subscription } from "rxjs";


@Component({
  selector: "app-home-content",
  templateUrl: "./home-content.component.html",
  styleUrls: ["./home-content.component.css"]
})
export class HomeContentComponent implements OnInit {

  swal: SweetAlert = _swal as any;
  @ViewChild("chartTarget") chartTarget: ElementRef;
  chart: Highcharts.ChartObject;
  public subscriptionObject: Subscription;
  public subscribedTopic: boolean;
  public successfullConnection: boolean;

  private connOption: IMqttServiceOptions;
  private measurement = 0;
  private usefTopic = "";
  private defOpt: Highcharts.Options = {
    chart: {
      events: {
        load: function() {}
      }
    },
    time: {
      useUTC: true
    },

    title: {
      text: ""
    },

    exporting: {
      enabled: false
    },

    series: [
      {
        name: "random",
        data: []
      }
    ]
  };

  constructor(private _mqttService: MqttService) {
    this.successfullConnection = false;
    this.subscribedTopic = false;
  }

  ngOnInit() {

  }

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
    let myChart = this.chart;
    const options = this.defOpt;
    const series = options.series[0];

    if (topicForm.valid) {
      const topic = topicForm.value;
      this.usefTopic = topic.topicField;
      if (this.successfullConnection) {
        this.defOpt.chart.events.load = () => {
         this.subscriptionObject = this._mqttService
          .observe(topic.topicField)
          .subscribe((message: IMqttMessage) => {
            console.log(`Sottoscritto topic: ${message.topic}`);
            this.measurement = JSON.parse(message.payload.toString());
            console.dir(this.measurement);
            this.subscribedTopic = true;
            // this.createChart();
            options.title.text = "Dati Random";
            const x = new Date().toDateString();
            const y = this.measurement;
            if (series.data.length > 50) {
              series.data.shift();
            }
            series.data.push([x, y]);
            myChart.update(options);
          },
          (error: any) => console.log(error),
        );

        swal(
          "SUBSCRIBED!",
          `You have subscribed the topic ${topic.topicField}`,
          "info"
        );
      };
      myChart = chart(this.chartTarget.nativeElement, this.defOpt);
    }
    }
  }

  unSubscribeTopic() {
    console.log("Unsubscribed");
    this.subscriptionObject.unsubscribe();
    swal(
      "UNSUBSCRIBED!",
      ``,
      "warning"
    );
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
      swal(
        "CONNECTION ERROR!",
        `Check the broker or the connection option`,
        "error"
      );
    });
  }

  /*createChart() {
    let myChart = this.chart;
    const options = this.defOpt;
    const series = options.series[0];

    this.defOpt.chart.events.load = () => {
      options.title.text = "Dati Random";
      const x = new Date().toDateString();
      const y = this.measurement;

      if (series.data.length > 50) {
        series.data.shift();
      }

      series.data.push([x, y]);
      myChart.update(options);
    };
    myChart = chart(this.chartTarget.nativeElement, this.defOpt);
  }*/

}
