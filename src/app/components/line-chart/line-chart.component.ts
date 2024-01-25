import { Component } from '@angular/core';
import * as d3 from 'd3';
import { DepartmentName, dataType } from '../../../assets/models';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../../assets/data-service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
  tooltip: any;
  data: dataType[] = [];
  departmentNames = [
    DepartmentName.Defense,
    DepartmentName.Education,
    DepartmentName.Health,
    DepartmentName.Homeland,
  ];
  form = new FormGroup({
    department: new FormControl(this.departmentNames[0]),
  });
  constructor(private dataService: DataService) {}
  ngOnInit(): void {
    this.createTooltip();
    this.updateChart();
    this.form.get('department')?.valueChanges.subscribe(() => {
      this.updateChart();
    });
  }
  updateChart(): void {
    const name: string = this.form.get('department')?.value || '';
    this.dataService
      .getDepartmentData('./assets/Data/us-spending-since-2000-v3.json', name)
      .subscribe((data: any) => {
        this.data = data;
        this.drawChart();
      });
  }
  createTooltip() {
    this.tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('background', '#dbd8e3')
      .style('padding', '10px')
      .style('border-radius', '8px');
  }
  drawChart(): void {
    const maxNum: any = d3.max(Object.values(this.data[0]).slice(0, -1));
    const values: number[] = Object.values(this.data[0]).slice(0, -1);
    d3.select('#lineChart').select('svg').remove();
    const margin = { top: 20, right: 20, bottom: 50, left: 170 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    const svg = d3
      .select('#lineChart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const x = d3.scaleLinear().domain([2000, 2022]).range([0, width]);
    const y = d3.scaleLinear().domain([0, maxNum]).range([height, 0]);
    const line: d3.Line<[number, number]> = d3
      .line()
      .x((d, i) => x(2000 + i))
      .y((d: any) => y(d));
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    svg
      .selectAll('.line')
      .data(this.data)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', (d) => line(values.map((value: any) => value)))
      .style('stroke', (d, i: any) => color(i))
      .style('stroke-width', '3px')
      .style('fill', 'none');

    svg
      .selectAll('.dot')
      .data(Object.values(this.data[0]).slice(0, -1))
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any, i: number) => x(2000 + i))
      .attr('cy', (d: any) => y(d))
      .attr('r', 4)
      .style('fill', 'rgb(214, 39, 40)')
      .on('mouseover', (event, d: any) => {
        const [mouseX, mouseY] = d3.pointer(event);
        const year = Math.round(x.invert(mouseX));
        const amount = this.data[0][year];
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(
          'Year: ' +
            year +
            '<br>' +
            'Amount: ' +
            d3.format('($,')(amount) +
            '<br>' +
            'Department: ' +
            this.form.get('department')?.value
        );
      })
      .on('mousemove', (event: any) => {
        const [mouseX, mouseY] = d3.pointer(event);
        return this.tooltip
          .style('top', mouseY + margin.top + 'px')
          .style('left', mouseX + margin.left + 'px');
      })
      .on('mouseout', () => {
        return this.tooltip.style('visibility', 'hidden');
      });
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 10)
      .text('Year');
    svg
      .append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('($,')))
      .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .text('USD');
  }
}
