import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { GroupedPieChartCasesService } from "./grouped-pie-chart-cases.service"
import { GroupedPieChartExpenseService } from './grouped-pie-chart-expense.service';
import { GroupedPieChartTainingService } from './grouped-pie-chart-training.service';

@Injectable()
export class GroupedLineChartService {
  private keys: string[];
  private currkeys: string[];
  private columnMap = new Map<string, boolean>();
  private year: number;
  private dataURL: {
    cases: any,
    training: any,
    expense: any
  };
  private dataColoumn: {
    cases: string[],
    training: string[],
    expense: string[]
  };
  private data: {
    cases: any,
    casesCummulative: any,
    training: any,
    trainingCummulative: any,
    expense: any
    expenseCummulative: any
  };
  private columnMapCases = new Map<string, boolean>();
  private columnMapExpense = new Map<string, boolean>();
  private columnMaptraining = new Map<string, boolean>();
  private currkeysCases: string[];
  private currkeysExpense: string[];
  private currkeysTraining: string[];
  private currData: any;
  private newData = new Subject<any>();
  private parameter = new Subject<any>();
  private tableData = new Subject<any>();
  private xLabel: string;
  private yLabel: string;
  private xColumn: string;
  private cumulative: boolean;
  private port: number;

  constructor(protected http: HttpClient,
    protected pieChartCasesService: GroupedPieChartCasesService,
    protected pieChartExpenseService: GroupedPieChartExpenseService,
    protected pieChartTrainingService: GroupedPieChartTainingService) {

    this.initialize();
    this.port = 3000;

    this.pieChartCasesService.getLineChartParameterListener().subscribe((d) => {
      this.setColumn(d.datatype, d.key);
    });
    this.pieChartExpenseService.getLineChartParameterListener().subscribe((d) => {
      this.setColumn(d.datatype, d.key);
    });
    this.pieChartTrainingService.getLineChartParameterListener().subscribe((d) => {
      this.setColumn(d.datatype, d.key);
    });
  }

  name() {
    return "GroupedLineChartService";
  }

  initialize() {
    this.dataURL = {
      cases: "getMonthlyTotalCases",
      training: "getMonthlyTotalTaining",
      expense: "getMonthlyTotalExpense"
    };

    this.dataColoumn = {
      cases: ["Alcohol Cases", "Suicide Cases", "SMD Cases", "CMD Cases", "Psychiatric Disorder Cases", "O1 Cases", "O2 Cases", "O3 Cases", "O4 Cases", "O5 Cases"],
      training: ["ANM/Health Workers",
        "ASHA",
        "Ayush Doctors",
        //"Counselor",
        //"Medical Officers",
        "Nursing Staff",
        "Pharmacist",
        "RBSK/RKSK",
        "Teachers(College)",
        "Others"],
      expense: ["AmbulatoryService",
        "B2030_AnnualIncrement",
        "B3012_PsyNurse",
        "B3012_StaffNurse",
        "B3032_Psychiatrists",
        "B3032_PsychiatristsTA",
        "B10162_Awarness",
        "B30112_Psyst_Counsellor",
        "B30114_SocialWorker",
        "B30114_SocialWorkerTA",
        "B30137_MedialRedAsst",
        "B30137_WardAsst",
        "Drugs",
        "Equipments",
        "IEC",
        "Infrastucture",
        "J17_Contingency",
        "Miscellanious",
        "OperationExpense",
        "TargetIntervention",
        "Training"]
    };

    this.year = 2018;
    this.cumulative = false;
    this.xColumn = "Month";
    this.xLabel = "Month";
    this.keys = ["Cases", "Expense", "Training"];
    this.setColumns();
  }

  setColumns() {
    this.columnMapCases = new Map<string, boolean>();
    for (let col of this.dataColoumn.cases)
      this.columnMapCases.set(col, true);

    this.columnMaptraining = new Map<string, boolean>();
    for (let col of this.dataColoumn.training)
      this.columnMaptraining.set(col, true);

    this.columnMapExpense = new Map<string, boolean>();
    for (let col of this.dataColoumn.expense)
      this.columnMapExpense.set(col, true);
  }

  getYearDataFromServer(postData: { year: number, districtId?: number }) {
    this.http.post<any>("http://localhost:" + this.port + "/" + this.dataURL['cases'], postData)
      .subscribe(resCasesData => {

        this.http.post<any>("http://localhost:" + this.port + "/" + this.dataURL['training'], postData)
          .subscribe(resTrainingData => {

            this.http.post<any>("http://localhost:" + this.port + "/" + this.dataURL['expense'], postData)
              .subscribe(resExpenseData => {
                this.data = {
                  cases: resCasesData,
                  casesCummulative: this.calculateCummulativeTotal(resCasesData, this.dataColoumn.cases),
                  training: resTrainingData,
                  trainingCummulative: this.calculateCummulativeTotal(resTrainingData, this.dataColoumn.training),
                  expense: resExpenseData,
                  expenseCummulative: this.calculateCummulativeTotal(resExpenseData, this.dataColoumn.expense)
                }

                console.log(this.data);
                this.updatePieChartData();
                this.updateData();
              });
          });
      });
  }

  calculateCummulativeTotal(resMonthlyData, keys) {
    if (resMonthlyData.length == 0)
      return [];

    let tmp = { ...resMonthlyData[0] };
    for (let k of keys)
      tmp[k] = 0;

    let monthlyDataCummulative = [];
    resMonthlyData.forEach(d => {
      let b = { ...d };
      for (let k of keys) {
        tmp[k] += d[k];
        b[k] = tmp[k];
      }
      monthlyDataCummulative.push(b);
    });

    return monthlyDataCummulative;
  }

  updatePieChartData() {
    this.pieChartCasesService.setKeys(this.dataColoumn.cases);
    this.pieChartCasesService.setData(this.data.casesCummulative[this.data.casesCummulative.length - 1]);
    this.pieChartCasesService.updateParameter();
    this.pieChartCasesService.updateTotal();

    this.pieChartExpenseService.setKeys(this.dataColoumn.expense);
    this.pieChartExpenseService.setData(this.data.expenseCummulative[this.data.expenseCummulative.length - 1]);
    this.pieChartExpenseService.updateParameter();
    this.pieChartExpenseService.updateTotal();

    this.pieChartTrainingService.setKeys(this.dataColoumn.training);
    this.pieChartTrainingService.setData(this.data.trainingCummulative[this.data.trainingCummulative.length - 1]);
    this.pieChartTrainingService.updateParameter();
    this.pieChartTrainingService.updateTotal();
  }

  calculateTotal() {
    this.currkeysCases = []
    this.currkeysTraining = []
    this.currkeysExpense = []

    for (let [colName, colbool] of this.columnMapCases)
      if (colbool) this.currkeysCases.push(colName);

    for (let [colName, colbool] of this.columnMaptraining)
      if (colbool) this.currkeysTraining.push(colName);

    for (let [colName, colbool] of this.columnMapExpense)
      if (colbool) this.currkeysExpense.push(colName);

    let data = {
      cases: this.cumulative ? this.data.casesCummulative : this.data.cases,
      training: this.cumulative ? this.data.trainingCummulative : this.data.training,
      expense: this.cumulative ? this.data.expenseCummulative : this.data.expense
    }

    this.currData = [];
    for (let i = 0; i < data.cases.length; i++) {
      let tempTotalCases = 0;
      let tempTotalTraining = 0;
      let tempTotalExpense = 0;
      for (let colName of this.currkeysCases)
        tempTotalCases += data.cases[i][colName];
      for (let colName of this.currkeysTraining)
        tempTotalTraining += data.training[i][colName];
      for (let colName of this.currkeysExpense)
        tempTotalExpense += data.expense[i][colName];
      this.currData.push({
        Month: data.cases[i]["Month"],
        Cases: Number(tempTotalCases.toFixed(2)),
        Training: Number(tempTotalTraining.toFixed(2)),
        Expense: Number(tempTotalExpense.toFixed(2))
      })
    }
  }

  updateData() {
    // this.currData = this.cumulative ? this.data.monthlyDataCummulative : this.data.monthlyData;
    this.calculateTotal();
    let newData = {
      data: this.currData
    }
    console.log("DataLine", newData);

    this.newData.next(newData);
  }

  updateParameter() {
    let parameter = {
      xLabel: this.xLabel,
      xColumn: this.xColumn,
      keys: this.keys
    };
    console.log("parameterLine", parameter);

    this.parameter.next(parameter);
  }

  getDataListener() {
    return this.newData.asObservable();
  }

  getParameterListener() {
    return this.parameter.asObservable();
  }

  getTableData() {
    return this.tableData.asObservable();
  }

  getCumulative() {
    return this.cumulative;
  }

  setxColumn(xColumn: string) {
    this.xColumn = xColumn;
  }

  setLabels(xLabel: string, yLabel: string) {
    this.xLabel = xLabel;
    this.yLabel = yLabel;
  }

  setYear(year: number) {
    this.year = year;
  }

  setKeys(keys: string[]) {
    this.keys = keys;
    this.columnMap = new Map<string, boolean>();
    for (let key of this.keys.reverse()) {
      this.columnMap.set(key, true);
    }
    this.keys.reverse();
  }

  setCumulative(cumulative: boolean) {
    this.cumulative = cumulative;
    this.updateData();
  }

  setColumn(datatype: string, key: string) {
    switch (datatype) {
      case "Cases": {
        this.columnMapCases.set(key, !this.columnMapCases.get(key));
        break;
      }
      case "Training": {
        this.columnMaptraining.set(key, !this.columnMaptraining.get(key));
        break;
      }
      case "Expense": {
        this.columnMapExpense.set(key, !this.columnMapExpense.get(key));
        break;
      }
    }
    this.updateData();
  }
}
