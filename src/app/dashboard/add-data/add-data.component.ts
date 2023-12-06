import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BackendService } from 'src/app/shared/backend.service';
import { StoreService } from 'src/app/shared/store.service';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
})
export class AddDataComponent implements OnInit {
  errorMessages: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    public storeService: StoreService,
    public backendService: BackendService,
  ) {}

  public addChildForm: any;
  @Input() currentPage!: number;

  ngOnInit(): void {
    this.addChildForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      kindergardenId: ['', Validators.required],
      birthDate: [null, [Validators.required, this.validateAge()]],
    });
  }

  get name() {
    return this.addChildForm.get('name');
  }

  get kindergardenId() {
    return this.addChildForm.get('kindergardenId');
  }

  get birthDate() {
    return this.addChildForm.get('birthDate');
  }

  onSubmit() {
    if (this.addChildForm.valid) {
      this.backendService.addChildData(
        this.addChildForm.value,
        this.currentPage,
      );
    }
  }

  validateAge(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const fitsInAgeGroup = age >= 3 && age <= 6;
      return !fitsInAgeGroup ? { birthDate: true } : null;
    };
  }

  getErrorMessage(controlName: string) {
    const control = this.addChildForm.get(controlName);

    if (!control) {
      return '';
    }

    const errorCheck = (type: string, message: string) =>
      control.hasError(type) ? message : '';

    this.errorMessages[controlName] =
      errorCheck('required', 'You must enter a value') ||
      errorCheck('minlength', 'Name must be at least 3 characters long') ||
      errorCheck('maxlength', 'Name must be at most 20 characters long') ||
      errorCheck('birthDate', 'Child must be between 3 and 6 years old');

    return this.errorMessages[controlName];
  }
}
