import { Routes } from '@angular/router';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';

export const routes: Routes = [
  { path: 'bar', component: BarChartComponent },
  { path: 'line', component: LineChartComponent },
  { path: 'pie', component: PieChartComponent },
];
