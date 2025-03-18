import { Component, OnInit, TemplateRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Mdule } from '../../../interfaces/module';
import { ModuleService } from '../../../services/module.service';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Lesson } from '../../../interfaces/lesson';
import { LessonService } from '../../../services/lesson.service';
import { TimeServiceService } from '../../../services/time.service';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LessonsComponent implements OnInit, OnDestroy {
  private timerSubscription!: Subscription;
  module$: Observable<any>;
  lesson$!: Observable<Lesson | null>;
  lessons: Lesson[] = [];
  index!: number;
  seconds: number = 0;
  selectedCategory: string = ''; // To store the selected category


  constructor(
    private moduleService: ModuleService,
    private activatedRoute: ActivatedRoute,
    private canvas: NgbOffcanvas,
    private lessonService: LessonService,
    private timeService: TimeServiceService
  ) {
    this.module$ = this.moduleService.module$;
    this.lesson$ = this.lessonService.lesson$;
    this.timeService.getElapsedTimeInSeconds().subscribe(
      seconds => this.seconds = seconds
    );
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.moduleService.show(+id!).subscribe();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  view(lesson: Lesson, template: TemplateRef<any>, index: number, lessons: Lesson[]) {
    this.lessons = lessons;
    this.index = index;
    this.lessonService.lesson = lesson;
    this.canvas.open(template, { position: 'end' });
    this.startTimer();
  }

  next() {
    this.track();
    this.index++;
    this.lessonService.lesson = this.lessons[this.index];
    this.checker();
    this.startTimer();
  }

  previous() {
    this.track();
    this.index--;
    this.lessonService.lesson = this.lessons[this.index];
    this.checker();
    this.startTimer();
  }

  checker() {
    if (!this.lessons[this.index]) {
      this.canvas.dismiss();
      this.stopTimer();
    }
  }

  track() {
    this.stopTimer();
    const lesson = this.lessons[this.index];
    this.moduleService.track(lesson.id, this.seconds).subscribe(res => this.moduleService.index().subscribe());
  }

  private startTimer() {
    if (this.timerSubscription) {
      this.stopTimer();
    }
    this.timerSubscription = this.timeService.startTimer().subscribe();
  }

  private stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  getCategories(lessons: Lesson[]): string[] {
    const categories = new Set<string>();
    if (lessons) { // Check if lessons is not null
      lessons.forEach(lesson => {
          if (lesson.category) {
              categories.add(lesson.category);
          }
      });
    return Array.from(categories);
  }
  return []; // Return an empty array if lessons is null or undefined
}
}

