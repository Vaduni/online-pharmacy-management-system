import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../core/order.service';
import { AuthService } from '../../../core/auth.service';
import { NotificationService } from '../../../core/notification.service';
import { DynamicFormComponent, FormFieldConfig }
from '../../../shared/components/dynamic-form/dynamic-form.component';
import { ageEligibilityValidator, deliverySlotValidator, prescriptionFileRequired } from '../../../shared/validators';

@Component({
  selector: 'app-customer-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CustomerCheckoutComponent implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notif = inject(NotificationService);

  readonly step = signal<number>(1);
  readonly cart = this.orderService.cart;
  readonly cartTotal = this.orderService.cartTotal;
  readonly requiresRx = this.orderService.cartRequiresPrescription;

  readonly rxItems = computed(() => 
    this.cart().filter(item => item.medicine.isPrescriptionRequired)
  );

  readonly rxFileInfo = signal<{ name: string; size: number; base64?: string } | null>(null);
  readonly shippingDetails = signal<any | null>(null);

  rxForm!: FormGroup;

  readonly formConfig = computed<FormFieldConfig[]>(() => {
    const user = this.auth.currentUser();
    const config: FormFieldConfig[] = [
      {
        name: 'fullName',
        label: 'Recipient Full Name',
        type: 'text',
        placeholder: 'e.g. Jane Doe',
        defaultValue: user?.profile?.name || '',
        validations: [{ type: 'required', message: 'Recipient name is required.' }]
      },
      {
        name: 'street',
        label: 'Street Address',
        type: 'text',
        placeholder: 'e.g. 123 Healthway Blvd',
        defaultValue: user?.profile?.street || '',
        validations: [{ type: 'required', message: 'Street address is required.' }]
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'e.g. Metro City',
        defaultValue: user?.profile?.city || '',
        validations: [{ type: 'required', message: 'City is required.' }]
      },
      {
        name: 'state',
        label: 'State',
        type: 'text',
        placeholder: 'e.g. NY',
        defaultValue: user?.profile?.state || '',
        validations: [{ type: 'required', message: 'State is required.' }]
      },
      {
        name: 'zipCode',
        label: 'Zip Code',
        type: 'text',
        placeholder: 'e.g. 10001',
        defaultValue: user?.profile?.zipCode || '',
        validations: [{ type: 'required', message: 'Zip Code is required.' }]
      },
      {
        name: 'deliverySlot',
        label: 'Schedule Delivery Slot Time',
        type: 'datetime-local',
        validations: [
          { type: 'required', message: 'Delivery slot schedule time is required.' },
          { type: 'custom', customValidator: deliverySlotValidator(), message: 'Slot must be at least 4 hours in the future.' }
        ]
      }
    ];

    if (this.requiresRx()) {
      config.unshift({
        name: 'dateOfBirth',
        label: 'Patient Date of Birth (Age restriction verification)',
        type: 'date',
        validations: [
          { type: 'required', message: 'Birth date is required for verification.' },
          { type: 'custom', customValidator: ageEligibilityValidator(18), message: 'Patient must be 18+ to order Rx drugs.' }
        ]
      });
    }

    return config;
  });

  ngOnInit() {
    if (this.cart().length === 0) {
      this.notif.addNotification('Checkout Blocked', 'Your shopping cart is empty.', 'warning');
      this.router.navigate(['/customer/cart']);
      return;
    }

    this.rxForm = this.fb.group({
      prescriptionFile: ['', this.requiresRx() ? [prescriptionFileRequired(true)] : []]
    });
  }

  onFormCreated(form: FormGroup) {
  }

  onAddressSubmit(formValue: any) {
    this.shippingDetails.set(formValue);
    if (this.requiresRx()) {
      this.step.set(2);
    } else {
      this.step.set(3);
    }
  }

  onRxFileSelected(event: any) {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileObj = {
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string
        };
        this.rxFileInfo.set(fileObj);
        this.rxForm.patchValue({ prescriptionFile: fileObj });
        this.rxForm.get('prescriptionFile')?.markAsTouched();
      };
      reader.readAsDataURL(file);
    }
  }

  clearRxFile() {
    this.rxFileInfo.set(null);
    this.rxForm.patchValue({ prescriptionFile: '' });
    const fileInput = document.getElementById('rx-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onRxSubmit() {
    if (this.rxForm.valid) {
      this.step.set(3);
    } else {
      this.rxForm.get('prescriptionFile')?.markAsTouched();
    }
  }

  prevStep() {
    this.step.update(s => Math.max(1, s - 1));
  }

  formatDeliverySlot(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString() + ' @ ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  submitFinalOrder() {
    const address = this.shippingDetails();
    if (!address) return;

    const shippingAddress = {
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode
    };

    const deliverySlotFormatted = this.formatDeliverySlot(address.deliverySlot);
    const fileObj = this.rxFileInfo();

    const order = this.orderService.checkout(
      shippingAddress,
      deliverySlotFormatted,
      fileObj
    );

    if (order) {
      this.router.navigate(['/customer/orders']);
    }
  }
}