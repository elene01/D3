import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as d3 from 'd3';
import { dataType } from '../../../assets/models';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../../assets/data-service';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent {
  constructor(private dataService: DataService) {}

  data: dataType[] | [] = [];
  form = new FormGroup({
    year: new FormControl('2000'),
  });
  years: string[] = [
    '2000',
    '2001',
    '2002',
    '2003',
    '2004',
    '2005',
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
  ];
  svg: any;
  margin = 40;
  width = 500;
  height = 320;
  totalNum = 0;
  radius = Math.min(this.width, this.height) / 2 - this.margin;
  colors: any;
  tooltip: any;

  createSvg(): void {
    this.svg = d3
      .select('figure#pie')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ',' + this.height / 2 + ')'
      );
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
  createColors(year: string): void {
    this.totalNum = 0;
    this.colors = d3
      .scaleOrdinal()
      .domain(
        this.data.map((d: any) => {
          this.totalNum += d[year];
          return d[year].toString();
        })
      )
      .range(['#FFC154', '#BD5645', '#47B39C', '#EC6B56']);
  }
  drawChart(year: string): void {
    this.createColors(year);

    const pie = d3.pie<any>().value((d: any) => Number(d[year]));

    const data_ready = pie(this.data);

    // Build the pie chart
    this.svg
      .selectAll('pieces')
      .data(data_ready)
      .enter()
      .append('path')
      .transition()
      .duration(1000)
      .attr('d', d3.arc().innerRadius(50).outerRadius(this.radius))
      .attr('fill', (d: any, i: any) => this.colors(i))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 1);

    const labelLocation = d3.arc().innerRadius(50).outerRadius(this.radius);

    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('text')
      .text((d: any, i: any) => {
        return Math.round((d.value / this.totalNum) * 100) + '%';
      })
      .attr(
        'transform',
        (d: any) => 'translate(' + labelLocation.centroid(d) + ')'
      )
      .style('text-anchor', 'middle')
      .style('font-size', 18)
      .attr('fill', 'black');
    //hover
    this.svg
      .on('mouseover', (d: any) => {
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(
          'Year: ' +
            year +
            '<br>' +
            'Department: ' +
            d.toElement['__data__'].data.Department +
            '<br>' +
            'Amount: ' +
            d3.format('($,')(d.toElement['__data__'].data[year]) +
            '<br>' +
            'Percent: ' +
            Math.round(
              (d.toElement['__data__'].data[year] / this.totalNum) * 100
            ) +
            '%'
        );
      })
      .on('mousemove', (d: any) => {
        return this.tooltip
          .style('top', d.y - 25 + 'px')
          .style('left', d.x + 25 + 'px');
      })
      .on('mouseout', () => {
        return this.tooltip.style('visibility', 'hidden');
      });
  }
  ngOnInit(): void {
    this.createTooltip();
    this.createSvg();
    this.dataService
      .getData('./assets/Data/us-spending-since-2000-v3.json')
      .subscribe((data) => {
        this.data = data;
        this.drawChart('2000');
      });

    this.form.get('year')?.valueChanges.subscribe((value: any) => {
      this.drawChart(value);
    });
  }
}
