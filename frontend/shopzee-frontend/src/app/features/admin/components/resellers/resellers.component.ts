import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthApiService } from '../../../../core/services/api/auth-api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { API_BASE } from '../../../../core/services/api/api.config';

interface Reseller {
  id: number; userId: number; name: string; email: string; phone: string;
  businessName: string; whatsApp: string; city: string;
  paymentMethod: string; accountNumber: string; accountTitle: string;
  status: string; appliedAt: string; totalEarnings: number; totalOrders: number;
}
interface ResellerDetail {
  id: number; userId: number; name: string; email: string; phone: string;
  businessName: string; whatsApp: string; city: string; address: string; cnic: string;
  paymentMethod: string; accountTitle: string; accountNumber: string; bankName: string;
  status: string; rejectionReason: string; appliedAt: string; approvedAt: string;
  totalEarnings: number; pendingEarnings: number; withdrawnAmount: number;
  totalOrders: number; orders: ROrder[];
}
interface ROrder {
  id: number; customerName: string; customerPhone: string; customerCity: string;
  customerAddress: string; paymentMethod: string;
  subTotal: number; shippingCost: number; resellerProfit: number; totalAmount: number;
  status: string; trackingNumber: string; notes: string; createdAt: string; items: OItem[];
}
interface OItem {
  productName: string; productImage: string; basePrice: number;
  resellerPrice: number; profit: number; quantity: number;
  selectedSize: string; selectedColor: string;
}
interface Payment {
  id: number; resellerId: number; resellerName: string; amount: number;
  method: string; reference: string; status: string; note: string; paidAt: string; paidBy: string;
}
interface AOrder {
  id: number; resellerId: number; resellerName: string; resellerBiz: string;
  customerName: string; customerCity: string; customerPhone: string;
  paymentMethod: string; subTotal: number; shippingCost: number;
  resellerProfit: number; totalAmount: number; status: string;
  trackingNumber: string; notes: string; createdAt: string; itemCount: number;
}
interface Analytics {
  topResellers: LEntry[]; monthlyStats: MStat[];
  totalPayoutsPaid: number; totalProfitGenerated: number;
  totalActiveResellers: number; totalResellerOrders: number; ordersByStatus: SStat[];
}
interface LEntry { resellerId: number; name: string; businessName: string; city: string; totalOrders: number; totalEarnings: number; totalRevenue: number; }
interface MStat { month: string; orders: number; revenue: number; profit: number; newResellers: number; }
interface SStat { status: string; count: number; }
interface PPayout { id: number; name: string; businessName: string; city: string; paymentMethod: string; accountNumber: string; accountTitle: string; totalEarnings: number; withdrawnAmount: number; availableBalance: number; }
interface Stats { totalResellers: number; pendingResellers: number; approvedResellers: number; totalOrders: number; pendingOrders: number; totalRevenue: number; totalProfit: number; }
@Component({
  selector: 'app-resellers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="rs-page">
  <div class="rs-page-tabs">
    @for(t of pageTabs; track t.key) {
      <button class="rs-ptab" [class.active]="pageTab()===t.key" (click)="switchPage(t.key)">
        {{t.label}}
        @if(t.key==='resellers' && stats()?.pendingResellers) {
          <span class="rs-badge">{{stats()!.pendingResellers}}</span>
        }
      </button>
    }
  </div>

  @if(stats()) {
    <div class="rs-stats">
      <div class="rs-stat"><span class="rs-sv">{{stats()!.totalResellers}}</span><span class="rs-sl">Total Resellers</span></div>
      <div class="rs-stat rs-stat--warn"><span class="rs-sv">{{stats()!.pendingResellers}}</span><span class="rs-sl">Pending</span></div>
      <div class="rs-stat rs-stat--green"><span class="rs-sv">{{stats()!.approvedResellers}}</span><span class="rs-sl">Active</span></div>
      <div class="rs-stat"><span class="rs-sv">{{stats()!.totalOrders}}</span><span class="rs-sl">Orders</span></div>
      <div class="rs-stat rs-stat--gold"><span class="rs-sv">PKR {{stats()!.totalProfit|number:'1.0-0'}}</span><span class="rs-sl">Profit Paid</span></div>
    </div>
  }

  @if(pageTab()==='resellers') {
    <div class="rs-toolbar">
      <div class="rs-sw"><span class="rs-si">🔍</span><input class="rs-search" placeholder="Search..." [(ngModel)]="searchQ"/></div>
      <div class="rs-tabs">
        @for(t of sTabs; track t.k) {
          <button class="rs-tab" [class.active]="sTab()===t.k" (click)="sTab.set(t.k)">
            {{t.l}} @if(tabCnt(t.k)>0){<span class="rs-tbadge">{{tabCnt(t.k)}}</span>}
          </button>
        }
      </div>
      <button class="rs-outline" (click)="exportResellers()">⬇ CSV</button>
    </div>

    @if(loading()) {
      <div class="rs-loading"><div class="rs-spin"></div></div>
    } @else if(filtered().length===0) {
      <div class="rs-empty"><p>No resellers found.</p></div>
    } @else {
      <div class="rs-twrap">
        <table class="rs-tbl">
          <thead><tr><th>Reseller</th><th>Business</th><th>Contact</th><th>Payment Info</th><th>Applied</th><th>Earnings</th><th>Orders</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            @for(r of filtered(); track r.id) {
              <tr>
                <td><div class="rs-rinfo"><div class="rs-av">{{r.name[0]}}</div><div><div class="rs-rn">{{r.name}}</div><div class="rs-rs">{{r.email}}</div></div></div></td>
                <td><div class="rs-rn">{{r.businessName}}</div><div class="rs-rs">{{r.city}}</div></td>
                <td><div>{{r.phone}}</div><div class="rs-rs">📱 {{r.whatsApp}}</div></td>
                <td><span class="rs-pm">{{r.paymentMethod}}</span><div class="rs-rs">{{r.accountNumber}}</div></td>
                <td class="rs-rs">{{r.appliedAt|date:'dd MMM y'}}</td>
                <td class="rs-gold rs-fw">PKR {{r.totalEarnings|number:'1.0-0'}}</td>
                <td class="rs-fw" style="text-align:center">{{r.totalOrders}}</td>
                <td class="rs-gold rs-fw">PKR {{r.totalEarnings|number:'1.0-0'}}</td>
                <td><span class="rs-st" [class]="'rs-st--'+r.status">{{r.status}}</span></td>
                <td>
                  <div class="rs-acts">
                    <button class="rs-ab rs-ab--view" (click)="openDetail(r.id)" title="View">👁</button>
                    @if(r.status==='pending') {
                      <button class="rs-ab rs-ab--ok" (click)="approve(r.id)" [disabled]="aLoading()" title="Approve">✓</button>
                      <button class="rs-ab rs-ab--no" (click)="openReject(r.id)" [disabled]="aLoading()" title="Reject">✗</button>
                    }
                    @if(r.status==='approved') {
                      <button class="rs-ab rs-ab--pay" (click)="quickPay(r)" title="Payout">💳</button>
                      <button class="rs-ab rs-ab--warn" (click)="openReject(r.id)" title="Suspend">⛔</button>
                    }
                    @if(r.status==='rejected') {
                      <button class="rs-ab rs-ab--ok" (click)="approve(r.id)" title="Re-approve">✓</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  }

  @if(pageTab()==='orders') {
    <div class="rs-toolbar">
      <select class="rs-sel" [(ngModel)]="oStatus" (ngModelChange)="loadOrders()">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option><option value="processing">Processing</option>
        <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      @if(selOrders().length>0) {
        <span class="rs-selc">{{selOrders().length}} selected</span>
        <select class="rs-sel" [(ngModel)]="bulkAct">
          <option value="">Bulk Action</option>
          <option value="updateStatus|processing">→ Processing</option>
          <option value="updateStatus|shipped">→ Shipped</option>
          <option value="updateStatus|delivered">→ Delivered</option>
          <option value="updateStatus|cancelled">→ Cancelled</option>
          <option value="assign_tracking">Assign Tracking</option>
        </select>
        @if(bulkAct==='assign_tracking') {
          <input class="rs-inp rs-inp--sm" placeholder="Prefix e.g. TRK" [(ngModel)]="trackPfx"/>
        }
        <button class="rs-outline" (click)="doBulk()" [disabled]="!bulkAct||aLoading()">Apply</button>
      }
      <button class="rs-outline" (click)="exportOrders()">⬇ CSV</button>
    </div>
    @if(oLoading()) {
      <div class="rs-loading"><div class="rs-spin"></div></div>
    } @else {
      <div class="rs-twrap">
        <table class="rs-tbl">
          <thead><tr>
            <th><input type="checkbox" (change)="selAll($event)"/></th>
            <th>#</th><th>Reseller</th><th>Customer</th><th>Amount</th>
            <th>Profit</th><th>Payment</th><th>Status</th><th>Tracking</th><th>Date</th><th></th>
          </tr></thead>
          <tbody>
            @for(o of aOrders(); track o.id) {
              <tr [class.rs-sel-row]="isSel(o.id)">
                <td><input type="checkbox" [checked]="isSel(o.id)" (change)="togOrd(o.id,$event)"/></td>
                <td class="rs-gold rs-fw">#{{o.id}}</td>
                <td><div class="rs-rn">{{o.resellerName}}</div><div class="rs-rs">{{o.resellerBiz}}</div></td>
                <td><div class="rs-rn">{{o.customerName}}</div><div class="rs-rs">{{o.customerCity}}</div></td>
                <td class="rs-fw">PKR {{o.totalAmount|number:'1.0-0'}}</td>
                <td class="rs-green rs-fw">+{{o.resellerProfit|number:'1.0-0'}}</td>
                <td><span class="rs-pm">{{o.paymentMethod}}</span></td>
                <td>
                  <select class="rs-sel rs-sel--xs" [(ngModel)]="osMap[o.id]" (ngModelChange)="updOrd(o.id)">
                    <option value="pending">Pending</option><option value="processing">Processing</option>
                    <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td><input class="rs-inp rs-inp--xs" placeholder="Tracking" [(ngModel)]="otMap[o.id]" (blur)="saveTrk(o.id)"/></td>
                <td class="rs-rs">{{o.createdAt|date:'dd MMM'}}</td>
                <td><button class="rs-ab rs-ab--view" (click)="openDetail(o.resellerId)">👁</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="rs-pgn">
        <button class="rs-outline" (click)="loadOrders(oPage-1)" [disabled]="oPage<=1">← Prev</button>
        <span class="rs-pgi">Page {{oPage}} · {{oTotal}} orders</span>
        <button class="rs-outline" (click)="loadOrders(oPage+1)" [disabled]="aOrders().length<oPgSz">Next →</button>
      </div>
    }
  }

  @if(pageTab()==='payments') {
    <div class="rs-toolbar">
      <h2 class="rs-sh">Payment History</h2>
      <button class="rs-outline" (click)="exportPayments()">⬇ CSV</button>
    </div>
    @if(pPays().length>0) {
      <div class="rs-pbanner">
        <div><span class="rs-pt">💰 {{pPays().length}} resellers awaiting payment</span><span class="rs-ps">Total due: PKR {{pPayTotal()|number:'1.0-0'}}</span></div>
        <button class="rs-outline" (click)="pExp.set(!pExp())">{{pExp()?'Hide':'View Pending'}}</button>
      </div>
    }
    @if(pExp()) {
      <div class="rs-plist">
        @for(p of pPays(); track p.id) {
          <div class="rs-prow">
            <div class="rs-pinfo"><div class="rs-rn">{{p.name}}</div><div class="rs-rs">{{p.businessName}} · {{p.city}}</div><div class="rs-rs">{{p.paymentMethod|uppercase}} · {{p.accountNumber}}</div></div>
            <div style="text-align:right"><div class="rs-gold rs-fw">PKR {{p.availableBalance|number:'1.0-0'}}</div><div class="rs-rs">Available</div></div>
            <button class="rs-outline" (click)="openDetail(p.id);pExp.set(false)">Pay Now</button>
          </div>
        }
      </div>
    }
    @if(pLoad()) {
      <div class="rs-loading"><div class="rs-spin"></div></div>
    } @else if(aPays().length===0) {
      <div class="rs-empty"><p>No payments recorded yet.</p></div>
    } @else {
      <div class="rs-twrap">
        <table class="rs-tbl">
          <thead><tr><th>#</th><th>Reseller</th><th>Amount</th><th>Method</th><th>Reference</th><th>Note</th><th>Paid By</th><th>Date</th></tr></thead>
          <tbody>
            @for(p of aPays(); track p.id) {
              <tr>
                <td class="rs-gold rs-fw">#{{p.id}}</td>
                <td class="rs-rn">{{p.resellerName}}</td>
                <td class="rs-green rs-fw">PKR {{p.amount|number:'1.0-0'}}</td>
                <td><span class="rs-pm">{{p.method}}</span></td>
                <td class="rs-rs">{{p.reference||'—'}}</td>
                <td class="rs-rs">{{p.note||'—'}}</td>
                <td class="rs-rs">{{p.paidBy}}</td>
                <td class="rs-rs">{{p.paidAt|date:'dd MMM y'}}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="rs-pgn">
        <button class="rs-outline" (click)="loadPays(pPage-1)" [disabled]="pPage<=1">← Prev</button>
        <span class="rs-pgi">Page {{pPage}} · {{pTotal}} payments</span>
        <button class="rs-outline" (click)="loadPays(pPage+1)" [disabled]="aPays().length<pPgSz">Next →</button>
      </div>
    }
  }

  @if(pageTab()==='analytics') {
    @if(anLoad()) {
      <div class="rs-loading"><div class="rs-spin"></div><span>Loading analytics...</span></div>
    } @else if(an()) {
      <div class="rs-kpis">
        <div class="rs-kpi rs-kpi--gold"><span class="rs-kv">PKR {{an()!.totalProfitGenerated|number:'1.0-0'}}</span><span class="rs-kl">Total Profit Generated</span></div>
        <div class="rs-kpi rs-kpi--green"><span class="rs-kv">PKR {{an()!.totalPayoutsPaid|number:'1.0-0'}}</span><span class="rs-kl">Total Payouts Made</span></div>
        <div class="rs-kpi"><span class="rs-kv">{{an()!.totalActiveResellers}}</span><span class="rs-kl">Active Resellers</span></div>
        <div class="rs-kpi"><span class="rs-kv">{{an()!.totalResellerOrders}}</span><span class="rs-kl">Total Orders</span></div>
      </div>

      <div class="rs-agrid">
        <div class="rs-ccard">
          <h3 class="rs-ch">Monthly Revenue & Profit (6 months)</h3>
          <div class="rs-bchart">
            @for(m of an()!.monthlyStats; track m.month) {
              <div class="rs-bg">
                <div class="rs-bwrap">
                  <div class="rs-bar rs-bar--rev" [style.height.%]="bPct(m.revenue,'revenue')" title="Revenue: PKR {{m.revenue|number:'1.0-0'}}"></div>
                  <div class="rs-bar rs-bar--pft" [style.height.%]="bPct(m.profit,'profit')" title="Profit: PKR {{m.profit|number:'1.0-0'}}"></div>
                </div>
                <span class="rs-bl">{{m.month|slice:5}}</span>
                <span class="rs-bo">{{m.orders}}</span>
              </div>
            }
          </div>
          <div class="rs-legend">
            <span><span class="rs-dot rs-dot--rev"></span>Revenue</span>
            <span><span class="rs-dot rs-dot--pft"></span>Profit</span>
            <span class="rs-rs">Numbers = order count</span>
          </div>
        </div>

        <div class="rs-ccard">
          <h3 class="rs-ch">Orders by Status</h3>
          <div class="rs-sbk">
            @for(s of an()!.ordersByStatus; track s.status) {
              <div class="rs-sbr">
                <span class="rs-st rs-st--{{s.status}}" style="min-width:80px">{{s.status}}</span>
                <div class="rs-sbb"><div class="rs-sbf rs-sbf--{{s.status}}" [style.width.%]="sPct(s.count)"></div></div>
                <span class="rs-fw" style="min-width:28px;text-align:right">{{s.count}}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="rs-lboard">
        <h3 class="rs-ch">🏆 Top Resellers Leaderboard</h3>
        <div class="rs-twrap">
          <table class="rs-tbl">
            <thead><tr><th>Rank</th><th>Reseller</th><th>City</th><th>Orders</th><th>Revenue</th><th>Earnings</th><th></th></tr></thead>
            <tbody>
              @for(r of an()!.topResellers; track r.resellerId; let i=$index) {
                <tr>
                  <td style="font-size:1.1rem">{{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}}</td>
                  <td><div class="rs-rn">{{r.name}}</div><div class="rs-rs">{{r.businessName}}</div></td>
                  <td class="rs-rs">{{r.city}}</td>
                  <td class="rs-fw">{{r.totalOrders}}</td>
                  <td class="rs-fw">PKR {{r.totalRevenue|number:'1.0-0'}}</td>
                  <td class="rs-gold rs-fw">PKR {{r.totalEarnings|number:'1.0-0'}}</td>
                  <td><button class="rs-ab rs-ab--view" (click)="openDetail(r.resellerId)">👁</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  }
</div>

@if(detOpen()&&det()) {
  <div class="rs-ov" (click)="closeDet()"></div>
  <div class="rs-modal">
    <div class="rs-mh">
      <div><h2 class="rs-mt">{{det()!.businessName}}</h2><span class="rs-st rs-st--{{det()!.status}}">{{det()!.status}}</span></div>
      <button class="rs-mc" (click)="closeDet()">✕</button>
    </div>
    <div class="rs-mtabs">
      @for(t of mTabs; track t) {
        <button class="rs-mtab" [class.active]="mTab()===t" (click)="mTab.set(t)">{{t}}</button>
      }
    </div>
    <div class="rs-mb">
      @if(mTab()==='Profile') {
        <div class="rs-g2">
          <div class="rs-f"><label>Name</label><span>{{det()!.name}}</span></div>
          <div class="rs-f"><label>Email</label><span>{{det()!.email}}</span></div>
          <div class="rs-f"><label>Phone</label><span>{{det()!.phone}}</span></div>
          <div class="rs-f"><label>WhatsApp</label><span>{{det()!.whatsApp}}</span></div>
          <div class="rs-f"><label>Business</label><span>{{det()!.businessName}}</span></div>
          <div class="rs-f"><label>City</label><span>{{det()!.city}}</span></div>
          <div class="rs-f rs-f--full"><label>Address</label><span>{{det()!.address}}</span></div>
          @if(det()!.cnic){<div class="rs-f"><label>CNIC</label><span>{{det()!.cnic}}</span></div>}
          <div class="rs-f"><label>Applied</label><span>{{det()!.appliedAt|date:'dd MMM yyyy'}}</span></div>
          @if(det()!.approvedAt){<div class="rs-f"><label>Approved</label><span>{{det()!.approvedAt|date:'dd MMM yyyy'}}</span></div>}
          @if(det()!.rejectionReason){<div class="rs-f rs-f--full"><label>Rejection Reason</label><span class="rs-rej">{{det()!.rejectionReason}}</span></div>}
        </div>
        <div class="rs-slbl">Payment Info</div>
        <div class="rs-g2">
          <div class="rs-f"><label>Method</label><span class="rs-pm">{{det()!.paymentMethod}}</span></div>
          <div class="rs-f"><label>Account Title</label><span>{{det()!.accountTitle}}</span></div>
          <div class="rs-f"><label>Account #</label><span>{{det()!.accountNumber}}</span></div>
          @if(det()!.bankName){<div class="rs-f"><label>Bank</label><span>{{det()!.bankName}}</span></div>}
        </div>
        <div class="rs-mas">
          @if(det()!.status==='pending'){
            <button class="btn btn-primary" (click)="approve(det()!.id);closeDet()">✓ Approve</button>
            <button class="btn btn-dark" (click)="openReject(det()!.id);closeDet()">✗ Reject</button>
          }
          @if(det()!.status==='approved'){<button class="btn btn-dark" (click)="openReject(det()!.id);closeDet()">Suspend</button>}
          @if(det()!.status==='rejected'){<button class="btn btn-primary" (click)="approve(det()!.id);closeDet()">Re-approve</button>}
        </div>
      }

      @if(mTab()==='Earnings & Payouts') {
        <div class="rs-ecards">
          <div class="rs-ec rs-ec--gold"><span class="rs-el">Total Earned</span><span class="rs-ev">PKR {{det()!.totalEarnings|number:'1.0-0'}}</span></div>
          <div class="rs-ec rs-ec--blue"><span class="rs-el">Pending</span><span class="rs-ev">PKR {{det()!.pendingEarnings|number:'1.0-0'}}</span></div>
          <div class="rs-ec rs-ec--green"><span class="rs-el">Paid Out</span><span class="rs-ev">PKR {{det()!.withdrawnAmount|number:'1.0-0'}}</span></div>
          <div class="rs-ec"><span class="rs-el">Available Balance</span><span class="rs-ev rs-gold">PKR {{(det()!.totalEarnings-det()!.withdrawnAmount)|number:'1.0-0'}}</span></div>
        </div>
        @if(det()!.status==='approved') {
          <div class="rs-pform">
            <div class="rs-slbl">Record New Payout</div>
            <div class="rs-g2">
              <div class="rs-fg"><label>Amount (PKR) *</label><input type="number" class="rs-inp" [(ngModel)]="pAmt" min="1"/></div>
              <div class="rs-fg"><label>Method</label>
                <select class="rs-sel" [(ngModel)]="pMeth">
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div class="rs-fg"><label>Transaction Reference</label><input type="text" class="rs-inp" [(ngModel)]="pRef" placeholder="TXN-123456"/></div>
              <div class="rs-fg"><label>Note (optional)</label><input type="text" class="rs-inp" [(ngModel)]="pNote"/></div>
            </div>
            <button class="btn btn-primary" (click)="recPayout()" [disabled]="aLoading()||!pAmt||pAmt<=0">
              @if(aLoading()){Processing...}@else{💳 Record Payout}
            </button>
          </div>
        }
        @if(rPays().length>0) {
          <div class="rs-slbl" style="margin-top:1.25rem">Payment History</div>
          <div class="rs-twrap">
            <table class="rs-tbl">
              <thead><tr><th>Amount</th><th>Method</th><th>Reference</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>
                @for(p of rPays(); track p.id) {
                  <tr>
                    <td class="rs-green rs-fw">PKR {{p.amount|number:'1.0-0'}}</td>
                    <td><span class="rs-pm">{{p.method}}</span></td>
                    <td class="rs-rs">{{p.reference||'—'}}</td>
                    <td class="rs-rs">{{p.note||'—'}}</td>
                    <td class="rs-rs">{{p.paidAt|date:'dd MMM y'}}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      @if(mTab()==='Orders') {
        @if(det()!.orders.length===0) {
          <div class="rs-empty"><p>No orders yet.</p></div>
        } @else {
          <div class="rs-olist">
            @for(o of det()!.orders; track o.id) {
              <div class="rs-oc">
                <div class="rs-och">
                  <div><span class="rs-gold rs-fw">#{{o.id}}</span> <span class="rs-rn">{{o.customerName}}</span> <span class="rs-rs">{{o.customerCity}}</span></div>
                  <div style="display:flex;gap:.625rem;align-items:center">
                    <span class="rs-st rs-st--{{o.status}}">{{o.status}}</span>
                    <span class="rs-green rs-fw">+PKR {{o.resellerProfit|number:'1.0-0'}}</span>
                  </div>
                </div>
                <div class="rs-ometa"><span>📅 {{o.createdAt|date:'dd MMM y'}}</span><span>💳 {{o.paymentMethod|uppercase}}</span><span>📦 PKR {{o.totalAmount|number:'1.0-0'}}</span>@if(o.trackingNumber){<span>🚚 {{o.trackingNumber}}</span>}</div>
                <div class="rs-oitems">
                  @for(it of o.items; track it.productName) {
                    <div class="rs-oit">
                      <img [src]="it.productImage" [alt]="it.productName" class="rs-oimg"/>
                      <div class="rs-oii"><div class="rs-rn">{{it.productName}}</div><div class="rs-rs">{{it.selectedSize}} · {{it.selectedColor}} · x{{it.quantity}}</div><div class="rs-green" style="font-size:.7rem">Profit: PKR {{it.profit|number:'1.0-0'}}</div></div>
                      <span class="rs-gold rs-fw">PKR {{it.resellerPrice|number:'1.0-0'}}</span>
                    </div>
                  }
                </div>
                <div class="rs-oupd">
                  <select class="rs-sel" [(ngModel)]="osMap[o.id]">
                    <option value="pending">Pending</option><option value="processing">Processing</option>
                    <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input class="rs-inp rs-inp--sm" placeholder="Tracking #" [(ngModel)]="otMap[o.id]"/>
                  <button class="rs-ab rs-ab--upd" (click)="updStatus(o.id)" [disabled]="aLoading()">Update</button>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  </div>
}

@if(rejOpen()) {
  <div class="rs-ov" (click)="rejOpen.set(false)"></div>
  <div class="rs-modal rs-modal--sm">
    <div class="rs-mh"><h2 class="rs-mt">Reject / Suspend</h2><button class="rs-mc" (click)="rejOpen.set(false)">✕</button></div>
    <div class="rs-mb">
      <div class="rs-fg"><label>Reason *</label><textarea class="rs-ta" rows="4" [(ngModel)]="rejR" placeholder="Explain reason..."></textarea></div>
      <div class="rs-mas">
        <button class="btn btn-dark" (click)="rejOpen.set(false)">Cancel</button>
        <button class="btn btn-primary" (click)="confirmRej()" [disabled]="aLoading()||!rejR.trim()">
          @if(aLoading()){Processing...}@else{Confirm}
        </button>
      </div>
    </div>
  </div>
}
`,
  styles: [`
    .rs-page{padding-bottom:3rem}
    .rs-page-tabs{display:flex;gap:.2rem;margin-bottom:1.25rem;border-bottom:1px solid var(--gray-200);flex-wrap:wrap}
    .rs-ptab{display:flex;align-items:center;gap:.375rem;padding:.6rem 1rem;font-size:.78rem;font-weight:600;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;color:var(--gray-400);transition:all .2s;margin-bottom:-1px;&.active{color:var(--gold-dark);border-bottom-color:var(--gold);&:hover:not(.active){color:var(--black)}}}
    .rs-badge{background:#f59e0b;color:#fff;font-size:.6rem;font-weight:700;padding:1px 5px;border-radius:8px}
    .rs-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:.875rem;margin-bottom:1.25rem;@media(max-width:1100px){grid-template-columns:repeat(3,1fr)}@media(max-width:600px){grid-template-columns:1fr 1fr;gap:.625rem}}
    .rs-stat{background:var(--cream-light);border:1px solid var(--gray-200);padding:.875rem 1rem;display:flex;flex-direction:column;gap:.2rem;&--warn{border-left:3px solid #f59e0b}&--green{border-left:3px solid #22c55e}&--gold{border-left:3px solid var(--gold)}}
    .rs-sv{font-family:var(--font-heading);font-size:1.2rem;font-weight:500;color:var(--black)}
    .rs-sl{font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gray-400)}
    .rs-toolbar{display:flex;gap:.75rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap}
    .rs-sh{font-family:var(--font-heading);font-size:1.25rem;font-weight:400}
    .rs-sw{position:relative;flex:1;min-width:160px;max-width:300px}
    .rs-si{position:absolute;left:.625rem;top:50%;transform:translateY(-50%);color:var(--gray-400);font-size:.75rem}
    .rs-search{width:100%;padding:.45rem .75rem .45rem 2rem;border:1px solid var(--gray-200);background:var(--cream-light);font-size:.8125rem;outline:none;box-sizing:border-box;&:focus{border-color:var(--gold)}}
    .rs-tabs{display:flex;gap:.25rem;flex-wrap:wrap}
    .rs-tab{padding:.35rem .75rem;font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:none;border:1.5px solid var(--gray-200);cursor:pointer;color:var(--gray-400);transition:all .2s;display:flex;align-items:center;gap:.3rem;&.active{border-color:var(--gold);background:var(--gold);color:var(--black)}&:hover:not(.active){border-color:var(--gold);color:var(--gold-dark)}}
    .rs-tbadge{background:rgba(26,26,26,.15);color:inherit;font-size:.6rem;font-weight:700;padding:1px 4px;border-radius:8px}
    .rs-outline{display:flex;align-items:center;gap:.375rem;padding:.4rem .875rem;font-size:.75rem;font-weight:600;background:none;border:1.5px solid var(--gray-300);cursor:pointer;color:var(--black);transition:all .2s;white-space:nowrap;&:hover{border-color:var(--gold);color:var(--gold-dark)}}
    .rs-selc{font-size:.8rem;font-weight:600;color:var(--gold-dark)}
    .rs-loading{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:3rem;color:var(--gray-400);font-size:.875rem}
    .rs-spin{width:32px;height:32px;border:3px solid var(--gray-200);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .rs-empty{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:3rem;text-align:center;color:var(--gray-400)}
    .rs-twrap{overflow-x:auto;border:1px solid var(--gray-200);-webkit-overflow-scrolling:touch}
    .rs-tbl{width:100%;border-collapse:collapse;font-size:.8rem;min-width:750px;
      th{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gray-400);padding:.5rem .75rem;border-bottom:1px solid var(--gray-200);text-align:left;background:var(--cream-light);white-space:nowrap}
      td{padding:.6rem .75rem;border-bottom:1px solid var(--gray-200);vertical-align:middle}
      tr:last-child td{border-bottom:none}
      tr:hover td{background:rgba(201,168,76,.03)}}
    .rs-sel-row td{background:rgba(201,168,76,.06)!important}
    .rs-rinfo{display:flex;align-items:center;gap:.5rem}
    .rs-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-size:.875rem;font-weight:700;color:var(--black);flex-shrink:0}
    .rs-rn{font-weight:600;font-size:.8rem}
    .rs-rs{font-size:.72rem;color:var(--gray-400)}
    .rs-gold{color:var(--gold-dark)}
    .rs-green{color:#15803d}
    .rs-fw{font-weight:600}
    .rs-pm{display:inline-block;padding:.12rem .4rem;background:rgba(201,168,76,.12);color:var(--gold-dark);font-size:.65rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
    .rs-st{display:inline-block;padding:.18rem .5rem;font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
    .rs-st--pending{background:rgba(245,158,11,.15);color:#b45309}
    .rs-st--approved{background:rgba(34,197,94,.15);color:#15803d}
    .rs-st--rejected{background:rgba(239,68,68,.15);color:#b91c1c}
    .rs-st--processing{background:rgba(59,130,246,.15);color:#1d4ed8}
    .rs-st--shipped{background:rgba(139,92,246,.15);color:#6d28d9}
    .rs-st--delivered{background:rgba(34,197,94,.15);color:#15803d}
    .rs-st--cancelled{background:rgba(239,68,68,.15);color:#b91c1c}
    .rs-acts{display:flex;gap:.3rem}
    .rs-ab{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--gray-200);background:none;cursor:pointer;border-radius:3px;font-size:.8rem;transition:all .2s;&:disabled{opacity:.5;cursor:not-allowed}}
    .rs-ab--view{color:var(--gray-400);&:hover{border-color:var(--gold);color:var(--gold)}}
    .rs-ab--ok{color:#15803d;border-color:rgba(34,197,94,.3);&:hover{background:rgba(34,197,94,.1)}}
    .rs-ab--no{color:#b91c1c;border-color:rgba(239,68,68,.3);&:hover{background:rgba(239,68,68,.1)}}
    .rs-ab--warn{color:#b45309;border-color:rgba(245,158,11,.3);&:hover{background:rgba(245,158,11,.1)}}
    .rs-ab--pay{color:#1d4ed8;border-color:rgba(59,130,246,.3);&:hover{background:rgba(59,130,246,.1)}}
    .rs-ab--upd{padding:0 .625rem;width:auto;height:28px;background:var(--gold);border-color:var(--gold);color:var(--black);font-size:.7rem;font-weight:700;&:hover{background:var(--gold-dark)}}
    .rs-sel{padding:.375rem .5rem;border:1px solid var(--gray-300);background:var(--cream-light);font-size:.8rem;cursor:pointer;outline:none;&:focus{border-color:var(--gold)}&--xs{font-size:.72rem;padding:.25rem .375rem}}
    .rs-inp{padding:.4rem .625rem;border:1px solid var(--gray-300);background:var(--cream-light);font-size:.8rem;outline:none;box-sizing:border-box;&:focus{border-color:var(--gold)}&--sm{width:130px}&--xs{width:110px;font-size:.72rem;padding:.25rem .375rem}}
    .rs-pgn{display:flex;align-items:center;gap:1rem;margin-top:.875rem;justify-content:center}
    .rs-pgi{font-size:.8rem;color:var(--gray-400)}
    .rs-pbanner{display:flex;justify-content:space-between;align-items:center;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.3);padding:.875rem 1.25rem;margin-bottom:1rem;flex-wrap:wrap;gap:.75rem}
    .rs-pt{font-weight:700;font-size:.875rem;display:block}
    .rs-ps{font-size:.8rem;color:var(--gray-400)}
    .rs-plist{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.25rem}
    .rs-prow{display:flex;align-items:center;gap:1rem;background:var(--cream-light);border:1px solid var(--gray-200);padding:.75rem 1rem;flex-wrap:wrap}
    .rs-pinfo{flex:1;min-width:160px}
    .rs-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:.875rem;margin-bottom:1.5rem;@media(max-width:900px){grid-template-columns:repeat(2,1fr)}}
    .rs-kpi{background:var(--cream-light);border:1px solid var(--gray-200);padding:1rem;display:flex;flex-direction:column;gap:.25rem;&--gold{border-left:3px solid var(--gold)}&--green{border-left:3px solid #22c55e}}
    .rs-kv{font-family:var(--font-heading);font-size:1.375rem;font-weight:500;color:var(--black)}
    .rs-kl{font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gray-400)}
    .rs-agrid{display:grid;grid-template-columns:1fr 300px;gap:1rem;margin-bottom:1.5rem;@media(max-width:900px){grid-template-columns:1fr}}
    .rs-ccard{background:var(--cream-light);border:1px solid var(--gray-200);padding:1.25rem}
    .rs-ch{font-family:var(--font-heading);font-size:1rem;font-weight:500;margin-bottom:1rem}
    .rs-bchart{display:flex;align-items:flex-end;gap:.625rem;height:150px;padding-top:1.5rem;overflow-x:auto}
    .rs-bg{display:flex;flex-direction:column;align-items:center;gap:.25rem;flex:1;min-width:36px;height:100%}
    .rs-bwrap{display:flex;align-items:flex-end;gap:2px;height:100%;width:100%;justify-content:center}
    .rs-bar{width:14px;min-height:4px;transition:height .4s ease;&--rev{background:var(--gold)}&--pft{background:#22c55e}}
    .rs-bl{font-size:.65rem;color:var(--gray-400)}
    .rs-bo{font-size:.6rem;color:var(--gray-500)}
    .rs-legend{display:flex;gap:1rem;margin-top:.625rem;font-size:.72rem;color:var(--gray-500)}
    .rs-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:.3rem;&--rev{background:var(--gold)}&--pft{background:#22c55e}}
    .rs-sbk{display:flex;flex-direction:column;gap:.625rem}
    .rs-sbr{display:flex;align-items:center;gap:.625rem}
    .rs-sbb{flex:1;height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden}
    .rs-sbf{height:100%;border-radius:4px;transition:width .5s ease;&--pending{background:#f59e0b}&--processing{background:#3b82f6}&--shipped{background:#8b5cf6}&--delivered{background:#22c55e}&--cancelled{background:#ef4444}}
    .rs-lboard{background:var(--cream-light);border:1px solid var(--gray-200);padding:1.25rem}
    .rs-ov{position:fixed;inset:0;background:rgba(26,26,26,.6);z-index:500;backdrop-filter:blur(4px)}
    .rs-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:501;width:min(94vw,820px);max-height:88vh;background:var(--cream-light);display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.25);&--sm{width:min(90vw,460px)}}
    .rs-mh{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;border-bottom:1px solid var(--gray-200);gap:.75rem;flex-shrink:0;>div{display:flex;align-items:center;gap:.625rem;flex-wrap:wrap}}
    .rs-mt{font-family:var(--font-heading);font-size:1.2rem;font-weight:400}
    .rs-mc{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:var(--black);border-radius:50%;transition:all .2s;flex-shrink:0;&:hover{background:rgba(201,168,76,.1)}}
    .rs-mtabs{display:flex;border-bottom:1px solid var(--gray-200);flex-shrink:0;overflow-x:auto}
    .rs-mtab{padding:.625rem 1rem;font-size:.78rem;font-weight:600;background:none;border:none;cursor:pointer;color:var(--gray-400);border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;&.active{color:var(--gold-dark);border-bottom-color:var(--gold)}}
    .rs-mb{flex:1;overflow-y:auto;padding:1.25rem}
    .rs-mas{display:flex;gap:.625rem;margin-top:1.25rem;flex-wrap:wrap}
    .rs-g2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem;@media(max-width:580px){grid-template-columns:1fr}}
    .rs-f{display:flex;flex-direction:column;gap:.2rem;label{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gray-400)}span{font-size:.8125rem;color:var(--black)}&--full{grid-column:1/-1}}
    .rs-rej{color:#b91c1c;font-style:italic}
    .rs-slbl{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-dark);margin:.875rem 0 .5rem;padding-bottom:.375rem;border-bottom:1px solid rgba(201,168,76,.2)}
    .rs-ecards{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;margin-bottom:1.25rem;@media(max-width:480px){grid-template-columns:1fr}}
    .rs-ec{background:var(--cream);border:1px solid var(--gray-200);padding:1rem;display:flex;flex-direction:column;gap:.2rem;&--gold{border-left:3px solid var(--gold)}&--blue{border-left:3px solid #3b82f6}&--green{border-left:3px solid #22c55e}}
    .rs-el{font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gray-400)}
    .rs-ev{font-family:var(--font-heading);font-size:1.2rem;font-weight:500;color:var(--black)}
    .rs-pform{background:var(--cream);border:1px solid var(--gray-200);padding:1rem;margin-bottom:1rem}
    .rs-fg{display:flex;flex-direction:column;gap:.3rem;label{font-size:.75rem;font-weight:600;color:var(--black)}}
    .rs-ta{width:100%;padding:.5rem .625rem;border:1px solid var(--gray-300);background:var(--cream-light);font-size:.8125rem;outline:none;resize:vertical;box-sizing:border-box;font-family:var(--font-body);&:focus{border-color:var(--gold)}}
    .rs-olist{display:flex;flex-direction:column;gap:.875rem}
    .rs-oc{border:1px solid var(--gray-200);background:var(--cream)}
    .rs-och{display:flex;justify-content:space-between;align-items:center;padding:.625rem .875rem;border-bottom:1px solid var(--gray-200);background:var(--cream-light);flex-wrap:wrap;gap:.5rem}
    .rs-ometa{display:flex;gap:.875rem;font-size:.72rem;color:var(--gray-400);flex-wrap:wrap;padding:.625rem .875rem}
    .rs-oitems{display:flex;flex-direction:column;gap:.375rem;padding:.5rem .875rem}
    .rs-oupd{display:flex;gap:.375rem;align-items:center;flex-wrap:wrap;padding:.625rem .875rem;border-top:1px solid var(--gray-200)}
    .rs-oit{display:flex;gap:.625rem;align-items:center;padding:.4rem;background:var(--cream-light);border:1px solid var(--gray-200)}
    .rs-oimg{width:36px;height:48px;object-fit:cover;object-position:top center;flex-shrink:0}
    .rs-oii{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
  `]
})
export class ResellersComponent implements OnInit {
  private http    = inject(HttpClient);
  private authApi = inject(AuthApiService);
  private toast   = inject(ToastService);

  resellers = signal<Reseller[]>([]); stats = signal<Stats|null>(null);
  an = signal<Analytics|null>(null); aOrders = signal<AOrder[]>([]); aPays = signal<Payment[]>([]);
  pPays = signal<PPayout[]>([]); rPays = signal<Payment[]>([]); det = signal<ResellerDetail|null>(null);
  loading = signal(true); aLoading = signal(false); oLoading = signal(false);
  pLoad = signal(false); anLoad = signal(false); detOpen = signal(false);
  rejOpen = signal(false); pExp = signal(false);
  pageTab = signal('resellers'); sTab = signal('all'); mTab = signal('Profile');
  searchQ = ''; rejR = ''; selId = 0;
  pAmt = 0; pMeth = 'easypaisa'; pRef = ''; pNote = '';
  oStatus = ''; bulkAct = ''; trackPfx = '';
  selIds = new Set<number>(); osMap: Record<number,string> = {}; otMap: Record<number,string> = {};
  oPage = 1; oPgSz = 20; oTotal = 0; pPage = 1; pPgSz = 20; pTotal = 0;

  pageTabs = [{key:'resellers',label:'Resellers'},{key:'orders',label:'All Orders'},{key:'payments',label:'Payments'},{key:'analytics',label:'Analytics'}];
  sTabs = [{k:'all',l:'All'},{k:'pending',l:'Pending'},{k:'approved',l:'Approved'},{k:'rejected',l:'Rejected'}];
  mTabs = ['Profile','Earnings & Payouts','Orders'];

  filtered = computed(() => {
    const t = this.sTab(), q = this.searchQ.toLowerCase().trim();
    let l = t==='all' ? this.resellers() : this.resellers().filter(r=>r.status===t);
    if(q) l = l.filter(r=>r.name.toLowerCase().includes(q)||r.email.toLowerCase().includes(q)||r.businessName.toLowerCase().includes(q)||r.city.toLowerCase().includes(q));
    return l;
  });
  selOrders = computed(() => Array.from(this.selIds));
  pPayTotal = computed(() => this.pPays().reduce((s,p)=>s+p.availableBalance,0));
  tabCnt(k:string){ return k==='all'?0:this.resellers().filter(r=>r.status===k).length; }
  private get h(){ return new HttpHeaders({Authorization:`Bearer ${this.authApi.getToken()}`}); }

  ngOnInit(){ this.loadR(); this.loadStats(); }

  switchPage(k:string){
    this.pageTab.set(k);
    if(k==='orders'&&!this.aOrders().length) this.loadOrders();
    if(k==='payments'&&!this.aPays().length){ this.loadPays(); this.loadPending(); }
    if(k==='analytics'&&!this.an()) this.loadAn();
  }

  loadR(){ this.loading.set(true); this.http.get<Reseller[]>(`${API_BASE}/reseller/admin/all`,{headers:this.h}).subscribe({next:d=>{this.resellers.set(d);this.loading.set(false)},error:()=>this.loading.set(false)}); }
  loadStats(){ this.http.get<Stats>(`${API_BASE}/reseller/admin/stats`,{headers:this.h}).subscribe({next:s=>this.stats.set(s),error:()=>{}}); }
  loadOrders(p=1){ this.oLoading.set(true);this.oPage=p;const st=this.oStatus?`&status=${this.oStatus}`:''; this.http.get<any>(`${API_BASE}/reseller/admin/orders?page=${p}&pageSize=${this.oPgSz}${st}`,{headers:this.h}).subscribe({next:r=>{this.oTotal=r.total;const o:AOrder[]=r.data;o.forEach(x=>{if(!this.osMap[x.id])this.osMap[x.id]=x.status;if(!this.otMap[x.id])this.otMap[x.id]=x.trackingNumber||''});this.aOrders.set(o);this.oLoading.set(false)},error:()=>this.oLoading.set(false)}); }
  loadPays(p=1){ this.pLoad.set(true);this.pPage=p; this.http.get<any>(`${API_BASE}/reseller/admin/payments?page=${p}&pageSize=${this.pPgSz}`,{headers:this.h}).subscribe({next:r=>{this.aPays.set(r.data);this.pTotal=r.total;this.pLoad.set(false)},error:()=>this.pLoad.set(false)}); }
  loadPending(){ this.http.get<any>(`${API_BASE}/reseller/admin/pending-payouts`,{headers:this.h}).subscribe({next:r=>this.pPays.set(r.resellers),error:()=>{}}); }
  loadAn(){ this.anLoad.set(true); this.http.get<Analytics>(`${API_BASE}/reseller/admin/analytics`,{headers:this.h}).subscribe({next:a=>{this.an.set(a);this.anLoad.set(false)},error:()=>this.anLoad.set(false)}); }
  loadRPays(id:number){ this.http.get<Payment[]>(`${API_BASE}/reseller/admin/${id}/payments`,{headers:this.h}).subscribe({next:p=>this.rPays.set(p),error:()=>{}}); }

  openDetail(id:number){ this.http.get<ResellerDetail>(`${API_BASE}/reseller/admin/${id}`,{headers:this.h}).subscribe({next:d=>{this.det.set(d);d.orders.forEach(o=>{this.osMap[o.id]=o.status;this.otMap[o.id]=o.trackingNumber||''});this.mTab.set('Profile');this.pAmt=0;this.pRef='';this.pNote='';this.loadRPays(id);this.detOpen.set(true)},error:()=>this.toast.error('Failed to load.')}); }
  closeDet(){ this.detOpen.set(false);this.det.set(null); }

  approve(id:number){ this.aLoading.set(true); this.http.put(`${API_BASE}/reseller/admin/${id}/approve`,{action:'approve'},{headers:this.h}).subscribe({next:()=>{this.toast.success('Approved!');this.aLoading.set(false);this.loadR();this.loadStats()},error:()=>{this.toast.error('Failed.');this.aLoading.set(false)}}); }
  openReject(id:number){ this.selId=id;this.rejR='';this.rejOpen.set(true); }
  confirmRej(){ this.aLoading.set(true); this.http.put(`${API_BASE}/reseller/admin/${this.selId}/approve`,{action:'reject',rejectionReason:this.rejR},{headers:this.h}).subscribe({next:()=>{this.toast.success('Rejected.');this.aLoading.set(false);this.rejOpen.set(false);this.loadR();this.loadStats()},error:()=>{this.toast.error('Failed.');this.aLoading.set(false)}}); }

  quickPay(r:Reseller){ this.openDetail(r.id);setTimeout(()=>this.mTab.set('Earnings & Payouts'),400); }
  recPayout(){ if(!this.det()||this.pAmt<=0)return; this.aLoading.set(true); this.http.post(`${API_BASE}/reseller/admin/${this.det()!.id}/payout`,{amount:this.pAmt,method:this.pMeth,reference:this.pRef,note:this.pNote},{headers:this.h}).subscribe({next:()=>{this.toast.success(`PKR ${this.pAmt.toLocaleString()} recorded!`);this.aLoading.set(false);this.pAmt=0;this.pRef='';this.pNote='';this.openDetail(this.det()!.id);this.loadStats();this.loadPending();this.loadPays()},error:(e)=>{this.toast.error(e.error?.message||'Failed.');this.aLoading.set(false)}}); }

  updStatus(id:number){ this.aLoading.set(true); this.http.put(`${API_BASE}/reseller/admin/orders/${id}/status`,{status:this.osMap[id],trackingNumber:this.otMap[id]||null},{headers:this.h}).subscribe({next:()=>{this.toast.success('Updated.');this.aLoading.set(false);if(this.det())this.openDetail(this.det()!.id)},error:()=>{this.toast.error('Failed.');this.aLoading.set(false)}}); }
  updOrd(id:number){ this.updStatus(id); }
  saveTrk(id:number){ if(!this.otMap[id])return; this.http.put(`${API_BASE}/reseller/admin/orders/${id}/status`,{status:this.osMap[id],trackingNumber:this.otMap[id]},{headers:this.h}).subscribe({next:()=>this.toast.success('Tracking saved.'),error:()=>{}}); }

  selAll(e:Event){ const c=(e.target as HTMLInputElement).checked; if(c)this.aOrders().forEach(o=>this.selIds.add(o.id));else this.selIds.clear(); }
  togOrd(id:number,e:Event){ const c=(e.target as HTMLInputElement).checked; if(c)this.selIds.add(id);else this.selIds.delete(id); }
  isSel(id:number){ return this.selIds.has(id); }
  doBulk(){ if(!this.bulkAct||!this.selIds.size)return; const[act,st]=this.bulkAct.split('|'); this.aLoading.set(true); const b:any={orderIds:Array.from(this.selIds),action:act};if(st)b.status=st;if(act==='assign_tracking')b.trackingPrefix=this.trackPfx||'TRK'; this.http.post(`${API_BASE}/reseller/admin/orders/bulk`,b,{headers:this.h}).subscribe({next:(r:any)=>{this.toast.success(`${r.updatedCount} updated.`);this.aLoading.set(false);this.selIds.clear();this.bulkAct='';this.loadOrders(this.oPage)},error:()=>{this.toast.error('Failed.');this.aLoading.set(false)}}); }

  bPct(val:number,field:'revenue'|'profit'):number{ const ms=this.an()?.monthlyStats||[];const max=Math.max(...ms.map(s=>s[field]));return max>0?Math.round(val/max*100):0; }
  sPct(cnt:number):number{ const t=this.an()?.totalResellerOrders||1;return Math.round(cnt/t*100); }

  exportResellers(){ this.dl([['Name','Email','Phone','Business','City','Status','Applied','Earnings','Orders'],...this.filtered().map(r=>[r.name,r.email,r.phone,r.businessName,r.city,r.status,new Date(r.appliedAt).toLocaleDateString(),r.totalEarnings+'',r.totalOrders+''])],'resellers.csv'); }
  exportOrders(){ this.dl([['ID','Reseller','Customer','City','Total','Profit','Status','Date'],...this.aOrders().map(o=>[o.id+'',o.resellerName,o.customerName,o.customerCity,o.totalAmount+'',o.resellerProfit+'',o.status,new Date(o.createdAt).toLocaleDateString()])],'orders.csv'); }
  exportPayments(){ this.dl([['ID','Reseller','Amount','Method','Reference','Status','Date'],...this.aPays().map(p=>[p.id+'',p.resellerName,p.amount+'',p.method,p.reference,p.status,new Date(p.paidAt).toLocaleDateString()])],'payments.csv'); }
  private dl(rows:string[][],fn:string){ const c=rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');const b=new Blob([c],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=fn;a.click();URL.revokeObjectURL(u); }
}
