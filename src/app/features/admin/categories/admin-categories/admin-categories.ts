import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategories {

  categories = signal([
    {
      id: 1,
      name: 'Pain Relief',
      description: 'Medicines for pain management'
    },
    {
      id: 2,
      name: 'Antibiotics',
      description: 'Medicines for bacterial infections'
    },
    {
      id: 3,
      name: 'Vitamins',
      description: 'Nutritional supplements'
    },
    {
      id: 4,
      name: 'Diabetes Care',
      description: 'Diabetes medications'
    }
  ]);

  deleteCategory(id: number) {
    this.categories.update(categories =>
      categories.filter(category => category.id !== id)
    );
  }
}