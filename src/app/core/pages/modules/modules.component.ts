import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from '../../interfaces/activity';
import { Mdule } from '../../interfaces/module';
import { ModuleService } from '../../services/module.service';
import { QuizService } from '../../services/quiz.service';
import { Progress } from '../../interfaces/progress';
import { ChartOptions } from '../../../interfaces/chart-options';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss'
})
export class ModulesComponent implements OnInit {
  chartOptions: ChartOptions[] = [];

  modules$!: Observable<Mdule[]>;

  constructor(
    private moduleService: ModuleService,
    private router: Router
  ) { 
    this.modules$ = this.moduleService.modules$;

    this.modules$.subscribe(modules => {
      this.chartOptions.push(...modules.map(module => this.chartConfig(module.progress)));
    });
  }

  ngOnInit(): void {
    this.moduleService.index().subscribe();
  }

  chartConfig(progress: Progress): ChartOptions {
    return {
      series: [progress.total_lessons-progress.completed_lessons, progress.completed_lessons],
      colors: ['#6c757d', '#8E1615'],
      labels: ["Total", "Completed"],
      chart: {
        height: 150,
        width: 150,
        type: "donut"
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
            }
          }
        }
      },
      legend: {
        show: false
      },
      dataLabels:{
        enabled: true
      }
    }
  }

  show(id: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['module',id]);
  }

  bookmark(id: number, event: Event) {
    event.stopPropagation();
    this.moduleService.bookmark(id).subscribe();
  }

}
