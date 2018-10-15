import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MqttService, IMqttServiceOptions, IMqttMessage } from "ngx-mqtt";
import * as _swal from "sweetalert";
import { SweetAlert } from "sweetalert/typings/core";
import { chart } from 'highcharts';
import { Subscription, Observable, timer } from "rxjs";


@Component({
  selector: "app-home-content",
  templateUrl: "./home-content.component.html",
  styleUrls: ["./home-content.component.css", "./spinner.scss"]
})
export class HomeContentComponent implements OnInit {

  swal: SweetAlert = _swal as any;
  @ViewChild("chartTarget") chartTarget: ElementRef;
  chart: Highcharts.ChartObject;
  public subscriptionObject: Subscription;
  public subscribedTopic: boolean;
  public successfullConnection: boolean;
  public hideOnUnsub: boolean;
  public showSpinner: boolean;
  public usefTopic;

  private connOption: IMqttServiceOptions;
  private measurement = 0;
  private spinnerSubscription: Subscription;
  private spinnerTimer: Observable<any>;
  private defOpt: Highcharts.Options = {
    chart: {
      events: {
        load: function() {}
      }
    },
    time: {
      //timezone: 'Europe/London'
      useUTC: true
    },

    title: {
      text: ""
    },

    exporting: {
      enabled: false
    },
    xAxis: {
      type: "datetime"
    },
    series: [
      {
        name: "values",
        data: []
      }
    ]
  };

  constructor(private _mqttService: MqttService) {
    this.successfullConnection = false;
    this.subscribedTopic = false;
    this.hideOnUnsub = false;
    this.showSpinner = false;
  }

  ngOnInit() {

  }

   setTimer() {
    this.showSpinner   = true;

    this.spinnerTimer = timer(5000);
    this.spinnerSubscription = this.spinnerTimer.subscribe(() => {
        this.showSpinner = false;
        this.subscribedTopic = true;

    });
  }

  saveConnectionOptions(connectionForm: NgForm) {
    if (connectionForm.valid) {
      const formValue = connectionForm.value;

      this.connOption = {
        hostname: formValue.hostname,
      //hostname": "13.94.229.181",
       // port: 3000,
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
      this.setTimer();
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
            const title = message.topic.split("/", 6);

           console.log(title[5]);
            options.title.text = `${title[3]} - ${title[4]} - ${title[5]}`.toUpperCase();
            const x = new Date(this.measurement[0].timestamp).getTime();
            console.log(x);

            const y = this.measurement[0].value;
            if (series.data.length > 50) {
              series.data.shift();
            }
           // series.yAxis = this.measurement;

            series.data.push([x, y]);
            console.log(series.data);
            myChart.update(options);
            this.hideOnUnsub = true;
          },
          (error: any) => console.log(error),
          () => {
            this.spinnerSubscription.unsubscribe();
          }
        );

        swal(
          "SUBSCRIBED!",
          `You have subscribed the topic ${topic.topicField}`,
          "info"
        );
      };
      myChart = chart(this.chartTarget.nativeElement, this.defOpt);
      window.scrollTo(0, document.body.scrollHeight);
      this.chart = myChart;
    }
    }
  }

  unSubscribeTopic() {
    const options = this.defOpt;
    const series = options.series[0];

    console.log("Unsubscribed");
    this.subscriptionObject.unsubscribe();
    //series.data.splice(0, series.data.length);
    const x = 0;
    const y = 0;
    console.log(series.data);
    series.data = [[x, y].pop()];
    console.log(series.data);
    this.chart.destroy();
    this.hideOnUnsub = false;
    this.subscribedTopic = false;
    //this.chart.update(options);
    console.log(series.data);
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

  /*
    const MqttTopicInflux = 'SYMulation/DataLogger/sensori';

    const MqttTopicPath = 'SYMulation/DataLogger/';

    const MqttTopicPompa1 = MqttTopicPath + 'Pompa1';
    const MqttTopicPompa2 =  MqttTopicPath + 'Pompa2';
    const MqttTopicVentilatore =  MqttTopicPath + 'Ventilatore';
    const MqttTopicMotore1 =  MqttTopicPath + 'Motore1';
    const MqttTopicMotore2 =  MqttTopicPath + 'Motore2';
    const MqttTopicVasca1 =  MqttTopicPath + 'Vasca1';
    const MqttTopicVasca2 =  MqttTopicPath + 'Vasca2';
    const MqttTopicVasca3 =  MqttTopicPath + 'Vasca3';
    const MqttTopicVasca4 =  MqttTopicPath + 'Vasca4';
    const MqttTopicVasca5 =  MqttTopicPath + 'Vasca5';
    const MqttTopicVasca6 =  MqttTopicPath + 'Vasca6';
  */

}
