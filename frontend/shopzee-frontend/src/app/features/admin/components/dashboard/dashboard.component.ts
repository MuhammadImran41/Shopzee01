import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SvgIconsComponent } from '../../../../shared/components/svg-icons/svg-icons.component';
import { AdminApiService } from '../../../../core/services/api/admin-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SvgIconsComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
        <span class="dashboard-date">{{ today }}</span>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card">
            <div class="kpi-icon" [class]="'kpi-icon--' + kpi.color">
              <app-icon [name]="kpi.icon" [size]="24"/>
            </div>
            <div class="kpi-data">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="kpi-label">{{ kpi.label }}</span>
              <span class="kpi-change" [class.positive]="kpi.positive">
                <app-icon [name]="kpi.positive ? 'chevron-up' : 'chevron-down'" [size]="12"/>
                {{ kpi.change }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Sales Chart -->
        <div class="chart-card chart-card--wide">
          <div class="chart-header">
            <h2 class="chart-title">Revenue Overview</h2>
            <div class="chart-period">
              @for (p of ['7D','1M','3M','1Y']; track p) {
                <button class="period-btn" [class.active]="period === p" (click)="period = p">{{ p }}</button>
              }
            </div>
          </div>
          <div class="bar-chart" aria-label="Revenue bar chart">
            @for (bar of chartData; track bar.label) {
              <div class="bar-wrap">
                <div class="bar" [style.height.%]="bar.pct">
                  <span class="bar-val">{{ bar.val }}k</span>
                </div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Category Pie -->
        <div class="chart-card">
          <h2 class="chart-title">Sales by Category</h2>
          <div class="donut-chart">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#EDE6D6" stroke-width="20"/>
              <circle cx="60" cy="60" r="40" fill="none" stroke="#C9A84C" stroke-width="20"
                stroke-dasharray="163 88" stroke-dashoffset="-7" stroke-linecap="butt"/>
              <circle cx="60" cy="60" r="40" fill="none" stroke="#1A1A1A" stroke-width="20"
                stroke-dasharray="88 163" stroke-dashoffset="-170" stroke-linecap="butt"/>
            </svg>
            <div class="donut-center">
              <span class="donut-total">251</span>
              <span class="donut-sub">Orders</span>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item"><span class="legend-dot" style="background:var(--gold)"></span>Women (65%)</div>
            <div class="legend-item"><span class="legend-dot" style="background:var(--black)"></span>Men (35%)</div>
          </div>
        </div>
      </div>

      <!-- Recent Orders & Top Products -->
      <div class="bottom-row">
        <!-- Recent Orders -->
        <div class="data-card data-card--wide">
          <div class="data-card-header">
            <h2 class="chart-title">Recent Orders</h2>
            <a routerLink="/admin/orders" class="view-all">View All</a>
          </div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                @for (order of recentOrders; track order.id) {
                  <tr>
                    <td class="order-id-cell">#{{ order.orderNumber }}</td>
                    <td>{{ order.customerName }}</td>
                    <td>PKR {{ order.total | number }}</td>
                    <td><span class="status-badge status-{{order.status}}">{{ order.status | titlecase }}</span></td>
                    <td class="date-cell">{{ order.createdAt | date:'MMM d, y' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Products -->
        <div class="data-card">
          <div class="data-card-header">
            <h2 class="chart-title">Top Products</h2>
            <a routerLink="/admin/products" class="view-all">View All</a>
          </div>
          @for (p of topProducts; track p.productId) {
            <div class="top-product">
              <img [src]="p.productImage" [alt]="p.productName" class="tp-img" loading="lazy"/>
              <div class="tp-info">
                <span class="tp-name">{{ p.productName }}</span>
                <div class="tp-bar-wrap">
                  <div class="tp-bar" [style.width.%]="topProducts.length ? (p.totalSold / topProducts[0].totalSold * 100) : 0"></div>
                </div>
                <span class="tp-sales">{{ p.totalSold }} sold</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {}
    .dashboard-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.5rem; }
    .dashboard-title { font-family:var(--font-heading); font-size:clamp(1.5rem, 4vw, var(--text-4xl)); font-weight:400; }
    .dashboard-date { font-size:var(--text-sm); color:var(--gray-400); }
    .kpi-grid {
      display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem;
      @media(max-width:1100px){ grid-template-columns:repeat(2,1fr); }
      @media(max-width:480px) { grid-template-columns:repeat(2,1fr); gap:0.75rem; }
      @media(max-width:360px) { grid-template-columns:1fr; }
    }
    .kpi-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; display:flex; gap:0.875rem; align-items:flex-start; transition:box-shadow 0.3s; min-width:0; &:hover{box-shadow:var(--shadow-gold);}
      @media(max-width:480px){ padding:1rem 0.875rem; gap:0.625rem; }
    }
    .kpi-icon { width:44px; height:44px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; flex-shrink:0; &--gold{background:rgba(201,168,76,0.12);app-icon{color:var(--gold);}} &--black{background:rgba(26,26,26,0.08);app-icon{color:var(--black);}} &--green{background:rgba(76,175,80,0.12);app-icon{color:#388E3C;}} &--blue{background:rgba(33,150,243,0.12);app-icon{color:#1565C0;}} }
    .kpi-data { display:flex; flex-direction:column; gap:2px; min-width:0; }
    .kpi-value { font-family:var(--font-heading); font-size:clamp(1.1rem,2.5vw,1.625rem); font-weight:500; color:var(--black); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .kpi-label { font-size:0.7rem; color:var(--gray-400); letter-spacing:0.06em; text-transform:uppercase; }
    .kpi-change { font-size:0.7rem; display:flex; align-items:center; gap:2px; color:var(--gray-400); &.positive{color:#388E3C;} }
    .charts-row {
      display:grid; grid-template-columns:1fr 280px; gap:1rem; margin-bottom:1.5rem;
      @media(max-width:1100px){ grid-template-columns:1fr; }
    }
    .chart-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; min-width:0;
      @media(max-width:480px){ padding:1rem; }
    }
    .chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; }
    .chart-title { font-family:var(--font-heading); font-size:1.1rem; font-weight:500; }
    .chart-period { display:flex; gap:0.25rem; flex-wrap:wrap; }
    .period-btn { padding:0.25rem 0.5rem; font-size:0.7rem; background:none; border:1px solid var(--gray-200); cursor:pointer; transition:all 0.2s; &.active{background:var(--gold);border-color:var(--gold);color:var(--black);font-weight:600;} &:hover:not(.active){border-color:var(--gold);} }
    .bar-chart { display:flex; align-items:flex-end; gap:0.375rem; height:140px; padding-top:1.5rem;
      @media(max-width:480px){ height:110px; gap:0.25rem; }
    }
    .bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:0.25rem; height:100%; }
    .bar { width:100%; background:linear-gradient(to top,var(--gold-dark),var(--gold-light)); position:relative; display:flex; align-items:flex-start; justify-content:center; min-height:8px; transition:height 0.5s ease; }
    .bar-val { font-size:0.6rem; color:var(--gold-dark); font-weight:600; white-space:nowrap; margin-top:-1.1rem; }
    .bar-label { font-size:0.6rem; color:var(--gray-400); }
    .donut-chart { position:relative; width:130px; height:130px; margin:0.75rem auto; }
    .donut-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .donut-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .donut-total { font-family:var(--font-heading); font-size:1.5rem; font-weight:500; }
    .donut-sub { font-size:0.65rem; color:var(--gray-400); letter-spacing:0.1em; }
    .legend { display:flex; flex-direction:column; gap:0.5rem; margin-top:0.75rem; }
    .legend-item { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:var(--gray-500); }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .bottom-row {
      display:grid; grid-template-columns:1fr 300px; gap:1rem;
      @media(max-width:1100px){ grid-template-columns:1fr; }
    }
    .data-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.25rem; overflow:hidden; min-width:0;
      @media(max-width:480px){ padding:1rem; }
    }
    .data-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem; }
    .view-all { font-size:0.75rem; color:var(--gold); text-decoration:none; &:hover{text-decoration:underline;} }
    .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
    .admin-table { width:100%; border-collapse:collapse; font-size:0.8125rem; min-width:500px;
      th{font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gray-400);padding:0.5rem 0.75rem;border-bottom:1px solid var(--gray-200);text-align:left;white-space:nowrap;}
      td{padding:0.625rem 0.75rem;border-bottom:1px solid var(--gray-200);color:var(--black);vertical-align:middle;}
      tr:last-child td{border-bottom:none;} tr:hover td{background:rgba(201,168,76,0.04);}
    }
    .order-id-cell { color:var(--gold-dark); font-weight:600; white-space:nowrap; }
    .date-cell { color:var(--gray-400); white-space:nowrap; }
    .status-badge { padding:0.2rem 0.5rem; font-size:0.65rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; }
    .status-delivered{background:rgba(76,175,80,0.12);color:#388E3C;}
    .status-processing{background:rgba(201,168,76,0.15);color:var(--gold-dark);}
    .status-shipped{background:rgba(33,150,243,0.12);color:#1565C0;}
    .status-pending{background:rgba(158,158,158,0.15);color:var(--gray-500);}
    .top-product { display:flex; gap:0.75rem; align-items:center; padding:0.75rem 0; border-bottom:1px solid var(--gray-200); &:last-child{border-bottom:none;} }
    .tp-img { width:46px; height:60px; object-fit:cover; object-position:top center; flex-shrink:0; }
    .tp-info { flex:1; min-width:0; }
    .tp-name { font-size:0.8rem; font-weight:500; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.375rem; }
    .tp-bar-wrap { height:4px; background:var(--gray-200); border-radius:2px; overflow:hidden; margin-bottom:0.25rem; }
    .tp-bar { height:100%; background:var(--gold); border-radius:2px; transition:width 0.8s ease; }
    .tp-sales { font-size:0.7rem; color:var(--gray-400); }
  `]
})
export class DashboardComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  today = new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  period = '1M';

  kpis: any[] = [];
  chartData: any[] = [];
  recentOrders: any[] = [];
  topProducts: any[] = [];

  // Default fallback values
  totalRevenue  = 0;
  totalOrders   = 0;
  totalCustomers= 0;
  totalProducts = 0;

  ngOnInit() {
    this.adminApi.getDashboard().subscribe({
      next: data => {
        this.totalRevenue   = data.totalRevenue;
        this.totalOrders    = data.totalOrders;
        this.totalCustomers = data.totalCustomers;
        this.totalProducts  = data.totalProducts;
        this.recentOrders   = data.recentOrders || [];
        this.topProducts    = data.topProducts  || [];
        this.chartData      = (data.revenueChart || []).map((c: any) => ({
          label: c.label,
          val:   Math.round(c.value / 1000),
          pct:   data.revenueChart.length
                   ? Math.round((c.value / Math.max(...data.revenueChart.map((x: any) => x.value), 1)) * 100)
                   : 0
        }));

        this.kpis = [
          { label:'Total Revenue',  value:`PKR ${(this.totalRevenue/1000).toFixed(1)}K`, change:'+18% this month', positive:true,  icon:'chart',   color:'gold' },
          { label:'Total Orders',   value:String(this.totalOrders),                       change:'+12% this month', positive:true,  icon:'bag',     color:'black' },
          { label:'Customers',      value:String(this.totalCustomers),                    change:'+8% this month',  positive:true,  icon:'users',   color:'green' },
          { label:'Products',       value:String(this.totalProducts),                     change:'Active products', positive:true,  icon:'package', color:'blue' }
        ];
      },
      error: () => {
        // Fallback mock data
        this.kpis = [
          { label:'Total Revenue',  value:'PKR 4.2M', change:'+18% this month', positive:true,  icon:'chart',   color:'gold' },
          { label:'Total Orders',   value:'251',       change:'+12% this month', positive:true,  icon:'bag',     color:'black' },
          { label:'Customers',      value:'1,840',     change:'+8% this month',  positive:true,  icon:'users',   color:'green' },
          { label:'Avg Order Value',value:'PKR 16.7k', change:'-2% this month', positive:false, icon:'package', color:'blue' }
        ];
        this.chartData = [
          { label:'Jan',val:28,pct:40 },{ label:'Feb',val:35,pct:50 },{ label:'Mar',val:42,pct:60 },
          { label:'Apr',val:38,pct:54 },{ label:'May',val:55,pct:78 },{ label:'Jun',val:62,pct:88 },
          { label:'Jul',val:48,pct:68 },{ label:'Aug',val:70,pct:100 }
        ];
        this.recentOrders = [
          { id:1, orderNumber:'SZ45930', customerName:'Fatima Khan',   customerEmail:'fatima@email.com', total:22500, status:'processing', createdAt:new Date() },
          { id:2, orderNumber:'SZ45929', customerName:'Sara Malik',    customerEmail:'sara@email.com',   total:8500,  status:'shipped',    createdAt:new Date() },
          { id:3, orderNumber:'SZ45928', customerName:'Ayesha Rehman', customerEmail:'ayesha@email.com', total:28000, status:'delivered',  createdAt:new Date() }
        ];
        this.topProducts = [
          { productId:3, productName:'Ivory Gold Bridal Luxury',    productImage:'assets/images/women/women-3.png', totalSold:56,  totalRevenue:1568000 },
          { productId:1, productName:'Sage Embroidered Net Suit',   productImage:'assets/images/women/women-1.png', totalSold:124, totalRevenue:1550000 },
          { productId:9, productName:'Midnight Black Kurta Set',    productImage:'assets/images/men/men-2.png',     totalSold:87,  totalRevenue:679000  },
          { productId:5, productName:'Cream Pearl Embroidered Suit',productImage:'assets/images/women/women-5.png', totalSold:142, totalRevenue:2130000 }
        ];
      }
    });
  }
}
