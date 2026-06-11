import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'datetime-local' | 'textarea' | 'number' | 'file';
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validations?: {
    type: 'required' | 'min' | 'max' | 'custom';
    value?: any;
    customValidator?: any;
    message: string;
  }[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styles: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() config: FormFieldConfig[] = [];
  @Input() showSubmitButton = true;
  @Input() submitButtonText = 'Submit';
  
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCreated = new EventEmitter<FormGroup>();

  form!: FormGroup;
  submitted = false;
  fileNames: Record<string, string> = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] && !changes['config'].firstChange) {
      this.createForm();
    }
  }

  private createForm() {
    const group: any = {};

    this.config.forEach(field => {
      const validatorsList: any[] = [];
      
      if (field.validations) {
        field.validations.forEach(val => {
          if (val.type === 'required') {
            validatorsList.push(Validators.required);
          } else if (val.type === 'min') {
            validatorsList.push(Validators.min(val.value));
          } else if (val.type === 'max') {
            validatorsList.push(Validators.max(val.value));
          } else if (val.type === 'custom' && val.customValidator) {
            validatorsList.push(val.customValidator);
          }
        });
      }

      group[field.name] = new FormControl(
        field.defaultValue !== undefined ? field.defaultValue : '',
        validatorsList
      );
    });

    this.form = this.fb.group(group);
    this.formCreated.emit(this.form);
  }

  isRequired(field: FormFieldConfig): boolean {
    return !!field.validations?.some(val => val.type === 'required');
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.form.get(fieldName);
    if (!control) return false;
    
    if (errorType === 'required') return control.hasError('required');
    if (errorType === 'min') return control.hasError('min');
    if (errorType === 'max') return control.hasError('max');
    if (errorType === 'custom') {
      return control.invalid && !control.hasError('required') && !control.hasError('min') && !control.hasError('max');
    }
    return false;
  }

  hasValidationMsg(field: FormFieldConfig, type: string): boolean {
    return !!field.validations?.some(val => val.type === type);
  }

  onFileChange(event: any, fieldName: string) {
    const file = event.target?.files?.[0];
    if (file) {
      this.fileNames[fieldName] = file.name;
      
      const reader = new FileReader();
      reader.onload = () => {
        const fileObj = {
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string
        };
        this.form.patchValue({ [fieldName]: fileObj });
        this.form.get(fieldName)?.markAsTouched();
      };
      reader.readAsDataURL(file);
    }
  }

  clearFile(fieldName: string) {
    delete this.fileNames[fieldName];
    this.form.patchValue({ [fieldName]: '' });
    const fileInput = document.getElementById(fieldName) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
}