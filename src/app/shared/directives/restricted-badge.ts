import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRestrictedIndicator]',
  standalone: true
})
export class RestrictedIndicatorDirective implements OnInit {
  @Input('appRestrictedIndicator') isRestricted = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.isRestricted) {
      this.renderer.addClass(this.el.nativeElement, 'medicine-restricted');
      this.renderer.setAttribute(
        this.el.nativeElement,
        'title',
        'Rx - Doctor\'s prescription required to order.'
      );
      
      
      const marker = this.renderer.createElement('span');
      this.renderer.addClass(marker, 'rx-lock-indicator');
      const text = this.renderer.createText('Rx Required');
      this.renderer.appendChild(marker, text);
      
      const host = this.el.nativeElement;
      if (host.firstChild) {
        this.renderer.insertBefore(host, marker, host.firstChild);
      } else {
        this.renderer.appendChild(host, marker);
      }
    }
  }
}