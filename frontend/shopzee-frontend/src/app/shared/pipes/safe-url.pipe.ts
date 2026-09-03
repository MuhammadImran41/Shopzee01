import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Bypasses Angular's security sanitization for data: URLs in [src] bindings.
 * Usage: <img [src]="imageUrl | safeUrl" />
 */
@Pipe({ name: 'safeUrl', standalone: true, pure: true })
export class SafeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string | null | undefined): SafeUrl | string {
    if (!url) return '';
    // Only bypass for data: URLs — regular http/https/assets URLs are safe as-is
    if (url.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }
    return url;
  }
}
