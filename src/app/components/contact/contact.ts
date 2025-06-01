import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async onSubmit() {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitMessage = '';

      try {
        const formData = this.contactForm.value;

        const response = await this.http.post<any>(
          'https://5c351f29-langkeyo-contact-api.shizhuolin91.workers.dev/', // 你的实际Worker URL
          formData
        ).toPromise();

        if (response.success) {
          this.submitSuccess = true;
          this.submitMessage = response.message;
          this.contactForm.reset();
        } else {
          this.submitSuccess = false;
          this.submitMessage = response.error || '发送失败，请重试';
        }
      } catch (error) {
        this.submitSuccess = false;
        this.submitMessage = '网络错误，请检查连接后重试';
        console.error('Form submission error:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName === 'name' ? '姓名' : fieldName === 'email' ? '邮箱' : '留言'}为必填项`;
      if (field.errors['email']) return '请输入有效的邮箱地址';
      if (field.errors['minlength']) return `${fieldName === 'name' ? '姓名至少2个字符' : '留言至少10个字符'}`;
    }
    return '';
  }
}
