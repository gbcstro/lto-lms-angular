import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Activity } from '../../../interfaces/activity';
import { QuizService } from '../../../services/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Question } from '../../../interfaces/question';
import Swal from 'sweetalert2';
import { TimeServiceService } from '../../../services/time.service';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrl: './quizzes.component.scss'
})
export class QuizzesComponent implements OnInit, OnDestroy {
  private timerSubscription!: Subscription;
  quiz$!: Observable<Activity | null>;
  elapsedMinutes!: Observable<number>;
  remainingMinutes!: Observable<number | null>;

  selectedImage: string | null = null;
  imageModalSrc: string = '';
  imageModal: boolean = false;

  questionsForm!: FormGroup;
  questionIndex: number = 0;
  questionLength: number = 0;
  id: number = 0;
  duration: number = 0;
  quiz: Activity | null = null;
  showFeedback: boolean = false;

  constructor(
    private quizService: QuizService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private timeService: TimeServiceService,
    private router: Router
  ) {
    this.quiz$ = this.quizService.quiz$;
    this.elapsedMinutes = this.timeService.getElapsedTimeInMinutes();
    this.remainingMinutes = this.timeService.getRemainingTimeInMinutes();
    this.timeService.getElapsedTimeInMinutes().subscribe(minutes => this.duration = minutes);

    this.questionsForm = this.fb.group({});

    this.quizService.quiz$.subscribe(quiz => {
      if (quiz) {
        this.quiz = quiz;
        quiz.questions.forEach(question => this.createQuestion(question));
        this.questionLength = quiz.questions.length;
      }
    });
  }

  ngOnInit(): void {
    this.id = +this.activatedRoute.snapshot.paramMap.get('id')!;
    this.quizService.show(this.id).subscribe(() => {
      this.timerSubscription = this.timeService.startTimer(this.id === 3 ? 11 : undefined).subscribe(res => {
        if (this.id === 3) {
          this.timeService.getRemainingTimeInMinutes().subscribe(minutes => {
            if (minutes === 0) {
              this.questionsForm.disable();
              this.quizService.submit(this.id, this.questionsForm.value, this.duration).subscribe();
              Swal.fire({
                title: "Time's up! You can always try again later.",
                icon: 'warning',
                confirmButtonText: 'Try Again',
                allowEscapeKey: false,
                allowOutsideClick: false
              }).then(result => {
                if (result.isConfirmed) {
                  this.router.navigate(['/quiz']);
                  Swal.close();
                }
              });
            }
          });
        }
      });
    });
  }

  select(index: number) {
    this.questionIndex = index;
  }

  prev() {
    if (this.questionIndex > 0) {
      this.questionIndex--;
    }
  }

  next() {
    if (this.questionIndex < this.questionLength - 1) {
      this.questionIndex++;
    }
  }

  submit() {
    if (this.questionsForm.invalid) {
      Swal.fire({
        title: "Some questions are unanswered. Do you still want to submit?",
        icon: 'warning',
        confirmButtonText: 'Submit',
        showDenyButton: true,
        denyButtonText: 'No'
      }).then(result => {
        if (result.isConfirmed) {
          this.processSubmit();
        }
      });
    } else {
      this.processSubmit();
    }
  }

  private processSubmit() {
    this.quizService.submit(this.id, this.questionsForm.value, this.duration).subscribe(
      (response) => {
        Swal.fire({
          title: "Quiz Submitted!",
          text: "Your answers have been recorded successfully.",
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/quiz-results']); // Redirect to the results page
        });
      },
      (error) => {
        Swal.fire({
          title: "Submission Failed",
          text: "An error occurred while submitting your quiz. Please try again.",
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error("Quiz submission error:", error);
      }
    );

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private createQuestion(question: Question) {
    this.questionsForm.addControl(
      question.id.toString(), new FormControl(null, Validators.required)
    );
  }

  // Show Image Modal
  showImageModal(imageSrc: string) {
    this.imageModalSrc = imageSrc;
    this.imageModal = true;
  }

  // Close Image Modal
  closeImageModal() {
    this.imageModal = false;
    this.imageModalSrc = '';
  }

  // Check Answer and Show Feedback
  checkAnswer(selectedChoice: any, question: Question) {
    const correctChoice = question.choices.find((c: any) => c.is_correct);

    if (!correctChoice) {
      console.warn("No correct answer found for question:", question);
      return;
    }

    if (selectedChoice.id === correctChoice.id) {
      // ✅ If answer is correct, show a success message (text or image)
      if (question.type === 'image') {
        Swal.fire({
          title: "Correct!",
          html: `<p>Well done! The correct answer is:</p> 
                 <img src="${correctChoice.context}" width="150" height="150" alt="Correct Answer" class="img-fluid"/>`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: "Correct!",
          text: `Well done! The correct answer is: ${correctChoice.context}`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    } else {
      // ✅ If answer is incorrect, show the correct answer (text or image)
      if (question.type === 'image') {
        Swal.fire({
          title: "Incorrect!",
          html: `<p>The correct answer is:</p> 
                 <img src="${correctChoice.context}" width="150" height="150" alt="Correct Answer" class="img-fluid"/>`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: "Incorrect!",
          text: `The correct answer is: ${correctChoice.context}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
}
}