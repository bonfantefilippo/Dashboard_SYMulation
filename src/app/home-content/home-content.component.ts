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
      useUTC: false
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
        port: 3000,
        //port: 3001,
        path: "",
        username: formValue.username, //admin
        password: formValue.password, //secret
        clientId: formValue.clientId,
        protocol: "ws"
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
            options.title.text = "Dati Random";
            const x = new Date().toLocaleDateString();
            const y = this.measurement;

            if (series.data.length > 50) {
              series.data.shift();
            }
            series.data.push([x, y]);
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
