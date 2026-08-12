import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { AdminApiService } from '../../../../core/services/api/admin-api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconsComponent],
  template: `
    <div class="admin-section">
      <div class="section-top">
        <h1 class="admin-page-title">Analytics</h1>
        <div class="section-actions">
          <select
            class="admin-select"
            [(ngModel)]="range"
            (ngModelChange)="load()"
            aria-label="Date range"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button class="btn btn-outline" (click)="exportCsv()">
            <app-icon name="download" [size]="16"/> Export
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-row">
          <div class="spinner"></div><span>Loading analytics...</span>
        </div>
      }

      @if (!loading()) {
        <!-- KPI Cards -->
        <div class="kpi-row">
          <div class="kpi-card">
            <span class="kpi-label">Revenue</span>
            <span class="kpi-val" style="color:var(--gold-dark)">PKR {{ data().revenue | number }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Orders</span>
            <span class="kpi-val">{{ data().orderCount }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg Order</span>
            <span class="kpi-val">PKR {{ data().avgOrder | number:'1.0-0' }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">New Customers</span>
            <span class="kpi-val" style="color:#388E3C">{{ data().newCustomers }}</span>
          </div>
        </div>

        <!-- Revenue Chart (SVG line) -->
        <div class="chart-card">
          <div class="chart-header">
            <h2 class="chart-title">Revenue Trend</h2>
            <span class="chart-total">PKR {{ data().revenue | number }}</span>
          </div>
          <div class="line-chart">
            <svg viewBox="0 0 600 180" class="line-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="#C9A84C" stop-opacity="0.22"/>
                  <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
                </linearGradient>
              </defs>
              @if (chartPath()) {
                <path [attr.d]="chartAreaPath()" fill="url(#ag)"/>
                <path [attr.d]="chartPath()" fill="none" stroke="#C9A84C" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
                @for (pt of chartPoints(); track pt.x) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4"
                    fill="#C9A84C" stroke="#F5F0E8" stroke-width="2"/>
                }
              }
            </svg>
            <div class="chart-labels">
              @for (l of chartLabels(); track l) { <span>{{ l }}</span> }
            </div>
          </div>
        </div>

        <!-- Category breakdown + metrics row -->
        <div class="analytics-row">
          <!-- Category breakdown from API -->
          <div class="analytics-card">
            <h2 class="chart-title">Sales by Category</h2>
            @if (data().categoryBreakdown?.length) {
              @for (cat of data().categoryBreakdown; track cat.category) {
                <div class="cat-row">
                  <span class="cat-name">{{ cat.category }}</span>
                  <div class="cat-bar-wrap">
                    <div
                      class="cat-bar"
                      [style.width.%]="maxCatRevenue() ? (cat.revenue / maxCatRevenue() * 100) : 0"
                      style="background:var(--gold)"
                    ></div>
                  </div>
                  <span class="cat-val">{{ cat.units }} units</span>
                </div>
              }
            } @else {
              <p class="no-data">No category data yet.</p>
            }
          </div>

          <!-- Key metrics -->
          <div class="analytics-card">
            <h2 class="chart-title">Key Metrics</h2>
            @for (m of metrics(); track m.label) {
              <div class="metric-row">
                <div class="metric-icon">
                  <app-icon [name]="m.icon" [size]="18"/>
                </div>
                <div class="metric-info">
                  <span class="metric-value">{{ m.value }}</span>
                  <span class="metric-label">{{ m.label }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-section {}
    .section-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
    .admin-page-title { font-family:var(--font-heading); font-size:var(--text-4xl); font-weight:400; }
    .section-actions { display:flex; gap:0.75rem; }
    .admin-select { padding:0.5rem 0.875rem; border:1px solid var(--gray-200); background:var(--cream-light); font-size:0.875rem; outline:none; }
    .loading-row { display:flex; align-items:center; gap:1rem; padding:2rem; color:var(--gray-400); }
    .spinner { width:24px; height:24px; border:2px solid var(--gray-200); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; @media(max-width:900px){grid-template-columns:repeat(2,1fr);} }
    .kpi-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; }
    .kpi-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold-dark); margin-bottom:0.5rem; }
    .kpi-val { display:block; font-family:var(--font-heading); font-size:1.75rem; font-weight:500; }
    .chart-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; margin-bottom:1.5rem; }
    .chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
    .chart-title { font-family:var(--font-heading); font-size:1.125rem; font-weight:500; }
    .chart-total { font-size:0.875rem; font-weight:600; color:var(--gold-dark); }
    .line-svg { width:100%; height:180px; }
    .chart-labels { display:flex; justify-content:space-between; padding-top:0.5rem; span{font-size:0.7rem;color:var(--gray-400);} }
    .analytics-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; @media(max-width:768px){grid-template-columns:1fr;} }
    .analytics-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; }
    .cat-row { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.875rem; }
    .cat-name { font-size:0.8125rem; width:120px; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cat-bar-wrap { flex:1; height:8px; background:var(--gray-200); border-radius:4px; overflow:hidden; }
    .cat-bar { height:100%; border-radius:4px; transition:width 0.8s ease; }
    .cat-val { font-size:0.8125rem; font-weight:600; color:var(--gold-dark); width:64px; text-align:right; white-space:nowrap; }
    .no-data { font-size:0.875rem; color:var(--gray-400); padding:1rem 0; text-align:center; }
    .metric-row { display:flex; align-items:center; gap:0.875rem; padding:0.75rem 0; border-bottom:1px solid var(--gray-200); &:last-child{border-bottom:none;} }
    .metric-icon { width:36px; height:36px; border-radius:50%; background:rgba(201,168,76,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; app-icon{color:var(--gold);} }
    .metric-info { flex:1; }
    .metric-value { display:block; font-size:0.9375rem; font-weight:600; }
    .metric-label { font-size:0.75rem; color:var(--gray-400); }
  `]
})
export class AnalyticsComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  loading = signal(false);
  range   = '30d';

  data = signal<any>({
    revenue: 0, orderCount: 0, avgOrder: 0, newCustomers: 0,
    categoryBreakdown: []
  });

  chartPoints  = signal<{x:number,y:number}[]>([]);
  chartLabels  = signal<string[]>([]);
  metrics      = signal<any[]>([]);

  maxCatRevenue = () => {
    const cats = this.data().categoryBreakdown || [];
    return cats.length ? Math.max(...cats.map((c: any) => c.revenue)) : 1;
  };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminApi.getAnalytics(this.range).subscribe({
      next: d => {
        this.data.set(d);

        // Build chart from category breakdown as bar data
        const cats = d.categoryBreakdown || [];
        const maxRev = cats.length ? Math.max(...cats.map((c: any) => c.revenue)) : 1;
        const pts: {x:number,y:number}[] = cats.map((c: any, i: number) => ({
          x: Math.round((i / Math.max(cats.length - 1, 1)) * 600),
          y: Math.round(170 - (c.revenue / maxRev) * 150)
        }));
        this.chartPoints.set(pts);
        this.chartLabels.set(cats.map((c: any) => c.category));

        this.metrics.set([
          { icon:'chart', label:'Total Revenue',  value:`PKR ${(d.revenue/1000).toFixed(1)}K` },
          { icon:'bag',   label:'Total Orders',   value:String(d.orderCount) },
          { icon:'users', label:'New Customers',  value:String(d.newCustomers) },
          { icon:'package',label:'Avg Order Value',value:`PKR ${Math.round(d.avgOrder).toLocaleString()}` }
        ]);

        this.loading.set(false);
      },
      error: () => {
        // Fallback static data
        this.chartPoints.set([
          {x:0,y:140},{x:75,y:110},{x:150,y:120},{x:225,y:90},
          {x:300,y:80},{x:375,y:60},{x:450,y:40},{x:525,y:25},{x:600,y:10}
        ]);
        this.chartLabels.set(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug']);
        this.metrics.set([
          { icon:'chart',      label:'Total Revenue',   value:'PKR 4.2M' },
          { icon:'bag',        label:'Total Orders',    value:'251'      },
          { icon:'users',      label:'New Customers',   value:'184'      },
          { icon:'package',    label:'Avg Order Value', value:'PKR 16.7K'}
        ]);
        this.loading.set(false);
      }
    });
  }

  // Build SVG path from chart points
  chartPath(): string {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  }

  chartAreaPath(): string {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ')
      + ` L${pts[pts.length-1].x},180 L0,180 Z`;
  }

  exportCsv() {
    const cats = this.data().categoryBreakdown || [];
    const rows = [
      ['Category','Revenue','Units'],
      ...cats.map((c: any) => [c.category, c.revenue, c.units])
    ];
    const csv  = rows.map((r: any[]) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
