import { Component, OnInit, Input, Inject } from '@angular/core';
import { Normalise } from '../../Services/patient-count.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @Input() private menuService: any;
  private year: number = 2018;
  public quarterChoosen: number = 1;
  private monthChoosen: number = 1;
  private months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  public monthName = "January";
  public granularChoosen: number = 0; // Granualirity : 0: Annual , 1 : Month , 2: Quarter
  private checkedNormalize: boolean = false;
  private columns: string[] = [];// = ["Alcohol Cases", "Suicide Cases", "SMD Cases", "CMD Cases", "Psychiatric Disorder Cases", "O1 Cases", "O2 Cases", "O3 Cases", "O4 Cases", "O5 Cases"];
  private toggleOptions_Sort: string[];
  private toggleValue_Sort: number;
  private toggleOptions_Granularity: string[] = ["Annual", "Month", "Quarter"];
  private mapName: string;
  private xColumn: string;
  private normalizeDisabled: boolean;
  public data:any;
  public dataType;
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.granularChoosen = this.menuService.getGranularity();
    this.toggleValue_Sort = this.menuService.getSortOption();
    this.checkedNormalize = this.menuService.getNormalize() == Normalise.YES ? true : false;
    this.year = this.menuService.getYear();
    this.xColumn = this.menuService.getxColumn();
    this.mapName = this.menuService.getMapName();
    this.normalizeDisabled = this.menuService.getNormalizeDisabled();
    this.toggleOptions_Sort = ["Rank", this.xColumn];
    this.dataType = this.menuService.getDataType();
    this.menuService.getDataListener().subscribe((d)=>{
      this.columns = d.currkeys;
      this.data = d.data;
    })
  }

  onMonthChange(event: any) {
    this.menuService.setMonth(event.value);
    this.monthName = this.months[event.value - 1];
  }

  onQuarterChange(event: any) {
    this.menuService.setQuarter(event.value);
    this.quarterChoosen = event.value;
  }

  onToggleChange_Sort(toggleValue: number) {
    this.menuService.setSortOption(toggleValue);
    this.toggleValue_Sort = toggleValue;
  }

  onToggleChange_Granularity(toggleValue: number) {
    this.menuService.setGranularity(toggleValue);
    this.granularChoosen = toggleValue;
  }

  onNormaliseChange() {
    this.menuService.setNormalise(this.checkedNormalize ? Normalise.YES : Normalise.NO);
  }

  /*public yearObj = new FormControl(moment());
  choosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    //this.radioPresent=!this.radioPresent;
    const ctrlValue = this.yearObj.value;
    ctrlValue.year(normalizedYear.year());
    this.yearObj.setValue(ctrlValue);
    datepicker.close();
    this.year = normalizedYear.year();
    this.annualData = [];
    this.monthlyData = [];
    this.quarterData = [];
    this.getYearDataFromServer(this.year);
  }*/

  viewTable(){
    let inputData =  {
      data : this.data,
      columns : this.columns,
      xColumn : this.xColumn
    };
    this.dialog.open(TabularDialog,{
      width: '1500px',
      data : inputData
    })
  }


}

@Component({
  selector: 'app-tabular',
  templateUrl: 'tabular-data.html',
})
export class TabularDialog {
  private columns;
  private data;
  private xColumn;
  constructor(public dialogRef: MatDialogRef<TabularDialog>,@Inject(MAT_DIALOG_DATA) public inputData) {
    this.columns = inputData.columns;
    this.data = inputData.data;
    this.xColumn = inputData.xColumn;
  }


  /*name of the excel-file which will be downloaded. */ 
fileName= 'ExcelSheet.xlsx';  

onClickDownload()
    {
       /* table id is passed over here */   
       let element = document.getElementById('excel-table'); 
       const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, this.fileName);
			
    }

   
}