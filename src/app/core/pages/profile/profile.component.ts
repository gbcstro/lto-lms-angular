import { Component, OnInit } from '@angular/core';
import { ModuleService } from '../../services/module.service';
import { Observable } from 'rxjs';
import { ChartOptions } from '../../../interfaces/chart-options';
import { Mdule } from '../../interfaces/module';
import { Progress } from '../../interfaces/progress';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { Bookmark, BookmarkHistory } from '../../interfaces/bookmark';
import { ActivityHistory } from '../../interfaces/activity-history';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  modules$!: Observable<Mdule[]>;
  bookmarks$!: Observable<BookmarkHistory[]>;
  activityHistory$!: Observable<ActivityHistory[]>;

  allActivities: ActivityHistory[] = [];
  pagedActivities: ActivityHistory[] = [];
  currentActivityPage: number = 1;
  itemsPerPage: number = 5;
  totalActivityPages: number = 1;

  allBookmarks: BookmarkHistory[] = [];
  pagedBookmarks: BookmarkHistory[] = [];
  currentBookmarkPage: number = 1;
  totalBookmarkPages: number = 1;

  chartOptions: ChartOptions[] = [];
  active: number = 1;
  user: any;
  noActivity = false;
  noBookmarks: boolean = false;

  //Url = 'https://your-api-endpoint.com/api'; // Replace with actual API URL
  private apiUrl = 'http://13.211.132.113';
  GOOGLE_CLIENT_ID = '674774180848-ihgv6rlj4p2kckuafr5cqa72rahifjlo.apps.googleusercontent.com';
  activity: ActivityHistory | undefined;

  constructor(
    private http: HttpClient,
    private moduleService: ModuleService,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.modules$ = this.moduleService.modules$;
    this.bookmarks$ = this.profileService.bookmarks$;
    this.profileService.activityHistory().subscribe(activities => {
      // ✅ Remove duplicates based on activity ID
      this.allActivities = activities.filter((activity, index, self) =>
        index === self.findIndex((a) => a.id === activity.id)
      );
      this.totalActivityPages = Math.ceil(this.allActivities.length / this.itemsPerPage);
      this.updateActivityPagination();
    });

    this.modules$.subscribe(modules => {
      this.chartOptions.push(...modules.map(module => this.chartConfig(module.progress)));
    });
  }

  ngOnInit(): void {
    this.moduleService.index().subscribe();
  
    this.profileService.activityHistory().subscribe(activities => {
      this.allActivities = activities;
      this.totalActivityPages = Math.ceil(this.allActivities.length / this.itemsPerPage);
      this.updateActivityPagination();
      this.noActivity = this.allActivities.length === 0;
    });

    this.profileService.bookmarks().subscribe(bookmarks => {
      this.allBookmarks = bookmarks;
      this.totalBookmarkPages = Math.ceil(this.allBookmarks.length / this.itemsPerPage);
      this.updateBookmarkPagination();
    });
  }

  // 🔄 Pagination Functions for Activity History
  changeActivityPage(page: number) {
    if (page >= 1 && page <= this.totalActivityPages) {
      this.currentActivityPage = page;
      this.updateActivityPagination();
    }
  }

  updateActivityPagination() {
    const start = (this.currentActivityPage - 1) * this.itemsPerPage;
    this.pagedActivities = this.allActivities.slice(start, start + this.itemsPerPage);
  
    // ✅ If the last item on a page is deleted, move to the previous page
    if (this.pagedActivities.length === 0 && this.currentActivityPage > 1) {
      this.changeActivityPage(this.currentActivityPage - 1);
    }
  }

  // 🔥 Delete activity using HttpClient
  deleteActivity(activity: ActivityHistory) {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${activity.activity.title}"?`);

    if (confirmDelete) {
      this.http.delete(`${this.apiUrl}/activity-history/${activity.id}`).subscribe({
        next: () => {
          console.log('Deleted activity:', activity.id);
          this.allActivities = this.allActivities.filter(a => a.id !== activity.id);
          this.updateActivityPagination();
        },
        error: (err) => {
          console.error('Failed to delete activity:', err);
          alert('Failed to delete activity. Please try again.');
        }
      });
    }
  }

  // 📌 Retake a quiz by navigating to the quiz page
  retakeQuiz(quizId: number) {
    this.router.navigate([`/quiz/${quizId}`]);
  }

  // 🔄 Pagination Functions for Bookmarks
  changeBookmarkPage(page: number) {
    if (page >= 1 && page <= this.totalBookmarkPages) {
      this.currentBookmarkPage = page;
      this.updateBookmarkPagination();
    }
  }

  updateBookmarkPagination() {
    const start = (this.currentBookmarkPage - 1) * this.itemsPerPage;
    this.pagedBookmarks = this.allBookmarks.slice(start, start + this.itemsPerPage);

    if (this.pagedBookmarks.length === 0 && this.currentBookmarkPage > 1) {
      this.changeBookmarkPage(this.currentBookmarkPage - 1);
    }
  }

  // 📌 View bookmarked module by navigating to the module page
  viewModule(moduleId: number) {
    this.router.navigate([`/module/${moduleId}`]);
  }

  // 🔥 Delete bookmark using HttpClient
  deleteBookmark(bookmark: BookmarkHistory) {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${bookmark.module.title}" from bookmarks?`);

    if (confirmDelete) {
        this.http.delete(`${this.apiUrl}/bookmarks/${bookmark.id}`).subscribe(() => {
            console.log('Deleted bookmark:', bookmark.id);
            this.allBookmarks = this.allBookmarks.filter(b => b.id !== bookmark.id);
            this.updateBookmarkPagination();
        });
    }
  }

  chartConfig(progress: Progress): ChartOptions {
    return {
      series: [progress.total_lessons - progress.completed_lessons, progress.completed_lessons],
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
      dataLabels: {
        enabled: true
      }
    };
  }

  bookmarkAction(id: number) {
    this.moduleService.bookmark(id).subscribe(() => 
      this.profileService.bookmarks().subscribe(bookmarks => {
        this.allBookmarks = bookmarks;
        this.totalBookmarkPages = Math.ceil(this.allBookmarks.length / this.itemsPerPage);
        this.updateBookmarkPagination();
        this.noActivity = bookmarks.length === 0;
      })
    );
  }
}
