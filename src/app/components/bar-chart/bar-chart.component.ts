import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../../../assets/data-service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit {
  constructor(private dataService: DataService) {}
  data: any;
  maxNumber: number = 0;
  chartdata: any;
  svg: any;
  defenseMilitaryData: any;
  tooltip: any;
  // Margin convention
  margin = { top: 50, right: 50, bottom: 70, left: 150 };
  width = 700 - this.margin.left - this.margin.right;
  height = 500 - this.margin.top - this.margin.bottom;
  ngOnInit(): void {
    this.createSvg();

    // Tooltip
    this.tooltip = d3
      .select('figure#bar')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    this.dataService
      .getData('./assets/Data/us-spending-since-2000-v3.json')
      .subscribe((data: any) => {
        this.ready(data);
      });
  }
  ready(data: any) {
    this.chartdata = this.rollupData(data);
    this.drawBars(this.chartdata);
  }
  createSvg(): void {
    this.svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
  }
  rollupData(data: any) {
    const preparedData: any[] = [];
    data.map((v: any) => {
      this.findMaxNumber({
        2018: v[2018],
        2019: v[2019],
        2020: v[2020],
        2021: v[2021],
        2022: v[2022],
      });
      preparedData.push({
        2018: v[2018],
        2019: v[2019],
        2020: v[2020],
        2021: v[2021],
        2022: v[2022],
        Department: String(v.Department),
      });
    });

    return preparedData;
  }
  findMaxNumber(data: any) {
    const num = d3.max(Object.values(data));
    if (num && this.maxNumber < +num) {
      this.maxNumber = +num;
    }
  }
  private drawBars(data: any[]): void {
    const years = ['2018', '2019', '2020', '2021', '2022'];

    // Create color scale for departments
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create X-axis band scale
    const x = d3
      .scaleBand()
      .range([0, this.width - this.margin.left])
      .domain(years.map((d) => d))
      .padding(0.2);

    // Draw X-axis
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height / 2 + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Create Y-axis linear scale
    const y = d3
      .scaleLinear()
      .domain([0, this.maxNumber])
      .range([this.height / 2, 0]);

    // Draw Y-axis
    this.svg.append('g').call(d3.axisLeft(y));

    // Create and fill the bars for each year
    years.forEach(
      (year, index) => {
        const k: any = x(year);
        this.svg
          .selectAll('bars')
          .data(data)
          .enter()
          .append('rect')
          .attr('x', (d: any, i: any) => k + (x.bandwidth() * i) / years.length)
          .attr('y', (d: any) => y(d[year]))
          .attr('width', x.bandwidth() / years.length)
          .attr('height', (d: any) => this.height / 2 - y(d[year]))
          .attr('fill', (d: any) =>
            d && d.Department && color(d.Department)
              ? color(d.Department)
              : '#d04a35'
          );
      }
      // .on('mouseover', (event, d: any) => {
      //   // Show tooltip on hover
      //   const tooltip = d3.select('figure#bar').append('div').attr('class', 'tooltip');
      //   const [x, y] = d3.pointer(event);
      //   tooltip.transition().duration(200).style('opacity', 0.9);
      //   tooltip
      //     .html(
      //       `Year: ${year}<br/>Department: ${d.Department}<br/>Amount Spent: $${d[year].toLocaleString()}`
      //     )
      //     .style('left', x + 'px')
      //     .style('top', y - 28 + 'px');
      // })
      // .on('mouseout', () => {
      //   // Hide tooltip on mouseout
      //   d3.select('.tooltip').remove(); // Remove the tooltip element
      // });
    );
    const legend = this.svg
      .selectAll('.legend')
      .data(data.map((d) => d.Department))
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (_: any, i: any) => 'translate(0,' + i * 20 + ')');

    legend
      .append('rect')
      .attr('y', this.height - 100)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d: any) => color(d));

    legend
      .append('text')
      .attr('y', this.height - 92)
      .attr('x', 25)
      .attr('dy', '.35em')
      .text((d: any) => d);
  }
  drawLegand() {}
}
